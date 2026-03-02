export interface Employee {
  id: string;
  // Personal Details
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  // Employment Details
  employeeId: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  employmentType: 'Permanent' | 'Contract' | 'Probation';
  // Statutory Identifiers
  pan: string;
  aadhaar: string;
  uan: string;
  esicNumber: string;
  // Bank Details
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  // Salary
  salaryStructureId?: string;
  ctc: number;
  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;

export const DEPARTMENTS = [
  'Engineering', 'Finance', 'HR', 'Marketing', 'Operations',
  'Sales', 'Legal', 'Admin', 'IT', 'Product', 'Design', 'Customer Support'
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];
