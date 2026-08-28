import { useState } from 'react';
import { DashboardHeader } from '@/components/Controls';
import { Icon } from '@/components/Icon';
import { ClientRegistrationTab } from './ClientRegistrationTab';
import { ClientPOsTab } from './ClientPOsTab';

type Tab = 'registration' | 'pos';

export function ClientsPage() {
  const [tab, setTab] = useState<Tab>('registration');

  return (
    <div className="space-y-5">
      <DashboardHeader title="Clients" subtitle="Manage clients and their purchase orders" />

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-slate-200">
        <TabButton active={tab === 'registration'} onClick={() => setTab('registration')} icon="UserPlus">
          Client Registration
        </TabButton>
        <TabButton active={tab === 'pos'} onClick={() => setTab('pos')} icon="FileText">
          Client POs
        </TabButton>
      </div>

      <div key={tab} className="animate-fade-in">
        {tab === 'registration' ? <ClientRegistrationTab /> : <ClientPOsTab />}
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
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
      {children}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />}
    </button>
  );
}
