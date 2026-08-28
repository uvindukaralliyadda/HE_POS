import { PORT_CARDS, RECENT_TRUCK_ENTRIES } from '@/data/mockData';
import { Card, CardHeader, StatCard, Badge } from '@/components/ui';
import { DashboardHeader } from '@/components/Controls';
import { Icon } from '@/components/Icon';

const STATUS_TONE: Record<string, string> = {
  Completed: 'success',
  'Pending Weighing': 'amber',
  Submitted: 'brand',
};

export function PortDashboard() {
  return (
    <div className="space-y-5">
      <DashboardHeader title="Dashboard" subtitle="Today's port operations" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PORT_CARDS.map((c, i) => (
          <StatCard key={c.id} label={c.label} value={c.value} icon={c.icon} accent={c.accent} delay={i * 50} />
        ))}
      </div>

      {/* Recent Truck Entries */}
      <Card className="animate-fade-up">
        <CardHeader title="Recent Truck Entries" />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-semibold">Truck Reference</th>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Material</th>
                <th className="px-5 py-3 font-semibold">Quantity</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RECENT_TRUCK_ENTRIES.map((row, i) => (
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
                    <Badge tone={STATUS_TONE[row.status] ?? 'slate'}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
