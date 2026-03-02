import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit2, Check } from 'lucide-react';
import { useGetEmployees } from '../hooks/useEmployees';
import { useGetAttendance, useGetWorkingDays } from '../hooks/useAttendance';
import { useGetLeaveTypes } from '../hooks/useLeaveTypes';
import { getMonthName } from '../lib/calculations';
import AttendanceEntryForm from '../components/AttendanceEntryForm';
import type { Employee } from '../types/employee';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function AttendanceManagement() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const { data: employees = [] } = useGetEmployees();
  const { data: attendanceRecords = [] } = useGetAttendance(month, year);
  const { data: workingDays = 0 } = useGetWorkingDays(month, year);
  const { data: leaveTypes = [] } = useGetLeaveTypes();

  const getAttendance = (empId: string) =>
    attendanceRecords.find(a => a.employeeId === empId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Working days in {getMonthName(month)} {year}: <strong>{workingDays}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {employees.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No employees found. Add employees first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm payroll-table">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-center py-3 px-4">Working Days</th>
                    <th className="text-center py-3 px-4">Present</th>
                    <th className="text-center py-3 px-4">Leaves</th>
                    <th className="text-center py-3 px-4">LOP</th>
                    <th className="text-center py-3 px-4">Paid Days</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const att = getAttendance(emp.id);
                    const totalLeaves = att?.leaveBreakdown.reduce((s, l) => s + l.days, 0) || 0;
                    return (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{emp.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{emp.employeeId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums">{workingDays}</td>
                        <td className="py-3 px-4 text-center tabular-nums">{att?.presentDays ?? '—'}</td>
                        <td className="py-3 px-4 text-center tabular-nums">{att ? totalLeaves : '—'}</td>
                        <td className="py-3 px-4 text-center tabular-nums">
                          {att ? (
                            <span className={att.lopDays > 0 ? 'text-destructive font-medium' : ''}>
                              {att.lopDays}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-medium">{att?.paidDays ?? '—'}</td>
                        <td className="py-3 px-4 text-center">
                          {att ? (
                            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                              <Check className="h-3 w-3 mr-1" />
                              Entered
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditEmployee(emp)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editEmployee && (
        <AttendanceEntryForm
          employee={editEmployee}
          month={month}
          year={year}
          workingDays={workingDays}
          leaveTypes={leaveTypes}
          onClose={() => setEditEmployee(null)}
        />
      )}
    </div>
  );
}
