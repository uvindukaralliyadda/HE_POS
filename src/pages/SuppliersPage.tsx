import { useState } from 'react';
import { DashboardHeader } from '@/components/Controls';
import { Icon } from '@/components/Icon';
import { SupplierRegistrationTab } from './SupplierRegistrationTab';
import { SupplierPOsTab } from './SupplierPOsTab';

type Tab = 'registration' | 'pos';

export function SuppliersPage({ role = 'Office Staff', initialTab = 'registration' }: { role?: 'Admin' | 'Office Staff' | 'Accountant'; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-5">
      <DashboardHeader title="Suppliers" subtitle="Manage suppliers and their purchase orders" />

      <div className={`flex gap-1 border-b border-slate-200 ${role === 'Accountant' ? 'hidden' : ''}`}>
        <TabButton active={tab === 'registration'} onClick={() => setTab('registration')} icon="Warehouse">
          Supplier Registration
        </TabButton>
        <TabButton active={tab === 'pos'} onClick={() => setTab('pos')} icon="FileText">
          Supplier POs
        </TabButton>
      </div>

      <div key={tab} className="tab-content-enter">
        {tab === 'registration' ? <SupplierRegistrationTab /> : <SupplierPOsTab />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
        active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
      {children}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />}
    </button>
  );
}
