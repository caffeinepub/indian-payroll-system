import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Info } from 'lucide-react';
import { useGetTaxSettings, useUpdateTaxSettings } from '../hooks/useTaxSettings';
import { formatCurrency } from '../lib/calculations';
import type { TaxSettings as TaxSettingsType, TaxSlab } from '../types/tax';
import { DEFAULT_TAX_SETTINGS } from '../types/tax';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TaxSettings() {
  const { data: settings } = useGetTaxSettings();
  const updateMutation = useUpdateTaxSettings();
  const [form, setForm] = useState<TaxSettingsType>(DEFAULT_TAX_SETTINGS);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form);
      toast.success('Tax settings saved');
    } catch { toast.error('Failed to save tax settings'); }
  };

  const updateSlab = (regime: 'old' | 'new', idx: number, field: keyof TaxSlab, value: number | null) => {
    const key = regime === 'old' ? 'oldRegimeSlabs' : 'newRegimeSlabs';
    setForm(prev => ({
      ...prev,
      [key]: prev[key].map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  const SlabTable = ({ regime }: { regime: 'old' | 'new' }) => {
    const slabs = regime === 'old' ? form.oldRegimeSlabs : form.newRegimeSlabs;
    return (
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-2.5 px-3">Min Income (₹)</th>
              <th className="text-left py-2.5 px-3">Max Income (₹)</th>
              <th className="text-left py-2.5 px-3">Tax Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {slabs.map((slab, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={slab.minIncome}
                    onChange={e => updateSlab(regime, idx, 'minIncome', parseInt(e.target.value) || 0)}
                    className="h-8 w-32 tabular-nums"
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={slab.maxIncome ?? ''}
                    onChange={e => updateSlab(regime, idx, 'maxIncome', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                    className="h-8 w-32 tabular-nums"
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={slab.rate}
                    onChange={e => updateSlab(regime, idx, 'rate', parseFloat(e.target.value) || 0)}
                    className="h-8 w-24 tabular-nums"
                    step={5}
                    min={0}
                    max={100}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tax Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure income tax slabs and TDS parameters (FY 2024-25)</p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </div>

        <Tabs defaultValue="old-regime">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="old-regime">Old Regime</TabsTrigger>
            <TabsTrigger value="new-regime">New Regime</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="old-regime" className="mt-4 space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Old Tax Regime Slabs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SlabTable regime="old" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Standard Deduction (₹)</Label>
                    <Input
                      type="number"
                      value={form.oldRegimeStandardDeduction}
                      onChange={e => setForm(p => ({ ...p, oldRegimeStandardDeduction: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹50,000</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1">
                      Section 87A Threshold (₹)
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>Rebate applies if taxable income ≤ this amount</TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={form.section87AThresholdOld}
                      onChange={e => setForm(p => ({ ...p, section87AThresholdOld: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹5,00,000</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max 87A Rebate (₹)</Label>
                    <Input
                      type="number"
                      value={form.section87AMaxRebateOld}
                      onChange={e => setForm(p => ({ ...p, section87AMaxRebateOld: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹12,500</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-regime" className="mt-4 space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">New Tax Regime Slabs (FY 2024-25)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SlabTable regime="new" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Standard Deduction (₹)</Label>
                    <Input
                      type="number"
                      value={form.newRegimeStandardDeduction}
                      onChange={e => setForm(p => ({ ...p, newRegimeStandardDeduction: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹75,000</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Section 87A Threshold (₹)</Label>
                    <Input
                      type="number"
                      value={form.section87AThresholdNew}
                      onChange={e => setForm(p => ({ ...p, section87AThresholdNew: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹7,00,000</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max 87A Rebate (₹)</Label>
                    <Input
                      type="number"
                      value={form.section87AMaxRebateNew}
                      onChange={e => setForm(p => ({ ...p, section87AMaxRebateNew: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹25,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">General Tax Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Surcharge Threshold (₹)</Label>
                    <Input
                      type="number"
                      value={form.surchargeThreshold}
                      onChange={e => setForm(p => ({ ...p, surchargeThreshold: parseInt(e.target.value) || 0 }))}
                      className="tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">Default: ₹50,00,000</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Surcharge Rate (%)</Label>
                    <Input
                      type="number"
                      value={form.surchargeRate}
                      onChange={e => setForm(p => ({ ...p, surchargeRate: parseFloat(e.target.value) || 0 }))}
                      className="tabular-nums"
                      step={0.5}
                    />
                    <p className="text-xs text-muted-foreground">Default: 10%</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Health & Education Cess (%)</Label>
                    <Input
                      type="number"
                      value={form.cessRate}
                      onChange={e => setForm(p => ({ ...p, cessRate: parseFloat(e.target.value) || 0 }))}
                      className="tabular-nums"
                      step={0.5}
                    />
                    <p className="text-xs text-muted-foreground">Default: 4%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
