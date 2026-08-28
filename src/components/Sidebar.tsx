import { NAV_ITEMS, type Role } from '@/data/mockData';
import { Icon } from './Icon';
import logo from '@/HE.webp';

export function Sidebar({
  role,
  activeId,
  onSelect,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  role: Role;
  activeId: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const items = NAV_ITEMS.filter((n) => n.roles.includes(role));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:static lg:translate-x-0 ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-[248px]'
        } ${mobileOpen ? 'w-[260px] translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center gap-2.5 border-b border-slate-100 px-4 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <img src={logo} alt="Harith Engineering" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="lg:block">
              <div className="text-sm font-bold leading-tight text-slate-800">Material Supply Tracker</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Harith Engineering</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center gap-3 mx-2 my-0.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />
                )}
                <Icon
                  name={item.icon}
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="hidden border-t border-slate-100 p-4 lg:block">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500">Prototype Build</div>
              <div className="text-[10px] text-slate-400">v1.0 · Frontend Only</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
