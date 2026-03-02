import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useGetEmployees, useDeleteEmployee } from '../hooks/useEmployees';
import { maskPAN, maskAadhaar } from '../lib/calculations';
import { DEPARTMENTS } from '../types/employee';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeDeleteConfirmation from '../components/EmployeeDeleteConfirmation';
import type { Employee } from '../types/employee';
import { toast } from 'sonner';

export default function EmployeeManagement() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useGetEmployees({ search, department: department || undefined });
  const deleteMutation = useDeleteEmployee();

  const handleDelete = async () => {
    if (!deleteEmployee) return;
    try {
      await deleteMutation.mutateAsync(deleteEmployee.id);
      toast.success(`${deleteEmployee.name} has been removed`);
      setDeleteEmployee(null);
    } catch {
      toast.error('Failed to delete employee');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{employees.length} active employees</p>
        </div>
        <Button onClick={() => { setEditEmployee(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-sm">No employees found.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setEditEmployee(null); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm payroll-table">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Department</th>
                    <th className="text-left py-3 px-4">Designation</th>
                    <th className="text-left py-3 px-4">PAN</th>
                    <th className="text-left py-3 px-4">Aadhaar</th>
                    <th className="text-left py-3 px-4">Joining Date</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{emp.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-xs">{emp.department}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{emp.designation}</td>
                      <td className="py-3 px-4 font-mono text-xs">{maskPAN(emp.pan)}</td>
                      <td className="py-3 px-4 font-mono text-xs">{maskAadhaar(emp.aadhaar)}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{emp.dateOfJoining}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => { setEditEmployee(emp); setShowForm(true); }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteEmployee(emp)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <EmployeeForm
          employee={editEmployee}
          onClose={() => { setShowForm(false); setEditEmployee(null); }}
        />
      )}

      {deleteEmployee && (
        <EmployeeDeleteConfirmation
          employee={deleteEmployee}
          onConfirm={handleDelete}
          onCancel={() => setDeleteEmployee(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
