export type Role = 'Admin' | 'Office Staff' | 'Port Staff';

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  roles: Role[];
};

export const ROLE_LABELS: Record<Role, { name: string; sub: string }> = {
  Admin: { name: 'Admin User', sub: 'Admin' },
  'Office Staff': { name: 'Office User', sub: 'Office Staff' },
  'Port Staff': { name: 'Port User', sub: 'Port Staff' },
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['Admin', 'Office Staff', 'Port Staff'] },
  { id: 'clients', label: 'Clients', icon: 'Building2', roles: ['Admin', 'Office Staff'] },
  { id: 'po-tracking', label: 'PO Tracking', icon: 'ChartNoAxesCombined', roles: ['Admin'] },
  { id: 'suppliers', label: 'Suppliers', icon: 'Truck', roles: ['Admin', 'Office Staff'] },
  { id: 'port-ops', label: 'Port Operations', icon: 'Ship', roles: ['Admin', 'Office Staff', 'Port Staff'] },
  { id: 'invoices', label: 'Invoices', icon: 'ReceiptText', roles: ['Admin', 'Office Staff'] },
  { id: 'vouchers', label: 'Supplier Vouchers', icon: 'Ticket', roles: ['Admin', 'Office Staff'] },
  { id: 'ledger', label: 'General Ledger', icon: 'BookOpen', roles: ['Admin', 'Office Staff'] },
  { id: 'users', label: 'Users & Access', icon: 'Users', roles: ['Admin'] },
  { id: 'settings', label: 'Settings', icon: 'Settings', roles: ['Admin'] },
];

export type PeriodKey = 'today' | 'week' | 'month' | 'year' | 'custom';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' },
];

export type ChartView = 'daily' | 'weekly' | 'monthly';

export const ADMIN_CARDS = [
  { id: 'revenue', label: 'Total Revenue', value: 'LKR 12.8M', trend: '+8.4%', trendUp: true, icon: 'TrendingUp', accent: 'brand' },
  { id: 'expenses', label: 'Total Expenses', value: 'LKR 7.4M', trend: '+4.2%', trendUp: true, icon: 'TrendingDown', accent: 'rose' },
  { id: 'net-income', label: 'Net Income', value: 'LKR 5.4M', trend: '+12.1%', trendUp: true, icon: 'Wallet', accent: 'success' },
  { id: 'out-client', label: 'Outstanding Client Payments', value: 'LKR 2.0M', icon: 'Clock', accent: 'amber' },
  { id: 'out-supplier', label: 'Outstanding Supplier Payments', value: 'LKR 1.3M', icon: 'Hourglass', accent: 'orange' },
  { id: 'total-invoiced', label: 'Total Invoiced', value: 'LKR 14.5M', icon: 'FileText', accent: 'brand' },
  { id: 'total-received', label: 'Total Received', value: 'LKR 12.5M', icon: 'Banknote', accent: 'success' },
  { id: 'total-paid', label: 'Total Paid to Suppliers', value: 'LKR 6.1M', icon: 'CreditCard', accent: 'slate' },
] as const;

export const REVENUE_EXPENSES = {
  daily: [
    { label: 'Mon', revenue: 1.8, expenses: 1.1, net: 0.7 },
    { label: 'Tue', revenue: 2.1, expenses: 1.3, net: 0.8 },
    { label: 'Wed', revenue: 1.6, expenses: 0.9, net: 0.7 },
    { label: 'Thu', revenue: 2.4, expenses: 1.5, net: 0.9 },
    { label: 'Fri', revenue: 2.9, expenses: 1.7, net: 1.2 },
    { label: 'Sat', revenue: 1.2, expenses: 0.6, net: 0.6 },
    { label: 'Sun', revenue: 0.8, expenses: 0.3, net: 0.5 },
  ],
  weekly: [
    { label: 'W1', revenue: 9.4, expenses: 5.2, net: 4.2 },
    { label: 'W2', revenue: 11.2, expenses: 6.1, net: 5.1 },
    { label: 'W3', revenue: 10.8, expenses: 5.9, net: 4.9 },
    { label: 'W4', revenue: 12.8, expenses: 7.4, net: 5.4 },
  ],
  monthly: [
    { label: 'Jan', revenue: 38, expenses: 22, net: 16 },
    { label: 'Feb', revenue: 42, expenses: 25, net: 17 },
    { label: 'Mar', revenue: 45, expenses: 27, net: 18 },
    { label: 'Apr', revenue: 41, expenses: 24, net: 17 },
    { label: 'May', revenue: 48, expenses: 28, net: 20 },
    { label: 'Jun', revenue: 52, expenses: 31, net: 21 },
    { label: 'Jul', revenue: 49, expenses: 29, net: 20 },
    { label: 'Aug', revenue: 54, expenses: 32, net: 22 },
  ],
};

export const CLIENT_RECEIVABLES = [
  { client: 'ABC Construction', invoiced: 5.0, received: 3.5, outstanding: 1.5 },
  { client: 'XYZ Holdings', invoiced: 2.5, received: 2.0, outstanding: 0.5 },
  { client: 'Prime Developers', invoiced: 3.2, received: 2.1, outstanding: 1.1 },
  { client: 'Lanka Infrastructure', invoiced: 2.0, received: 1.8, outstanding: 0.2 },
  { client: 'Ceylon Builders', invoiced: 1.8, received: 1.0, outstanding: 0.8 },
];

export const INVOICE_STATUS = {
  segments: [
    { label: 'Paid', value: 68, color: '#22c55e' },
    { label: 'Unpaid', value: 22, color: '#3b82f6' },
    { label: 'Overdue', value: 10, color: '#f43f5e' },
  ],
  stats: {
    count: 156,
    totalValue: 'LKR 14.5M',
    received: 'LKR 12.5M',
    outstanding: 'LKR 2.0M',
  },
};

export const MATERIAL_FULFILMENT = [
  { material: 'ABC Material', required: 1000, fulfilled: 800, remaining: 200 },
  { material: 'Sand', required: 300, fulfilled: 250, remaining: 50 },
  { material: 'Gravel', required: 200, fulfilled: 100, remaining: 100 },
  { material: 'Cement', required: 500, fulfilled: 420, remaining: 80 },
  { material: 'Steel', required: 150, fulfilled: 90, remaining: 60 },
];

export const TRUCK_ACTIVITY = [
  { date: '18 Aug', entries: 18, completed: 15, pending: 3 },
  { date: '19 Aug', entries: 24, completed: 21, pending: 3 },
  { date: '20 Aug', entries: 30, completed: 27, pending: 3 },
  { date: '21 Aug', entries: 22, completed: 19, pending: 3 },
  { date: '22 Aug', entries: 28, completed: 25, pending: 3 },
];

export const SUPPLIER_PAYMENTS = [
  { supplier: 'Supplier A', payable: 3.0, paid: 2.2, outstanding: 0.8 },
  { supplier: 'Supplier B', payable: 1.5, paid: 1.0, outstanding: 0.5 },
  { supplier: 'Supplier C', payable: 2.2, paid: 1.4, outstanding: 0.8 },
  { supplier: 'Supplier D', payable: 1.0, paid: 0.7, outstanding: 0.3 },
  { supplier: 'Supplier E', payable: 1.8, paid: 0.8, outstanding: 1.0 },
];

export const RECENT_ACTIVITY = [
  { datetime: '20/08/26 15:30', activity: 'Invoice Generated', reference: 'INV-025', user: 'Office Staff', icon: 'ReceiptText', tone: 'brand' },
  { datetime: '20/08/26 15:10', activity: 'Supplier Voucher Created', reference: 'VCH-018', user: 'Office Staff', icon: 'Ticket', tone: 'success' },
  { datetime: '20/08/26 14:45', activity: 'Truck Entry Completed', reference: 'TR-105', user: 'Port Staff', icon: 'Truck', tone: 'amber' },
  { datetime: '20/08/26 14:20', activity: 'Client PO Created', reference: 'CPO-012', user: 'Office Staff', icon: 'FileText', tone: 'brand' },
  { datetime: '20/08/26 13:55', activity: 'Payment Received', reference: 'PAY-031', user: 'Office Staff', icon: 'Banknote', tone: 'success' },
  { datetime: '20/08/26 13:30', activity: 'Supplier Payment Released', reference: 'SPY-009', user: 'Office Staff', icon: 'CreditCard', tone: 'rose' },
];

export const OFFICE_CARDS = [
  { id: 'truck-val', label: 'Pending Truck Validation', value: '8', icon: 'ClipboardCheck', accent: 'amber' },
  { id: 'truck-entries', label: "Today's Truck Entries", value: '42', icon: 'Truck', accent: 'brand' },
  { id: 'vouchers', label: 'Pending Vouchers', value: '6', icon: 'Ticket', accent: 'success' },
  { id: 'unpaid-inv', label: 'Unpaid Client Invoices', value: '12', icon: 'ReceiptText', accent: 'rose' },
  { id: 'pending-pay', label: 'Pending Supplier Payments', value: '5', icon: 'CreditCard', accent: 'orange' },
] as const;

export const PENDING_TRUCK_VALIDATION = [
  { truck: 'TR-105', client: 'ABC Construction', material: 'Sand', quantity: '18 MT', status: 'Pending Validation', time: '15:30' },
  { truck: 'TR-106', client: 'XYZ Holdings', material: 'Gravel', quantity: '22 MT', status: 'Pending Validation', time: '15:10' },
  { truck: 'TR-107', client: 'Prime Developers', material: 'ABC Material', quantity: '25 MT', status: 'Pending Validation', time: '14:55' },
  { truck: 'TR-108', client: 'Ceylon Builders', material: 'Cement', quantity: '14 MT', status: 'Pending Validation', time: '14:30' },
  { truck: 'TR-109', client: 'Lanka Infrastructure', material: 'Steel', quantity: '9 MT', status: 'Pending Validation', time: '14:05' },
];

export const PORT_CARDS = [
  { id: 'entries', label: "Today's Truck Entries", value: '42', icon: 'Truck', accent: 'brand' },
  { id: 'weighing', label: 'Pending Weighing', value: '7', icon: 'Scale', accent: 'amber' },
  { id: 'completed', label: 'Completed Entries', value: '31', icon: 'CheckCircle2', accent: 'success' },
  { id: 'submitted', label: 'Recently Submitted', value: '4', icon: 'Send', accent: 'slate' },
] as const;

export const RECENT_TRUCK_ENTRIES = [
  { truck: 'TR-105', client: 'ABC Construction', material: 'Sand', quantity: '18 MT', status: 'Completed' },
  { truck: 'TR-106', client: 'XYZ Holdings', material: 'Gravel', quantity: '22 MT', status: 'Pending Weighing' },
  { truck: 'TR-107', client: 'Lanka Infrastructure', material: 'ABC Material', quantity: '25 MT', status: 'Submitted' },
  { truck: 'TR-108', client: 'Ceylon Builders', material: 'Cement', quantity: '14 MT', status: 'Completed' },
  { truck: 'TR-109', client: 'Prime Developers', material: 'Steel', quantity: '9 MT', status: 'Pending Weighing' },
  { truck: 'TR-110', client: 'ABC Construction', material: 'Sand', quantity: '20 MT', status: 'Submitted' },
];
