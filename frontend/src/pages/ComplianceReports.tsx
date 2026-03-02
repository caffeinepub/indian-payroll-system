import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText } from 'lucide-react';
import { useGetPayrollRuns } from '../hooks/usePayroll';
import { formatCurrency, getMonthName, maskPAN } from '../lib/calculations';
import { exportToCSV } from '../lib/exportCSV';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];
const QUARTERS = [
  { value: 'Q1', label: 'Q1 (Apr–Jun)' },
  { value: 'Q2', label: 'Q2 (Jul–Sep)' },
  { value: 'Q3', label: 'Q3 (Oct–Dec)' },
  { value: 'Q4', label: 'Q4 (Jan–Mar)' },
];

export default function ComplianceReports() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState('Q1');

  const { data: payrollRuns = [] } = useGetPayrollRuns();
  const run = payrollRuns.find(r => r.month === month && r.year === year);

  // PF ECR
  const pfECRData = (run?.employees || []).map(e => ({
    UAN: e.uan || 'N/A',
    'Employee Name': e.employeeName,
    'Gross Wages': e.grossSalary,
    'EPF Wages (Basic+DA)': e.basicSalary + e.da,
    'EPF Employee (12%)': e.epfEmployee,
    'EPF Employer (3.67%)': e.epfEmployer,
    'EPS (8.33%)': e.epsContribution,
    'Total PF': e.epfEmployee + e.epfEmployer + e.epsContribution,
  }));

  // ESI Challan (only gross <= 21000)
  const esiData = (run?.employees || [])
    .filter(e => e.grossSalary <= 21000)
    .map(e => ({
      'ESIC Number': 'N/A',
      'Employee Name': e.employeeName,
      'Gross Wages': e.grossSalary,
      'ESI Employee (0.75%)': e.esiEmployee,
      'ESI Employer (3.25%)': e.esiEmployer,
      'Total ESI': e.esiEmployee + e.esiEmployer,
    }));

  // PT Returns
  const ptData = (run?.employees || [])
    .filter(e => e.professionalTax > 0)
    .map(e => ({
      'Employee Name': e.employeeName,
      'Gross Salary': e.grossSalary,
      'PT Amount': e.professionalTax,
    }));

  // TDS Summary (quarterly)
  const quarterMonths: Record<string, number[]> = {
    Q1: [4, 5, 6], Q2: [7, 8, 9], Q3: [10, 11, 12], Q4: [1, 2, 3],
  };
  const qMonths = quarterMonths[quarter] || [];
  const quarterRuns = payrollRuns.filter(r => qMonths.includes(r.month) && r.year === year);
  const tdsMap: Record<string, { name: string; pan: string; gross: number; tds: number }> = {};
  for (const qRun of quarterRuns) {
    for (const e of qRun.employees) {
      if (!tdsMap[e.employeeId]) {
        tdsMap[e.employeeId] = { name: e.employeeName, pan: e.pan, gross: 0, tds: 0 };
      }
      tdsMap[e.employeeId].gross += e.grossSalary;
      tdsMap[e.employeeId].tds += e.tds;
    }
  }
  const tdsData = Object.values(tdsMap).map(e => ({
    'Employee Name': e.name,
    'PAN': maskPAN(e.pan),
    'Quarterly Gross Income': e.gross,
    'TDS Deducted': e.tds,
  }));

  const PeriodSelector = () => (
    <div className="flex gap-2">
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
  );

  const ReportTable = ({ data, title, filename }: { data: Record<string, string | number>[]; title: string; filename: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{data.length} records</p>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(data, filename)} disabled={data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No data available. Process payroll for {getMonthName(month)} {year} first.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm payroll-table">
            <thead>
              <tr className="border-b bg-muted/30">
                {Object.keys(data[0]).map(h => (
                  <th key={h} className="text-left py-2.5 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="py-2.5 px-3 tabular-nums">
                      {typeof val === 'number' ? formatCurrency(val) : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Compliance Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Generate statutory compliance reports for PF, ESI, PT, and TDS</p>
      </div>

      <Tabs defaultValue="pf-ecr">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="pf-ecr">PF ECR</TabsTrigger>
          <TabsTrigger value="esi">ESI Challan</TabsTrigger>
          <TabsTrigger value="pt">PT Returns</TabsTrigger>
          <TabsTrigger value="tds">TDS (24Q)</TabsTrigger>
        </TabsList>

        <TabsContent value="pf-ecr" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PF ECR Report
                </CardTitle>
                <PeriodSelector />
              </div>
            </CardHeader>
            <CardContent>
              <ReportTable data={pfECRData} title="PF ECR" filename={`PF_ECR_${getMonthName(month)}_${year}.csv`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esi" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ESI Challan Report
                  <span className="text-xs text-muted-foreground font-normal">(Gross ≤ ₹21,000)</span>
                </CardTitle>
                <PeriodSelector />
              </div>
            </CardHeader>
            <CardContent>
              <ReportTable data={esiData} title="ESI Challan" filename={`ESI_Challan_${getMonthName(month)}_${year}.csv`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pt" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Professional Tax Returns
                </CardTitle>
                <PeriodSelector />
              </div>
            </CardHeader>
            <CardContent>
              <ReportTable data={ptData} title="PT Returns" filename={`PT_Returns_${getMonthName(month)}_${year}.csv`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tds" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  TDS Summary — Form 24Q
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
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
            </CardHeader>
            <CardContent>
              <ReportTable data={tdsData} title="TDS Summary" filename={`TDS_24Q_${quarter}_${year}.csv`} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
