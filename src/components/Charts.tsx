import { useId, useState, useRef, type ReactNode } from 'react';

/* ---------- Shared Tooltip ---------- */

function ChartTooltip({
  x,
  y,
  children,
  containerW,
  containerH,
}: {
  x: number;
  y: number;
  children: ReactNode;
  containerW: number;
  containerH: number;
}) {
  const tw = 140;
  const th = 56;
  let tx = x + 12;
  let ty = y - th - 8;
  if (tx + tw > containerW) tx = x - tw - 12;
  if (ty < 0) ty = y + 12;
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-elevated animate-scale-in"
      style={{ left: tx, top: ty, width: tw }}
    >
      {children}
    </div>
  );
}

function TooltipRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <span className="text-[11px] font-bold text-slate-700">{value}</span>
    </div>
  );
}

/* ---------- Bar / Line combo chart (Revenue vs Expenses) ---------- */

type ComboPoint = { label: string; revenue: number; expenses: number; net: number };

export function ComboChart({ data }: { data: ComboPoint[] }) {
  const gradId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const W = 760;
  const H = 280;
  const pad = { top: 20, right: 16, bottom: 32, left: 44 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const max = Math.max(...data.flatMap((d) => [d.revenue, d.expenses])) * 1.15;
  const step = iw / (data.length - 1 || 1);

  const x = (i: number) => pad.left + i * step;
  const y = (v: number) => pad.top + ih - (v / max) * ih;

  const linePath = (key: 'revenue' | 'expenses') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');
  const areaPath = `${linePath('revenue')} L ${x(data.length - 1)} ${pad.top + ih} L ${x(0)} ${pad.top + ih} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((px - pad.left) / step);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setHover(clamped);
    setMouse({ x: x(clamped), y: y(data[clamped].revenue) });
  };

  return (
    <div ref={wrapRef} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((g) => (
          <line key={g} x1={pad.left} x2={W - pad.right} y1={pad.top + ih * g} y2={pad.top + ih * g} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} className="animate-fade-in" />
        <path d={linePath('expenses')} fill="none" stroke="#f43f5e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />
        <path d={linePath('revenue')} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />

        {/* Hover indicator */}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + ih} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
            <circle cx={x(hover)} cy={y(data[hover].revenue)} r={5.5} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
            <circle cx={x(hover)} cy={y(data[hover].expenses)} r={5.5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
          </g>
        )}

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.revenue)} r={3.5} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} className="animate-fade-in" />
            <circle cx={x(i)} cy={y(d.expenses)} r={3.5} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} className="animate-fade-in" />
            <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-slate-400 text-[11px] font-medium">
              {d.label}
            </text>
          </g>
        ))}
        {gridLines.map((g) => (
          <text key={`y${g}`} x={pad.left - 8} y={pad.top + ih * g + 4} textAnchor="end" className="fill-slate-300 text-[10px]">
            {Math.round(max * (1 - g))}
          </text>
        ))}

        {/* Hover capture overlay */}
        <rect
          x={pad.left}
          y={pad.top}
          width={iw}
          height={ih}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {hover !== null && (
        <ChartTooltip x={mouse.x} y={mouse.y} containerW={W} containerH={H}>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{data[hover].label}</div>
          <div className="space-y-0.5">
            <TooltipRow label="Revenue" value={`${data[hover].revenue}M`} color="#3b82f6" />
            <TooltipRow label="Expenses" value={`${data[hover].expenses}M`} color="#f43f5e" />
            <TooltipRow label="Net" value={`${data[hover].net}M`} color="#22c55e" />
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}

/* ---------- Donut chart (Invoice Status) ---------- */

type Segment = { label: string; value: number; color: string };

export function DonutChart({ segments }: { segments: Segment[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const R = 70;
  const r = 46;
  const cx = 90;
  const cy = 90;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <svg viewBox="0 0 180 180" className="w-full max-w-[200px]">
      {segments.map((seg, idx) => {
        const len = (seg.value / total) * circ;
        const dash = `${len} ${circ - len}`;
        const el = (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={hoverIdx === idx ? R - r + 8 : R - r}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="animate-draw-line cursor-pointer transition-all duration-200"
            style={{
              transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
              opacity: hoverIdx === null || hoverIdx === idx ? 1 : 0.35,
            }}
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        );
        offset += len;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-800 text-[20px] font-bold">
        {hoverIdx !== null ? segments[hoverIdx].value : total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400 text-[10px] font-medium uppercase tracking-wide">
        {hoverIdx !== null ? segments[hoverIdx].label : 'Invoices'}
      </text>
    </svg>
  );
}

/* ---------- Grouped bar chart (Client Receivables, Supplier Payments) ---------- */

type GroupedItem = { label: string; values: { value: number; color: string; name?: string }[] };

export function GroupedBarChart({ items, max, unit = 'M' }: { items: GroupedItem[]; max: number; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 760;
  const H = 280;
  const pad = { top: 16, right: 16, bottom: 56, left: 44 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const groupCount = items.length;
  const seriesCount = items[0]?.values.length ?? 1;
  const groupW = iw / groupCount;
  const barW = Math.min(18, (groupW * 0.7) / seriesCount);
  const gap = 3;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {gridLines.map((g) => (
          <line key={g} x1={pad.left} x2={W - pad.right} y1={pad.top + ih * g} y2={pad.top + ih * g} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        {gridLines.map((g) => (
          <text key={`y${g}`} x={pad.left - 8} y={pad.top + ih * g + 4} textAnchor="end" className="fill-slate-300 text-[10px]">
            {Math.round(max * (1 - g))}
          </text>
        ))}
        {items.map((item, gi) => {
          const gx = pad.left + gi * groupW + groupW / 2;
          const totalBarW = barW * seriesCount + gap * (seriesCount - 1);
          const startX = gx - totalBarW / 2;
          const isHovered = hover === gi;
          return (
            <g key={gi}>
              {item.values.map((v, si) => {
                const bh = (v.value / max) * ih;
                const bx = startX + si * (barW + gap);
                const by = pad.top + ih - bh;
                return (
                  <rect
                    key={si}
                    x={bx}
                    y={by}
                    width={barW}
                    height={bh}
                    rx={3}
                    fill={v.color}
                    className="animate-grow-bar transition-opacity duration-200"
                    style={{
                      transformOrigin: `${bx + barW / 2}px ${pad.top + ih}px`,
                      opacity: hover === null || isHovered ? 1 : 0.4,
                    }}
                  />
                );
              })}
              {/* Hover background */}
              <rect
                x={pad.left + gi * groupW}
                y={pad.top}
                width={groupW}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(gi)}
                onMouseLeave={() => setHover(null)}
              />
              {isHovered && (
                <rect x={pad.left + gi * groupW + 2} y={pad.top} width={groupW - 4} height={ih} fill="#3b82f6" fillOpacity={0.04} rx={4} />
              )}
              <text x={gx} y={H - 36} textAnchor="middle" className={`text-[10px] font-medium transition-colors ${isHovered ? 'fill-brand-600 font-bold' : 'fill-slate-500'}`}>
                {item.label.length > 14 ? item.label.slice(0, 12) + '…' : item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <ChartTooltip x={pad.left + hover * groupW + groupW / 2} y={pad.top + 20} containerW={W} containerH={H}>
          <div className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{items[hover].label}</div>
          <div className="space-y-0.5">
            {items[hover].values.map((v, si) => (
              <TooltipRow key={si} label={v.name ?? `Series ${si + 1}`} value={`${v.value}${unit}`} color={v.color} />
            ))}
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}

/* ---------- Stacked horizontal bar chart (Material Fulfilment) ---------- */

type MaterialItem = { material: string; required: number; fulfilled: number; remaining: number };

export function MaterialBarChart({ data }: { data: MaterialItem[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.required));
  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const pct = (d.fulfilled / d.required) * 100;
        const isHovered = hover === i;
        return (
          <div
            key={i}
            className="animate-fade-up rounded-lg p-2 transition-all duration-200"
            style={{
              animationDelay: `${i * 60}ms`,
              backgroundColor: isHovered ? '#f8fafc' : 'transparent',
            }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className={`font-semibold transition-colors ${isHovered ? 'text-brand-600' : 'text-slate-700'}`}>{d.material}</span>
              <span className="text-slate-400">
                <span className="font-semibold text-slate-600">{d.fulfilled.toLocaleString()}</span>
                {' / '}
                {d.required.toLocaleString()} MT
              </span>
            </div>
            <div className="relative h-7 w-full overflow-hidden rounded-md bg-slate-100">
              <div
                className={`flex h-full items-center justify-end rounded-md px-2 text-[10px] font-semibold text-white transition-all duration-700 ${
                  isHovered ? 'from-success-600 to-success-500' : 'from-success-500 to-success-400'
                } bg-gradient-to-r`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              >
                {pct.toFixed(0)}%
              </div>
              {isHovered && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white shadow-elevated">
                  Remaining: {d.remaining.toLocaleString()} MT
                </div>
              )}
            </div>
            {!isHovered && (
              <div className="mt-1 text-[10px] text-slate-400">
                Remaining: <span className="font-semibold text-amber-600">{d.remaining.toLocaleString()} MT</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Truck activity bar chart ---------- */

type TruckDay = { date: string; entries: number; completed: number; pending: number };

export function TruckBarChart({ data }: { data: TruckDay[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 760;
  const H = 280;
  const pad = { top: 16, right: 16, bottom: 32, left: 40 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.entries));
  const groupW = iw / data.length;
  const barW = Math.min(28, groupW * 0.5);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {gridLines.map((g) => (
          <line key={g} x1={pad.left} x2={W - pad.right} y1={pad.top + ih * g} y2={pad.top + ih * g} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        {gridLines.map((g) => (
          <text key={`y${g}`} x={pad.left - 8} y={pad.top + ih * g + 4} textAnchor="end" className="fill-slate-300 text-[10px]">
            {Math.round(max * (1 - g))}
          </text>
        ))}
        {data.map((d, i) => {
          const gx = pad.left + i * groupW + groupW / 2;
          const entriesH = (d.entries / max) * ih;
          const completedH = (d.completed / max) * ih;
          const isHovered = hover === i;
          return (
            <g key={i}>
              {isHovered && (
                <rect x={pad.left + i * groupW + 2} y={pad.top} width={groupW - 4} height={ih} fill="#3b82f6" fillOpacity={0.04} rx={4} />
              )}
              <rect
                x={gx - barW / 2}
                y={pad.top + ih - entriesH}
                width={barW}
                height={entriesH}
                rx={4}
                fill="#dbeafe"
                className="animate-grow-bar transition-opacity duration-200"
                style={{ transformOrigin: `${gx}px ${pad.top + ih}px`, opacity: hover === null || isHovered ? 1 : 0.4 }}
              />
              <rect
                x={gx - barW / 2}
                y={pad.top + ih - completedH}
                width={barW}
                height={completedH}
                rx={4}
                fill="#3b82f6"
                className="animate-grow-bar transition-opacity duration-200"
                style={{ transformOrigin: `${gx}px ${pad.top + ih}px`, animationDelay: `${i * 80}ms`, opacity: hover === null || isHovered ? 1 : 0.4 }}
              />
              <text x={gx} y={H - 10} textAnchor="middle" className={`text-[11px] font-medium transition-colors ${isHovered ? 'fill-brand-600 font-bold' : 'fill-slate-400'}`}>
                {d.date}
              </text>
              {/* Hover capture */}
              <rect
                x={pad.left + i * groupW}
                y={pad.top}
                width={groupW}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <ChartTooltip x={pad.left + hover * groupW + groupW / 2} y={pad.top + 20} containerW={W} containerH={H}>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{data[hover].date}</div>
          <div className="space-y-0.5">
            <TooltipRow label="Entries" value={String(data[hover].entries)} color="#dbeafe" />
            <TooltipRow label="Completed" value={String(data[hover].completed)} color="#3b82f6" />
            <TooltipRow label="Pending" value={String(data[hover].pending)} color="#f59e0b" />
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}
