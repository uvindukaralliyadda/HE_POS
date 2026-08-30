import { PERIODS, type PeriodKey, type Role } from '@/data/mockData';
import { useApp } from '@/data/appState';
import { UserAvatar } from '@/components/UserAvatar';

export function PeriodSelector({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (p: PeriodKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
            value === p.key
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function ChartViewControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: any) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
            value === o.key ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardWelcome({
  role,
  subtitle,
  children,
}: {
  role: Role;
  subtitle: string;
  children?: React.ReactNode;
}) {
  const { users } = useApp();
  const currentUser = users.find((user) => user.role === role && user.status === 'Active') ?? users.find((user) => user.role === role) ?? users[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-sky-50 p-4 shadow-card animate-fade-up sm:p-5">
        <div className="flex items-start gap-3">
          <UserAvatar role={role} size="lg" className="shrink-0" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Dashboard</p>
            <h2 className="mt-1 text-lg font-medium text-slate-800 sm:text-2xl">Welcome Back, {currentUser.fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function DashboardHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
