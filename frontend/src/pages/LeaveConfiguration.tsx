import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useGetLeaveTypes, useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType } from '../hooks/useLeaveTypes';
import type { LeaveType } from '../types/attendance';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const emptyLeaveType: Omit<LeaveType, 'id'> = {
  name: '', code: '', annualQuota: 0, carryForward: false, maxCarryForward: 0, isPaid: true, isLOP: false,
};

export default function LeaveConfiguration() {
  const [showForm, setShowForm] = useState(false);
  const [editType, setEditType] = useState<LeaveType | null>(null);
  const [deleteType, setDeleteType] = useState<LeaveType | null>(null);
  const [form, setForm] = useState<Omit<LeaveType, 'id'>>(emptyLeaveType);

  const { data: leaveTypes = [] } = useGetLeaveTypes();
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();

  const openCreate = () => { setForm(emptyLeaveType); setEditType(null); setShowForm(true); };
  const openEdit = (lt: LeaveType) => { setForm({ ...lt }); setEditType(lt); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) { toast.error('Name and code are required'); return; }
    try {
      if (editType) {
        await updateMutation.mutateAsync({ id: editType.id, data: form });
        toast.success('Leave type updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Leave type created');
      }
      setShowForm(false);
    } catch { toast.error('Failed to save leave type'); }
  };

  const handleDelete = async () => {
    if (!deleteType) return;
    try {
      await deleteMutation.mutateAsync(deleteType.id);
      toast.success('Leave type deleted');
      setDeleteType(null);
    } catch { toast.error('Failed to delete leave type'); }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Configuration</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure leave types and annual quotas</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Type
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm payroll-table">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4">Leave Type</th>
                  <th className="text-center py-3 px-4">Code</th>
                  <th className="text-center py-3 px-4">Annual Quota</th>
                  <th className="text-center py-3 px-4">Carry Forward</th>
                  <th className="text-center py-3 px-4">Paid</th>
                  <th className="text-center py-3 px-4">LOP</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map(lt => (
                  <tr key={lt.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium">{lt.name}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" className="font-mono text-xs">{lt.code}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">{lt.annualQuota} days</td>
                    <td className="py-3 px-4 text-center">
                      {lt.carryForward ? (
                        <span className="text-success text-xs">Yes (max {lt.maxCarryForward})</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={lt.isPaid ? 'default' : 'secondary'} className="text-xs">
                        {lt.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {lt.isLOP && <Badge variant="destructive" className="text-xs">LOP</Badge>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(lt)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteType(lt)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editType ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Leave Name *</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Earned Leave" />
                </div>
                <div className="space-y-1.5">
                  <Label>Code *</Label>
                  <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g., EL" maxLength={5} className="uppercase" />
                </div>
                <div className="space-y-1.5">
                  <Label>Annual Quota (days)</Label>
                  <Input type="number" value={form.annualQuota} onChange={e => setForm(p => ({ ...p, annualQuota: parseInt(e.target.value) || 0 }))} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Carry Forward</Label>
                  <Input type="number" value={form.maxCarryForward} onChange={e => setForm(p => ({ ...p, maxCarryForward: parseInt(e.target.value) || 0 }))} min={0} disabled={!form.carryForward} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.carryForward} onCheckedChange={v => setForm(p => ({ ...p, carryForward: v }))} />
                  <Label>Carry Forward</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isPaid} onCheckedChange={v => setForm(p => ({ ...p, isPaid: v }))} />
                  <Label>Paid Leave</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isLOP} onCheckedChange={v => setForm(p => ({ ...p, isLOP: v }))} />
                  <Label>Is LOP</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editType ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteType && (
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Leave Type</AlertDialogTitle>
              <AlertDialogDescription>Delete "{deleteType.name}"? This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteType(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
