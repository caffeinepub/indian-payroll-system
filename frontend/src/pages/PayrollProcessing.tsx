import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, CheckCircle, Unlock, CreditCard, Eye } from 'lucide-react';
import { useGetPayrollRuns, useInitiatePayroll, useApprovePayroll, useUnlockPayroll, useMarkPayrollAsPaid } from '../hooks/usePayroll';
import { useGetEmployees } from '../hooks/useEmployees';
import { useGetAttendance, useGetWorkingDays } from '../hooks/useAttendance';
import { useGetStatutorySettings } from '../hooks/useStatutorySettings';
import { useGetTaxDeclaration } from '../hooks/useTaxSettings';
import { useGetTaxSettings } from '../hooks/useTaxSettings';
import { formatCurrency, getMonthName, computeStatutoryDeductions, computeTDS } from '../lib/calculations';
import type { EmployeePayrollData } from '../types/payroll';
import type { Employee } from '../types/employee';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFromStorage, STORAGE_KEYS } from '../lib/storage';
import type { TaxDeclaration } from '../types/tax';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

function statusBadgeClass(status: string) {
  if (status === 'Paid') return 'bg-success/10 text-success border-success/20';
  if (status === 'Approved') return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-muted text-muted-foreground border-border';
}

export default function PayrollProcessing() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [selectedRun, setSelectedRun] = useState<{ month: number; year: number } | null>(null);

  const { data: payrollRuns = [] } = useGetPayrollRuns();
  const { data: employees = [] } = useGetEmployees();
  const { data: statutorySettings } = useGetStatutorySettings();
  const { data: taxSettings } = useGetTaxSettings();

  const initiateMutation = useInitiatePayroll();
  const approveMutation = useApprovePayroll();
  const unlockMutation = useUnlockPayroll();
  const paidMutation = useMarkPayrollAsPaid();

  const currentRun = payrollRuns.find(r => r.month === month && r.year === year);

  const handleInitiatePayroll = async () => {
    if (!statutorySettings || !taxSettings) {
      toast.error('Statutory and tax settings must be configured first');
      return;
    }
    if (employees.length === 0) {
      toast.error('No employees found');
      return;
    }

    const attendanceRecords = getFromStorage<ReturnType<typeof Array>>(STORAGE_KEYS.ATTENDANCE, []) as Array<{
      employeeId: string; month: number; year: number; workingDays: number;
      presentDays: number; lopDays: number; paidDays: number;
    }>;
    const taxDeclarations = getFromStorage<TaxDeclaration[]>(STORAGE_KEYS.TAX_DECLARATIONS, []);

    const payrollData: EmployeePayrollData[] = employees.map((emp: Employee) => {
      const att = attendanceRecords.find(a => a.employeeId === emp.id && a.month === month && a.year === year);
      const workingDays = att?.workingDays || 22;
      const paidDays = att?.paidDays || workingDays;
      const lopDays = att?.lopDays || 0;

      // Monthly salary components (approximate from CTC)
      const monthlyCTC = emp.ctc / 12;
      const basicSalary = Math.round(monthlyCTC * 0.4 * 100) / 100;
      const hra = Math.round(basicSalary * 0.4 * 100) / 100;
      const da = 0;
      const specialAllowance = Math.round((monthlyCTC - basicSalary - hra) * 100) / 100;
      const conveyanceAllowance = 1600;
      const medicalAllowance = 1250;
      const lta = 0;
      const otherEarnings = 0;

      const grossBeforeLOP = basicSalary + hra + da + specialAllowance + conveyanceAllowance + medicalAllowance + lta + otherEarnings;
      const dailyRate = grossBeforeLOP / workingDays;
      const lopDeduction = Math.round(dailyRate * lopDays * 100) / 100;
      const grossSalary = Math.round((grossBeforeLOP - lopDeduction) * 100) / 100;

      const statutory = computeStatutoryDeductions(basicSalary, da, grossSalary, statutorySettings, emp.state);

      // TDS
      const declaration = taxDeclarations.find(d => d.employeeId === emp.id);
      let tds = 0;
      if (declaration && taxSettings) {
        const annualGross = grossSalary * 12;
        const projection = computeTDS(emp, annualGross, declaration, taxSettings);
        tds = projection.tdsPerMonth;
      }

      const totalDeductions = statutory.epfEmployee + statutory.esiEmployee + statutory.professionalTax + statutory.lwf + tds;
      const netPay = Math.round((grossSalary - totalDeductions) * 100) / 100;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        designation: emp.designation,
        department: emp.department,
        pan: emp.pan,
        uan: emp.uan,
        workingDays,
        paidDays,
        lopDays,
        basicSalary,
        hra,
        da,
        specialAllowance,
        conveyanceAllowance,
        medicalAllowance,
        lta,
        otherEarnings,
        grossSalary,
        epfEmployee: statutory.epfEmployee,
        epfEmployer: statutory.epfEmployer,
        epsContribution: statutory.epsContribution,
        esiEmployee: statutory.esiEmployee,
        esiEmployer: statutory.esiEmployer,
        professionalTax: statutory.professionalTax,
        lwf: statutory.lwf,
        tds,
        loanDeduction: 0,
        totalDeductions,
        netPay,
      };
    });

    try {
      await initiateMutation.mutateAsync({ month, year, employees: payrollData });
      toast.success(`Payroll for ${getMonthName(month)} ${year} initiated successfully`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to initiate payroll');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ month, year });
      toast.success('Payroll approved and locked');
      setShowApproveDialog(false);
    } catch { toast.error('Failed to approve payroll'); }
  };

  const handleUnlock = async () => {
    if (!unlockReason.trim()) { toast.error('Please provide a reason for unlocking'); return; }
    try {
      await unlockMutation.mutateAsync({ month, year, reason: unlockReason });
      toast.success('Payroll unlocked for editing');
      setShowUnlockDialog(false);
      setUnlockReason('');
    } catch { toast.error('Failed to unlock payroll'); }
  };

  const handleMarkPaid = async () => {
    try {
      await paidMutation.mutateAsync({ month, year });
      toast.success('Payroll marked as paid');
    } catch { toast.error('Failed to mark payroll as paid'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payroll Processing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Process monthly payroll with statutory deductions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Bar */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{getMonthName(month)} {year}</span>
              {currentRun ? (
                <Badge variant="outline" className={statusBadgeClass(currentRun.status)}>
                  {currentRun.status}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">Not Initiated</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {(!currentRun || currentRun.status === 'Draft') && (
                <Button onClick={handleInitiatePayroll} disabled={initiateMutation.isPending}>
                  {initiateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  {currentRun ? 'Re-run Payroll' : 'Initiate Payroll'}
                </Button>
              )}
              {currentRun?.status === 'Draft' && (
                <Button variant="outline" onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {currentRun?.status === 'Approved' && (
                <>
                  <Button variant="outline" onClick={() => setShowUnlockDialog(true)}>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock
                  </Button>
                  <Button onClick={handleMarkPaid} disabled={paidMutation.isPending}>
                    {paidMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Mark as Paid
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {currentRun && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Employees', value: String(currentRun.employees.length) },
            { label: 'Total Gross', value: formatCurrency(currentRun.totalGross) },
            { label: 'Total Deductions', value: formatCurrency(currentRun.totalDeductions) },
            { label: 'Total Net Pay', value: formatCurrency(currentRun.totalNetPay) },
          ].map(card => (
            <Card key={card.label} className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{card.label}</p>
                <p className="text-lg font-bold mt-1 tabular-nums">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Employee Payroll Table */}
      {currentRun && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Employee Payroll Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm payroll-table">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-center py-3 px-3">Paid Days</th>
                    <th className="text-center py-3 px-3">LOP</th>
                    <th className="text-right py-3 px-3">Gross</th>
                    <th className="text-right py-3 px-3">EPF</th>
                    <th className="text-right py-3 px-3">ESI</th>
                    <th className="text-right py-3 px-3">PT</th>
                    <th className="text-right py-3 px-3">TDS</th>
                    <th className="text-right py-3 px-3">Total Ded.</th>
                    <th className="text-right py-3 px-4">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRun.employees.map(emp => (
                    <tr key={emp.employeeId} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <p className="font-medium">{emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{emp.department}</p>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums">{emp.paidDays}</td>
                      <td className="py-3 px-3 text-center tabular-nums">
                        <span className={emp.lopDays > 0 ? 'text-destructive' : ''}>{emp.lopDays}</span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">{formatCurrency(emp.grossSalary)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">{formatCurrency(emp.epfEmployee)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">{formatCurrency(emp.esiEmployee)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">{formatCurrency(emp.professionalTax)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">{formatCurrency(emp.tds)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-destructive">{formatCurrency(emp.totalDeductions)}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-success">{formatCurrency(emp.netPay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Payroll Runs */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payrollRuns.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No payroll runs yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm payroll-table">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-center py-3 px-4">Employees</th>
                    <th className="text-right py-3 px-4">Gross Pay</th>
                    <th className="text-right py-3 px-4">Net Pay</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.map(run => (
                    <tr key={run.id} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => { setMonth(run.month); setYear(run.year); }}>
                      <td className="py-3 px-4 font-medium">{getMonthName(run.month)} {run.year}</td>
                      <td className="py-3 px-4 text-center tabular-nums">{run.employees.length}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(run.totalGross)}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">{formatCurrency(run.totalNetPay)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={`text-xs ${statusBadgeClass(run.status)}`}>
                          {run.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payroll</DialogTitle>
            <DialogDescription>
              Approving payroll for {getMonthName(month)} {year} will lock it for editing.
              {currentRun && (
                <span className="block mt-2 font-medium text-foreground">
                  {currentRun.employees.length} employees · Net Pay: {formatCurrency(currentRun.totalNetPay)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve & Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Payroll</DialogTitle>
            <DialogDescription>
              Unlocking will revert the payroll to Draft status for editing. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 my-2">
            <Label>Reason for Unlocking *</Label>
            <Input value={unlockReason} onChange={e => setUnlockReason(e.target.value)} placeholder="e.g., Correction needed for employee X" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnlock} disabled={unlockMutation.isPending}>
              {unlockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unlock Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
