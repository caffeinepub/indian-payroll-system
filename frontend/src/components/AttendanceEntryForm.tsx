import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useSaveAttendance, useGetEmployeeAttendance } from '../hooks/useAttendance';
import { getMonthName } from '../lib/calculations';
import type { Employee } from '../types/employee';
import type { LeaveType } from '../types/attendance';
import { toast } from 'sonner';

interface Props {
  employee: Employee;
  month: number;
  year: number;
  workingDays: number;
  leaveTypes: LeaveType[];
  onClose: () => void;
}

export default function AttendanceEntryForm({ employee, month, year, workingDays, leaveTypes, onClose }: Props) {
  const { data: existing } = useGetEmployeeAttendance(employee.id, month, year);
  const saveMutation = useSaveAttendance();

  const [presentDays, setPresentDays] = useState(0);
  const [leaveBreakdown, setLeaveBreakdown] = useState<{ leaveTypeId: string; leaveTypeName: string; days: number }[]>([]);

  useEffect(() => {
    if (existing) {
      setPresentDays(existing.presentDays);
      setLeaveBreakdown(existing.leaveBreakdown);
    } else {
      setPresentDays(workingDays);
      setLeaveBreakdown(leaveTypes.filter(lt => !lt.isLOP).map(lt => ({
        leaveTypeId: lt.id,
        leaveTypeName: lt.name,
        days: 0,
      })));
    }
  }, [existing, workingDays, leaveTypes]);

  const totalLeaves = leaveBreakdown.reduce((s, l) => s + l.days, 0);
  const lopDays = Math.max(0, workingDays - presentDays - totalLeaves);
  const paidDays = presentDays + totalLeaves;

  const updateLeave = (leaveTypeId: string, days: number) => {
    setLeaveBreakdown(prev => prev.map(l => l.leaveTypeId === leaveTypeId ? { ...l, days } : l));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (presentDays + totalLeaves > workingDays) {
      toast.error(`Total days (${presentDays + totalLeaves}) cannot exceed working days (${workingDays})`);
      return;
    }
    try {
      await saveMutation.mutateAsync({
        employeeId: employee.id,
        month,
        year,
        workingDays,
        presentDays,
        leaveBreakdown,
        lopDays,
        paidDays,
      });
      toast.success('Attendance saved');
      onClose();
    } catch {
      toast.error('Failed to save attendance');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance — {employee.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{getMonthName(month)} {year} · {workingDays} working days</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Present Days</Label>
            <Input
              type="number"
              value={presentDays}
              onChange={e => setPresentDays(Math.max(0, Math.min(workingDays, parseInt(e.target.value) || 0)))}
              min={0}
              max={workingDays}
            />
          </div>

          <div className="space-y-2">
            <Label>Leave Breakdown</Label>
            {leaveBreakdown.map(l => (
              <div key={l.leaveTypeId} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-32 shrink-0">{l.leaveTypeName}</span>
                <Input
                  type="number"
                  value={l.days}
                  onChange={e => updateLeave(l.leaveTypeId, Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  className="h-8 w-20"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/40 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Present Days</span>
              <span className="tabular-nums font-medium">{presentDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leave Days</span>
              <span className="tabular-nums font-medium">{totalLeaves}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LOP Days</span>
              <span className={`tabular-nums font-medium ${lopDays > 0 ? 'text-destructive' : ''}`}>{lopDays}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1.5 mt-1.5">
              <span>Paid Days</span>
              <span className="tabular-nums">{paidDays}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
