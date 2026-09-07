import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Role } from '@/data/mockData';

export type Client = {
  id: string;
  status?: 'Active' | 'Inactive';
  name: string;
  tin: string;
  vatNumber: string;
  address: string;
  phone: string;
};

export type MaterialUnit = 'ton' | 'Cube';

export type Material = {
  id: string;
  name: string;
  unit: MaterialUnit;
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
  materialId?: string;
  mode?: 'Material' | 'Both' | 'Transport';
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
  origin: string;
  items: SupplierLineItem[];
  ssclPercent: number;
  vatPercent: number;
  status: 'Active' | 'Completed' | 'Pending';
};

export type SupplierAssignment = {
  supplierId: string;
  supplierPOId: string;
  state: PortEntry['state'];
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
  grnNumber: string;
  supplierId: string;
  clientId: string;
  customerId: string;
  state: 'Transport' | 'Material' | 'Both';
  supplierAssignments: SupplierAssignment[];
  priceMode: SupplierLineItem['priceMode'];
  grossWeight: number | null;
  tareWeight: number | null;
  netWeight: number | null;
  verificationStatus: 'Pending' | 'Confirmed';
  verifiedBy?: 'Admin' | 'Office Staff';
};

export type PortTable = {
  id: string;
  clientId?: string;
  site: string;
  date: string;
  material: string;
};

export type SupplierVoucher = {
  id: string;
  lines: SupplierVoucherLine[];
  supplierId: string;
  supplierName: string;
  voucherDate: string;
  fromDate: string;
  toDate: string;
  subtotal: number;
  ssclEnabled: boolean;
  sscl: number;
  vatEnabled: boolean;
  vat: number;
  grandTotal: number;
  paymentStatus: 'Paid' | 'Unpaid';
};

export type SupplierVoucherLine = {
  portEntryId: string;
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
  ssclEnabled: boolean;
  sscl: number;
  vatEnabled: boolean;
  vat: number;
  totalAmount: number;
  paymentStatus: 'Received' | 'Pending';
  lineItems?: ClientInvoiceLine[];
  ssclPercent?: number;
  vatPercent?: number;
  companyInfo?: CompanyInfo;
  clientInfo?: Client;
  additionalInformation?: string;
  paymentMode?: string;
  sourcePerformaInvoiceId?: string;
  portEntryIds?: string[];
};

export type ClientInvoiceLine = {
  reference: string;
  material: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type PerformaInvoice = {
  id: string;
  clientId: string;
  clientName: string;
  clientInfo?: Client;
  site: string;
  invoiceDate: string;
  fromDate?: string;
  toDate?: string;
  additionalInformation: string;
  lineItems: ClientInvoiceLine[];
  portEntryIds: string[];
  subtotal: number;
  ssclEnabled: boolean;
  ssclPercent: number;
  sscl: number;
  vatEnabled: boolean;
  vatPercent: number;
  vat: number;
  totalAmount: number;
  companyInfo: CompanyInfo;
  paymentMode?: string;
  sourceCalculateReference: string;
  conversionStatus: 'Open' | 'Converted';
  taxInvoiceId?: string;
};

export type CompanyInfo = {
  name: string;
  tin: string;
  vatNumber: string;
  stampDRN: string;
  ssclNumber: string;
  address: string;
  telephone: string;
};

export type SystemUser = {
  id: string;
  fullName: string;
  username: string;
  password: string;
  role: Role;
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
  performaInvoices: PerformaInvoice[];
  users: SystemUser[];
  tax: TaxSettings;
  companyInfo: CompanyInfo;
  addClient: (c: Omit<Client, 'id'>) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, patch: Partial<Material>) => void;
  addClientPO: (po: Omit<ClientPO, 'id'>) => void;
  updateClientPO: (id: string, patch: Partial<ClientPO>) => void;
  addSupplierPO: (po: Omit<SupplierPO, 'id'>) => void;
  updateSupplierPO: (id: string, patch: Partial<SupplierPO>) => void;
  addPortEntry: (entry: Omit<PortEntry, 'id'>) => string;
  addPortTable: (table: Omit<PortTable, 'id'>) => string;
  updatePortEntry: (id: string, patch: Partial<PortEntry>) => void;
  deletePortEntry: (id: string) => void;
  addSupplierVoucher: (voucher: Omit<SupplierVoucher, 'id'> & Partial<Pick<SupplierVoucher, 'id'>>) => string | null;
  updateSupplierVoucher: (id: string, patch: Partial<SupplierVoucher>) => void;
  addClientInvoice: (invoice: Omit<ClientInvoice, 'id'>) => string;
  updateClientInvoice: (id: string, patch: Partial<ClientInvoice>) => void;
  addPerformaInvoice: (invoice: Omit<PerformaInvoice, 'id'> & Partial<Pick<PerformaInvoice, 'id'>>) => string;
  updatePerformaInvoice: (id: string, patch: Partial<PerformaInvoice>) => void;
  addUser: (user: Omit<SystemUser, 'id'>) => string;
  updateUser: (id: string, patch: Partial<SystemUser>) => void;
  setTax: (t: Partial<TaxSettings>) => void;
  setCompanyInfo: (info: CompanyInfo) => void;
};

const AppContext = createContext<AppState | null>(null);

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'ABC Construction (Pvt) Ltd', tin: '101234567', vatNumber: 'VAT-100001', address: 'Colombo 03, Sri Lanka', phone: '0112345678' },
  { id: 'c2', name: 'Metro Developers (Pvt) Ltd', tin: '102345678', vatNumber: 'VAT-100002', address: 'Colombo 05, Sri Lanka', phone: '0112456789' },
  { id: 'c3', name: 'Lanka Infrastructure Ltd', tin: '103456789', vatNumber: 'VAT-100003', address: 'Rajagiriya, Sri Lanka', phone: '0112567890' },
  { id: 'c4', name: 'Greenfield Engineering (Pvt) Ltd', tin: '104567890', vatNumber: 'VAT-100004', address: 'Kotte, Sri Lanka', phone: '0112678901' },
  { id: 'c5', name: 'Prime Housing Solutions (Pvt) Ltd', tin: '105678901', vatNumber: 'VAT-100005', address: 'Nugegoda, Sri Lanka', phone: '0112789012' },
];

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'Sand', unit: 'ton', active: true },
  { id: 'm2', name: 'Gravel', unit: 'ton', active: true },
  { id: 'm3', name: 'ABC Material', unit: 'ton', active: true },
  { id: 'm4', name: 'Cement', unit: 'ton', active: true },
  { id: 'm5', name: 'Steel', unit: 'ton', active: true },
  { id: 'm6', name: 'Metal', unit: 'Cube', active: true },
];

const INITIAL_POS: ClientPO[] = [
  {
    id: 'p1',
    poNumber: 'PO-ABC-001',
    clientId: 'c1',
    site: 'Colombo Warehouse Project',
    date: '2026-09-01',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'i1', description: 'Cement', unit: 'ton', quantity: 200, unitPrice: 25000, fulfilled: 0 },
      { id: 'i2', description: 'Sand', unit: 'ton', quantity: 180, unitPrice: 18000, fulfilled: 0 },
      { id: 'i3', description: 'Metal', unit: 'Cube', quantity: 100, unitPrice: 22000, fulfilled: 0 },
    ],
  },
  {
    id: 'p2',
    poNumber: 'PO-ABC-002',
    clientId: 'c2',
    site: 'Dehiwala Apartment Project',
    date: '2026-09-01',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'i4', description: 'Cement', unit: 'ton', quantity: 160, unitPrice: 25500, fulfilled: 0 },
      { id: 'i5', description: 'Sand', unit: 'ton', quantity: 120, unitPrice: 18500, fulfilled: 0 },
    ],
  },
  {
    id: 'p3',
    poNumber: 'PO-METRO-001',
    clientId: 'c3',
    site: 'Colombo 05 Commercial Centre',
    date: '2026-09-01',
    status: 'Active',
    ssclPercent: 2.5,
    vatPercent: 15,
    items: [
      { id: 'i6', description: 'Cement', unit: 'ton', quantity: 220, unitPrice: 24500, fulfilled: 0 },
      { id: 'i7', description: 'Metal', unit: 'Cube', quantity: 140, unitPrice: 23000, fulfilled: 0 },
    ],
  },
  { id: 'p4', poNumber: 'PO-METRO-002', clientId: 'c2', site: 'Rajagiriya Retail Park', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i8', description: 'Sand', unit: 'ton', quantity: 200, unitPrice: 19000, fulfilled: 0 }, { id: 'i9', description: 'Steel', unit: 'ton', quantity: 80, unitPrice: 28500, fulfilled: 0 }] },
  { id: 'p5', poNumber: 'PO-LANKA-001', clientId: 'c3', site: 'Rajagiriya Road Development', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i10', description: 'Cement', unit: 'ton', quantity: 240, unitPrice: 26000, fulfilled: 0 }, { id: 'i11', description: 'Metal', unit: 'Cube', quantity: 120, unitPrice: 22500, fulfilled: 0 }] },
  { id: 'p6', poNumber: 'PO-LANKA-002', clientId: 'c3', site: 'Wattala Logistics Hub', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i12', description: 'Sand', unit: 'ton', quantity: 180, unitPrice: 17500, fulfilled: 0 }, { id: 'i13', description: 'Steel', unit: 'ton', quantity: 75, unitPrice: 29500, fulfilled: 0 }] },
  { id: 'p7', poNumber: 'PO-GREEN-001', clientId: 'c4', site: 'Kotte Commercial Building', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i14', description: 'Cement', unit: 'ton', quantity: 210, unitPrice: 25200, fulfilled: 0 }, { id: 'i15', description: 'Sand', unit: 'ton', quantity: 160, unitPrice: 18200, fulfilled: 0 }] },
  { id: 'p8', poNumber: 'PO-GREEN-002', clientId: 'c4', site: 'Nawala Office Park', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i16', description: 'Metal', unit: 'Cube', quantity: 100, unitPrice: 23500, fulfilled: 0 }, { id: 'i17', description: 'Steel', unit: 'ton', quantity: 70, unitPrice: 30000, fulfilled: 0 }] },
  { id: 'p9', poNumber: 'PO-PRIME-001', clientId: 'c5', site: 'Nugegoda Housing Scheme', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i18', description: 'Cement', unit: 'ton', quantity: 260, unitPrice: 24800, fulfilled: 0 }, { id: 'i19', description: 'Metal', unit: 'Cube', quantity: 150, unitPrice: 21800, fulfilled: 0 }] },
  { id: 'p10', poNumber: 'PO-PRIME-002', clientId: 'c5', site: 'Maharagama Community Centre', date: '2026-09-01', status: 'Active', ssclPercent: 2.5, vatPercent: 15, items: [{ id: 'i20', description: 'Sand', unit: 'ton', quantity: 220, unitPrice: 18800, fulfilled: 0 }, { id: 'i21', description: 'Steel', unit: 'ton', quantity: 90, unitPrice: 31000, fulfilled: 0 }] },
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
    origin: 'Material',
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
    origin: 'Transport',
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
    origin: 'Both',
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
  { id: 'pt1', site: 'Colombo Warehouse Project', date: '2026-09-01', material: 'Cement' },
  { id: 'pt2', site: 'Dehiwala Apartment Project', date: '2026-09-02', material: 'Sand' },
  { id: 'pt3', site: 'Colombo 05 Commercial Centre', date: '2026-09-03', material: 'Metal' },
  { id: 'pt4', site: 'Rajagiriya Road Development', date: '2026-09-04', material: 'Cement' },
  { id: 'pt5', site: 'Wattala Logistics Hub', date: '2026-09-05', material: 'Sand' },
  { id: 'pt6', site: 'Kotte Commercial Building', date: '2026-09-06', material: 'Cement' },
  { id: 'pt7', site: 'Nawala Office Park', date: '2026-09-07', material: 'Metal' },
  { id: 'pt8', site: 'Nugegoda Housing Scheme', date: '2026-09-03', material: 'Cement' },
  { id: 'pt9', site: 'Maharagama Community Centre', date: '2026-09-05', material: 'Sand' },
];

const makeDummyPortEntry = (id: number, clientPOId: string, site: string, date: string, material: string, customerId: string, supplierId: string, supplierPOId: string, netWeight: number, truckNumber: string): PortEntry => ({
  id: `pe${id}`, tableId: `pt${Math.min(id, 9)}`, clientPOId, supplierPOId, site, date, material, truckNumber, billNo: `BILL-${String(id).padStart(3, '0')}`, grnNumber: `GRN-${String(id).padStart(3, '0')}`, supplierId, clientId: customerId, customerId, state: 'Material', supplierAssignments: [{ supplierId, supplierPOId, state: 'Material' }], priceMode: 'both', grossWeight: netWeight + 10, tareWeight: 10, netWeight, verificationStatus: 'Confirmed', verifiedBy: 'Office Staff',
});

const INITIAL_PORT_ENTRIES: PortEntry[] = [
  makeDummyPortEntry(1, 'p1', 'Colombo Warehouse Project', '2026-09-01', 'Cement', 'c1', 's1', 'sp1', 20, 'WP CAB-1001'),
  makeDummyPortEntry(2, 'p1', 'Colombo Warehouse Project', '2026-09-02', 'Cement', 'c1', 's1', 'sp1', 15, 'WP CAB-1002'),
  makeDummyPortEntry(3, 'p1', 'Colombo Warehouse Project', '2026-09-03', 'Sand', 'c1', 's1', 'sp1', 25, 'WP CAB-1003'),
  makeDummyPortEntry(4, 'p1', 'Colombo Warehouse Project', '2026-09-04', 'Sand', 'c1', 's1', 'sp1', 20, 'WP CAB-1004'),
  makeDummyPortEntry(5, 'p2', 'Dehiwala Apartment Project', '2026-09-01', 'Cement', 'c1', 's1', 'sp1', 18, 'WP CAA-2001'),
  makeDummyPortEntry(6, 'p2', 'Dehiwala Apartment Project', '2026-09-05', 'Sand', 'c1', 's1', 'sp1', 16, 'WP CAA-2002'),
  makeDummyPortEntry(7, 'p3', 'Colombo 05 Commercial Centre', '2026-09-02', 'Cement', 'c2', 's2', 'sp2', 30, 'WP CBB-3001'),
  makeDummyPortEntry(8, 'p3', 'Colombo 05 Commercial Centre', '2026-09-03', 'Metal', 'c2', 's2', 'sp2', 20, 'WP CBB-3002'),
  makeDummyPortEntry(9, 'p3', 'Colombo 05 Commercial Centre', '2026-09-06', 'Metal', 'c2', 's2', 'sp2', 15, 'WP CBB-3003'),
  makeDummyPortEntry(10, 'p4', 'Rajagiriya Retail Park', '2026-09-04', 'Sand', 'c2', 's2', 'sp2', 22, 'WP CDD-4001'),
  makeDummyPortEntry(11, 'p4', 'Rajagiriya Retail Park', '2026-09-07', 'Steel', 'c2', 's2', 'sp2', 12, 'WP CDD-4002'),
  makeDummyPortEntry(12, 'p5', 'Rajagiriya Road Development', '2026-09-01', 'Cement', 'c3', 's3', 'sp3', 24, 'CP EFG-5001'),
  makeDummyPortEntry(13, 'p5', 'Rajagiriya Road Development', '2026-09-04', 'Metal', 'c3', 's3', 'sp3', 18, 'CP EFG-5002'),
  makeDummyPortEntry(14, 'p6', 'Wattala Logistics Hub', '2026-09-02', 'Sand', 'c3', 's3', 'sp3', 28, 'CP HIJ-6001'),
  makeDummyPortEntry(15, 'p6', 'Wattala Logistics Hub', '2026-09-05', 'Steel', 'c3', 's3', 'sp3', 14, 'CP HIJ-6002'),
  makeDummyPortEntry(16, 'p7', 'Kotte Commercial Building', '2026-09-03', 'Cement', 'c4', 's4', 'sp3', 21, 'ND-7001'),
  makeDummyPortEntry(17, 'p7', 'Kotte Commercial Building', '2026-09-06', 'Sand', 'c4', 's4', 'sp3', 19, 'ND-7002'),
  makeDummyPortEntry(18, 'p8', 'Nawala Office Park', '2026-09-04', 'Metal', 'c4', 's4', 'sp3', 17, 'ND-8001'),
  makeDummyPortEntry(19, 'p8', 'Nawala Office Park', '2026-09-07', 'Steel', 'c4', 's4', 'sp3', 11, 'ND-8002'),
  makeDummyPortEntry(20, 'p9', 'Nugegoda Housing Scheme', '2026-09-01', 'Cement', 'c5', 's1', 'sp1', 26, 'WP ABC-9001'),
  makeDummyPortEntry(21, 'p9', 'Nugegoda Housing Scheme', '2026-09-03', 'Metal', 'c5', 's1', 'sp1', 23, 'WP ABC-9002'),
  makeDummyPortEntry(22, 'p10', 'Maharagama Community Centre', '2026-09-05', 'Sand', 'c5', 's1', 'sp1', 27, 'WP ABC-10001'),
  makeDummyPortEntry(23, 'p10', 'Maharagama Community Centre', '2026-09-06', 'Steel', 'c5', 's1', 'sp1', 13, 'WP ABC-10002'),
  makeDummyPortEntry(24, 'p10', 'Maharagama Community Centre', '2026-09-07', 'Sand', 'c5', 's1', 'sp1', 18, 'WP ABC-10003'),
];

const INITIAL_CLIENT_INVOICES: ClientInvoice[] = [
  { id: 'INV-001', clientId: 'c1', clientName: 'ABC Construction', site: 'Colombo 03 Project', invoiceDate: '2026-08-25', fromDate: '2026-08-20', toDate: '2026-08-22', subtotal: 320000, ssclEnabled: true, sscl: 8000, vatEnabled: true, vat: 49200, totalAmount: 377200, paymentStatus: 'Received' },
  { id: 'INV-002', clientId: 'c2', clientName: 'XYZ Holdings', site: 'Colombo 07 Project', invoiceDate: '2026-08-26', fromDate: '2026-08-21', toDate: '2026-08-23', subtotal: 540000, ssclEnabled: true, sscl: 13500, vatEnabled: true, vat: 83250, totalAmount: 636750, paymentStatus: 'Pending' },
  { id: 'INV-003', clientId: 'c3', clientName: 'Lanka Infrastructure', site: 'Wattala Project', invoiceDate: '2026-08-27', fromDate: '2026-08-22', toDate: '2026-08-24', subtotal: 185000, ssclEnabled: true, sscl: 4625, vatEnabled: true, vat: 28444, totalAmount: 218069, paymentStatus: 'Received' },
  { id: 'INV-004', clientId: 'c4', clientName: 'Prime Developers', site: 'Mount Lavinia Project', invoiceDate: '2026-08-28', fromDate: '2026-08-25', toDate: '2026-08-28', subtotal: 410000, ssclEnabled: true, sscl: 10250, vatEnabled: true, vat: 63038, totalAmount: 483288, paymentStatus: 'Pending' },
];

const INITIAL_USERS: SystemUser[] = [
  { id: 'u1', fullName: 'Nimal Perera', username: 'nimal.port', password: 'demo123', role: 'Port Staff', status: 'Active', lastLogin: '28 Aug 2026, 08:42' },
  { id: 'u2', fullName: 'Sanjaya Fernando', username: 'sanjaya.office', password: 'demo123', role: 'Office Staff', status: 'Active', lastLogin: '27 Aug 2026, 17:10' },
  { id: 'u4', fullName: 'Amara Silva', username: 'amara.accounts', password: 'demo123', role: 'Accountant', status: 'Active', lastLogin: 'Never' },
  { id: 'u3', fullName: 'Harith', username: 'harith.admin', password: 'demo123', role: 'Admin', status: 'Active', lastLogin: '28 Aug 2026, 09:05' },
];

const INITIAL_SUPPLIER_VOUCHERS: SupplierVoucher[] = [
  { id: 'SV-001', lines: [], supplierId: 's1', supplierName: 'Supplier A', voucherDate: '2026-08-22', fromDate: '2026-08-20', toDate: '2026-08-20', subtotal: 70000, ssclEnabled: true, sscl: 1750, vatEnabled: true, vat: 10763, grandTotal: 82513, paymentStatus: 'Paid' },
  { id: 'SV-002', lines: [], supplierId: 's2', supplierName: 'Supplier B', voucherDate: '2026-08-23', fromDate: '2026-08-21', toDate: '2026-08-21', subtotal: 102000, ssclEnabled: true, sscl: 2550, vatEnabled: true, vat: 15683, grandTotal: 120233, paymentStatus: 'Unpaid' },
  { id: 'SV-003', lines: [], supplierId: 's3', supplierName: 'Supplier C', voucherDate: '2026-08-24', fromDate: '2026-08-22', toDate: '2026-08-22', subtotal: 145000, ssclEnabled: true, sscl: 3625, vatEnabled: true, vat: 22300, grandTotal: 170925, paymentStatus: 'Paid' },
  { id: 'SV-004', lines: [], supplierId: 's1', supplierName: 'Supplier A', voucherDate: '2026-08-25', fromDate: '2026-08-23', toDate: '2026-08-24', subtotal: 88000, ssclEnabled: true, sscl: 2200, vatEnabled: true, vat: 13530, grandTotal: 103730, paymentStatus: 'Unpaid' },
  { id: 'SV-005', lines: [], supplierId: 's4', supplierName: 'Supplier D', voucherDate: '2026-08-26', fromDate: '2026-08-24', toDate: '2026-08-25', subtotal: 215000, ssclEnabled: true, sscl: 5375, vatEnabled: true, vat: 33056, grandTotal: 253431, paymentStatus: 'Paid' },
  { id: 'SV-006', lines: [], supplierId: 's2', supplierName: 'Supplier B', voucherDate: '2026-08-27', fromDate: '2026-08-25', toDate: '2026-08-26', subtotal: 64000, ssclEnabled: true, sscl: 1600, vatEnabled: true, vat: 9840, grandTotal: 75440, paymentStatus: 'Unpaid' },
  { id: 'SV-007', lines: [], supplierId: 's3', supplierName: 'Supplier C', voucherDate: '2026-08-28', fromDate: '2026-08-26', toDate: '2026-08-28', subtotal: 126000, ssclEnabled: true, sscl: 3150, vatEnabled: true, vat: 19373, grandTotal: 148523, paymentStatus: 'Paid' },
];

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}${++idCounter}`;

export function AppProvider({ children, role = 'Admin' }: { children: ReactNode; role?: Role }) {
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CLIENTS;
    try {
      const stored = window.localStorage.getItem('he-pos-clients');
      return stored ? (JSON.parse(stored) as Client[]).map((client) => ({ ...client, vatNumber: client.vatNumber || INITIAL_CLIENTS.find((seed) => seed.id === client.id)?.vatNumber || '' })) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [clientPOs, setClientPOs] = useState<ClientPO[]>(INITIAL_POS);
  const [supplierPOs, setSupplierPOs] = useState<SupplierPO[]>(() => {
    if (typeof window === 'undefined') return INITIAL_SUPPLIER_POS;
    try {
      const stored = window.localStorage.getItem('he-pos-supplier-pos');
      const saved = stored ? JSON.parse(stored) as SupplierPO[] : INITIAL_SUPPLIER_POS;
      return saved.map((po) => ({ ...po, origin: po.origin ?? 'Material', items: (po.items ?? []).map((item) => ({ ...item, mode: item.mode ?? (po.origin?.trim().toLowerCase() === 'transport' ? 'Transport' : item.priceMode === 'material' ? 'Material' : 'Both') })) }));
    } catch {
      return INITIAL_SUPPLIER_POS;
    }
  });
  const [portEntries, setPortEntries] = useState<PortEntry[]>(INITIAL_PORT_ENTRIES);
  const [portTables, setPortTables] = useState<PortTable[]>(INITIAL_PORT_TABLES);
  const [supplierVouchers, setSupplierVouchers] = useState<SupplierVoucher[]>(() => {
    if (typeof window === 'undefined') return INITIAL_SUPPLIER_VOUCHERS;
    const stored = window.localStorage.getItem('he-pos-supplier-vouchers');
    if (!stored) return INITIAL_SUPPLIER_VOUCHERS;
    try {
      return JSON.parse(stored) as SupplierVoucher[];
    } catch {
      return INITIAL_SUPPLIER_VOUCHERS;
    }
  });
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CLIENT_INVOICES;
    try {
      const stored = window.localStorage.getItem('he-pos-client-invoices');
      return stored ? (JSON.parse(stored) as ClientInvoice[]) : INITIAL_CLIENT_INVOICES;
    } catch {
      return INITIAL_CLIENT_INVOICES;
    }
  });
  const [performaInvoices, setPerformaInvoices] = useState<PerformaInvoice[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem('he-pos-performa-invoices');
      return stored ? (JSON.parse(stored) as PerformaInvoice[]) : [];
    } catch {
      return [];
    }
  });
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [tax, setTaxState] = useState<TaxSettings>({ ssclPercent: 2.5, vatPercent: 15 });
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(() => {
    const defaults = { name: 'Harith Engineering & Company (Pvt) Ltd', tin: '200123456', vatNumber: 'VAT-HARITH-001', stampDRN: 'DRN-2026-001', ssclNumber: 'SSCL-HARITH-001', address: 'Colombo, Sri Lanka', telephone: '0112345678' };
    if (typeof window === 'undefined') return defaults;
    try {
      const stored = window.localStorage.getItem('he-pos-company-info');
      const saved = stored ? JSON.parse(stored) as Partial<CompanyInfo> : {};
      return { ...defaults, ...saved, tin: saved.tin || defaults.tin, vatNumber: saved.vatNumber || defaults.vatNumber, stampDRN: saved.stampDRN || defaults.stampDRN, ssclNumber: saved.ssclNumber || defaults.ssclNumber, address: saved.address || defaults.address, telephone: saved.telephone || defaults.telephone };
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('he-pos-supplier-vouchers', JSON.stringify(supplierVouchers));
  }, [supplierVouchers]);

  useEffect(() => {
    window.localStorage.setItem('he-pos-supplier-pos', JSON.stringify(supplierPOs));
  }, [supplierPOs]);

  useEffect(() => {
    window.localStorage.setItem('he-pos-clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    window.localStorage.setItem('he-pos-company-info', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    window.localStorage.setItem('he-pos-client-invoices', JSON.stringify(clientInvoices));
  }, [clientInvoices]);

  useEffect(() => {
    window.localStorage.setItem('he-pos-performa-invoices', JSON.stringify(performaInvoices));
  }, [performaInvoices]);

  const addClient = (c: Omit<Client, 'id'>) => {
    setClients((prev) => [...prev, { ...c, id: nextId('c') }]);
  };

  const updateClient = (id: string, patch: Partial<Client>) => {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...patch } : client)));
  };

  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    setSuppliers((prev) => [...prev, { ...s, id: nextId('s') }]);
  };

  const updateSupplier = (id: string, patch: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((supplier) => (supplier.id === id ? { ...supplier, ...patch } : supplier)));
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

  const updateClientPO = (id: string, patch: Partial<ClientPO>) => {
    setClientPOs((prev) => prev.map((po) => (po.id === id ? { ...po, ...patch } : po)));
  };

  const addSupplierPO = (po: Omit<SupplierPO, 'id'>) => {
    setSupplierPOs((prev) => [...prev, { ...po, id: nextId('sp') }]);
  };

  const updateSupplierPO = (id: string, patch: Partial<SupplierPO>) => {
    setSupplierPOs((prev) => prev.map((po) => (po.id === id ? { ...po, ...patch } : po)));
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

  const addSupplierVoucher = (voucher: Omit<SupplierVoucher, 'id'> & Partial<Pick<SupplierVoucher, 'id'>>) => {
    const id = voucher.id ?? nextId('sv');
    let added = false;
    setSupplierVouchers((prev) => {
      const existingEntryIds = new Set(prev.flatMap((item) => item.lines.map((line) => line.portEntryId)));
      if (voucher.lines.some((line) => existingEntryIds.has(line.portEntryId))) return prev;
      added = true;
      return [...prev, { ...voucher, id }];
    });
    return added ? id : null;
  };

  const updateSupplierVoucher = (id: string, patch: Partial<SupplierVoucher>) => {
    if (role === 'Office Staff' && patch.paymentStatus !== undefined) return;
    setSupplierVouchers((prev) => prev.map((voucher) => (voucher.id === id ? { ...voucher, ...patch } : voucher)));
  };

  const addClientInvoice = (invoice: Omit<ClientInvoice, 'id'>) => {
    const id = nextId('INV-');
    setClientInvoices((prev) => [...prev, { ...invoice, id }]);
    return id;
  };

  const updateClientInvoice = (id: string, patch: Partial<ClientInvoice>) => {
    if (role === 'Office Staff' && patch.paymentStatus !== undefined) return;
    setClientInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, ...patch } : invoice)));
  };

  const addPerformaInvoice = (invoice: Omit<PerformaInvoice, 'id'> & Partial<Pick<PerformaInvoice, 'id'>>) => {
    const id = invoice.id ?? `PI-${String(nextId('')).padStart(4, '0')}`;
    setPerformaInvoices((prev) => [...prev, { ...invoice, id }]);
    return id;
  };

  const updatePerformaInvoice = (id: string, patch: Partial<PerformaInvoice>) => {
    setPerformaInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, ...patch } : invoice)));
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
  const setCompanyInfo = (info: CompanyInfo) => setCompanyInfoState(info);

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
        performaInvoices,
        users,
        tax,
        companyInfo,
        addClient,
        updateClient,
        addSupplier,
        updateSupplier,
        addMaterial,
        updateMaterial,
        addClientPO,
        updateClientPO,
        addSupplierPO,
        updateSupplierPO,
        addPortEntry,
        addPortTable,
        updatePortEntry,
        deletePortEntry,
        addSupplierVoucher,
        updateSupplierVoucher,
        addClientInvoice,
        updateClientInvoice,
        addPerformaInvoice,
        updatePerformaInvoice,
        addUser,
        updateUser,
        setTax,
        setCompanyInfo,
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
