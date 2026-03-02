import type { EmployeePayrollData } from '../types/payroll';
import { formatCurrency, getMonthName, maskPAN } from './calculations';

export interface PayslipPDFData {
  empData: EmployeePayrollData;
  employeeId: string;
  month: number;
  year: number;
  logoUrl?: string;
}

function buildPayslipHTML(data: PayslipPDFData): string {
  const { empData, month, year } = data;
  const monthName = getMonthName(month);

  const earnings = [
    ['Basic Salary', empData.basicSalary],
    ['HRA', empData.hra],
    ['DA', empData.da],
    ['Special Allowance', empData.specialAllowance],
    ['Conveyance Allowance', empData.conveyanceAllowance],
    ['Medical Allowance', empData.medicalAllowance],
    ['LTA', empData.lta],
    ['Other Earnings', empData.otherEarnings],
  ].filter(([, v]) => (v as number) > 0);

  const deductions = [
    ['EPF (Employee)', empData.epfEmployee],
    ['ESI (Employee)', empData.esiEmployee],
    ['Professional Tax', empData.professionalTax],
    ['LWF', empData.lwf],
    ['TDS', empData.tds],
    ['Loan Deduction', empData.loanDeduction],
  ].filter(([, v]) => (v as number) > 0);

  const earningsRows = earnings
    .map(
      ([label, value]) => `
      <tr>
        <td class="label-cell">${label}</td>
        <td class="amount-cell">${formatCurrency(value as number)}</td>
      </tr>`
    )
    .join('');

  const deductionsRows = deductions
    .map(
      ([label, value]) => `
      <tr>
        <td class="label-cell">${label}</td>
        <td class="amount-cell deduction">${formatCurrency(value as number)}</td>
      </tr>`
    )
    .join('');

  const logoTag = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payslip_${empData.employeeName.replace(/\s+/g, '_')}_${monthName}_${year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11px;
      color: #1a2332;
      background: #fff;
      padding: 0;
      margin: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
      background: #fff;
    }

    /* Header */
    .header {
      background: #1a3a4a;
      color: #fff;
      padding: 20px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: contain;
      background: rgba(255,255,255,0.1);
    }
    .company-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .company-sub {
      font-size: 10px;
      color: rgba(255,255,255,0.65);
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
    }
    .pay-period-label {
      font-size: 9px;
      color: rgba(255,255,255,0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pay-period-value {
      font-size: 14px;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Body */
    .body {
      padding: 20px 28px;
    }

    /* Section title */
    .section-title {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #5a7a8a;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2eaee;
    }

    /* Employee details grid */
    .emp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
      margin-bottom: 20px;
    }
    .emp-field {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .emp-label {
      font-size: 9px;
      color: #7a9aaa;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .emp-value {
      font-size: 11px;
      font-weight: 500;
      color: #1a2332;
    }
    .emp-value.mono {
      font-family: 'Courier New', monospace;
      font-size: 10.5px;
    }

    /* Earnings / Deductions tables */
    .tables-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .table-section {}

    table {
      width: 100%;
      border-collapse: collapse;
    }
    .label-cell {
      padding: 5px 6px;
      color: #4a6a7a;
      border-bottom: 1px solid #eef2f5;
      font-size: 10.5px;
    }
    .amount-cell {
      padding: 5px 6px;
      text-align: right;
      font-family: 'Courier New', monospace;
      font-size: 10.5px;
      font-weight: 500;
      border-bottom: 1px solid #eef2f5;
      color: #1a2332;
    }
    .amount-cell.deduction {
      color: #c0392b;
    }
    .total-row td {
      padding: 7px 6px 4px;
      font-weight: 700;
      font-size: 11px;
      border-top: 2px solid #1a3a4a;
      border-bottom: none;
    }
    .total-row .amount-cell {
      color: #1a3a4a;
    }
    .total-row .amount-cell.deduction {
      color: #c0392b;
    }

    /* Net Pay */
    .net-pay-box {
      background: #1a3a4a;
      color: #fff;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .net-pay-label {
      font-size: 9px;
      color: rgba(255,255,255,0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .net-pay-amount {
      font-size: 22px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      letter-spacing: -0.5px;
    }
    .employer-contrib {
      text-align: right;
      font-size: 9.5px;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
    }
    .employer-contrib strong {
      color: rgba(255,255,255,0.9);
    }

    /* Summary row */
    .summary-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .summary-card {
      border: 1px solid #e2eaee;
      border-radius: 6px;
      padding: 10px 12px;
      text-align: center;
    }
    .summary-card-label {
      font-size: 9px;
      color: #7a9aaa;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 4px;
    }
    .summary-card-value {
      font-size: 13px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      color: #1a2332;
    }
    .summary-card-value.green { color: #1a7a4a; }
    .summary-card-value.red { color: #c0392b; }

    /* Footer */
    .footer {
      border-top: 1px solid #e2eaee;
      padding: 12px 28px;
      text-align: center;
      font-size: 9px;
      color: #9ab0bc;
    }

    @media print {
      body { margin: 0; }
      .page { width: 100%; margin: 0; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        ${logoTag}
        <div>
          <div class="company-name">PayrollPro India</div>
          <div class="company-sub">Payslip for ${monthName} ${year}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="pay-period-label">Pay Period</div>
        <div class="pay-period-value">${monthName} ${year}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Employee Details -->
      <div class="section-title">Employee Details</div>
      <div class="emp-grid">
        <div class="emp-field">
          <span class="emp-label">Employee Name</span>
          <span class="emp-value">${empData.employeeName}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">Employee ID</span>
          <span class="emp-value mono">${data.employeeId}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">Designation</span>
          <span class="emp-value">${empData.designation}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">Department</span>
          <span class="emp-value">${empData.department}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">PAN</span>
          <span class="emp-value mono">${maskPAN(empData.pan)}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">UAN</span>
          <span class="emp-value mono">${empData.uan || '—'}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">Working Days</span>
          <span class="emp-value">${empData.workingDays}</span>
        </div>
        <div class="emp-field">
          <span class="emp-label">Paid Days</span>
          <span class="emp-value">${empData.paidDays}</span>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-card-label">Gross Salary</div>
          <div class="summary-card-value green">${formatCurrency(empData.grossSalary)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">Total Deductions</div>
          <div class="summary-card-value red">${formatCurrency(empData.totalDeductions)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">Net Pay</div>
          <div class="summary-card-value">${formatCurrency(empData.netPay)}</div>
        </div>
      </div>

      <!-- Earnings & Deductions -->
      <div class="tables-row">
        <div class="table-section">
          <div class="section-title">Earnings</div>
          <table>
            <tbody>
              ${earningsRows}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td class="label-cell">Gross Salary</td>
                <td class="amount-cell">${formatCurrency(empData.grossSalary)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="table-section">
          <div class="section-title">Deductions</div>
          <table>
            <tbody>
              ${deductionsRows}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td class="label-cell">Total Deductions</td>
                <td class="amount-cell deduction">${formatCurrency(empData.totalDeductions)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Net Pay Box -->
      <div class="net-pay-box">
        <div>
          <div class="net-pay-label">Net Pay (Take Home)</div>
          <div class="net-pay-amount">${formatCurrency(empData.netPay)}</div>
        </div>
        <div class="employer-contrib">
          <div>EPF Employer: <strong>${formatCurrency(empData.epfEmployer)}</strong></div>
          <div>ESI Employer: <strong>${formatCurrency(empData.esiEmployer)}</strong></div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      This is a computer-generated payslip and does not require a signature. &nbsp;|&nbsp;
      Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
</body>
</html>`;
}

export async function generatePayslipPDF(data: PayslipPDFData): Promise<void> {
  const { empData, month, year } = data;
  const monthName = getMonthName(month);
  const filename = `Payslip_${empData.employeeName.replace(/\s+/g, '_')}_${monthName}_${year}`;

  const html = buildPayslipHTML(data);

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow pop-ups for this site.');
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for fonts/images to load, then trigger print
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('PDF generation timed out. Please try again.'));
      printWindow.close();
    }, 15000);

    printWindow.onload = () => {
      clearTimeout(timeout);
      // Small delay to ensure fonts are rendered
      setTimeout(() => {
        try {
          printWindow.document.title = filename;
          printWindow.print();
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 500);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      clearTimeout(timeout);
      try {
        printWindow.document.title = filename;
        printWindow.print();
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 2000);
  });
}
