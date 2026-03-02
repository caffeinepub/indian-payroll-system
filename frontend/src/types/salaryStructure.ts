export type ComponentMode = 'fixed' | 'percentage';

export interface EarningsComponent {
  name: string;
  mode: ComponentMode;
  value: number; // amount if fixed, percentage if percentage (of Basic)
  isEnabled: boolean;
}

export interface DeductionsComponent {
  name: string;
  mode: ComponentMode;
  value: number;
  isEnabled: boolean;
  isStatutory: boolean;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description: string;
  earnings: EarningsComponent[];
  deductions: DeductionsComponent[];
  createdAt: string;
  updatedAt: string;
}

export type SalaryStructureFormData = Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt'>;

export const DEFAULT_EARNINGS: EarningsComponent[] = [
  { name: 'Basic Salary', mode: 'fixed', value: 0, isEnabled: true },
  { name: 'HRA', mode: 'percentage', value: 40, isEnabled: true },
  { name: 'Dearness Allowance', mode: 'percentage', value: 0, isEnabled: false },
  { name: 'Special Allowance', mode: 'fixed', value: 0, isEnabled: true },
  { name: 'Conveyance Allowance', mode: 'fixed', value: 1600, isEnabled: true },
  { name: 'Medical Allowance', mode: 'fixed', value: 1250, isEnabled: true },
  { name: 'LTA', mode: 'fixed', value: 0, isEnabled: false },
];

export const DEFAULT_DEDUCTIONS: DeductionsComponent[] = [
  { name: 'Employee PF', mode: 'percentage', value: 12, isEnabled: true, isStatutory: true },
  { name: 'ESI', mode: 'percentage', value: 0.75, isEnabled: true, isStatutory: true },
  { name: 'Professional Tax', mode: 'fixed', value: 200, isEnabled: true, isStatutory: true },
  { name: 'LWF', mode: 'fixed', value: 25, isEnabled: true, isStatutory: true },
  { name: 'TDS', mode: 'fixed', value: 0, isEnabled: true, isStatutory: true },
  { name: 'Loan Deduction', mode: 'fixed', value: 0, isEnabled: false, isStatutory: false },
];
