import { OFFICE_CARDS, PENDING_TRUCK_VALIDATION, type Role } from '@/data/mockData';
import { Card, CardHeader, StatCard, Badge, toneClasses } from '@/components/ui';
import { DashboardWelcome } from '@/components/Controls';
import { Icon } from '@/components/Icon';

export function OfficeDashboard({ role = 'Office Staff' }: { role?: Role }) {
  return (
    <div className="space-y-5">
      <DashboardWelcome role={role} subtitle="Operational overview and pending activities" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {OFFICE_CARDS.map((c, i) => (
          <StatCard key={c.id} label={c.label} value={c.value} icon={c.icon} accent={c.accent} delay={i * 50} />
        ))}
      </div>

      {/* Pending Truck Validation table */}
      <Card className="animate-fade-up">
        <CardHeader
          title="Pending Truck Validation"
          action={<Badge tone="amber">{PENDING_TRUCK_VALIDATION.length} pending</Badge>}
        />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-semibold">Truck</th>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Material</th>
                <th className="px-5 py-3 font-semibold">Quantity</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PENDING_TRUCK_VALIDATION.map((row, i) => (
                <tr
                  key={row.truck}
                  className="transition hover:bg-slate-50/60 animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                        <Icon name="Truck" className="h-4 w-4 text-brand-600" />
                      </div>
                      <span className="font-semibold text-slate-700">{row.truck}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{row.client}</td>
                  <td className="px-5 py-3 text-slate-600">{row.material}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{row.quantity}</td>
                  <td className="px-5 py-3">
                    <Badge tone="amber">{row.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
