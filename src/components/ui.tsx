import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {action}
    </div>
  );
}

const ACCENT_MAP: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600' },
  success: { bg: 'bg-success-50', text: 'text-success-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export function toneClasses(tone: string) {
  return ACCENT_MAP[tone] ?? ACCENT_MAP.brand;
}

export function StatCard({
  label,
  value,
  trend,
  trendUp,
  icon,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  accent: string;
  delay?: number;
}) {
  const a = ACCENT_MAP[accent] ?? ACCENT_MAP.brand;
  return (
    <div
      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.bg}`}>
          <Icon name={icon} className={`h-[18px] w-[18px] ${a.text}`} />
        </div>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              trendUp ? 'bg-success-50 text-success-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="mt-0.5 text-xl font-bold text-slate-800 count-enter">{value}</div>
      </div>
    </div>
  );
}

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-success-50 text-success-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone] ?? tones.slate}`}>
      {children}
    </span>
  );
}

export function ChartCard({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`flex flex-col animate-fade-up ${className}`}>
      <CardHeader title={title} action={action} />
      <div className="flex-1 p-5">{children}</div>
    </Card>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.color }} />
          <span className="text-xs font-medium text-slate-500">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
