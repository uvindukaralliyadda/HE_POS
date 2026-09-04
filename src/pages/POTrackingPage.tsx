import { useMemo, useState } from 'react';
import { Card, CardHeader, Badge, Modal } from '@/components/ui';
import { DashboardHeader } from '@/components/Controls';
import { Icon } from '@/components/Icon';
import { formatLKR, supplierLineUnitPrice, useApp, type ClientPO, type PortEntry, type SupplierPO } from '@/data/appState';

const money = formatLKR;
const dateText = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

type MaterialMetric = { description: string; required: number; fulfilled: number; remaining: number; percent: number };
type TrackingRecord = {
  po: ClientPO;
  clientName: string;
  materials: MaterialMetric[];
  entries: PortEntry[];
  invoices: ReturnType<typeof useApp>['clientInvoices'];
  vouchers: ReturnType<typeof useApp>['supplierVouchers'];
  revenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  expense: number;
  paidExpense: number;
  pendingExpense: number;
  profit: number;
  margin: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Over Fulfilled';
};

export function POTrackingPage() {
  const { clients, clientPOs, portEntries, clientInvoices, supplierPOs, supplierVouchers } = useApp();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<TrackingRecord['status'] | ''>('');
  const [material, setMaterial] = useState('');
  const [selected, setSelected] = useState<TrackingRecord | null>(null);
  const materials = [...new Set(clientPOs.flatMap((po) => po.items.map((item) => item.description)))].sort();

  const records = useMemo(() => clientPOs
    .filter((po) => !clientId || po.clientId === clientId)
    .filter((po) => (!fromDate || po.date >= fromDate) && (!toDate || po.date <= toDate))
    .map((po) => buildTracking(po, clients.find((client) => client.id === po.clientId)?.name ?? 'Unknown client', portEntries, clientInvoices, supplierPOs, supplierVouchers, { from: fromDate, to: toDate, material }))
    .filter((record) => (!material || record.materials.some((item) => item.description === material)) && (!status || record.status === status)), [clientId, clientInvoices, clientPOs, clients, fromDate, material, portEntries, status, supplierPOs, supplierVouchers, toDate]);
  const clearFilters = () => { setClientId(''); setStatus(''); setMaterial(''); setFromDate(''); setToDate(''); };

  return <div className="space-y-5">
    <DashboardHeader title="PO Tracking" subtitle="Client PO fulfilment, revenue, supplier expense and current financial position" />
    <Card className="animate-fade-up"><CardHeader title="Tracking Filters" /><div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Client"><select value={clientId} onChange={(event) => setClientId(event.target.value)} className="form-select min-h-11"><option value="">All Clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></Field><Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value as TrackingRecord['status'] | '')} className="form-select min-h-11"><option value="">All Statuses</option><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Over Fulfilled">Over Fulfilled</option></select></Field><Field label="Material"><select value={material} onChange={(event) => setMaterial(event.target.value)} className="form-select min-h-11"><option value="">All Materials</option>{materials.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="From Date"><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="form-input min-h-11" /></Field><Field label="To Date"><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="form-input min-h-11" /></Field><button type="button" onClick={clearFilters} className="min-h-11 self-end rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear Filters</button></div></Card>
    {records.length ? <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{records.map((record, index) => <POCard key={record.po.id} record={record} material={material} delay={index * 35} onOpen={() => setSelected(record)} />)}</div> : <Card><div className="px-5 py-14 text-center text-sm text-slate-400">No Client POs match the selected filters.</div></Card>}
    {selected && <PODetail record={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function buildTracking(po: ClientPO, clientName: string, allEntries: PortEntry[], allInvoices: ReturnType<typeof useApp>['clientInvoices'], supplierPOs: SupplierPO[], allVouchers: ReturnType<typeof useApp>['supplierVouchers'], filters: { from: string; to: string; material: string }): TrackingRecord {
  const dateInRange = (date: string) => (!filters.from || date >= filters.from) && (!filters.to || date <= filters.to);
  const entries = allEntries.filter((entry) => entry.verificationStatus === 'Confirmed' && entry.clientPOId === po.id && entry.customerId === po.clientId && entry.site === po.site && dateInRange(entry.date) && (!filters.material || entry.material === filters.material));
  const materials = po.items.filter((item) => !filters.material || item.description === filters.material).map((item) => {
    const fulfilled = entries.filter((entry) => entry.material === item.description).reduce((sum, entry) => sum + (entry.netWeight ?? 0), 0);
    const remaining = Math.max(0, item.quantity - fulfilled);
    return { description: item.description, required: item.quantity, fulfilled, remaining, percent: item.quantity ? fulfilled / item.quantity * 100 : 0 };
  });
  const poEntries = allEntries.filter((entry) => entry.verificationStatus === 'Confirmed' && entry.clientPOId === po.id && entry.customerId === po.clientId && entry.site === po.site && dateInRange(entry.date));
  const invoices = allInvoices.filter((invoice) => invoice.clientId === po.clientId && invoice.site === po.site && dateInRange(invoice.invoiceDate));
  const entrySupplierIds = new Set(poEntries.flatMap((entry) => [entry.supplierId, ...entry.supplierAssignments.map((assignment) => assignment.supplierId)]).filter(Boolean));
  const vouchers = allVouchers.filter((voucher) => entrySupplierIds.has(voucher.supplierId) && dateInRange(voucher.voucherDate) && voucher.fromDate <= po.date || entrySupplierIds.has(voucher.supplierId) && dateInRange(voucher.voucherDate) && voucher.fromDate >= po.date);
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const receivedRevenue = invoices.filter((invoice) => invoice.paymentStatus === 'Received').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const pendingRevenue = invoices.filter((invoice) => invoice.paymentStatus === 'Pending').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const expense = vouchers.reduce((sum, voucher) => sum + voucher.grandTotal, 0);
  const paidExpense = vouchers.filter((voucher) => voucher.paymentStatus === 'Paid').reduce((sum, voucher) => sum + voucher.grandTotal, 0);
  const pendingExpense = vouchers.filter((voucher) => voucher.paymentStatus === 'Unpaid').reduce((sum, voucher) => sum + voucher.grandTotal, 0);
  const required = materials.reduce((sum, item) => sum + item.required, 0);
  const fulfilled = materials.reduce((sum, item) => sum + item.fulfilled, 0);
  const status = fulfilled === 0 ? 'Not Started' : fulfilled > required ? 'Over Fulfilled' : fulfilled === required ? 'Completed' : 'In Progress';
  return { po, clientName, materials, entries: poEntries, invoices, vouchers, revenue, receivedRevenue, pendingRevenue, expense, paidExpense, pendingExpense, profit: revenue - expense, margin: revenue ? (revenue - expense) / revenue * 100 : 0, status };
}

function POCard({ record, material, delay, onOpen }: { record: TrackingRecord; material: string; delay: number; onOpen: () => void }) {
  const required = record.materials.reduce((sum, item) => sum + item.required, 0);
  const fulfilled = record.materials.reduce((sum, item) => sum + item.fulfilled, 0);
  const percent = required ? fulfilled / required * 100 : 0;
  return <button type="button" onClick={onOpen} style={{ animationDelay: `${delay}ms` }} className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-elevated animate-fade-up"><div className="flex items-start justify-between gap-3"><div><div className="text-base font-bold text-slate-800">{record.po.poNumber}</div><div className="mt-1 text-sm text-slate-500">{record.clientName} · {record.po.site}</div><div className="mt-1 text-xs text-slate-400">PO date: {dateText(record.po.date)}</div></div><Badge tone={record.status === 'Completed' ? 'success' : record.status === 'Over Fulfilled' ? 'brand' : record.status === 'In Progress' ? 'amber' : 'slate'}>{record.status}</Badge></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><Metric label="Required" value={`${required.toFixed(2)} Ton`} /><Metric label="Fulfilled" value={`${fulfilled.toFixed(2)} Ton`} /><Metric label="Remaining" value={`${Math.max(0, required - fulfilled).toFixed(2)} Ton`} /></div><div className="mt-4 border-t border-slate-100 pt-4"><div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Materials</div><div className="space-y-3">{record.materials.map((item) => <div key={item.description} className="rounded-lg bg-slate-50 p-3"><div className="flex justify-between gap-2 text-sm font-semibold text-slate-700"><span>{item.description}</span><span>{item.percent.toFixed(0)}%</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500"><span>Required<br /><strong className="text-slate-700">{item.required.toFixed(2)} Ton</strong></span><span>Fulfilled<br /><strong className="text-slate-700">{item.fulfilled.toFixed(2)} Ton</strong></span><span>Remaining<br /><strong className="text-slate-700">{item.remaining.toFixed(2)} Ton</strong></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${item.percent > 100 ? 'bg-brand-600' : 'bg-success-500'}`} style={{ width: `${Math.min(100, item.percent)}%` }} /></div></div>)}</div></div><div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs"><Metric label="Revenue" value={money(record.revenue)} /><Metric label="Supplier Expense" value={money(record.expense)} /><Metric label="Current Profit" value={money(record.profit)} /><Metric label="Margin" value={`${record.margin.toFixed(1)}%`} /></div><div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-brand-600">View PO Details <Icon name="ChevronRight" className="h-4 w-4" /></div></button>;
}

function PODetail({ record, onClose }: { record: TrackingRecord; onClose: () => void }) {
  return <Modal title={`${record.po.poNumber} Details`} onClose={onClose}><div className="space-y-5 p-5"><div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><Metric label="Client" value={record.clientName} /><Metric label="Site" value={record.po.site} /><Metric label="PO Date" value={dateText(record.po.date)} /><Metric label="Status" value={record.status} /></div><section><h3 className="mb-2 text-sm font-bold text-slate-800">Material Fulfilment</h3><DataTable headers={['Material', 'Required', 'Fulfilled', 'Remaining', 'Fulfilment %']} rows={record.materials.map((item) => [item.description, `${item.required.toFixed(2)} Ton`, `${item.fulfilled.toFixed(2)} Ton`, `${item.remaining.toFixed(2)} Ton`, `${item.percent.toFixed(1)}%`])} /></section><section><h3 className="mb-2 text-sm font-bold text-slate-800">Revenue</h3><DataTable headers={['Invoice Number', 'Date', 'Site', 'Amount', 'Status']} rows={record.invoices.map((invoice) => [invoice.id, dateText(invoice.invoiceDate), invoice.site, money(invoice.totalAmount), invoice.paymentStatus])} /></section><section><h3 className="mb-2 text-sm font-bold text-slate-800">Supplier Expense</h3><DataTable headers={['Voucher', 'Supplier', 'Date', 'Amount', 'Status']} rows={record.vouchers.map((voucher) => [voucher.id, voucher.supplierName, dateText(voucher.voucherDate), money(voucher.grandTotal), voucher.paymentStatus])} /></section><div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4"><Metric label="Total Revenue" value={money(record.revenue)} /><Metric label="Received Revenue" value={money(record.receivedRevenue)} /><Metric label="Pending Revenue" value={money(record.pendingRevenue)} /><Metric label="Total Supplier Expense" value={money(record.expense)} /><Metric label="Paid Expense" value={money(record.paidExpense)} /><Metric label="Pending Expense" value={money(record.pendingExpense)} /><Metric label="Current Profit" value={money(record.profit)} /><Metric label="Profit Margin" value={`${record.margin.toFixed(1)}%`} /></div></div></Modal>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) { return <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[620px] text-xs"><thead className="bg-slate-50"><tr>{headers.map((header) => <th key={header} className="px-3 py-2 text-left font-semibold text-slate-500">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? rows.map((row, index) => <tr key={index}>{row.map((value, cellIndex) => <td key={cellIndex} className="px-3 py-2 text-slate-600">{value}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-3 py-5 text-center text-slate-400">No linked records</td></tr>}</tbody></table></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><div className="text-xs text-slate-500">{label}</div><div className="mt-1 font-semibold text-slate-700">{value}</div></div>; }
