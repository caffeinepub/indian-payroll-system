import type { StatutorySettings, DeductionBreakdown } from '../types/statutory';
import type { TaxSettings, TaxDeclaration, TDSProjection } from '../types/tax';
import type { Employee } from '../types/employee';
import type { SalaryStructure } from '../types/salaryStructure';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(2)}`;
}

export function maskPAN(pan: string): string {
  if (!pan || pan.length < 10) return pan;
  return pan.substring(0, 5) + 'XXXXX';
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 12) return aadhaar;
  return 'XXXX XXXX ' + aadhaar.slice(-4);
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return acc;
  return 'XXXX XXXX ' + acc.slice(-4);
}

export function validatePAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
}

export function validateAadhaar(aadhaar: string): boolean {
  const cleaned = aadhaar.replace(/\s/g, '');
  return /^\d{12}$/.test(cleaned);
}

export function getWorkingDaysInMonth(month: number, year: number): number {
  const date = new Date(year, month - 1, 1);
  let workingDays = 0;
  while (date.getMonth() === month - 1) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) workingDays++;
    date.setDate(date.getDate() + 1);
  }
  return workingDays;
}

export function computeSalaryComponents(
  structure: SalaryStructure,
  ctc: number
): { earnings: Record<string, number>; gross: number } {
  const earnings: Record<string, number> = {};
  let basic = 0;

  // First pass: find basic
  const basicComp = structure.earnings.find(e => e.name === 'Basic Salary');
  if (basicComp && basicComp.isEnabled) {
    basic = basicComp.mode === 'fixed' ? basicComp.value : (ctc * basicComp.value) / 100;
    earnings['Basic Salary'] = Math.round(basic * 100) / 100;
  }

  // Second pass: compute other components
  for (const comp of structure.earnings) {
    if (!comp.isEnabled || comp.name === 'Basic Salary') continue;
    const amount = comp.mode === 'fixed' ? comp.value : (basic * comp.value) / 100;
    earnings[comp.name] = Math.round(amount * 100) / 100;
  }

  const gross = Object.values(earnings).reduce((sum, v) => sum + v, 0);
  return { earnings, gross };
}

export function computeStatutoryDeductions(
  basicSalary: number,
  da: number,
  grossSalary: number,
  settings: StatutorySettings,
  state: string
): DeductionBreakdown {
  const epfWages = basicSalary + da;
  const epfEmployee = Math.round((epfWages * settings.epfRate) / 100 * 100) / 100;
  const epsContribution = Math.round((epfWages * settings.epsRate) / 100 * 100) / 100;
  const epfEmployer = Math.round((epfWages * (settings.epfEmployerRate - settings.epsRate)) / 100 * 100) / 100;

  const esiApplicable = grossSalary <= settings.esiThreshold;
  const esiEmployee = esiApplicable ? Math.round((grossSalary * settings.esiEmployeeRate) / 100 * 100) / 100 : 0;
  const esiEmployer = esiApplicable ? Math.round((grossSalary * settings.esiEmployerRate) / 100 * 100) / 100 : 0;

  // PT based on state config
  const ptConfig = settings.ptConfig.find(p => p.state === state);
  let professionalTax = 0;
  if (ptConfig) {
    for (const slab of ptConfig.slabs) {
      if (grossSalary >= slab.minIncome && (slab.maxIncome === null || grossSalary <= slab.maxIncome)) {
        professionalTax = slab.ptAmount;
        break;
      }
    }
  }

  // LWF
  const lwfConfig = settings.lwfConfig.find(l => l.state === state);
  const lwf = lwfConfig ? lwfConfig.employeeContribution : 0;

  const totalEmployeeDeductions = epfEmployee + esiEmployee + professionalTax + lwf;
  const totalEmployerContributions = epfEmployer + epsContribution + esiEmployer;

  return {
    epfEmployee,
    epfEmployer,
    epsContribution,
    esiEmployee,
    esiEmployer,
    professionalTax,
    lwf,
    tds: 0,
    totalEmployeeDeductions,
    totalEmployerContributions,
  };
}

export function computeTDS(
  employee: Employee,
  annualGross: number,
  declaration: TaxDeclaration,
  settings: TaxSettings
): TDSProjection {
  const regime = declaration.regime;
  const slabs = regime === 'old' ? settings.oldRegimeSlabs : settings.newRegimeSlabs;
  const standardDeduction = regime === 'old' ? settings.oldRegimeStandardDeduction : settings.newRegimeStandardDeduction;

  // HRA Exemption (old regime only)
  let hraExemption = 0;
  if (regime === 'old' && declaration.hraRentPaid > 0) {
    const annualRent = declaration.hraRentPaid * 12;
    const basicAnnual = annualGross * 0.4; // approximate
    const hraReceived = annualGross * 0.2; // approximate
    const rentMinus10Percent = annualRent - basicAnnual * 0.1;
    const metroHRA = basicAnnual * (declaration.hraIsMetroCity ? 0.5 : 0.4);
    hraExemption = Math.max(0, Math.min(hraReceived, rentMinus10Percent, metroHRA));
  }

  // 80C deductions (old regime only, max 150000)
  let deductions80C = 0;
  if (regime === 'old') {
    const s80c = declaration.section80C;
    deductions80C = Math.min(150000,
      s80c.ppf + s80c.elss + s80c.lifeInsurance + s80c.nsc +
      s80c.homeLoanPrincipal + s80c.tuitionFees + s80c.epf + s80c.others
    );
  }

  const deductions80D = regime === 'old' ? Math.min(25000, declaration.section80D) : 0;
  const nps80CCD = regime === 'old' ? Math.min(50000, declaration.nps80CCD) : 0;
  const otherDeductions = regime === 'old' ? declaration.otherDeductions : 0;

  const taxableIncome = Math.max(0,
    annualGross - standardDeduction - hraExemption - deductions80C - deductions80D - nps80CCD - otherDeductions
  );

  // Compute tax from slabs
  let grossTax = 0;
  for (const slab of slabs) {
    if (taxableIncome <= slab.minIncome) break;
    const upper = slab.maxIncome === null ? taxableIncome : Math.min(taxableIncome, slab.maxIncome);
    grossTax += ((upper - slab.minIncome) * slab.rate) / 100;
  }

  // Section 87A rebate
  const threshold87A = regime === 'old' ? settings.section87AThresholdOld : settings.section87AThresholdNew;
  const maxRebate87A = regime === 'old' ? settings.section87AMaxRebateOld : settings.section87AMaxRebateNew;
  const section87ARebate = taxableIncome <= threshold87A ? Math.min(grossTax, maxRebate87A) : 0;

  const taxAfterRebate = Math.max(0, grossTax - section87ARebate);

  // Surcharge
  const surcharge = taxableIncome > settings.surchargeThreshold
    ? (taxAfterRebate * settings.surchargeRate) / 100
    : 0;

  // Cess
  const cess = ((taxAfterRebate + surcharge) * settings.cessRate) / 100;

  const totalTax = taxAfterRebate + surcharge + cess;

  // Remaining months in FY (April to March)
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const fyStartMonth = 4; // April
  let remainingMonths: number;
  if (currentMonth >= fyStartMonth) {
    remainingMonths = 12 - (currentMonth - fyStartMonth);
  } else {
    remainingMonths = fyStartMonth - currentMonth;
  }
  remainingMonths = Math.max(1, remainingMonths);

  const tdsPerMonth = Math.round((totalTax / 12) * 100) / 100;

  return {
    annualGross,
    standardDeduction,
    hraExemption,
    totalDeductions80C: deductions80C,
    totalDeductions80D: deductions80D,
    otherDeductions: nps80CCD + otherDeductions,
    taxableIncome,
    grossTax,
    surcharge,
    cess,
    section87ARebate,
    totalTax,
    tdsPerMonth,
    remainingMonths,
  };
}

export function getFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  return `${year - 1}-${year.toString().slice(2)}`;
}

export function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || '';
}
