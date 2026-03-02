import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { TaxSettings, TaxDeclaration } from '../types/tax';
import { DEFAULT_TAX_SETTINGS } from '../types/tax';

export function useGetTaxSettings() {
  return useQuery({
    queryKey: ['taxSettings'],
    queryFn: () => getFromStorage<TaxSettings>(STORAGE_KEYS.TAX_SETTINGS, DEFAULT_TAX_SETTINGS),
  });
}

export function useUpdateTaxSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: TaxSettings) => {
      const updated = { ...settings, updatedAt: new Date().toISOString() };
      saveToStorage(STORAGE_KEYS.TAX_SETTINGS, updated);
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxSettings'] }),
  });
}

export function useGetTaxDeclaration(employeeId: string) {
  return useQuery({
    queryKey: ['taxDeclaration', employeeId],
    queryFn: () => {
      const all = getFromStorage<TaxDeclaration[]>(STORAGE_KEYS.TAX_DECLARATIONS, []);
      return all.find(d => d.employeeId === employeeId) || null;
    },
    enabled: !!employeeId,
  });
}

export function useSaveTaxDeclaration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (declaration: TaxDeclaration) => {
      const all = getFromStorage<TaxDeclaration[]>(STORAGE_KEYS.TAX_DECLARATIONS, []);
      const existing = all.findIndex(d => d.employeeId === declaration.employeeId);
      const updated = { ...declaration, updatedAt: new Date().toISOString() };
      if (existing >= 0) {
        all[existing] = updated;
      } else {
        all.push(updated);
      }
      saveToStorage(STORAGE_KEYS.TAX_DECLARATIONS, all);
      return updated;
    },
    onSuccess: (_, decl) => {
      queryClient.invalidateQueries({ queryKey: ['taxDeclaration', decl.employeeId] });
    },
  });
}
