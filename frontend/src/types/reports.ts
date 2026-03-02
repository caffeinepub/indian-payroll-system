export interface PFECRRecord {
  uan: string;
  employeeName: string;
  grossWages: number;
  epfWages: number; // Basic + DA
  epfEmployeeContribution: number; // 12%
  epfEmployerContribution: number; // 3.67%
  epsContribution: number; // 8.33%
  totalPF: number;
}

export interface ESIChallanRecord {
  esicNumber: string;
  employeeName: string;
  grossWages: number;
  esiEmployee: number; // 0.75%
  esiEmployer: number; // 3.25%
  totalESI: number;
}

export interface PTReturnsRecord {
  state: string;
  employeeCount: number;
  totalPT: number;
  employees: { employeeName: string; grossSalary: number; ptAmount: number }[];
}

export interface TDSSummaryRecord {
  employeeName: string;
  pan: string; // masked
  quarterlyGrossIncome: number;
  taxableIncome: number;
  tdsDeducted: number;
}
