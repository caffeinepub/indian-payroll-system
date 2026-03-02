export interface PayslipEarnings {
  basicSalary: number;
  hra: number;
  da: number;
  specialAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  lta: number;
  otherEarnings: number;
  grossSalary: number;
}

export interface PayslipDeductions {
  epfEmployee: number;
  esiEmployee: number;
  professionalTax: number;
  lwf: number;
  tds: number;
  loanDeduction: number;
  totalDeductions: number;
}

export interface Payslip {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  pan: string; // masked
  uan: string;
  esicNumber: string;
  bankAccountNumber: string; // masked
  month: number;
  year: number;
  workingDays: number;
  paidDays: number;
  lopDays: number;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  netPay: number;
  epfEmployer: number;
  esiEmployer: number;
}
