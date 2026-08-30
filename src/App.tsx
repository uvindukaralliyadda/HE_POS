import { useState } from 'react';
import type { Role } from '@/data/mockData';
import { AppProvider } from '@/data/appState';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ToastContainer } from '@/components/Toast';
import { AdminDashboard } from '@/dashboards/AdminDashboard';
import { OfficeDashboard } from '@/dashboards/OfficeDashboard';
import { PortDashboard } from '@/dashboards/PortDashboard';
import { ClientsPage } from '@/pages/ClientsPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SupplierVouchersPage } from '@/pages/SupplierVouchersPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { UsersPage } from '@/pages/UsersPage';
import { LedgerPage } from '@/pages/LedgerPage';

export default function App() {
  const [role, setRole] = useState<Role>('Admin');
  const [activeId, setActiveId] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const handleRoleChange = (r: Role) => {
    setRole(r);
    setActiveId('dashboard');
    setTabVisible(false);
    window.setTimeout(() => setTabVisible(true), 120);
  };

  const handleTabSelect = (id: string) => {
    if (id === 'port-ops') {
      setActiveId(id);
      return;
    }
    setTabVisible(false);
    window.setTimeout(() => {
      setActiveId(id);
      window.setTimeout(() => setTabVisible(true), 50);
    }, 140);
  };

  const renderContent = () => {
    if (activeId === 'clients') return <ClientsPage />;
    if (activeId === 'suppliers') return <SuppliersPage />;
    if (activeId === 'settings') return <SettingsPage />;
    if (activeId === 'vouchers') return <SupplierVouchersPage />;
    if (activeId === 'invoices') return <InvoicesPage />;
    if (activeId === 'users') return role === 'Admin' ? <UsersPage /> : <PlaceholderView title="users" />;
    if (activeId === 'ledger') return role === 'Admin' || role === 'Office Staff' ? <LedgerPage /> : <PlaceholderView title="ledger" />;
    if (activeId === 'port-ops') return <PortDashboard role={role} />;
    if (activeId !== 'dashboard') return <PlaceholderView title={activeId} />;
    switch (role) {
      case 'Admin':
        return <AdminDashboard role={role} />;
      case 'Office Staff':
        return <OfficeDashboard role={role} />;
      case 'Port Staff':
        return <PortDashboard role={role} />;
    }
  };

  return (
    <AppProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role={role}
          activeId={activeId}
          onSelect={handleTabSelect}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            role={role}
            activeId={activeId}
            onToggleSidebar={() => setCollapsed((v) => !v)}
            onOpenMobile={() => setMobileOpen(true)}
            onRoleChange={handleRoleChange}
          />
          <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
            <div
              key={`${role}-${activeId}`}
              className={`transition-all duration-220 ease-out ${tabVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
            >
              {renderContent()}
            </div>
          </main>
        </div>
        <ToastContainer />
      </div>
    </AppProvider>
  );
}

function PlaceholderView({ title }: { title: string }) {
  const label = title
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
        <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-700">{label}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        This module is part of the full POS system. The prototype focuses on the dashboard foundation and role-based navigation.
      </p>
    </div>
  );
}
