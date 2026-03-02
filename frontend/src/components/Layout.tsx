import React from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <PageBreadcrumb />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <footer className="border-t bg-card px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} Indian Payroll System. All rights reserved.</span>
          <span>
            Built with{' '}
            <span className="text-destructive">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'indian-payroll-system')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </span>
        </footer>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}

function PageBreadcrumb() {
  const location = useLocation();
  const pathMap: Record<string, string> = {
    '/': 'Dashboard',
    '/employees': 'Employees',
    '/salary-structures': 'Salary Structures',
    '/attendance': 'Attendance',
    '/leave-config': 'Leave Configuration',
    '/payroll': 'Payroll Processing',
    '/payslip': 'Payslip',
    '/reports': 'Compliance Reports',
    '/tax-settings': 'Tax Settings',
    '/statutory-settings': 'Statutory Settings',
  };
  const path = location.pathname;
  const label = pathMap[path] || pathMap[path.split('/').slice(0, 2).join('/')] || 'Page';
  return <span className="text-sm font-medium text-foreground">{label}</span>;
}
