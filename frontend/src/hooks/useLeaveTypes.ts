import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { LeaveType } from '../types/attendance';
import { DEFAULT_LEAVE_TYPES } from '../types/attendance';
import { v4 as uuidv4 } from '../lib/uuid';

export function useGetLeaveTypes() {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: () => getFromStorage<LeaveType[]>(STORAGE_KEYS.LEAVE_TYPES, DEFAULT_LEAVE_TYPES),
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<LeaveType, 'id'>) => {
      const types = getFromStorage<LeaveType[]>(STORAGE_KEYS.LEAVE_TYPES, DEFAULT_LEAVE_TYPES);
      const newType: LeaveType = { ...data, id: uuidv4() };
      saveToStorage(STORAGE_KEYS.LEAVE_TYPES, [...types, newType]);
      return newType;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaveTypes'] }),
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LeaveType> }) => {
      const types = getFromStorage<LeaveType[]>(STORAGE_KEYS.LEAVE_TYPES, DEFAULT_LEAVE_TYPES);
      const updated = types.map(t => t.id === id ? { ...t, ...data } : t);
      saveToStorage(STORAGE_KEYS.LEAVE_TYPES, updated);
      return updated.find(t => t.id === id)!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaveTypes'] }),
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const types = getFromStorage<LeaveType[]>(STORAGE_KEYS.LEAVE_TYPES, DEFAULT_LEAVE_TYPES).filter(t => t.id !== id);
      saveToStorage(STORAGE_KEYS.LEAVE_TYPES, types);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaveTypes'] }),
  });
}
