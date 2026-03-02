import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import { validatePAN, validateAadhaar } from '../lib/calculations';
import { DEPARTMENTS, INDIAN_STATES } from '../types/employee';
import type { Employee, EmployeeFormData } from '../types/employee';
import { toast } from 'sonner';

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

const emptyForm: EmployeeFormData = {
  name: '', dateOfBirth: '', gender: 'Male', address: '', city: '', state: 'Maharashtra',
  pincode: '', phone: '', email: '', employeeId: '', designation: '', department: 'Engineering',
  dateOfJoining: '', employmentType: 'Permanent', pan: '', aadhaar: '', uan: '', esicNumber: '',
  bankAccountNumber: '', ifscCode: '', bankName: '', ctc: 0, isActive: true,
};

export default function EmployeeForm({ employee, onClose }: Props) {
  const [form, setForm] = useState<EmployeeFormData>(employee ? { ...employee } : emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = (field: keyof EmployeeFormData, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!form.designation.trim()) errs.designation = 'Designation is required';
    if (!form.dateOfJoining) errs.dateOfJoining = 'Date of joining is required';
    if (form.pan && !validatePAN(form.pan)) errs.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
    if (form.aadhaar && !validateAadhaar(form.aadhaar)) errs.aadhaar = 'Aadhaar must be 12 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (employee) {
        await updateMutation.mutateAsync({ id: employee.id, data: form });
        toast.success('Employee updated successfully');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Employee added successfully');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save employee';
      toast.error(msg);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="mt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="statutory">Statutory</TabsTrigger>
              <TabsTrigger value="bank">Bank</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => set('gender', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Select value={form.state} onValueChange={v => set('state', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6-digit pincode" maxLength={6} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Mobile number" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Employee ID *</Label>
                  <Input value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="e.g., EMP001" />
                  {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Designation *</Label>
                  <Input value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g., Software Engineer" />
                  {errors.designation && <p className="text-xs text-destructive">{errors.designation}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={v => set('department', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Employment Type</Label>
                  <Select value={form.employmentType} onValueChange={v => set('employmentType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Probation">Probation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Joining *</Label>
                  <Input type="date" value={form.dateOfJoining} onChange={e => set('dateOfJoining', e.target.value)} />
                  {errors.dateOfJoining && <p className="text-xs text-destructive">{errors.dateOfJoining}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Annual CTC (₹)</Label>
                  <Input
                    type="number"
                    value={form.ctc || ''}
                    onChange={e => set('ctc', parseFloat(e.target.value) || 0)}
                    placeholder="Annual CTC in rupees"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statutory" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>PAN Number</Label>
                  <Input
                    value={form.pan}
                    onChange={e => set('pan', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="font-mono uppercase"
                  />
                  {errors.pan && <p className="text-xs text-destructive">{errors.pan}</p>}
                  <p className="text-xs text-muted-foreground">Format: ABCDE1234F</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Aadhaar Number</Label>
                  <Input
                    value={form.aadhaar}
                    onChange={e => set('aadhaar', e.target.value.replace(/\D/g, ''))}
                    placeholder="12-digit Aadhaar"
                    maxLength={12}
                    className="font-mono"
                  />
                  {errors.aadhaar && <p className="text-xs text-destructive">{errors.aadhaar}</p>}
                  <p className="text-xs text-muted-foreground">12-digit number</p>
                </div>
                <div className="space-y-1.5">
                  <Label>UAN (Universal Account Number)</Label>
                  <Input
                    value={form.uan}
                    onChange={e => set('uan', e.target.value)}
                    placeholder="12-digit UAN for PF"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>ESIC Number</Label>
                  <Input
                    value={form.esicNumber}
                    onChange={e => set('esicNumber', e.target.value)}
                    placeholder="ESIC registration number"
                    className="font-mono"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Bank Account Number</Label>
                  <Input
                    value={form.bankAccountNumber}
                    onChange={e => set('bankAccountNumber', e.target.value)}
                    placeholder="Account number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>IFSC Code</Label>
                  <Input
                    value={form.ifscCode}
                    onChange={e => set('ifscCode', e.target.value.toUpperCase())}
                    placeholder="e.g., SBIN0001234"
                    className="font-mono uppercase"
                    maxLength={11}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Name</Label>
                  <Input
                    value={form.bankName}
                    onChange={e => set('bankName', e.target.value)}
                    placeholder="e.g., State Bank of India"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
