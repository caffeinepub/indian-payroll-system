import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, IndianRupee, Calendar, AlertCircle, TrendingUp, FileText, ChevronRight } from 'lucide-react';
import { useGetEmployees } from '../hooks/useEmployees';
import { useGetPayrollRuns } from '../hooks/usePayroll';
import { formatCurrency, getMonthName } from '../lib/calculations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: employees = [] } = useGetEmployees();
  const { data: payrollRuns = [] } = useGetPayrollRuns();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentPayroll = payrollRuns.find(r => r.month === currentMonth && r.year === currentYear);
  const lastPayroll = payrollRuns[0];

  const statusColor = (status?: string) => {
    if (status === 'Paid') return 'bg-success/10 text-success border-success/20';
    if (status === 'Approved') return 'bg-warning/10 text-warning border-warning/20';
    if (status === 'Draft') return 'bg-muted text-muted-foreground border-border';
    return 'bg-muted text-muted-foreground border-border';
  };

  // Compliance deadlines
  const complianceDeadlines = [
    { name: 'PF ECR Filing', date: `15 ${getMonthName(currentMonth === 12 ? 1 : currentMonth + 1)}`, type: 'PF' },
    { name: 'ESI Challan', date: `21 ${getMonthName(currentMonth === 12 ? 1 : currentMonth + 1)}`, type: 'ESI' },
    { name: 'TDS Deposit', date: `7 ${getMonthName(currentMonth === 12 ? 1 : currentMonth + 1)}`, type: 'TDS' },
    { name: 'PT Returns', date: `Last day of month`, type: 'PT' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {getMonthName(currentMonth)} {currentYear} · Financial Year {currentYear >= 4 ? `${currentYear}-${(currentYear + 1).toString().slice(2)}` : `${currentYear - 1}-${currentYear.toString().slice(2)}`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Employees</p>
                <p className="text-3xl font-bold text-foreground mt-1">{employees.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Active headcount</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Month Payroll</p>
                <div className="mt-1">
                  {currentPayroll ? (
                    <>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(currentPayroll.totalNetPay)}</p>
                      <Badge variant="outline" className={`text-xs mt-1 ${statusColor(currentPayroll.status)}`}>
                        {currentPayroll.status}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-muted-foreground">Not Initiated</p>
                      <p className="text-xs text-muted-foreground mt-1">{getMonthName(currentMonth)} {currentYear}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Payroll Run</p>
                {lastPayroll ? (
                  <>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {getMonthName(lastPayroll.month)} {lastPayroll.year}
                    </p>
                    <Badge variant="outline" className={`text-xs mt-1 ${statusColor(lastPayroll.status)}`}>
                      {lastPayroll.status}
                    </Badge>
                  </>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground mt-1">No runs yet</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payroll Runs</p>
                <p className="text-3xl font-bold text-foreground mt-1">{payrollRuns.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total processed</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Deadlines */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Upcoming Compliance Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceDeadlines.map((deadline) => (
              <div key={deadline.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs font-mono w-10 justify-center">
                    {deadline.type}
                  </Badge>
                  <span className="text-sm font-medium">{deadline.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{deadline.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Add New Employee', path: '/employees', icon: Users },
              { label: 'Process Payroll', path: '/payroll', icon: IndianRupee },
              { label: 'View Attendance', path: '/attendance', icon: Calendar },
              { label: 'Generate Reports', path: '/reports', icon: FileText },
            ].map((action) => (
              <Button
                key={action.path}
                variant="ghost"
                className="w-full justify-between h-10 px-3"
                onClick={() => navigate({ to: action.path })}
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{action.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      {payrollRuns.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Payroll Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm payroll-table">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Month</th>
                    <th className="text-right py-2 px-3">Employees</th>
                    <th className="text-right py-2 px-3">Gross Pay</th>
                    <th className="text-right py-2 px-3">Net Pay</th>
                    <th className="text-center py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.slice(0, 5).map((run) => (
                    <tr key={run.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate({ to: '/payroll' })}>
                      <td className="py-2 px-3 font-medium">{getMonthName(run.month)} {run.year}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{run.employees.length}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(run.totalGross)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold">{formatCurrency(run.totalNetPay)}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant="outline" className={`text-xs ${statusColor(run.status)}`}>
                          {run.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
