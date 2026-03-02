import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, IndianRupee, FileText, Users } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/payroll-logo.dim_128x128.png"
            alt="PayrollPro"
            className="h-10 w-10 rounded-lg object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-xl font-bold text-sidebar-foreground">PayrollPro</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-sidebar-foreground leading-tight">
              Indian Payroll System
            </h1>
            <p className="mt-3 text-sidebar-foreground/70 text-lg">
              Compliant with Indian Labour Laws & Income Tax Rules
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: IndianRupee, title: 'EPF, ESI & PT Compliance', desc: 'Automated statutory deductions per Indian labour laws' },
              { icon: FileText, title: 'Old & New Tax Regime', desc: 'TDS computation with investment declarations' },
              { icon: Users, title: 'Complete Employee Management', desc: 'PAN, Aadhaar, UAN, ESIC with validation' },
              { icon: Shield, title: 'Payslip & Reports', desc: 'PF ECR, ESI Challan, Form 24Q exports' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent">
                  <feature.icon className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">{feature.title}</p>
                  <p className="text-xs text-sidebar-foreground/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-sidebar-foreground/40">
          FY 2024-25 compliant · Indian Rupee (₹) · All statutory rates configurable
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:hidden">
            <img
              src="/assets/generated/payroll-logo.dim_128x128.png"
              alt="PayrollPro"
              className="h-16 w-16 mx-auto rounded-xl object-contain mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <h1 className="text-2xl font-bold">PayrollPro</h1>
            <p className="text-muted-foreground text-sm mt-1">Indian Payroll System</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground text-sm">
              Use Internet Identity to securely access your payroll system.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-11 text-base font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secure, decentralized authentication powered by the Internet Computer
          </p>
        </div>
      </div>
    </div>
  );
}
