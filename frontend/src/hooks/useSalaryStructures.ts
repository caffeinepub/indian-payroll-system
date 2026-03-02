import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { SalaryStructure, SalaryStructureFormData } from '../types/salaryStructure';
import { v4 as uuidv4 } from '../lib/uuid';

function getStructures(): SalaryStructure[] {
  return getFromStorage<SalaryStructure[]>(STORAGE_KEYS.SALARY_STRUCTURES, []);
}

export function useGetSalaryStructures() {
  return useQuery({
    queryKey: ['salaryStructures'],
    queryFn: () => getStructures(),
  });
}

export function useGetSalaryStructure(id: string) {
  return useQuery({
    queryKey: ['salaryStructure', id],
    queryFn: () => getStructures().find(s => s.id === id) || null,
    enabled: !!id,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SalaryStructureFormData) => {
      const structures = getStructures();
      const newStructure: SalaryStructure = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.SALARY_STRUCTURES, [...structures, newStructure]);
      return newStructure;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salaryStructures'] }),
  });
}

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalaryStructureFormData> }) => {
      const structures = getStructures();
      const updated = structures.map(s =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
      );
      saveToStorage(STORAGE_KEYS.SALARY_STRUCTURES, updated);
      return updated.find(s => s.id === id)!;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] });
      queryClient.invalidateQueries({ queryKey: ['salaryStructure', id] });
    },
  });
}

export function useDeleteSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const structures = getStructures().filter(s => s.id !== id);
      saveToStorage(STORAGE_KEYS.SALARY_STRUCTURES, structures);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salaryStructures'] }),
  });
}
