export type PayrollStatus = 'Draft' | 'Approved' | 'Paid';

export interface EmployeePayrollData {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  pan: string;
  uan: string;
  workingDays: number;
  paidDays: number;
  lopDays: number;
  // Earnings
  basicSalary: number;
  hra: number;
  da: number;
  specialAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  lta: number;
  otherEarnings: number;
  grossSalary: number;
  // Deductions
  epfEmployee: number;
  epfEmployer: number;
  epsContribution: number;
  esiEmployee: number;
  esiEmployer: number;
  professionalTax: number;
  lwf: number;
  tds: number;
  loanDeduction: number;
  totalDeductions: number;
  netPay: number;
}

export interface PayrollRun {
  id: string;
  month: number; // 1-12
  year: number;
  status: PayrollStatus;
  employees: EmployeePayrollData[];
  totalGross: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEpfEmployer: number;
  totalEsiEmployer: number;
  initiatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  unlockedAt?: string;
  unlockReason?: string;
}
