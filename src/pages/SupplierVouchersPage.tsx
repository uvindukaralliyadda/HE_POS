import { useMemo, useState, type ReactNode } from 'react';
import { useApp, formatLKR, supplierLineUnitPrice, type PortEntry, type SupplierPO, type SupplierVoucher } from '@/data/appState';
import { Card, CardHeader, Badge, Modal } from '@/components/ui';
import { DashboardHeader } from '@/components/Controls';
import { Pagination } from '@/components/Pagination';
import { showToast } from '@/components/Toast';
import { Icon } from '@/components/Icon';
import { PrintedVouchersTab } from './PrintedVouchersTab';

const PAGE_SIZE = 10;
const dateText = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const weightText = (value: number | null) => value === null ? '—' : `${value.toFixed(2)} Ton`;
type VoucherRow = PortEntry & { supplierPO?: SupplierPO; rate: number; amount: number; voucher?: SupplierVoucher };
type Tab = 'pending' | 'vouchered' | 'printed';
type VoucherDraft = { id: string; rows: VoucherRow[]; supplierId: string; supplierName: string; voucherDate: string; fromDate: string; toDate: string; subtotal: number; ssclEnabled: boolean; sscl: number; vatEnabled: boolean; vat: number; grandTotal: number };

export function SupplierVouchersPage() {
  const { suppliers, materials, supplierPOs, portEntries, supplierVouchers, tax, addSupplierVoucher } = useApp();
  const [tab, setTab] = useState<Tab>('pending');
  const [supplierId, setSupplierId] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [ssclEnabled, setSsclEnabled] = useState(true);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [preview, setPreview] = useState<VoucherDraft | null>(null);
    function materialFilterLabel(selected: string[], allMaterials: string[]) { if (!selected.length || selected.length === allMaterials.length) return 'All materials'; if (selected.length <= 2) return selected.join(', '); return `${selected.slice(0, 2).join(', ')} +${selected.length - 2}`; }
  const voucheredEntryIds = useMemo(() => new Set(supplierVouchers.flatMap((voucher) => voucher.lines.map((line) => line.portEntryId))), [supplierVouchers]);
  const filteredRows = useMemo(() => {
    const buildRow = (entry: PortEntry, voucher?: SupplierVoucher): VoucherRow => {
      const supplierPO = supplierPOs.find((po) => po.id === entry.supplierPOId);
      const line = supplierPO?.items.find((item) => item.description === entry.material);
      const rate = line ? supplierLineUnitPrice(line) : 0;
      return { ...entry, supplierPO, rate, amount: rate * (entry.netWeight ?? 0), voucher };
    };
    const rows = tab === 'vouchered'
      ? supplierVouchers.flatMap((voucher) => voucher.lines.map((line) => {
        const entry = portEntries.find((item) => item.id === line.portEntryId);
        return entry ? buildRow(entry, voucher) : null;
      }).filter((row): row is VoucherRow => Boolean(row)))
      : portEntries.filter((entry) => entry.verificationStatus === 'Confirmed' && !voucheredEntryIds.has(entry.id)).map((entry) => buildRow(entry));
    return rows.filter((row) => (!supplierId || row.supplierId === supplierId) && (!selectedMaterials.length || selectedMaterials.includes(row.material)) && (!fromDate || row.date >= fromDate) && (!toDate || row.date <= toDate));
  }, [fromDate, portEntries, selectedMaterials, supplierId, supplierPOs, supplierVouchers, tab, toDate, voucheredEntryIds]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedRows = filteredRows.filter((row) => selectedIds.has(row.id));
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedIds.has(row.id));
  const someVisibleSelected = visibleRows.some((row) => selectedIds.has(row.id)) && !allVisibleSelected;
  const totals = useMemo(() => {
    const subtotal = selectedRows.reduce((sum, row) => sum + row.amount, 0);
    const sscl = ssclEnabled ? subtotal * tax.ssclPercent / 100 : 0;
    const vat = vatEnabled ? (subtotal + sscl) * tax.vatPercent / 100 : 0;
    return { subtotal, sscl, vat, grandTotal: subtotal + sscl + vat };
  }, [selectedRows, ssclEnabled, tax, vatEnabled]);
  const updateFilter = (action: () => void) => { action(); setPage(1); };
  const clear = () => { setSupplierId(''); setSelectedMaterials([]); setFromDate(''); setToDate(''); setSelectedIds(new Set()); setPage(1); };
  const toggleMaterial = (name: string) => updateFilter(() => setSelectedMaterials((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  const toggleAllMaterials = () => updateFilter(() => setSelectedMaterials(selectedMaterials.length === materials.length ? [] : materials.map((material) => material.name)));
  const toggleRow = (id: string) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleVisible = () => setSelectedIds((current) => { const next = new Set(current); visibleRows.forEach((row) => allVisibleSelected ? next.delete(row.id) : next.add(row.id)); return next; });
  const generatePreview = () => {
    if (!selectedRows.length) return;
    const eligibleRows = selectedRows.filter((row) => !voucheredEntryIds.has(row.id));
    if (eligibleRows.length !== selectedRows.length) {
      setSelectedIds(new Set(eligibleRows.map((row) => row.id)));
      showToast('This transaction has already been vouchered and cannot be added again');
      if (!eligibleRows.length) return;
    }
    const previewSubtotal = eligibleRows.reduce((sum, row) => sum + row.amount, 0);
    const previewSscl = ssclEnabled ? previewSubtotal * tax.ssclPercent / 100 : 0;
    const previewVat = vatEnabled ? (previewSubtotal + previewSscl) * tax.vatPercent / 100 : 0;
    const supplierIds = new Set(selectedRows.map((row) => row.supplierId));
    const supplier = suppliers.find((item) => item.id === supplierId);
    setPreview({
      id: `SV-${Date.now()}`,
      rows: eligibleRows,
      supplierId: supplierIds.size === 1 ? [...supplierIds][0] : supplier?.id ?? '',
      supplierName: supplierIds.size === 1 ? suppliers.find((item) => item.id === [...supplierIds][0])?.name ?? 'Unknown supplier' : 'Multiple suppliers',
      voucherDate: new Date().toISOString().slice(0, 10), fromDate, toDate,
      subtotal: previewSubtotal, ssclEnabled, sscl: previewSscl, vatEnabled, vat: previewVat, grandTotal: previewSubtotal + previewSscl + previewVat,
    });
  };
  const printVoucher = () => {
    if (!preview) return;
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) { showToast('Allow pop-ups to print the Supplier Voucher'); return; }
    const savedId = addSupplierVoucher({ id: preview.id, lines: preview.rows.map((row) => ({ portEntryId: row.id })), supplierId: preview.supplierId, supplierName: preview.supplierName, voucherDate: preview.voucherDate, fromDate: preview.fromDate, toDate: preview.toDate, subtotal: preview.subtotal, ssclEnabled: preview.ssclEnabled, sscl: preview.sscl, vatEnabled: preview.vatEnabled, vat: preview.vat, grandTotal: preview.grandTotal, paymentStatus: 'Unpaid' });
    if (!savedId) { popup.close(); showToast('This transaction has already been vouchered and cannot be added again'); return; }
    popup.document.write(`<html><head><title>Supplier Payment Voucher ${savedId}</title></head><body><h1>Supplier Payment Voucher</h1><p>Voucher Number: ${savedId}</p><p>Supplier: ${preview.supplierName}</p><p>Voucher Date: ${dateText(preview.voucherDate)}</p><table border="1" cellpadding="8"><tr><th>Site</th><th>Date</th><th>Material</th><th>Bill No.</th><th>GRN No.</th><th>Truck Number</th><th>Supplier PO Number</th><th>Gross Weight</th><th>Tare Weight</th><th>Net Weight</th><th>Rate</th><th>Amount</th></tr>${preview.rows.map((row) => `<tr><td>${row.site}</td><td>${dateText(row.date)}</td><td>${row.material}</td><td>${row.billNo}</td><td>${row.grnNumber}</td><td>${row.truckNumber}</td><td>${row.supplierPO?.poNumber ?? '—'}</td><td>${weightText(row.grossWeight)}</td><td>${weightText(row.tareWeight)}</td><td>${weightText(row.netWeight)}</td><td>${formatLKR(row.rate)}</td><td>${formatLKR(row.amount)}</td></tr>`).join('')}</table><p>Subtotal: ${formatLKR(preview.subtotal)}</p><p>SSCL: ${formatLKR(preview.sscl)}</p><p>VAT: ${formatLKR(preview.vat)}</p><h2>Grand Total: ${formatLKR(preview.grandTotal)}</h2><script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
    setPreview(null);
    setSelectedIds(new Set());
    showToast(`${preview.rows.length} port entr${preview.rows.length === 1 ? 'y' : 'ies'} added to ${savedId}`);
  };

  return <div className="space-y-5">
    <DashboardHeader title="Supplier Vouchers" subtitle="Select confirmed port entries and generate supplier payment vouchers" />
    <div className="flex w-fit gap-1 rounded-lg border border-slate-200 bg-white p-1"><TabButton active={tab === 'pending'} onClick={() => { setTab('pending'); setPage(1); }}>Pending Vouchers</TabButton><TabButton active={tab === 'vouchered'} onClick={() => { setTab('vouchered'); setPage(1); }}>Vouchered</TabButton><TabButton active={tab === 'printed'} onClick={() => setTab('printed')}>Printed Vouchers</TabButton></div>
    {tab === 'printed' ? <PrintedVouchersTab /> : <>
      <Card className="relative z-30 animate-fade-up"><CardHeader title="Supplier Voucher Filters" /><div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5"><Field label="Supplier Name"><select value={supplierId} onChange={(event) => updateFilter(() => setSupplierId(event.target.value))} className="form-select min-h-11 w-full"><option value="">All suppliers</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></Field><Field label="Material"><details className="group relative"><summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-2 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:border-slate-300"><span className="truncate">{materialFilterLabel(selectedMaterials, materials.map((material) => material.name))}</span><Icon name="ChevronDown" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary><div className="absolute left-0 right-0 z-50 mt-1 max-h-64 min-w-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-elevated animate-fade-in"><label className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm font-semibold hover:bg-slate-50"><input type="checkbox" checked={selectedMaterials.length === materials.length && materials.length > 0} onChange={toggleAllMaterials} /> <span>All Materials</span></label>{materials.map((material) => <label key={material.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-50"><input type="checkbox" checked={selectedMaterials.includes(material.name)} onChange={() => toggleMaterial(material.name)} /> <span className="truncate">{material.name}</span></label>)}</div></details></Field><Field label="Date From"><input type="date" value={fromDate} onChange={(event) => updateFilter(() => setFromDate(event.target.value))} className="form-input min-h-11 w-full" /></Field><Field label="Date To"><input type="date" value={toDate} onChange={(event) => updateFilter(() => setToDate(event.target.value))} className="form-input min-h-11 w-full" /></Field><div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-4"><button type="button" onClick={() => setPage(1)} className="min-h-11 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">Apply Filters</button><button type="button" onClick={clear} className="min-h-11 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Clear Filters</button></div></div></Card>
      <Card className="animate-fade-up"><CardHeader title={tab === 'pending' ? 'Pending Vouchers' : 'Vouchered Port Entries'} action={<div className="flex items-center gap-3"><Badge tone="brand">{filteredRows.length} records</Badge>{tab === 'pending' && <button type="button" disabled={!selectedRows.length} onClick={generatePreview} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Generate Voucher</button>}</div>} /><VoucherTable rows={visibleRows} pending={tab === 'pending'} allVisibleSelected={allVisibleSelected} someVisibleSelected={someVisibleSelected} onToggleAll={toggleVisible} selectedIds={selectedIds} onToggle={toggleRow} /><Pagination page={page} pageCount={pageCount} total={filteredRows.length} pageSize={PAGE_SIZE} onPageChange={setPage} />{tab === 'pending' && <div className="border-t border-slate-100 p-5"><div className="mb-4 text-sm font-semibold text-brand-700">{selectedRows.length} row{selectedRows.length === 1 ? '' : 's'} selected</div><div className="ml-auto max-w-sm space-y-2 text-sm"><Total label="Selected Subtotal" value={totals.subtotal} /><label className="flex justify-between text-slate-600"><span className="flex items-center gap-2"><input type="checkbox" checked={ssclEnabled} onChange={(event) => setSsclEnabled(event.target.checked)} /> SSCL ({tax.ssclPercent}%)</span><span className="font-semibold">{formatLKR(totals.sscl)}</span></label><label className="flex justify-between text-slate-600"><span className="flex items-center gap-2"><input type="checkbox" checked={vatEnabled} onChange={(event) => setVatEnabled(event.target.checked)} /> VAT ({tax.vatPercent}%)</span><span className="font-semibold">{formatLKR(totals.vat)}</span></label><Total label="Grand Total" value={totals.grandTotal} /></div></div>}</Card>
      {preview && <VoucherPreview draft={preview} onClose={() => setPreview(null)} onPrint={printVoucher} />}
    </>}
  </div>;
}

function VoucherPreview({ draft, onClose, onPrint }: { draft: VoucherDraft; onClose: () => void; onPrint: () => void }) {
  return <Modal title="Supplier Voucher Preview" onClose={onClose} className="max-w-6xl"><div className="space-y-5 p-5"><div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><div className="text-xs text-slate-500">Supplier</div><div className="font-semibold text-slate-800">{draft.supplierName}</div></div><div><div className="text-xs text-slate-500">Voucher Number</div><div className="font-semibold text-slate-800">{draft.id}</div></div><div><div className="text-xs text-slate-500">Voucher Date</div><div className="font-semibold text-slate-800">{dateText(draft.voucherDate)}</div></div><div><div className="text-xs text-slate-500">Transactions</div><div className="font-semibold text-slate-800">{draft.rows.length}</div></div></div><div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[1250px] text-xs"><thead className="bg-slate-50"><tr>{['Site', 'Date', 'Material', 'Bill No.', 'GRN No.', 'Truck Number', 'Supplier PO Number', 'Gross Weight', 'Tare Weight', 'Net Weight', 'Rate', 'Amount'].map((header) => <th key={header} className="px-3 py-2 text-left font-semibold text-slate-500">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{draft.rows.map((row) => <tr key={row.id}><td className="px-3 py-2">{row.site}</td><td className="px-3 py-2">{dateText(row.date)}</td><td className="px-3 py-2">{row.material}</td><td className="px-3 py-2">{row.billNo}</td><td className="px-3 py-2">{row.grnNumber}</td><td className="px-3 py-2">{row.truckNumber}</td><td className="px-3 py-2">{row.supplierPO?.poNumber ?? '—'}</td><td className="px-3 py-2">{weightText(row.grossWeight)}</td><td className="px-3 py-2">{weightText(row.tareWeight)}</td><td className="px-3 py-2">{weightText(row.netWeight)}</td><td className="px-3 py-2">{formatLKR(row.rate)}</td><td className="px-3 py-2 font-semibold">{formatLKR(row.amount)}</td></tr>)}</tbody></table></div><div className="ml-auto max-w-sm space-y-2 border-t border-slate-100 pt-4 text-sm"><Total label="Subtotal" value={draft.subtotal} /><Total label="SSCL" value={draft.sscl} /><Total label="VAT" value={draft.vat} /><Total label="Grand Total" value={draft.grandTotal} /></div><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="button" onClick={onPrint} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Print Voucher</button></div></div></Modal>;
}

function VoucherTable({ rows, pending, allVisibleSelected, someVisibleSelected, onToggleAll, selectedIds, onToggle }: { rows: VoucherRow[]; pending: boolean; allVisibleSelected: boolean; someVisibleSelected: boolean; onToggleAll: () => void; selectedIds: Set<string>; onToggle: (id: string) => void }) {
  const headers = pending ? ['Site', 'Date', 'Material', 'Bill No.', 'GRN No.', 'Truck Number', 'Supplier PO Number', 'Gross Weight', 'Tare Weight', 'Net Weight', 'Rate', 'Amount'] : ['Voucher Number', 'Supplier', 'Site', 'Date', 'Material', 'Bill No.', 'GRN No.', 'Truck Number', 'Supplier PO Number', 'Net Weight', 'Rate', 'Amount', 'Voucher Status', 'Actions'];
  return <div className="overflow-x-auto scrollbar-thin"><table className="w-full min-w-[1450px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-4 py-3"><label className="flex items-center gap-2"><input type="checkbox" aria-label="Select All" checked={allVisibleSelected} ref={(input) => { if (input) input.indeterminate = someVisibleSelected; }} onChange={onToggleAll} /> Select All</label></th>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-50">{rows.map((row) => <VoucherTableRow key={row.id} row={row} pending={pending} selected={selectedIds.has(row.id)} onToggle={() => onToggle(row.id)} />)}{!rows.length && <tr><td colSpan={pending ? 13 : 15} className="px-5 py-12 text-center text-sm text-slate-400">No records match the selected filters.</td></tr>}</tbody></table></div>;
}

function VoucherTableRow({ row, pending, selected, onToggle }: { row: VoucherRow; pending: boolean; selected: boolean; onToggle: () => void }) {
  const values = pending ? [row.site, dateText(row.date), row.material, row.billNo, row.grnNumber, row.truckNumber, row.supplierPO?.poNumber ?? '—', weightText(row.grossWeight), weightText(row.tareWeight), weightText(row.netWeight), formatLKR(row.rate), formatLKR(row.amount)] : [row.voucher?.id ?? '—', row.voucher?.supplierName ?? '—', row.site, dateText(row.date), row.material, row.billNo, row.grnNumber, row.truckNumber, row.supplierPO?.poNumber ?? '—', weightText(row.netWeight), formatLKR(row.rate), formatLKR(row.amount), row.voucher?.paymentStatus ?? '—', '—'];
  return <tr className="transition hover:bg-slate-50/60"><td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${row.grnNumber}`} checked={selected} onChange={onToggle} /></td>{values.map((value, index) => <td key={`${row.id}-${index}`} className={`px-4 py-3 ${index >= (pending ? 7 : 9) ? 'text-right' : ''} ${index === values.length - 1 || (!pending && index === 11) ? 'font-semibold' : ''}`}>{value}</td>)}</tr>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={`rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>{children}</button>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
function Total({ label, value }: { label: string; value: number }) { return <div className="flex justify-between text-slate-600"><span>{label}</span><span className="font-semibold">{formatLKR(value)}</span></div>; }
