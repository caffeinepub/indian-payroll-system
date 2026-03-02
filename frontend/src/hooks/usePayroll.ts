import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { PayrollRun, EmployeePayrollData } from '../types/payroll';
import { v4 as uuidv4 } from '../lib/uuid';

function getPayrollRuns(): PayrollRun[] {
  return getFromStorage<PayrollRun[]>(STORAGE_KEYS.PAYROLL_RUNS, []);
}

export function useGetPayrollRuns() {
  return useQuery({
    queryKey: ['payrollRuns'],
    queryFn: () => getPayrollRuns().sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    }),
  });
}

export function useGetPayrollRun(month: number, year: number) {
  return useQuery({
    queryKey: ['payrollRun', month, year],
    queryFn: () => getPayrollRuns().find(r => r.month === month && r.year === year) || null,
  });
}

export function useInitiatePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year, employees }: { month: number; year: number; employees: EmployeePayrollData[] }) => {
      const runs = getPayrollRuns();
      const existing = runs.find(r => r.month === month && r.year === year);
      if (existing && existing.status !== 'Draft') {
        throw new Error('Payroll for this month is already approved or paid');
      }
      const totalGross = employees.reduce((s, e) => s + e.grossSalary, 0);
      const totalDeductions = employees.reduce((s, e) => s + e.totalDeductions, 0);
      const totalNetPay = employees.reduce((s, e) => s + e.netPay, 0);
      const totalEpfEmployer = employees.reduce((s, e) => s + e.epfEmployer, 0);
      const totalEsiEmployer = employees.reduce((s, e) => s + e.esiEmployer, 0);

      const run: PayrollRun = {
        id: existing?.id || uuidv4(),
        month,
        year,
        status: 'Draft',
        employees,
        totalGross,
        totalDeductions,
        totalNetPay,
        totalEpfEmployer,
        totalEsiEmployer,
        initiatedAt: existing?.initiatedAt || new Date().toISOString(),
      };

      const updated = existing
        ? runs.map(r => r.month === month && r.year === year ? run : r)
        : [...runs, run];
      saveToStorage(STORAGE_KEYS.PAYROLL_RUNS, updated);
      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRun'] });
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const runs = getPayrollRuns();
      const updated = runs.map(r =>
        r.month === month && r.year === year && r.status === 'Draft'
          ? { ...r, status: 'Approved' as const, approvedAt: new Date().toISOString() }
          : r
      );
      saveToStorage(STORAGE_KEYS.PAYROLL_RUNS, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRun'] });
    },
  });
}

export function useUnlockPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year, reason }: { month: number; year: number; reason: string }) => {
      const runs = getPayrollRuns();
      const updated = runs.map(r =>
        r.month === month && r.year === year && r.status === 'Approved'
          ? { ...r, status: 'Draft' as const, unlockedAt: new Date().toISOString(), unlockReason: reason }
          : r
      );
      saveToStorage(STORAGE_KEYS.PAYROLL_RUNS, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRun'] });
    },
  });
}

export function useMarkPayrollAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const runs = getPayrollRuns();
      const updated = runs.map(r =>
        r.month === month && r.year === year && r.status === 'Approved'
          ? { ...r, status: 'Paid' as const, paidAt: new Date().toISOString() }
          : r
      );
      saveToStorage(STORAGE_KEYS.PAYROLL_RUNS, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRun'] });
    },
  });
}
