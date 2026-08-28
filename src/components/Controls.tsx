import { PERIODS, type PeriodKey } from '@/data/mockData';

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
