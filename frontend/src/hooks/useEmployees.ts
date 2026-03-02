import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { Employee, EmployeeFormData } from '../types/employee';
import { v4 as uuidv4 } from '../lib/uuid';

function getEmployees(): Employee[] {
  return getFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
}

export function useGetEmployees(filters?: { department?: string; designation?: string; search?: string }) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => {
      let employees = getEmployees().filter(e => e.isActive);
      if (filters?.department) {
        employees = employees.filter(e => e.department === filters.department);
      }
      if (filters?.designation) {
        employees = employees.filter(e => e.designation.toLowerCase().includes(filters.designation!.toLowerCase()));
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        employees = employees.filter(e =>
          e.name.toLowerCase().includes(s) ||
          e.employeeId.toLowerCase().includes(s) ||
          e.department.toLowerCase().includes(s)
        );
      }
      return employees;
    },
  });
}

export function useGetEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployees().find(e => e.id === id) || null,
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const employees = getEmployees();
      // Check duplicate PAN
      if (data.pan && employees.some(e => e.pan.toUpperCase() === data.pan.toUpperCase() && e.isActive)) {
        throw new Error('An employee with this PAN already exists');
      }
      // Check duplicate Aadhaar
      if (data.aadhaar && employees.some(e => e.aadhaar.replace(/\s/g, '') === data.aadhaar.replace(/\s/g, '') && e.isActive)) {
        throw new Error('An employee with this Aadhaar number already exists');
      }
      const newEmployee: Employee = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.EMPLOYEES, [...employees, newEmployee]);
      return newEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      const employees = getEmployees();
      // Check duplicate PAN (excluding current employee)
      if (data.pan && employees.some(e => e.id !== id && e.pan.toUpperCase() === data.pan!.toUpperCase() && e.isActive)) {
        throw new Error('An employee with this PAN already exists');
      }
      const updated = employees.map(e =>
        e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
      );
      saveToStorage(STORAGE_KEYS.EMPLOYEES, updated);
      return updated.find(e => e.id === id)!;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const employees = getEmployees();
      const updated = employees.map(e => e.id === id ? { ...e, isActive: false, updatedAt: new Date().toISOString() } : e);
      saveToStorage(STORAGE_KEYS.EMPLOYEES, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
