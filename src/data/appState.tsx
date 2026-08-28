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
  tax: TaxSettings;
  addClient: (c: Omit<Client, 'id'>) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, patch: Partial<Material>) => void;
  addClientPO: (po: Omit<ClientPO, 'id'>) => void;
  addSupplierPO: (po: Omit<SupplierPO, 'id'>) => void;
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
  { id: 's1', name: 'Supplier A', tin: '111222333', address: '10 Quarry Road, Colombo 02', phone: '077 111 2222', truckNumbers: ['NA-1234', 'NA-5678'] },
  { id: 's2', name: 'Supplier B', tin: '444555666', address: '25 Sand Lane, Negombo', phone: '071 333 4444', truckNumbers: ['NB-9876'] },
  { id: 's3', name: 'Supplier C', tin: '777888999', address: '40 Gravel Ave, Gampaha', phone: '076 555 6666', truckNumbers: ['NC-4321', 'NC-8765', 'NC-1357'] },
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

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}${++idCounter}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [clientPOs, setClientPOs] = useState<ClientPO[]>(INITIAL_POS);
  const [supplierPOs, setSupplierPOs] = useState<SupplierPO[]>(INITIAL_SUPPLIER_POS);
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
        tax,
        addClient,
        addSupplier,
        addMaterial,
        updateMaterial,
        addClientPO,
        addSupplierPO,
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
