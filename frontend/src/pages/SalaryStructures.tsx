import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { useGetSalaryStructures, useDeleteSalaryStructure } from '../hooks/useSalaryStructures';
import { formatCurrency } from '../lib/calculations';
import type { SalaryStructure } from '../types/salaryStructure';
import SalaryStructureForm from '../components/SalaryStructureForm';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SalaryStructures() {
  const [showForm, setShowForm] = useState(false);
  const [editStructure, setEditStructure] = useState<SalaryStructure | null>(null);
  const [deleteStructure, setDeleteStructure] = useState<SalaryStructure | null>(null);

  const { data: structures = [], isLoading } = useGetSalaryStructures();
  const deleteMutation = useDeleteSalaryStructure();

  const handleDelete = async () => {
    if (!deleteStructure) return;
    try {
      await deleteMutation.mutateAsync(deleteStructure.id);
      toast.success('Salary structure deleted');
      setDeleteStructure(null);
    } catch {
      toast.error('Failed to delete salary structure');
    }
  };

  const getGross = (s: SalaryStructure) => {
    const basic = s.earnings.find(e => e.name === 'Basic Salary');
    if (!basic || !basic.isEnabled) return 0;
    let gross = basic.value;
    for (const comp of s.earnings) {
      if (!comp.isEnabled || comp.name === 'Basic Salary') continue;
      gross += comp.mode === 'fixed' ? comp.value : (basic.value * comp.value) / 100;
    }
    return gross;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Salary Structures</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{structures.length} templates defined</p>
        </div>
        <Button onClick={() => { setEditStructure(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Structure
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : structures.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No salary structures defined yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setEditStructure(null); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Structure
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structures.map((s) => {
            const gross = getGross(s);
            const enabledEarnings = s.earnings.filter(e => e.isEnabled);
            const enabledDeductions = s.deductions.filter(d => d.isEnabled);
            return (
              <Card key={s.id} className="shadow-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      {s.description && (
                        <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setEditStructure(s); setShowForm(true); }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteStructure(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Monthly Gross</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(gross)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">{enabledEarnings.length} earnings</Badge>
                    <Badge variant="outline" className="text-xs">{enabledDeductions.length} deductions</Badge>
                  </div>
                  <div className="space-y-1">
                    {enabledEarnings.slice(0, 3).map(e => (
                      <div key={e.name} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{e.name}</span>
                        <span className="tabular-nums">
                          {e.mode === 'fixed'
                            ? formatCurrency(e.value)
                            : `${e.value}% of Basic`}
                        </span>
                      </div>
                    ))}
                    {enabledEarnings.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{enabledEarnings.length - 3} more</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <SalaryStructureForm
          structure={editStructure}
          onClose={() => { setShowForm(false); setEditStructure(null); }}
        />
      )}

      {deleteStructure && (
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Salary Structure</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteStructure.name}"? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteStructure(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
