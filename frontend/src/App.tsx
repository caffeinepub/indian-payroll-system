import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import SalaryStructures from './pages/SalaryStructures';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveConfiguration from './pages/LeaveConfiguration';
import PayrollProcessing from './pages/PayrollProcessing';
import PayslipView from './pages/PayslipView';
import ComplianceReports from './pages/ComplianceReports';
import TaxSettings from './pages/TaxSettings';
import StatutorySettings from './pages/StatutorySettings';

// Root route with auth guard
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <Outlet />
    </>
  );
}

// Layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

// Page routes
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const employeesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/employees',
  component: EmployeeManagement,
});

const salaryStructuresRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/salary-structures',
  component: SalaryStructures,
});

const attendanceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/attendance',
  component: AttendanceManagement,
});

const leaveConfigRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/leave-config',
  component: LeaveConfiguration,
});

const payrollRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payroll',
  component: PayrollProcessing,
});

const payslipRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payslip',
  component: PayslipView,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reports',
  component: ComplianceReports,
});

const taxSettingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/tax-settings',
  component: TaxSettings,
});

const statutorySettingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/statutory-settings',
  component: StatutorySettings,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    employeesRoute,
    salaryStructuresRoute,
    attendanceRoute,
    leaveConfigRoute,
    payrollRoute,
    payslipRoute,
    reportsRoute,
    taxSettingsRoute,
    statutorySettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
