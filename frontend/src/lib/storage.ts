// Local storage utilities for persisting payroll data
const STORAGE_KEYS = {
  EMPLOYEES: 'payroll_employees',
  SALARY_STRUCTURES: 'payroll_salary_structures',
  STATUTORY_SETTINGS: 'payroll_statutory_settings',
  TAX_SETTINGS: 'payroll_tax_settings',
  TAX_DECLARATIONS: 'payroll_tax_declarations',
  LEAVE_TYPES: 'payroll_leave_types',
  ATTENDANCE: 'payroll_attendance',
  LEAVE_BALANCES: 'payroll_leave_balances',
  PAYROLL_RUNS: 'payroll_runs',
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export { STORAGE_KEYS };
