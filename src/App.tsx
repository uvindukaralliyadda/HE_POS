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
import { POTrackingPage } from '@/pages/POTrackingPage';

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
    if (activeId === 'clients') return role === 'Accountant' ? <AccessDeniedView /> : <ClientsPage role={role} />;
    if (activeId === 'client-pos') return <ClientsPage role={role} initialTab="pos" />;
    if (activeId === 'po-tracking') return role === 'Admin' || role === 'Accountant' ? <POTrackingPage /> : <AccessDeniedView />;
    if (activeId === 'suppliers') return role === 'Accountant' ? <AccessDeniedView /> : <SuppliersPage role={role} />;
    if (activeId === 'supplier-pos') return <SuppliersPage role={role === 'Accountant' ? 'Accountant' : role} initialTab="pos" />;
    if (activeId === 'settings') return role === 'Admin' ? <SettingsPage /> : <AccessDeniedView />;
    if (activeId === 'vouchers') return <SupplierVouchersPage role={role} />;
    if (activeId === 'invoices') return <InvoicesPage role={role} />;
    if (activeId === 'users') return role === 'Admin' ? <UsersPage /> : <PlaceholderView title="users" />;
    if (activeId === 'ledger') return role === 'Admin' || role === 'Accountant' ? <LedgerPage /> : <AccessDeniedView />;
    if (activeId === 'port-ops') return role === 'Accountant' ? <AccessDeniedView /> : <PortDashboard role={role} />;
    if (activeId !== 'dashboard') return <PlaceholderView title={activeId} />;
    switch (role) {
      case 'Admin':
      case 'Accountant':
        return <AdminDashboard role={role} />;
      case 'Office Staff':
        return <OfficeDashboard role={role} />;
      case 'Port Staff':
        return <PortDashboard role={role} />;
    }
  };

  return (
    <AppProvider role={role}>
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

function AccessDeniedView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">Access</div>
      <h2 className="mt-4 text-lg font-bold text-slate-700">Access restricted</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-400">This module is available to Admin users only.</p>
    </div>
  );
}
