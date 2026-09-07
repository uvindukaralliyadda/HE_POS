import { useState } from 'react';
import {
  useApp,
  calcSupplierPOTotals,
  calcSupplierLineAmount,
  supplierLineUnitPrice,
  formatLKR,
  formatMT,
  type Material,
  type Supplier,
  type SupplierLineItem,
  type SupplierPO,
} from '@/data/appState';
import { showToast } from '@/components/Toast';
import { Card, CardHeader, Badge } from '@/components/ui';
import { Icon } from '@/components/Icon';

const PAGE_SIZE = 10;
const PRICE_MODES: { key: 'material' | 'both'; label: string }[] = [
  { key: 'material', label: 'Material' },
  { key: 'both', label: 'Both' },
];
const originCategory = (origin: string) => origin.trim().toLowerCase();
let sLineIdCounter = 0;
const newSLineId = () => `sline${++sLineIdCounter}`;
const emptyLine = (): SupplierLineItem => ({ id: newSLineId(), materialId: '', description: '', unit: 'ton', quantity: 0, materialPrice: 0, transportPrice: 0, priceMode: 'material', mode: 'Material', fulfilled: 0 });

export function SupplierPOsTab() {
  const { suppliers, materials, supplierPOs, tax, addSupplierPO, updateSupplierPO } = useApp();
  const [subTab, setSubTab] = useState<'material' | 'transport'>('material');
  const [formPO, setFormPO] = useState<SupplierPO | null | undefined>(undefined);
  const save = (po: Omit<SupplierPO, 'id'>) => {
    if (formPO) updateSupplierPO(formPO.id, po);
    else addSupplierPO(po);
    showToast(formPO ? 'Supplier PO updated successfully' : 'Supplier PO created successfully');
    setFormPO(undefined);
  };
  const visiblePOs = supplierPOs.filter((po) => subTab === 'material' ? ['material', 'both'].includes(originCategory(po.origin)) : originCategory(po.origin) === 'transport');
  return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3"><div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1"><button type="button" onClick={() => setSubTab('material')} className={`rounded-md px-4 py-2 text-sm font-semibold ${subTab === 'material' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Material &amp; Both</button><button type="button" onClick={() => setSubTab('transport')} className={`rounded-md px-4 py-2 text-sm font-semibold ${subTab === 'transport' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Transport Only</button></div><button type="button" onClick={() => setFormPO(null)} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"><Icon name="Plus" className="h-4 w-4" /> Create Supplier PO</button></div>
    {formPO !== undefined && <SupplierPOForm initialPO={formPO} suppliers={suppliers} materials={materials} tax={tax} onSubmit={save} onCancel={() => setFormPO(undefined)} />}
    <SupplierPOList suppliers={suppliers} supplierPOs={visiblePOs} onEdit={setFormPO} />
  </div>;
}

function SupplierPOForm({ initialPO, suppliers, materials, tax, onSubmit, onCancel }: { initialPO: SupplierPO | null; suppliers: Supplier[]; materials: Material[]; tax: { ssclPercent: number; vatPercent: number }; onSubmit: (po: Omit<SupplierPO, 'id'>) => void; onCancel: () => void }) {
  const [supplierId, setSupplierId] = useState(initialPO?.supplierId ?? '');
  const [poNumber, setPoNumber] = useState(initialPO?.poNumber ?? '');
  const [date, setDate] = useState(initialPO?.date ?? new Date().toISOString().slice(0, 10));
  const [origin, setOrigin] = useState(initialPO?.origin ?? 'Material');
  const [lines, setLines] = useState<SupplierLineItem[]>(initialPO?.items.map((line) => ({ ...line, mode: line.mode ?? (originCategory(initialPO.origin) === 'transport' ? 'Transport' : line.priceMode === 'material' ? 'Material' : 'Both'), materialId: line.materialId || materials.find((material) => material.name === line.description)?.id || '' })) ?? [emptyLine()]);
  const [ssclPercent, setSsclPercent] = useState(initialPO?.ssclPercent ?? tax.ssclPercent);
  const [vatPercent, setVatPercent] = useState(initialPO?.vatPercent ?? tax.vatPercent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const activeMaterials = materials.filter((material) => material.active);
  const needsMaterials = ['material', 'both'].includes(originCategory(origin));
  const updateLine = (id: string, patch: Partial<SupplierLineItem>) => setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch, ...(patch.priceMode ? { mode: patch.priceMode === 'material' ? 'Material' : 'Both' } : {}) } : line));
  const updatePrice = (line: SupplierLineItem, value: number) => updateLine(line.id, line.mode === 'Material' ? { materialPrice: value, transportPrice: 0, priceMode: 'material' } : { materialPrice: value, transportPrice: 0, priceMode: 'both' });
  const totals = calcSupplierPOTotals({ items: lines, ssclPercent, vatPercent });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!supplierId) nextErrors.supplier = 'Please select a supplier';
    if (!poNumber.trim()) nextErrors.poNumber = 'PO number is required';
    if (needsMaterials && (!lines.length || lines.some((line) => !line.materialId || line.quantity <= 0 || supplierLineUnitPrice(line) <= 0))) nextErrors.lines = 'Add at least one material with quantity and unit price';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    onSubmit({ supplierId, poNumber: poNumber.trim(), date, origin, items: needsMaterials ? lines : lines.map((line) => ({ ...line, mode: 'Transport' })) , ssclPercent, vatPercent, status: initialPO?.status ?? 'Active' });
  };
  return <form onSubmit={submit} className="space-y-4">
    <Card className="animate-fade-up"><CardHeader title={initialPO ? 'Edit Supplier PO' : 'Create Supplier PO'} /><div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-4"><Field label="Supplier" required><select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="form-select"><option value="">Select supplier...</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>{errors.supplier && <ErrorText>{errors.supplier}</ErrorText>}</Field><Field label="PO Number" required><input value={poNumber} onChange={(event) => setPoNumber(event.target.value)} className="form-input" placeholder="e.g. SPO-004" />{errors.poNumber && <ErrorText>{errors.poNumber}</ErrorText>}</Field><Field label="Origin" required><input value={origin} onChange={(event) => setOrigin(event.target.value)} className="form-input" placeholder="e.g. Material Supply" /></Field><Field label="Date"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="form-input" /></Field></div></Card>
    {needsMaterials ? <Card className="animate-fade-up"><CardHeader title="Materials" action={<button type="button" onClick={() => setLines((current) => [...current, emptyLine()])} className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600"><Icon name="Plus" className="h-3.5 w-3.5" /> Add Material</button>} /><div className="overflow-x-auto p-5"><div className="min-w-[760px]"><div className="grid grid-cols-[2.4fr_0.8fr_1fr_1.3fr_1.2fr_1.4fr_0.5fr] gap-2 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><div>Description</div><div>Unit</div><div>QTY</div><div>Unit Price</div><div>Mode</div><div>Amount</div><div /></div><div className="space-y-2">{lines.map((line) => <div key={line.id} className="grid grid-cols-[2.4fr_0.8fr_1fr_1.3fr_1.2fr_1.4fr_0.5fr] items-center gap-2"><select value={line.materialId || materials.find((material) => material.name === line.description)?.id || ''} onChange={(event) => { const material = materials.find((item) => item.id === event.target.value); updateLine(line.id, { materialId: material?.id ?? '', description: material?.name ?? '', unit: material?.unit ?? 'ton' }); }} className="form-select"><option value="">Select material...</option>{activeMaterials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select><input value={line.unit === 'Cube' ? 'Cube' : 'Ton'} disabled className="form-select text-center text-xs" /><input type="number" min="0" value={line.quantity || ''} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) || 0 })} className="form-input text-right" placeholder="0" /><input type="number" min="0" value={supplierLineUnitPrice(line) || ''} onChange={(event) => updatePrice(line, Number(event.target.value) || 0)} className="form-input text-right" placeholder="0.00" /><select value={line.mode ?? 'Both'} onChange={(event) => { const mode = event.target.value as SupplierLineItem['mode']; updateLine(line.id, { mode, priceMode: mode === 'Material' ? 'material' : 'both' }); }} className="form-select text-xs">{PRICE_MODES.map((mode) => <option key={mode.key} value={mode.key === 'material' ? 'Material' : 'Both'}>{mode.label}</option>)}</select><div className="rounded-lg bg-slate-50 px-2 py-2 text-right text-xs font-bold text-slate-700">{formatLKR(calcSupplierLineAmount(line))}</div><button type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Icon name="Trash2" className="h-4 w-4" /></button></div>)}</div></div>{errors.lines && <ErrorText>{errors.lines}</ErrorText>}<div className="mt-5 ml-auto max-w-sm space-y-2"><TotalRow label="Subtotal" value={formatLKR(totals.subtotal)} /><TotalRow label="SSCL" value={formatLKR(totals.ssclAmount)} /><TotalRow label="VAT" value={formatLKR(totals.vatAmount)} /><TotalRow label="Total" value={formatLKR(totals.grandTotal)} /></div></div></Card> : <Card className="p-5 text-sm text-slate-500"><Field label="Mode"><input value="Transport" disabled className="form-input mt-1 max-w-xs" /></Field><p className="mt-3">Transport Only POs do not use the Material/Both line-item table.</p></Card>}
    <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">{initialPO ? 'Save Changes' : 'Create Supplier PO'}</button></div>
  </form>;
}

function SupplierPOList({ suppliers, supplierPOs, onEdit }: { suppliers: Supplier[]; supplierPOs: SupplierPO[]; onEdit: (po: SupplierPO) => void }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pageCount = Math.max(1, Math.ceil(supplierPOs.length / PAGE_SIZE));
  const visible = supplierPOs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const supplierName = (id: string) => suppliers.find((supplier) => supplier.id === id)?.name ?? 'Unknown';
  return <Card className="animate-fade-up"><CardHeader title="Supplier Purchase Orders" action={<Badge tone="brand">{supplierPOs.length} POs</Badge>} /><div className="overflow-x-auto scrollbar-thin"><table className="w-full min-w-[850px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-5 py-3 font-semibold">PO Number</th><th className="px-5 py-3 font-semibold">Supplier</th><th className="px-5 py-3 font-semibold">Origin</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 text-right font-semibold">PO Value</th><th className="hidden px-5 py-3 text-right font-semibold md:table-cell">Required Load</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-center font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-50">{visible.map((po, index) => <SupplierPORow key={po.id} po={po} supplierName={supplierName(po.supplierId)} isOpen={expanded === po.id} delay={index * 30} onToggle={() => setExpanded(expanded === po.id ? null : po.id)} onEdit={() => onEdit(po)} />)}{!visible.length && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">No Supplier POs in this tab.</td></tr>}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>{supplierPOs.length} POs</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><span className="px-2 py-1.5">Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div></div></Card>;
}

function SupplierPORow({ po, supplierName, isOpen, delay, onToggle, onEdit }: { po: SupplierPO; supplierName: string; isOpen: boolean; delay: number; onToggle: () => void; onEdit: () => void }) {
  const totals = calcSupplierPOTotals(po);
  return <><tr className="transition hover:bg-slate-50/60 animate-fade-up" style={{ animationDelay: `${delay}ms` }}><td className="px-5 py-3 font-semibold text-slate-700">{po.poNumber}</td><td className="px-5 py-3 text-slate-600">{supplierName}</td><td className="px-5 py-3"><Badge tone={po.origin === 'Transport' ? 'amber' : 'brand'}>{po.origin}</Badge></td><td className="px-5 py-3 text-slate-500">{po.date}</td><td className="px-5 py-3 text-right font-bold text-slate-700">{formatLKR(totals.grandTotal)}</td><td className="hidden px-5 py-3 text-right text-slate-500 md:table-cell">{formatMT(po.items.reduce((sum, item) => sum + item.quantity, 0))}</td><td className="px-5 py-3"><Badge tone={po.status === 'Active' ? 'brand' : po.status === 'Completed' ? 'success' : 'amber'}>{po.status}</Badge></td><td className="px-5 py-3 text-center"><div className="flex justify-center gap-1"><button type="button" onClick={onEdit} title="Edit Supplier PO" className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Icon name="Pencil" className="h-4 w-4" /></button><button type="button" onClick={onToggle} title="Expand" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><Icon name="ChevronDown" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button></div></td></tr>{isOpen && <tr className="animate-fade-in"><td colSpan={8} className="bg-slate-50/50 px-5 py-4"><div className="rounded-lg border border-slate-200 bg-white p-4"><h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Material Breakdown</h4><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{po.items.map((item) => <div key={item.id} className="rounded-lg border border-slate-100 p-3.5"><div className="text-sm font-bold text-slate-700">{item.description}</div><div className="mt-2 text-xs text-slate-500">{item.unit === 'Cube' ? 'Cube' : 'Ton'} · {item.priceMode}</div><div className="mt-1 text-xs font-semibold text-slate-700">{formatLKR(supplierLineUnitPrice(item))} · {formatLKR(calcSupplierLineAmount(item))}</div></div>)}</div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm sm:grid-cols-4"><MiniStat label="Subtotal" value={formatLKR(totals.subtotal)} /><MiniStat label="SSCL" value={formatLKR(totals.ssclAmount)} /><MiniStat label="VAT" value={formatLKR(totals.vatAmount)} /><MiniStat label="Total" value={formatLKR(totals.grandTotal)} bold /></div></div></td></tr>}</>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}{required && <span className="text-rose-500"> *</span>}</span>{children}</label>; }
function ErrorText({ children }: { children: React.ReactNode }) { return <p className="mt-1 text-[11px] text-rose-500">{children}</p>; }
function TotalRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-slate-100 pb-2"><span className="text-xs font-semibold text-slate-500">{label}</span><span className="text-sm font-semibold text-slate-700">{value}</span></div>; }
function MiniStat({ label, value, bold }: { label: string; value: string; bold?: boolean }) { return <div><div className="text-[11px] font-medium text-slate-400">{label}</div><div className={bold ? 'text-sm font-bold text-brand-700' : 'text-sm font-semibold text-slate-700'}>{value}</div></div>; }
