import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, IndianRupee } from 'lucide-react';
import { useCreateSalaryStructure, useUpdateSalaryStructure } from '../hooks/useSalaryStructures';
import { DEFAULT_EARNINGS, DEFAULT_DEDUCTIONS } from '../types/salaryStructure';
import type { SalaryStructure, SalaryStructureFormData, EarningsComponent, DeductionsComponent } from '../types/salaryStructure';
import { formatCurrency } from '../lib/calculations';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface Props {
  structure: SalaryStructure | null;
  onClose: () => void;
}

export default function SalaryStructureForm({ structure, onClose }: Props) {
  const [name, setName] = useState(structure?.name || '');
  const [description, setDescription] = useState(structure?.description || '');
  const [earnings, setEarnings] = useState<EarningsComponent[]>(
    structure?.earnings || DEFAULT_EARNINGS.map(e => ({ ...e }))
  );
  const [deductions, setDeductions] = useState<DeductionsComponent[]>(
    structure?.deductions || DEFAULT_DEDUCTIONS.map(d => ({ ...d }))
  );

  const createMutation = useCreateSalaryStructure();
  const updateMutation = useUpdateSalaryStructure();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const basic = earnings.find(e => e.name === 'Basic Salary');
  const basicValue = basic?.isEnabled ? basic.value : 0;

  const computeAmount = (comp: EarningsComponent | DeductionsComponent): number => {
    if (!comp.isEnabled) return 0;
    return comp.mode === 'fixed' ? comp.value : (basicValue * comp.value) / 100;
  };

  const grossSalary = earnings.reduce((sum, e) => sum + computeAmount(e), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + computeAmount(d), 0);
  const netPay = grossSalary - totalDeductions;

  const updateEarning = (idx: number, field: keyof EarningsComponent, value: string | number | boolean) => {
    setEarnings(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const updateDeduction = (idx: number, field: keyof DeductionsComponent, value: string | number | boolean) => {
    setDeductions(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Structure name is required'); return; }
    const data: SalaryStructureFormData = { name: name.trim(), description: description.trim(), earnings, deductions };
    try {
      if (structure) {
        await updateMutation.mutateAsync({ id: structure.id, data });
        toast.success('Salary structure updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Salary structure created');
      }
      onClose();
    } catch {
      toast.error('Failed to save salary structure');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{structure ? 'Edit Salary Structure' : 'New Salary Structure'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Structure Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Senior Engineer Band" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
          </div>

          {/* Earnings */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Earnings Components</h3>
            <div className="space-y-2">
              {earnings.map((comp, idx) => (
                <div key={comp.name} className="flex items-center gap-3 p-3 rounded-md border bg-card">
                  <Switch
                    checked={comp.isEnabled}
                    onCheckedChange={v => updateEarning(idx, 'isEnabled', v)}
                  />
                  <span className="text-sm font-medium w-44 shrink-0">{comp.name}</span>
                  <Select
                    value={comp.mode}
                    onValueChange={v => updateEarning(idx, 'mode', v)}
                    disabled={!comp.isEnabled}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      <SelectItem value="percentage">% of Basic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={comp.value || ''}
                    onChange={e => updateEarning(idx, 'value', parseFloat(e.target.value) || 0)}
                    disabled={!comp.isEnabled}
                    className="h-8 w-28 text-xs tabular-nums"
                    min={0}
                    step={comp.mode === 'percentage' ? 0.5 : 100}
                  />
                  <span className="text-xs text-muted-foreground w-24 text-right tabular-nums">
                    {comp.isEnabled ? formatCurrency(computeAmount(comp)) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Deductions */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Deduction Components</h3>
            <div className="space-y-2">
              {deductions.map((comp, idx) => (
                <div key={comp.name} className="flex items-center gap-3 p-3 rounded-md border bg-card">
                  <Switch
                    checked={comp.isEnabled}
                    onCheckedChange={v => updateDeduction(idx, 'isEnabled', v)}
                    disabled={comp.isStatutory}
                  />
                  <span className="text-sm font-medium w-44 shrink-0">
                    {comp.name}
                    {comp.isStatutory && <span className="ml-1 text-xs text-muted-foreground">(statutory)</span>}
                  </span>
                  <Select
                    value={comp.mode}
                    onValueChange={v => updateDeduction(idx, 'mode', v)}
                    disabled={!comp.isEnabled}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      <SelectItem value="percentage">% of Basic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={comp.value || ''}
                    onChange={e => updateDeduction(idx, 'value', parseFloat(e.target.value) || 0)}
                    disabled={!comp.isEnabled}
                    className="h-8 w-28 text-xs tabular-nums"
                    min={0}
                    step={comp.mode === 'percentage' ? 0.1 : 50}
                  />
                  <span className="text-xs text-muted-foreground w-24 text-right tabular-nums">
                    {comp.isEnabled ? formatCurrency(computeAmount(comp)) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Salary</span>
              <span className="font-semibold tabular-nums">{formatCurrency(grossSalary)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-semibold text-destructive tabular-nums">- {formatCurrency(totalDeductions)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Net Take-Home</span>
              <span className="text-success tabular-nums">{formatCurrency(netPay)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {structure ? 'Update Structure' : 'Create Structure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
