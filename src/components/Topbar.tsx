import { Bell, Menu, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import type { Role } from '@/data/mockData';
import { NAV_ITEMS } from '@/data/mockData';
import { RoleDropdown } from './RoleDropdown';

type Notification = { id: number; title: string; message: string; time: string; unread: boolean };

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'New Port Entry', message: 'A new truck entry has been added to Port Operations.', time: 'Just now', unread: true },
  { id: 2, title: 'Supplier Voucher Pending', message: 'A supplier voucher is waiting for payment.', time: '12 minutes ago', unread: true },
  { id: 3, title: 'Port Entry Confirmation Required', message: 'A Port Operations record requires confirmation.', time: '35 minutes ago', unread: true },
  { id: 4, title: 'Invoice Payment Received', message: 'A client payment has been marked as received.', time: '1 hour ago', unread: false },
  { id: 5, title: 'Invoice Pending', message: 'An invoice is awaiting client payment.', time: 'Yesterday', unread: false },
  { id: 6, title: 'Supplier Voucher Paid', message: 'A supplier voucher has been marked as paid.', time: 'Yesterday', unread: false },
];

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((notification) => notification.unread).length;
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
          Material Supply Tracker / {title}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">{unreadCount}</span>}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-elevated animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div><h2 className="text-sm font-bold text-slate-800">Notifications</h2><p className="text-[11px] text-slate-400">{unreadCount} unread</p></div>
                <button type="button" onClick={() => setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })))} className="text-[11px] font-semibold text-brand-600 hover:text-brand-700">Mark all as read</button>
              </div>
              <div className="max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto scrollbar-thin">
                {notifications.map((notification) => <button key={notification.id} type="button" onClick={() => setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, unread: false } : item))} className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${notification.unread ? 'bg-brand-50/40' : 'bg-white'}`}><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.unread ? 'bg-brand-500' : 'bg-slate-200'}`} /><span className="min-w-0"><span className="block text-xs font-bold text-slate-700">{notification.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{notification.message}</span><span className="mt-1 block text-[10px] font-medium text-slate-400">{notification.time}</span></span></button>)}
              </div>
            </div>
          )}
        </div>
        <RoleDropdown role={role} onChange={onRoleChange} />
      </div>
    </header>
  );
}
