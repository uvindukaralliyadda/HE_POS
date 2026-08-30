import { createContext, useContext, useState, type ReactNode } from 'react';

export type Client = {
  id: string;
  name: string;
  tin: string;
  address: string;
  phone: string;
};

export type Material = {
  id: string;
  name: string;
  unit: string;
  active: boolean;
};

export type POLineItem = {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  fulfilled: number;
};

export type ClientPO = {
  id: string;
  poNumber: string;
  clientId: string;
  site: string;
  date: string;
  items: POLineItem[];
  ssclPercent: number;
  vatPercent: number;
  status: 'Active' | 'Completed' | 'Pending';
};

export type Supplier = {
  id: string;
  name: string;
  tin: string;
  address: string;
  phone: string;
  truckNumbers: string[];
};

export type SupplierLineItem = {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  materialPrice: number;
  transportPrice: number;
  priceMode: 'material' | 'transport' | 'both';
  fulfilled: number;
};

export type SupplierPO = {
  id: string;
  poNumber: string;
  supplierId: string;
  date: string;
  items: SupplierLineItem[];
  ssclPercent: number;
  vatPercent: number;
  status: 'Active' | 'Completed' | 'Pending';
};

export type PortEntry = {
  id: string;
  tableId: string;
  clientPOId: string;
  supplierPOId: string;
  site: string;
  date: string;
  material: string;
  truckNumber: string;
  billNo: string;
  supplierId: string;
  customerId: string;
  state: 'Transport' | 'Material' | 'Both';
  priceMode: SupplierLineItem['priceMode'];
  grossWeight: number | null;
  tareWeight: number | null;
  netWeight: number | null;
  verificationStatus: 'Pending' | 'Confirmed';
  verifiedBy?: 'Admin' | 'Office Staff';
};

export type PortTable = {
  id: string;
  site: string;
  date: string;
  material: string;
};

export type SupplierVoucher = {
  id: string;
  supplierId: string;
  supplierName: string;
  voucherDate: string;
  fromDate: string;
  toDate: string;
  subtotal: number;
  sscl: number;
  vat: number;
  grandTotal: number;
  paymentStatus: 'Paid' | 'Unpaid';
};

export type ClientInvoice = {
  id: string;
  clientId: string;
  clientName: string;
  site: string;
  invoiceDate: string;
  fromDate: string;
  toDate: string;
  subtotal: number;
  sscl: number;
  vat: number;
  totalAmount: number;
  paymentStatus: 'Received' | 'Pending';
};

export type SystemUser = {
  id: string;
  fullName: string;
  username: string;
  password: string;
  role: 'Port Staff' | 'Office Staff' | 'Admin';
  status: 'Active' | 'Inactive';
  lastLogin: string;
};

export type TaxSettings = {
  ssclPercent: number;
  vatPercent: number;
};

type AppState = {
  clients: Client[];
  suppliers: Supplier[];
  materials: Material[];
  clientPOs: ClientPO[];
  supplierPOs: SupplierPO[];
  portEntries: PortEntry[];
  portTables: PortTable[];
  supplierVouchers: SupplierVoucher[];
  clientInvoices: ClientInvoice[];
  users: SystemUser[];
  tax: TaxSettings;
  addClient: (c: Omit<Client, 'id'>) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, patch: Partial<Material>) => void;
  addClientPO: (po: Omit<ClientPO, 'id'>) => void;
  addSupplierPO: (po: Omit<SupplierPO, 'id'>) => void;
  addPortEntry: (entry: Omit<PortEntry, 'id'>) => string;
  addPortTable: (table: Omit<PortTable, 'id'>) => string;
  updatePortEntry: (id: string, patch: Partial<PortEntry>) => void;
  deletePortEntry: (id: string) => void;
  addSupplierVoucher: (voucher: Omit<SupplierVoucher, 'id'>) => string;
  updateSupplierVoucher: (id: string, patch: Partial<SupplierVoucher>) => void;
  addClientInvoice: (invoice: Omit<ClientInvoice, 'id'>) => string;
  updateClientInvoice: (id: string, patch: Partial<ClientInvoice>) => void;
  addUser: (user: Omit<SystemUser, 'id'>) => string;
  updateUser: (id: string, patch: Partial<SystemUser>) => void;
  setTax: (t: Partial<TaxSettings>) => void;
};

const AppContext = createContext<AppState | null>(null);

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'ABC Construction', tin: '123456789', address: '45 Galle Road, Colombo 03', phone: '077 123 4567' },
  { id: 'c2', name: 'XYZ Holdings', tin: '987654321', address: '12 Kandy Road, Colombo 07', phone: '071 456 7890' },
  { id: 'c3', name: 'Lanka Infrastructure', tin: '456789123', address: '78 Negombo Road, Wattala', phone: '076 789 1234' },
  { id: 'c4', name: 'Prime Developers', tin: '321654987', address: '34 Marine Drive, Mount Lavinia', phone: '070 234 5678' },
  { id: 'c5', name: 'Ceylon Builders', tin: '789123456', address: '90 High Level Road, Nugegoda', phone: '075 345 6789' },
];

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'Sand', unit: 'ton', active: true },
  { id: 'm2', name: 'Gravel', unit: 'ton', active: true },
  { id: 'm3', name: 'ABC Material', unit: 'ton', active: true },
  { id: 'm4', name: 'Cement', unit: 'ton', active: true },
  { id: 'm5', name: 'Steel', unit: 'ton', active: true },
];

const INITIAL_POS: ClientPO[] = [
  {
    id: 'p1',
    poNumber: 'CPO-001',
    clientId: 'c1',
    site: 'Colombo 03 Project',
    date: '2026-08-20',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'i1', description: 'Sand', unit: 'ton', quantity: 600, unitPrice: 4000, fulfilled: 500 },
      { id: 'i2', description: 'Gravel', unit: 'ton', quantity: 300, unitPrice: 6000, fulfilled: 220 },
      { id: 'i3', description: 'ABC Material', unit: 'ton', quantity: 100, unitPrice: 8000, fulfilled: 80 },
    ],
  },
  {
    id: 'p2',
    poNumber: 'CPO-002',
    clientId: 'c2',
    site: 'Colombo 07 Project',
    date: '2026-08-21',
    status: 'Pending',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'i4', description: 'Sand', unit: 'ton', quantity: 350, unitPrice: 4000, fulfilled: 200 },
      { id: 'i5', description: 'Cement', unit: 'ton', quantity: 150, unitPrice: 12000, fulfilled: 100 },
    ],
  },
  {
    id: 'p3',
    poNumber: 'CPO-003',
    clientId: 'c3',
    site: 'Wattala Project',
    date: '2026-08-22',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'i6', description: 'Steel', unit: 'ton', quantity: 200, unitPrice: 18000, fulfilled: 120 },
      { id: 'i7', description: 'Gravel', unit: 'ton', quantity: 550, unitPrice: 6000, fulfilled: 300 },
    ],
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Supplier A', tin: '111222333', address: '10 Quarry Road, Colombo 02', phone: '077 111 2222', truckNumbers: ['WP CAB-1234', 'WP CAA-5678', 'CP ABC-9012'] },
  { id: 's2', name: 'Supplier B', tin: '444555666', address: '25 Sand Lane, Negombo', phone: '071 333 4444', truckNumbers: ['WP CBB-2345', 'WP CDD-6789'] },
  { id: 's3', name: 'Supplier C', tin: '777888999', address: '40 Gravel Ave, Gampaha', phone: '076 555 6666', truckNumbers: ['CP EFG-3456', 'CP HIJ-7890'] },
  { id: 's4', name: 'Supplier D', tin: '121314151', address: '88 Steel Street, Homagama', phone: '070 777 8888', truckNumbers: ['ND-2468'] },
];

const INITIAL_SUPPLIER_POS: SupplierPO[] = [
  {
    id: 'sp1',
    poNumber: 'SPO-001',
    supplierId: 's1',
    date: '2026-08-20',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'si1', description: 'Sand', unit: 'ton', quantity: 500, materialPrice: 3500, transportPrice: 500, priceMode: 'both', fulfilled: 400 },
      { id: 'si2', description: 'Gravel', unit: 'ton', quantity: 200, materialPrice: 5500, transportPrice: 500, priceMode: 'material', fulfilled: 150 },
    ],
  },
  {
    id: 'sp2',
    poNumber: 'SPO-002',
    supplierId: 's2',
    date: '2026-08-21',
    status: 'Pending',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'si3', description: 'Sand', unit: 'ton', quantity: 300, materialPrice: 3400, transportPrice: 600, priceMode: 'both', fulfilled: 100 },
    ],
  },
  {
    id: 'sp3',
    poNumber: 'SPO-003',
    supplierId: 's3',
    date: '2026-08-22',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'si4', description: 'Gravel', unit: 'ton', quantity: 400, materialPrice: 5200, transportPrice: 800, priceMode: 'both', fulfilled: 250 },
      { id: 'si5', description: 'ABC Material', unit: 'ton', quantity: 150, materialPrice: 7500, transportPrice: 500, priceMode: 'transport', fulfilled: 80 },
    ],
  },
];

const INITIAL_PORT_TABLES: PortTable[] = [
  { id: 'pt1', site: 'Colombo 03 Project', date: '2026-08-20', material: 'Sand' },
  { id: 'pt2', site: 'Colombo 07 Project', date: '2026-08-21', material: 'Sand' },
  { id: 'pt3', site: 'Wattala Project', date: '2026-08-22', material: 'Gravel' },
];

const INITIAL_PORT_ENTRIES: PortEntry[] = [
  {
    id: 'pe1',
    tableId: 'pt1',
    clientPOId: 'p1',
    supplierPOId: 'sp1',
    site: 'Colombo 03 Project',
    date: '2026-08-20',
    material: 'Sand',
    truckNumber: 'WP CAB-1234',
    billNo: 'BILL-1001',
    supplierId: 's1',
    customerId: 'c1',
    state: 'Material',
    priceMode: 'both',
    grossWeight: 25.5,
    tareWeight: 10.5,
    netWeight: 15,
    verificationStatus: 'Pending',
  },
  {
    id: 'pe2',
    tableId: 'pt1',
    clientPOId: 'p1',
    supplierPOId: 'sp1',
    site: 'Colombo 03 Project',
    date: '2026-08-20',
    material: 'Sand',
    truckNumber: 'WP CAA-5678',
    billNo: 'BILL-1002',
    supplierId: 's1',
    customerId: 'c1',
    state: 'Both',
    priceMode: 'both',
    grossWeight: 28,
    tareWeight: 11,
    netWeight: 17,
    verificationStatus: 'Confirmed',
    verifiedBy: 'Office Staff',
  },
  {
    id: 'pe3',
    tableId: 'pt2',
    clientPOId: 'p2',
    supplierPOId: 'sp2',
    site: 'Colombo 07 Project',
    date: '2026-08-21',
    material: 'Sand',
    truckNumber: 'WP CBB-2345',
    billNo: 'BILL-2001',
    supplierId: 's2',
    customerId: '',
    state: 'Transport',
    priceMode: 'both',
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    verificationStatus: 'Pending',
  },
  {
    id: 'pe4',
    tableId: 'pt3',
    clientPOId: 'p3',
    supplierPOId: 'sp3',
    site: 'Wattala Project',
    date: '2026-08-22',
    material: 'Gravel',
    truckNumber: 'CP EFG-3456',
    billNo: 'BILL-3001',
    supplierId: 's3',
    customerId: 'c3',
    state: 'Material',
    priceMode: 'both',
    grossWeight: 30,
    tareWeight: 12,
    netWeight: 18,
    verificationStatus: 'Pending',
  },
  {
    id: 'pe5',
    tableId: 'pt3',
    clientPOId: 'p3',
    supplierPOId: 'sp3',
    site: 'Wattala Project',
    date: '2026-08-22',
    material: 'Gravel',
    truckNumber: 'CP HIJ-7890',
    billNo: 'BILL-3002',
    supplierId: 's3',
    customerId: 'c3',
    state: 'Both',
    priceMode: 'both',
    grossWeight: 24.5,
    tareWeight: 9.5,
    netWeight: 15,
    verificationStatus: 'Confirmed',
    verifiedBy: 'Office Staff',
  },
];

const INITIAL_CLIENT_INVOICES: ClientInvoice[] = [
  { id: 'INV-001', clientId: 'c1', clientName: 'ABC Construction', site: 'Colombo 03 Project', invoiceDate: '2026-08-25', fromDate: '2026-08-20', toDate: '2026-08-22', subtotal: 320000, sscl: 8000, vat: 49200, totalAmount: 377200, paymentStatus: 'Received' },
  { id: 'INV-002', clientId: 'c2', clientName: 'XYZ Holdings', site: 'Colombo 07 Project', invoiceDate: '2026-08-26', fromDate: '2026-08-21', toDate: '2026-08-23', subtotal: 540000, sscl: 13500, vat: 83250, totalAmount: 636750, paymentStatus: 'Pending' },
  { id: 'INV-003', clientId: 'c3', clientName: 'Lanka Infrastructure', site: 'Wattala Project', invoiceDate: '2026-08-27', fromDate: '2026-08-22', toDate: '2026-08-24', subtotal: 185000, sscl: 4625, vat: 28444, totalAmount: 218069, paymentStatus: 'Received' },
  { id: 'INV-004', clientId: 'c4', clientName: 'Prime Developers', site: 'Mount Lavinia Project', invoiceDate: '2026-08-28', fromDate: '2026-08-25', toDate: '2026-08-28', subtotal: 410000, sscl: 10250, vat: 63038, totalAmount: 483288, paymentStatus: 'Pending' },
];

const INITIAL_USERS: SystemUser[] = [
  { id: 'u1', fullName: 'Nimal Perera', username: 'nimal.port', password: 'demo123', role: 'Port Staff', status: 'Active', lastLogin: '28 Aug 2026, 08:42' },
  { id: 'u2', fullName: 'Sanjaya Fernando', username: 'sanjaya.office', password: 'demo123', role: 'Office Staff', status: 'Active', lastLogin: '27 Aug 2026, 17:10' },
  { id: 'u3', fullName: 'Harith', username: 'harith.admin', password: 'demo123', role: 'Admin', status: 'Active', lastLogin: '28 Aug 2026, 09:05' },
];

const INITIAL_SUPPLIER_VOUCHERS: SupplierVoucher[] = [
  { id: 'SV-001', supplierId: 's1', supplierName: 'Supplier A', voucherDate: '2026-08-22', fromDate: '2026-08-20', toDate: '2026-08-20', subtotal: 70000, sscl: 1750, vat: 10763, grandTotal: 82513, paymentStatus: 'Paid' },
  { id: 'SV-002', supplierId: 's2', supplierName: 'Supplier B', voucherDate: '2026-08-23', fromDate: '2026-08-21', toDate: '2026-08-21', subtotal: 102000, sscl: 2550, vat: 15683, grandTotal: 120233, paymentStatus: 'Unpaid' },
  { id: 'SV-003', supplierId: 's3', supplierName: 'Supplier C', voucherDate: '2026-08-24', fromDate: '2026-08-22', toDate: '2026-08-22', subtotal: 145000, sscl: 3625, vat: 22300, grandTotal: 170925, paymentStatus: 'Paid' },
  { id: 'SV-004', supplierId: 's1', supplierName: 'Supplier A', voucherDate: '2026-08-25', fromDate: '2026-08-23', toDate: '2026-08-24', subtotal: 88000, sscl: 2200, vat: 13530, grandTotal: 103730, paymentStatus: 'Unpaid' },
  { id: 'SV-005', supplierId: 's4', supplierName: 'Supplier D', voucherDate: '2026-08-26', fromDate: '2026-08-24', toDate: '2026-08-25', subtotal: 215000, sscl: 5375, vat: 33056, grandTotal: 253431, paymentStatus: 'Paid' },
  { id: 'SV-006', supplierId: 's2', supplierName: 'Supplier B', voucherDate: '2026-08-27', fromDate: '2026-08-25', toDate: '2026-08-26', subtotal: 64000, sscl: 1600, vat: 9840, grandTotal: 75440, paymentStatus: 'Unpaid' },
  { id: 'SV-007', supplierId: 's3', supplierName: 'Supplier C', voucherDate: '2026-08-28', fromDate: '2026-08-26', toDate: '2026-08-28', subtotal: 126000, sscl: 3150, vat: 19373, grandTotal: 148523, paymentStatus: 'Paid' },
];

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}${++idCounter}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [clientPOs, setClientPOs] = useState<ClientPO[]>(INITIAL_POS);
  const [supplierPOs, setSupplierPOs] = useState<SupplierPO[]>(INITIAL_SUPPLIER_POS);
  const [portEntries, setPortEntries] = useState<PortEntry[]>(INITIAL_PORT_ENTRIES);
  const [portTables, setPortTables] = useState<PortTable[]>(INITIAL_PORT_TABLES);
  const [supplierVouchers, setSupplierVouchers] = useState<SupplierVoucher[]>(INITIAL_SUPPLIER_VOUCHERS);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>(INITIAL_CLIENT_INVOICES);
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [tax, setTaxState] = useState<TaxSettings>({ ssclPercent: 2.5, vatPercent: 15 });

  const addClient = (c: Omit<Client, 'id'>) => {
    setClients((prev) => [...prev, { ...c, id: nextId('c') }]);
  };

  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    setSuppliers((prev) => [...prev, { ...s, id: nextId('s') }]);
  };

  const addMaterial = (m: Omit<Material, 'id'>) => {
    setMaterials((prev) => [...prev, { ...m, id: nextId('m') }]);
  };

  const updateMaterial = (id: string, patch: Partial<Material>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addClientPO = (po: Omit<ClientPO, 'id'>) => {
    setClientPOs((prev) => [...prev, { ...po, id: nextId('p') }]);
  };

  const addSupplierPO = (po: Omit<SupplierPO, 'id'>) => {
    setSupplierPOs((prev) => [...prev, { ...po, id: nextId('sp') }]);
  };

  const addPortEntry = (entry: Omit<PortEntry, 'id'>) => {
    const id = nextId('pe');
    setPortEntries((prev) => [...prev, { ...entry, id }]);
    return id;
  };

  const addPortTable = (table: Omit<PortTable, 'id'>) => {
    const id = nextId('pt');
    setPortTables((prev) => [...prev, { ...table, id }]);
    return id;
  };

  const updatePortEntry = (id: string, patch: Partial<PortEntry>) => {
    setPortEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const deletePortEntry = (id: string) => {
    setPortEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addSupplierVoucher = (voucher: Omit<SupplierVoucher, 'id'>) => {
    const id = nextId('sv');
    setSupplierVouchers((prev) => [...prev, { ...voucher, id }]);
    return id;
  };

  const updateSupplierVoucher = (id: string, patch: Partial<SupplierVoucher>) => {
    setSupplierVouchers((prev) => prev.map((voucher) => (voucher.id === id ? { ...voucher, ...patch } : voucher)));
  };

  const addClientInvoice = (invoice: Omit<ClientInvoice, 'id'>) => {
    const id = nextId('INV-');
    setClientInvoices((prev) => [...prev, { ...invoice, id }]);
    return id;
  };

  const updateClientInvoice = (id: string, patch: Partial<ClientInvoice>) => {
    setClientInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, ...patch } : invoice)));
  };

  const addUser = (user: Omit<SystemUser, 'id'>) => {
    const id = nextId('u');
    setUsers((prev) => [...prev, { ...user, id }]);
    return id;
  };

  const updateUser = (id: string, patch: Partial<SystemUser>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  };

  const setTax = (t: Partial<TaxSettings>) => {
    setTaxState((prev) => ({ ...prev, ...t }));
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        suppliers,
        materials,
        clientPOs,
        supplierPOs,
        portEntries,
        portTables,
        supplierVouchers,
        clientInvoices,
        users,
        tax,
        addClient,
        addSupplier,
        addMaterial,
        updateMaterial,
        addClientPO,
        addSupplierPO,
        addPortEntry,
        addPortTable,
        updatePortEntry,
        deletePortEntry,
        addSupplierVoucher,
        updateSupplierVoucher,
        addClientInvoice,
        updateClientInvoice,
        addUser,
        updateUser,
        setTax,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/* ---------- Calculation helpers ---------- */

export function calcLineAmount(item: { quantity: number; unitPrice: number }) {
  return item.quantity * item.unitPrice;
}

export function calcPOTotals(po: { items: { quantity: number; unitPrice: number }[]; ssclPercent: number; vatPercent: number }) {
  const subtotal = po.items.reduce((sum, it) => sum + calcLineAmount(it), 0);
  const ssclAmount = subtotal * (po.ssclPercent / 100);
  const vatAmount = (subtotal + ssclAmount) * (po.vatPercent / 100);
  const grandTotal = subtotal + ssclAmount + vatAmount;
  return { subtotal, ssclAmount, vatAmount, grandTotal };
}

export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMT(qty: number): string {
  return `${qty.toLocaleString('en-US')} MT`;
}

/* ---------- Supplier line item helpers ---------- */

export function supplierLineUnitPrice(item: SupplierLineItem): number {
  switch (item.priceMode) {
    case 'material':
      return item.materialPrice;
    case 'transport':
      return item.transportPrice;
    case 'both':
      return item.materialPrice + item.transportPrice;
  }
}

export function calcSupplierLineAmount(item: SupplierLineItem): number {
  return item.quantity * supplierLineUnitPrice(item);
}

export function calcSupplierPOTotals(po: { items: SupplierLineItem[]; ssclPercent: number; vatPercent: number }) {
  const subtotal = po.items.reduce((sum, it) => sum + calcSupplierLineAmount(it), 0);
  const ssclAmount = subtotal * (po.ssclPercent / 100);
  const vatAmount = (subtotal + ssclAmount) * (po.vatPercent / 100);
  const grandTotal = subtotal + ssclAmount + vatAmount;
  return { subtotal, ssclAmount, vatAmount, grandTotal };
}
