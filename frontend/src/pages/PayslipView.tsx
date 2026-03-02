import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetPayrollRuns } from '../hooks/usePayroll';
import { useGetEmployees } from '../hooks/useEmployees';
import { formatCurrency, getMonthName, maskPAN } from '../lib/calculations';
import { generatePayslipPDF } from '../lib/pdfGenerator';
import type { EmployeePayrollData } from '../types/payroll';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function PayslipView() {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: employees = [] } = useGetEmployees();
  const { data: payrollRuns = [] } = useGetPayrollRuns();

  const run = payrollRuns.find(r => r.month === month && r.year === year);
  const empData: EmployeePayrollData | undefined = run?.employees.find(e => e.employeeId === selectedEmployee);
  const employee = employees.find(e => e.id === selectedEmployee);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!empData || !employee) return;

    setIsGeneratingPDF(true);
    try {
      await generatePayslipPDF({
        empData,
        employeeId: employee.employeeId,
        month,
        year,
        logoUrl: `${window.location.origin}/assets/generated/payroll-logo.dim_128x128.png`,
      });
      toast.success('Payslip PDF ready', {
        description: `Payslip for ${empData.employeeName} — ${getMonthName(month)} ${year}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.';
      toast.error('PDF generation failed', { description: message });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payslip</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and download employee payslips</p>
        </div>
      </div>

      {/* Selectors */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name} ({e.employeeId})</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {empData && (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF…
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedEmployee && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Select an employee and month to view payslip
        </div>
      )}

      {selectedEmployee && !run && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No payroll run found for {getMonthName(month)} {year}. Please process payroll first.
        </div>
      )}

      {selectedEmployee && run && !empData && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Employee not found in this payroll run.
        </div>
      )}

      {empData && employee && (
        <div ref={printRef}>
          <Card className="shadow-card max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-sidebar text-sidebar-foreground p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/generated/payroll-logo.dim_128x128.png"
                    alt="Logo"
                    className="h-10 w-10 rounded-md object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div>
                    <h2 className="text-lg font-bold">PayrollPro India</h2>
                    <p className="text-xs text-sidebar-foreground/70">Payslip for {getMonthName(month)} {year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-sidebar-foreground/70">Pay Period</p>
                  <p className="font-semibold">{getMonthName(month)} {year}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><span className="text-muted-foreground">Employee Name:</span> <span className="font-medium ml-2">{empData.employeeName}</span></div>
                <div><span className="text-muted-foreground">Employee ID:</span> <span className="font-mono ml-2">{employee.employeeId}</span></div>
                <div><span className="text-muted-foreground">Designation:</span> <span className="font-medium ml-2">{empData.designation}</span></div>
                <div><span className="text-muted-foreground">Department:</span> <span className="font-medium ml-2">{empData.department}</span></div>
                <div><span className="text-muted-foreground">PAN:</span> <span className="font-mono ml-2">{maskPAN(empData.pan)}</span></div>
                <div><span className="text-muted-foreground">UAN:</span> <span className="font-mono ml-2">{empData.uan || '—'}</span></div>
                <div><span className="text-muted-foreground">Working Days:</span> <span className="font-medium ml-2">{empData.workingDays}</span></div>
                <div><span className="text-muted-foreground">Paid Days:</span> <span className="font-medium ml-2">{empData.paidDays}</span></div>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Earnings</h3>
                  <table className="w-full text-sm">
                    <tbody className="divide-y">
                      {[
                        ['Basic Salary', empData.basicSalary],
                        ['HRA', empData.hra],
                        ['DA', empData.da],
                        ['Special Allowance', empData.specialAllowance],
                        ['Conveyance', empData.conveyanceAllowance],
                        ['Medical', empData.medicalAllowance],
                        ['LTA', empData.lta],
                      ].filter(([, v]) => (v as number) > 0).map(([label, value]) => (
                        <tr key={label as string}>
                          <td className="py-1.5 text-muted-foreground">{label}</td>
                          <td className="py-1.5 text-right tabular-nums font-medium">{formatCurrency(value as number)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-bold">
                        <td className="pt-2">Gross Salary</td>
                        <td className="pt-2 text-right tabular-nums">{formatCurrency(empData.grossSalary)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Deductions</h3>
                  <table className="w-full text-sm">
                    <tbody className="divide-y">
                      {[
                        ['EPF (Employee)', empData.epfEmployee],
                        ['ESI (Employee)', empData.esiEmployee],
                        ['Professional Tax', empData.professionalTax],
                        ['LWF', empData.lwf],
                        ['TDS', empData.tds],
                        ['Loan Deduction', empData.loanDeduction],
                      ].filter(([, v]) => (v as number) > 0).map(([label, value]) => (
                        <tr key={label as string}>
                          <td className="py-1.5 text-muted-foreground">{label}</td>
                          <td className="py-1.5 text-right tabular-nums font-medium text-destructive">{formatCurrency(value as number)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-bold">
                        <td className="pt-2">Total Deductions</td>
                        <td className="pt-2 text-right tabular-nums text-destructive">{formatCurrency(empData.totalDeductions)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Net Pay */}
              <div className="rounded-lg bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-sidebar-foreground/70">Net Pay (Take Home)</p>
                  <p className="text-2xl font-bold tabular-nums">{formatCurrency(empData.netPay)}</p>
                </div>
                <div className="text-right text-xs text-sidebar-foreground/70 space-y-1">
                  <p>EPF Employer: {formatCurrency(empData.epfEmployer)}</p>
                  <p>ESI Employer: {formatCurrency(empData.esiEmployer)}</p>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                This is a computer-generated payslip and does not require a signature.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
