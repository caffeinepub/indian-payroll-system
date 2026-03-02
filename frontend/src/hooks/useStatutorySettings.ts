import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { StatutorySettings } from '../types/statutory';

const DEFAULT_STATUTORY: StatutorySettings = {
  epfRate: 12,
  epfEmployerRate: 12,
  epsRate: 8.33,
  esiEmployeeRate: 0.75,
  esiEmployerRate: 3.25,
  esiThreshold: 21000,
  ptConfig: [
    {
      state: 'Maharashtra',
      frequency: 'monthly',
      slabs: [
        { id: 'mh-1', minIncome: 0, maxIncome: 7500, ptAmount: 0 },
        { id: 'mh-2', minIncome: 7501, maxIncome: 10000, ptAmount: 175 },
        { id: 'mh-3', minIncome: 10001, maxIncome: null, ptAmount: 200 },
      ],
    },
    {
      state: 'Karnataka',
      frequency: 'monthly',
      slabs: [
        { id: 'ka-1', minIncome: 0, maxIncome: 15000, ptAmount: 0 },
        { id: 'ka-2', minIncome: 15001, maxIncome: 25000, ptAmount: 150 },
        { id: 'ka-3', minIncome: 25001, maxIncome: null, ptAmount: 200 },
      ],
    },
    {
      state: 'West Bengal',
      frequency: 'monthly',
      slabs: [
        { id: 'wb-1', minIncome: 0, maxIncome: 10000, ptAmount: 0 },
        { id: 'wb-2', minIncome: 10001, maxIncome: 15000, ptAmount: 110 },
        { id: 'wb-3', minIncome: 15001, maxIncome: 25000, ptAmount: 130 },
        { id: 'wb-4', minIncome: 25001, maxIncome: 40000, ptAmount: 150 },
        { id: 'wb-5', minIncome: 40001, maxIncome: null, ptAmount: 200 },
      ],
    },
  ],
  lwfConfig: [
    { state: 'Maharashtra', employeeContribution: 25, employerContribution: 75, frequency: 'monthly' },
    { state: 'Karnataka', employeeContribution: 20, employerContribution: 40, frequency: 'monthly' },
  ],
  updatedAt: new Date().toISOString(),
};

export function useGetStatutorySettings() {
  return useQuery({
    queryKey: ['statutorySettings'],
    queryFn: () => getFromStorage<StatutorySettings>(STORAGE_KEYS.STATUTORY_SETTINGS, DEFAULT_STATUTORY),
  });
}

export function useUpdateStatutorySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: StatutorySettings) => {
      const updated = { ...settings, updatedAt: new Date().toISOString() };
      saveToStorage(STORAGE_KEYS.STATUTORY_SETTINGS, updated);
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['statutorySettings'] }),
  });
}
