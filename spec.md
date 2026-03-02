# Specification

## Summary
**Goal:** Add client-side PDF download functionality for employee payslips directly from the PayslipView page.

**Planned changes:**
- Add a "Download PDF" button on the PayslipView page alongside the existing Print button
- Implement client-side PDF generation using a browser-based library (e.g., jsPDF or similar)
- Generated PDF includes all payslip sections: employee details, pay period, earnings breakdown, deductions breakdown, gross pay, total deductions, and net pay
- PDF file is named in the format `Payslip_<EmployeeName>_<Month>_<Year>.pdf`
- PDF layout styled to match the existing teal/green enterprise theme

**User-visible outcome:** Employees and admins can download a professionally formatted PDF of any payslip directly from the PayslipView page with a single button click, with no backend interaction required.
