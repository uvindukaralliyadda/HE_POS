import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Role } from '@/data/mockData';
import { ROLE_LABELS } from '@/data/mockData';

const ROLES: Role[] = ['Admin', 'Office Staff', 'Port Staff'];

export function RoleDropdown({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const [open, setOpen] = useState(false);
  const info = ROLE_LABELS[role];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
          {info.name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-800 leading-tight">{info.name}</div>
          <div className="text-[11px] text-slate-500 leading-tight">{info.sub}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-elevated animate-scale-in z-50">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Switch Role
          </div>
          {ROLES.map((r) => (
            <button
              key={r}
              onMouseDown={() => {
                onChange(r);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  r === role ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {ROLE_LABELS[r].name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{ROLE_LABELS[r].name}</div>
                <div className="text-[11px] text-slate-500">{ROLE_LABELS[r].sub}</div>
              </div>
              {r === role && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
