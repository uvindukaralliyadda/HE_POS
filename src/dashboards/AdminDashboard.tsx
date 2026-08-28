import { useState } from 'react';
import {
  ADMIN_CARDS,
  REVENUE_EXPENSES,
  CLIENT_RECEIVABLES,
  INVOICE_STATUS,
  MATERIAL_FULFILMENT,
  TRUCK_ACTIVITY,
  SUPPLIER_PAYMENTS,
  RECENT_ACTIVITY,
  type PeriodKey,
  type ChartView,
} from '@/data/mockData';
import { Card, CardHeader, StatCard, Badge, ChartCard, Legend, toneClasses } from '@/components/ui';
import { PeriodSelector, ChartViewControl, DashboardHeader } from '@/components/Controls';
import { ComboChart, DonutChart, GroupedBarChart, MaterialBarChart, TruckBarChart } from '@/components/Charts';
import { Icon } from '@/components/Icon';
import { useApp } from '@/data/appState';

export function AdminDashboard() {
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [chartView, setChartView] = useState<ChartView>('weekly');
  const { supplierVouchers, clientInvoices } = useApp();
  const paidBySupplier = supplierVouchers.reduce<Record<string, number>>((totals, voucher) => {
    if (voucher.paymentStatus === 'Paid') totals[voucher.supplierName] = (totals[voucher.supplierName] ?? 0) + voucher.grandTotal;
    return totals;
  }, {});
  const supplierPayments = SUPPLIER_PAYMENTS.map((supplier) => ({
    ...supplier,
    paid: (paidBySupplier[supplier.supplier] ?? 0) / 1_000_000,
    outstanding: Math.max(supplier.payable - ((paidBySupplier[supplier.supplier] ?? 0) / 1_000_000), 0),
  }));
  const receivedInvoiceTotal = clientInvoices.reduce((total, invoice) => total + (invoice.paymentStatus === 'Received' ? invoice.totalAmount : 0), 0);
  const clientReceivables = CLIENT_RECEIVABLES.map((client) => {
    const received = clientInvoices.filter((invoice) => invoice.clientName === client.client).reduce((total, invoice) => total + (invoice.paymentStatus === 'Received' ? invoice.totalAmount : 0), 0) / 1_000_000;
    return { ...client, received, outstanding: Math.max(client.invoiced - received, 0) };
  });

  return (
    <div className="space-y-5">
      <DashboardHeader title="Dashboard" subtitle="Overview of operational and financial performance">
        <PeriodSelector value={period} onChange={setPeriod} />
      </DashboardHeader>

      {/* Row 1: Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {ADMIN_CARDS.map((c, i) => (
          <StatCard
            key={c.id}
            label={c.label}
            value={c.value}
            trend={'trend' in c ? (c as any).trend : undefined}
            trendUp={'trendUp' in c ? (c as any).trendUp : undefined}
            icon={c.icon}
            accent={c.accent}
            delay={i * 50}
          />
        ))}
      </div>

      {/* Row 2: Revenue vs Expenses + Invoice Status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenue vs Expenses"
          className="lg:col-span-2"
          action={
            <ChartViewControl
              value={chartView}
              onChange={(v) => setChartView(v as ChartView)}
              options={[
                { key: 'daily', label: 'Daily' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
              ]}
            />
          }
        >
          <div className="mb-3">
            <Legend
              items={[
                { label: 'Revenue', color: '#3b82f6' },
                { label: 'Expenses', color: '#f43f5e' },
                { label: 'Net Income', color: '#22c55e' },
              ]}
            />
          </div>
          <ComboChart data={REVENUE_EXPENSES[chartView]} />
        </ChartCard>

        {/* Invoice Status donut */}
        <Card className="flex flex-col animate-fade-up">
          <CardHeader title="Invoice Status" />
          <div className="flex flex-1 flex-col items-center gap-4 p-5">
            <DonutChart segments={INVOICE_STATUS.segments} />
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {INVOICE_STATUS.segments.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-medium text-slate-500">
                    {s.label} <span className="font-bold text-slate-700">{s.value}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="grid w-full grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Stat label="No. of Invoices" value={String(INVOICE_STATUS.stats.count)} />
              <Stat label="Total Value" value={INVOICE_STATUS.stats.totalValue} />
              <Stat label="Received" value={`LKR ${(receivedInvoiceTotal / 1_000_000).toFixed(2)}M`} />
              <Stat label="Outstanding" value={INVOICE_STATUS.stats.outstanding} />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Client Receivables + Supplier Payments */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Client Receivables">
          <div className="mb-3">
            <Legend
              items={[
                { label: 'Invoiced', color: '#93c5fd' },
                { label: 'Received', color: '#3b82f6' },
                { label: 'Outstanding', color: '#f43f5e' },
              ]}
            />
          </div>
          <GroupedBarChart
            items={clientReceivables.map((c) => ({
              label: c.client,
              values: [
                { value: c.invoiced, color: '#93c5fd', name: 'Invoiced' },
                { value: c.received, color: '#3b82f6', name: 'Received' },
                { value: c.outstanding, color: '#f43f5e', name: 'Outstanding' },
              ],
            }))}
            max={5.5}
          />
        </ChartCard>

        <ChartCard title="Supplier Payments">
          <div className="mb-3">
            <Legend
              items={[
                { label: 'Payable', color: '#bfdbfe' },
                { label: 'Paid', color: '#22c55e' },
                { label: 'Outstanding', color: '#f59e0b' },
              ]}
            />
          </div>
          <GroupedBarChart
            items={supplierPayments.map((s) => ({
              label: s.supplier,
              values: [
                { value: s.payable, color: '#bfdbfe', name: 'Payable' },
                { value: s.paid, color: '#22c55e', name: 'Paid' },
                { value: s.outstanding, color: '#f59e0b', name: 'Outstanding' },
              ],
            }))}
            max={3.5}
          />
        </ChartCard>
      </div>

      {/* Row 4: Material Fulfilment + Truck Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Material Fulfilment">
          <div className="mb-3">
            <Legend
              items={[
                { label: 'Fulfilled', color: '#22c55e' },
                { label: 'Remaining', color: '#f59e0b' },
              ]}
            />
          </div>
          <MaterialBarChart data={MATERIAL_FULFILMENT} />
        </ChartCard>

        <ChartCard title="Load / Truck Activity">
          <div className="mb-3">
            <Legend
              items={[
                { label: 'Entries', color: '#dbeafe' },
                { label: 'Completed', color: '#3b82f6' },
                { label: 'Pending', color: '#f59e0b' },
              ]}
            />
          </div>
          <TruckBarChart data={TRUCK_ACTIVITY} />
        </ChartCard>
      </div>

      {/* Row 5: Recent Activity */}
      <Card className="animate-fade-up">
        <CardHeader title="Recent Activity" />
        <div className="divide-y divide-slate-50">
          {RECENT_ACTIVITY.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50/60 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses(a.tone).bg}`}>
                <Icon name={a.icon} className={`h-[18px] w-[18px] ${toneClasses(a.tone).text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-700">{a.activity}</div>
                <div className="text-xs text-slate-400">{a.datetime}</div>
              </div>
              <div className="hidden text-xs font-semibold text-slate-500 sm:block">{a.reference}</div>
              <Badge tone={a.tone}>{a.user}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}
