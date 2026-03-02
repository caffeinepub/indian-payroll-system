export interface PTSlab {
  id: string;
  minIncome: number;
  maxIncome: number | null; // null means no upper limit
  ptAmount: number;
}

export interface StatePTConfig {
  state: string;
  slabs: PTSlab[];
  frequency: 'monthly' | 'half-yearly' | 'annually';
}

export interface LWFConfig {
  state: string;
  employeeContribution: number;
  employerContribution: number;
  frequency: 'monthly' | 'half-yearly' | 'annually';
}

export interface StatutorySettings {
  epfRate: number; // default 12
  epfEmployerRate: number; // 3.67 EPF + 8.33 EPS = 12
  epsRate: number; // 8.33
  esiEmployeeRate: number; // 0.75
  esiEmployerRate: number; // 3.25
  esiThreshold: number; // 21000
  ptConfig: StatePTConfig[];
  lwfConfig: LWFConfig[];
  updatedAt: string;
}

export interface DeductionBreakdown {
  epfEmployee: number;
  epfEmployer: number;
  epsContribution: number;
  esiEmployee: number;
  esiEmployer: number;
  professionalTax: number;
  lwf: number;
  tds: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
}
