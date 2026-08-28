import { Bell, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import type { Role } from '@/data/mockData';
import { NAV_ITEMS } from '@/data/mockData';
import { RoleDropdown } from './RoleDropdown';

export function Topbar({
  role,
  activeId,
  onToggleSidebar,
  onOpenMobile,
  onRoleChange,
}: {
  role: Role;
  activeId: string;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  onRoleChange: (r: Role) => void;
}) {
  const item = NAV_ITEMS.find((n) => n.id === activeId);
  const title = item?.label ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleSidebar}
        className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:block"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-base font-bold text-slate-800 lg:text-lg">{title}</h1>
        <p className="hidden text-xs text-slate-400 sm:block">
          POS Manager / {title}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <RoleDropdown role={role} onChange={onRoleChange} />
      </div>
    </header>
  );
}
