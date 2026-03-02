import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { MonthlyAttendance, LeaveBalance } from '../types/attendance';
import { getWorkingDaysInMonth } from '../lib/calculations';
import { v4 as uuidv4 } from '../lib/uuid';

export function useGetAttendance(month: number, year: number) {
  return useQuery({
    queryKey: ['attendance', month, year],
    queryFn: () => {
      const all = getFromStorage<MonthlyAttendance[]>(STORAGE_KEYS.ATTENDANCE, []);
      return all.filter(a => a.month === month && a.year === year);
    },
  });
}

export function useGetEmployeeAttendance(employeeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['attendance', employeeId, month, year],
    queryFn: () => {
      const all = getFromStorage<MonthlyAttendance[]>(STORAGE_KEYS.ATTENDANCE, []);
      return all.find(a => a.employeeId === employeeId && a.month === month && a.year === year) || null;
    },
    enabled: !!employeeId,
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendance: Omit<MonthlyAttendance, 'id' | 'updatedAt'>) => {
      const all = getFromStorage<MonthlyAttendance[]>(STORAGE_KEYS.ATTENDANCE, []);
      const existing = all.findIndex(
        a => a.employeeId === attendance.employeeId && a.month === attendance.month && a.year === attendance.year
      );
      const record: MonthlyAttendance = {
        ...attendance,
        id: existing >= 0 ? all[existing].id : uuidv4(),
        updatedAt: new Date().toISOString(),
      };
      if (existing >= 0) {
        all[existing] = record;
      } else {
        all.push(record);
      }
      saveToStorage(STORAGE_KEYS.ATTENDANCE, all);
      return record;
    },
    onSuccess: (_, att) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', att.month, att.year] });
      queryClient.invalidateQueries({ queryKey: ['attendance', att.employeeId, att.month, att.year] });
    },
  });
}

export function useGetWorkingDays(month: number, year: number) {
  return useQuery({
    queryKey: ['workingDays', month, year],
    queryFn: () => getWorkingDaysInMonth(month, year),
  });
}

export function useGetLeaveBalances(employeeId: string) {
  return useQuery({
    queryKey: ['leaveBalances', employeeId],
    queryFn: () => {
      const all = getFromStorage<LeaveBalance[]>(STORAGE_KEYS.LEAVE_BALANCES, []);
      return all.filter(b => b.employeeId === employeeId);
    },
    enabled: !!employeeId,
  });
}
