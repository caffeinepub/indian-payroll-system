import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, DollarSign, Calendar, ClipboardList,
  FileText, Settings, Shield, LogOut, ChevronRight, Briefcase, BarChart3
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetCallerUserProfile } from '../hooks/useQueries';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Employees', icon: Users, path: '/employees' },
  { label: 'Salary Structures', icon: DollarSign, path: '/salary-structures' },
  { label: 'Attendance', icon: Calendar, path: '/attendance' },
  { label: 'Leave Config', icon: ClipboardList, path: '/leave-config' },
  { label: 'Payroll', icon: Briefcase, path: '/payroll' },
  { label: 'Payslip', icon: FileText, path: '/payslip' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
];

const settingsItems = [
  { label: 'Tax Settings', icon: Settings, path: '/tax-settings' },
  { label: 'Statutory Settings', icon: Shield, path: '/statutory-settings' },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/payroll-logo.dim_128x128.png"
            alt="Payroll Logo"
            className="h-8 w-8 rounded-md object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">PayrollPro</p>
            <p className="text-xs text-sidebar-foreground/60">India Payroll System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate({ to: item.path })}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate({ to: item.path })}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        {identity && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {profile?.name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.email || ''}
              </p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="cursor-pointer text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
