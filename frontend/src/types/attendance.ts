export interface LeaveType {
  id: string;
  name: string;
  code: string; // EL, CL, SL, LOP
  annualQuota: number;
  carryForward: boolean;
  maxCarryForward: number;
  isPaid: boolean;
  isLOP: boolean;
}

export interface LeaveBalance {
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  allocated: number;
  used: number;
  remaining: number;
  financialYear: string;
}

export interface MonthlyAttendance {
  id: string;
  employeeId: string;
  month: number; // 1-12
  year: number;
  workingDays: number;
  presentDays: number;
  leaveBreakdown: { leaveTypeId: string; leaveTypeName: string; days: number }[];
  lopDays: number;
  paidDays: number;
  updatedAt: string;
}

export const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  { id: 'lt-1', name: 'Earned Leave', code: 'EL', annualQuota: 15, carryForward: true, maxCarryForward: 30, isPaid: true, isLOP: false },
  { id: 'lt-2', name: 'Casual Leave', code: 'CL', annualQuota: 12, carryForward: false, maxCarryForward: 0, isPaid: true, isLOP: false },
  { id: 'lt-3', name: 'Sick Leave', code: 'SL', annualQuota: 7, carryForward: false, maxCarryForward: 0, isPaid: true, isLOP: false },
  { id: 'lt-4', name: 'Loss of Pay', code: 'LOP', annualQuota: 0, carryForward: false, maxCarryForward: 0, isPaid: false, isLOP: true },
];
