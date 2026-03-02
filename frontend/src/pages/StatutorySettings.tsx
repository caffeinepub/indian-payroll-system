import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Info } from 'lucide-react';
import { useGetStatutorySettings, useUpdateStatutorySettings } from '../hooks/useStatutorySettings';
import type { StatutorySettings as StatutorySettingsType } from '../types/statutory';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function StatutorySettings() {
  const { data: settings } = useGetStatutorySettings();
  const updateMutation = useUpdateStatutorySettings();
  const [form, setForm] = useState<StatutorySettingsType | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateMutation.mutateAsync(form);
      toast.success('Statutory settings saved successfully');
    } catch {
      toast.error('Failed to save statutory settings');
    }
  };

  if (!form) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        Loading settings...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Statutory Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure EPF, ESI, Professional Tax, and LWF rates per Indian labour laws
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>

        <Tabs defaultValue="epf-esi">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="epf-esi">EPF &amp; ESI</TabsTrigger>
            <TabsTrigger value="pt">Professional Tax</TabsTrigger>
            <TabsTrigger value="lwf">LWF</TabsTrigger>
          </TabsList>

          {/* EPF & ESI Tab */}
          <TabsContent value="epf-esi" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EPF Card */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    EPF Configuration
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Employee Provident Fund — calculated on Basic + DA wages
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Employee EPF Rate (%)</Label>
                    <Input
                      type="number"
                      value={form.epfRate}
                      onChange={e =>
                        setForm(p => p ? { ...p, epfRate: parseFloat(e.target.value) || 0 } : p)
                      }
                      step={0.5}
                      min={0}
                      max={100}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: 12% of Basic + DA</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employer EPF Rate (%)</Label>
                    <Input
                      type="number"
                      value={form.epfEmployerRate}
                      onChange={e =>
                        setForm(p => p ? { ...p, epfEmployerRate: parseFloat(e.target.value) || 0 } : p)
                      }
                      step={0.5}
                      min={0}
                      max={100}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Total 12% (3.67% EPF + 8.33% EPS)</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1">
                      EPS Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Employee Pension Scheme — part of employer's 12% contribution
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={form.epsRate}
                      onChange={e =>
                        setForm(p => p ? { ...p, epsRate: parseFloat(e.target.value) || 0 } : p)
                      }
                      step={0.01}
                      min={0}
                      max={100}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: 8.33% (Employee Pension Scheme)</p>
                  </div>

                  {/* EPF Summary */}
                  <div className="rounded-md bg-muted/40 p-3 space-y-1 text-xs">
                    <p className="font-semibold text-foreground mb-1">EPF Split Summary</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee contribution</span>
                      <span className="tabular-nums font-medium">{form.epfRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employer → EPF</span>
                      <span className="tabular-nums font-medium">
                        {Math.max(0, form.epfEmployerRate - form.epsRate).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employer → EPS</span>
                      <span className="tabular-nums font-medium">{form.epsRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ESI Card */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    ESI Configuration
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Employee State Insurance — applicable only if gross salary ≤ threshold
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1">
                      ESI Applicability Threshold (₹/month)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          ESI is deducted only if employee's gross salary is at or below this amount
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={form.esiThreshold}
                      onChange={e =>
                        setForm(p => p ? { ...p, esiThreshold: parseInt(e.target.value) || 0 } : p)
                      }
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹21,000/month gross salary</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employee ESI Rate (%)</Label>
                    <Input
                      type="number"
                      value={form.esiEmployeeRate}
                      onChange={e =>
                        setForm(p => p ? { ...p, esiEmployeeRate: parseFloat(e.target.value) || 0 } : p)
                      }
                      step={0.05}
                      min={0}
                      max={100}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: 0.75% of gross salary</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employer ESI Rate (%)</Label>
                    <Input
                      type="number"
                      value={form.esiEmployerRate}
                      onChange={e =>
                        setForm(p => p ? { ...p, esiEmployerRate: parseFloat(e.target.value) || 0 } : p)
                      }
                      step={0.05}
                      min={0}
                      max={100}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: 3.25% of gross salary</p>
                  </div>

                  {/* ESI Summary */}
                  <div className="rounded-md bg-muted/40 p-3 space-y-1 text-xs">
                    <p className="font-semibold text-foreground mb-1">ESI Summary</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total ESI rate</span>
                      <span className="tabular-nums font-medium">
                        {(form.esiEmployeeRate + form.esiEmployerRate).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicable when gross ≤</span>
                      <span className="tabular-nums font-medium">
                        ₹{form.esiThreshold.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professional Tax Tab */}
          <TabsContent value="pt" className="mt-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Professional Tax — State-wise Slabs
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      PT is deducted based on the employee's state and gross salary slab
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {form.ptConfig.map((stateConfig, si) => (
                  <div key={stateConfig.state} className="border rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{stateConfig.state}</h3>
                      <span className="text-xs text-muted-foreground capitalize">
                        {stateConfig.frequency} deduction
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground">
                              Min Income (₹)
                            </th>
                            <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground">
                              Max Income (₹)
                            </th>
                            <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                              PT Amount (₹/month)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stateConfig.slabs.map((slab, idx) => (
                            <tr key={slab.id} className="border-b last:border-0">
                              <td className="py-1.5 pr-3">
                                <Input
                                  type="number"
                                  value={slab.minIncome}
                                  onChange={e => {
                                    const updated = JSON.parse(JSON.stringify(form)) as StatutorySettingsType;
                                    updated.ptConfig[si].slabs[idx].minIncome = parseInt(e.target.value) || 0;
                                    setForm(updated);
                                  }}
                                  className="h-8 w-28 tabular-nums"
                                  min={0}
                                />
                              </td>
                              <td className="py-1.5 pr-3">
                                <Input
                                  type="number"
                                  value={slab.maxIncome ?? ''}
                                  onChange={e => {
                                    const updated = JSON.parse(JSON.stringify(form)) as StatutorySettingsType;
                                    updated.ptConfig[si].slabs[idx].maxIncome = e.target.value
                                      ? parseInt(e.target.value)
                                      : null;
                                    setForm(updated);
                                  }}
                                  placeholder="No limit"
                                  className="h-8 w-28 tabular-nums"
                                  min={0}
                                />
                              </td>
                              <td className="py-1.5">
                                <Input
                                  type="number"
                                  value={slab.ptAmount}
                                  onChange={e => {
                                    const updated = JSON.parse(JSON.stringify(form)) as StatutorySettingsType;
                                    updated.ptConfig[si].slabs[idx].ptAmount = parseInt(e.target.value) || 0;
                                    setForm(updated);
                                  }}
                                  className="h-8 w-24 tabular-nums"
                                  min={0}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {form.ptConfig.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No PT configurations found. Add state configurations to enable Professional Tax deductions.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LWF Tab */}
          <TabsContent value="lwf" className="mt-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Labour Welfare Fund — State-wise Configuration
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      LWF contributions vary by state and are deducted monthly or half-yearly
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {form.lwfConfig.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No LWF configurations found.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                            State
                          </th>
                          <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                            Employee (₹)
                          </th>
                          <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                            Employer (₹)
                          </th>
                          <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                            Frequency
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.lwfConfig.map((lwf, idx) => (
                          <tr key={lwf.state} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium">{lwf.state}</td>
                            <td className="py-2.5 px-4">
                              <Input
                                type="number"
                                value={lwf.employeeContribution}
                                onChange={e => {
                                  const updated = JSON.parse(JSON.stringify(form)) as StatutorySettingsType;
                                  updated.lwfConfig[idx].employeeContribution = parseFloat(e.target.value) || 0;
                                  setForm(updated);
                                }}
                                className="h-8 w-24 tabular-nums"
                                min={0}
                                step={1}
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <Input
                                type="number"
                                value={lwf.employerContribution}
                                onChange={e => {
                                  const updated = JSON.parse(JSON.stringify(form)) as StatutorySettingsType;
                                  updated.lwfConfig[idx].employerContribution = parseFloat(e.target.value) || 0;
                                  setForm(updated);
                                }}
                                className="h-8 w-24 tabular-nums"
                                min={0}
                                step={1}
                              />
                            </td>
                            <td className="py-2.5 px-4 text-sm text-muted-foreground capitalize">
                              {lwf.frequency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-4 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Note</p>
                  <p>
                    LWF is applicable in states like Maharashtra, Karnataka, Andhra Pradesh, Tamil Nadu, etc.
                    Contributions are typically small fixed amounts deducted monthly or half-yearly.
                    Employees in states without LWF will have ₹0 deducted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
