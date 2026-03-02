export type TaxRegime = 'old' | 'new';

export interface TaxSlab {
  minIncome: number;
  maxIncome: number | null;
  rate: number; // percentage
}

export interface TaxSettings {
  oldRegimeSlabs: TaxSlab[];
  newRegimeSlabs: TaxSlab[];
  oldRegimeStandardDeduction: number; // 50000
  newRegimeStandardDeduction: number; // 75000
  section87AThresholdOld: number; // 500000
  section87AThresholdNew: number; // 700000
  section87AMaxRebateOld: number; // 12500
  section87AMaxRebateNew: number; // 25000
  surchargeThreshold: number; // 5000000
  surchargeRate: number; // 10
  cessRate: number; // 4
  updatedAt: string;
}

export interface Section80C {
  ppf: number;
  elss: number;
  lifeInsurance: number;
  nsc: number;
  homeLoanPrincipal: number;
  tuitionFees: number;
  epf: number;
  others: number;
}

export interface TaxDeclaration {
  employeeId: string;
  financialYear: string;
  regime: TaxRegime;
  section80C: Section80C;
  section80D: number; // medical insurance premium
  hraRentPaid: number;
  hraIsMetroCity: boolean;
  section80G: number;
  section80E: number; // education loan interest
  nps80CCD: number; // NPS contribution
  otherDeductions: number;
  updatedAt: string;
}

export interface TDSProjection {
  annualGross: number;
  standardDeduction: number;
  hraExemption: number;
  totalDeductions80C: number;
  totalDeductions80D: number;
  otherDeductions: number;
  taxableIncome: number;
  grossTax: number;
  surcharge: number;
  cess: number;
  section87ARebate: number;
  totalTax: number;
  tdsPerMonth: number;
  remainingMonths: number;
}

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  oldRegimeSlabs: [
    { minIncome: 0, maxIncome: 250000, rate: 0 },
    { minIncome: 250000, maxIncome: 500000, rate: 5 },
    { minIncome: 500000, maxIncome: 1000000, rate: 20 },
    { minIncome: 1000000, maxIncome: null, rate: 30 },
  ],
  newRegimeSlabs: [
    { minIncome: 0, maxIncome: 300000, rate: 0 },
    { minIncome: 300000, maxIncome: 700000, rate: 5 },
    { minIncome: 700000, maxIncome: 1000000, rate: 10 },
    { minIncome: 1000000, maxIncome: 1200000, rate: 15 },
    { minIncome: 1200000, maxIncome: 1500000, rate: 20 },
    { minIncome: 1500000, maxIncome: null, rate: 30 },
  ],
  oldRegimeStandardDeduction: 50000,
  newRegimeStandardDeduction: 75000,
  section87AThresholdOld: 500000,
  section87AThresholdNew: 700000,
  section87AMaxRebateOld: 12500,
  section87AMaxRebateNew: 25000,
  surchargeThreshold: 5000000,
  surchargeRate: 10,
  cessRate: 4,
  updatedAt: new Date().toISOString(),
};
