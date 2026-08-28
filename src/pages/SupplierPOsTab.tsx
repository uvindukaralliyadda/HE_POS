import { useState, Fragment } from 'react';
import {
  useApp,
  calcSupplierPOTotals,
  calcSupplierLineAmount,
  supplierLineUnitPrice,
  formatLKR,
  formatMT,
  type SupplierLineItem,
} from '@/data/appState';
import { showToast } from '@/components/Toast';
import { Card, CardHeader, Badge } from '@/components/ui';
import { Icon } from '@/components/Icon';

let sLineIdCounter = 0;
const newSLineId = () => `sline${++sLineIdCounter}`;

const emptyLine = (): SupplierLineItem => ({
  id: newSLineId(),
  description: '',
  unit: 'ton',
  quantity: 0,
  materialPrice: 0,
  transportPrice: 0,
  priceMode: 'both',
  fulfilled: 0,
});

const PRICE_MODES: { key: SupplierLineItem['priceMode']; label: string }[] = [
  { key: 'material', label: 'Material' },
  { key: 'transport', label: 'Transport' },
  { key: 'both', label: 'Both' },
];

export function SupplierPOsTab() {
  const { suppliers, materials, supplierPOs, tax, addSupplierPO } = useApp();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-5">
      {showForm ? (
        <SupplierPOForm
          suppliers={suppliers}
          materials={materials}
          tax={tax}
          onSubmit={(po) => {
            addSupplierPO(po);
            showToast('Supplier PO created successfully');
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
          >
            <Icon name="Plus" className="h-4 w-4" />
            Create Supplier PO
          </button>
        </div>
      )}

      <SupplierPOList />
    </div>
  );
}

/* ---------- Supplier PO Creation Form ---------- */

function SupplierPOForm({
  suppliers,
  materials,
  tax,
  onSubmit,
  onCancel,
}: {
  suppliers: { id: string; name: string }[];
  materials: { id: string; name: string; unit: string; active: boolean }[];
  tax: { ssclPercent: number; vatPercent: number };
  onSubmit: (po: any) => void;
  onCancel: () => void;
}) {
  const [supplierId, setSupplierId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<SupplierLineItem[]>([emptyLine()]);
  const [ssclPercent, setSsclPercent] = useState(tax.ssclPercent);
  const [vatPercent, setVatPercent] = useState(tax.vatPercent);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeMaterials = materials.filter((m) => m.active);

  const updateLine = (id: string, patch: Partial<SupplierLineItem>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const totals = calcSupplierPOTotals({ items: lines, ssclPercent, vatPercent });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!supplierId) errs.supplier = 'Please select a supplier';
    if (!poNumber.trim()) errs.poNumber = 'PO number is required';
    const invalidLines = lines.some((l) => !l.description || l.quantity <= 0 || supplierLineUnitPrice(l) <= 0);
    if (invalidLines) errs.lines = 'All rows need a material, quantity, and a valid price';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      poNumber: poNumber.trim(),
      supplierId,
      date,
      items: lines,
      ssclPercent,
      vatPercent,
      status: 'Active',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* PO header */}
      <Card className="animate-fade-up">
        <CardHeader title="Create Supplier PO" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Supplier <span className="text-rose-500">*</span>
            </label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="form-select">
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.supplier && <p className="mt-1 text-[11px] text-rose-500">{errors.supplier}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              PO Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. SPO-004"
              className="form-input"
            />
            {errors.poNumber && <p className="mt-1 text-[11px] text-rose-500">{errors.poNumber}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
          </div>
        </div>
      </Card>

      {/* Materials section */}
      <Card className="animate-fade-up">
        <CardHeader
          title="Materials"
          action={
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100"
            >
              <Icon name="Plus" className="h-3.5 w-3.5" />
              Add Material
            </button>
          }
        />
        <div className="p-5">
          {/* Desktop header */}
          <div className="hidden grid-cols-12 gap-2 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:grid">
            <div className="col-span-3">Description</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Material Price</div>
            <div className="col-span-2">Transport Price</div>
            <div className="col-span-1">Mode</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div key={line.id} className="animate-fade-up" style={{ animationDelay: `${idx * 30}ms` }}>
                {/* Desktop row */}
                <div className="hidden items-end gap-2 lg:grid lg:grid-cols-12">
                  <div className="col-span-3">
                    <select
                      value={line.description}
                      onChange={(e) => {
                        const mat = materials.find((m) => m.name === e.target.value);
                        updateLine(line.id, { description: e.target.value, unit: mat?.unit ?? 'ton' });
                      }}
                      className="form-select"
                    >
                      <option value="">Select material…</option>
                      {activeMaterials.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input type="text" value={line.unit} disabled className="form-select text-center text-xs" />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min={0}
                      value={line.quantity || ''}
                      onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="form-input text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      value={line.materialPrice || ''}
                      disabled={line.priceMode === 'transport'}
                      onChange={(e) => updateLine(line.id, { materialPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="form-input text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      value={line.transportPrice || ''}
                      disabled={line.priceMode === 'material'}
                      onChange={(e) => updateLine(line.id, { transportPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="form-input text-right"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={line.priceMode}
                      onChange={(e) => updateLine(line.id, { priceMode: e.target.value as SupplierLineItem['priceMode'] })}
                      className="form-select text-[11px]"
                    >
                      {PRICE_MODES.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex items-center rounded-lg bg-slate-50 px-2 py-2 text-right text-xs font-bold text-slate-700">
                    {formatLKR(calcSupplierLineAmount(line))}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile / tablet portrait card */}
                <div className="space-y-3 rounded-lg border border-slate-100 p-3 lg:hidden">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-500">Description</label>
                    <select
                      value={line.description}
                      onChange={(e) => {
                        const mat = materials.find((m) => m.name === e.target.value);
                        updateLine(line.id, { description: e.target.value, unit: mat?.unit ?? 'ton' });
                      }}
                      className="form-select"
                    >
                      <option value="">Select material…</option>
                      {activeMaterials.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">Unit</label>
                      <input type="text" value={line.unit} disabled className="form-select text-center text-xs" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">Quantity</label>
                      <input
                        type="number"
                        min={0}
                        value={line.quantity || ''}
                        onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="form-input text-right"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">Mode</label>
                      <select
                        value={line.priceMode}
                        onChange={(e) => updateLine(line.id, { priceMode: e.target.value as SupplierLineItem['priceMode'] })}
                        className="form-select text-xs"
                      >
                        {PRICE_MODES.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">Material Price (LKR)</label>
                      <input
                        type="number"
                        min={0}
                        value={line.materialPrice || ''}
                        disabled={line.priceMode === 'transport'}
                        onChange={(e) => updateLine(line.id, { materialPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="form-input text-right"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">Transport Price (LKR)</label>
                      <input
                        type="number"
                        min={0}
                        value={line.transportPrice || ''}
                        disabled={line.priceMode === 'material'}
                        onChange={(e) => updateLine(line.id, { transportPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="form-input text-right"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-500">Amount</span>
                    <span className="text-sm font-bold text-slate-700">{formatLKR(calcSupplierLineAmount(line))}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-100 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
                  >
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {errors.lines && <p className="mt-2 text-[11px] text-rose-500">{errors.lines}</p>}

          {/* Totals */}
          <div className="mt-5 flex flex-col gap-3 sm:ml-auto sm:max-w-sm">
            <TotalRow label="Subtotal" value={formatLKR(totals.subtotal)} />
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">SSCL %</label>
              <input
                type="number"
                min={0}
                value={ssclPercent}
                onChange={(e) => setSsclPercent(parseFloat(e.target.value) || 0)}
                className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-right text-xs font-semibold text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <span className="flex-1 text-right text-sm font-semibold text-slate-700">{formatLKR(totals.ssclAmount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">VAT %</label>
              <input
                type="number"
                min={0}
                value={vatPercent}
                onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-right text-xs font-semibold text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <span className="flex-1 text-right text-sm font-semibold text-slate-700">{formatLKR(totals.vatAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-brand-600 px-4 py-3 text-white">
              <span className="text-sm font-semibold">Grand Total</span>
              <span className="text-lg font-bold">{formatLKR(totals.grandTotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
            >
              <Icon name="Check" className="h-4 w-4" />
              Create Supplier PO
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </form>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

/* ---------- Supplier PO List with expandable rows ---------- */

const STATUS_TONE: Record<string, string> = {
  Active: 'brand',
  Completed: 'success',
  Pending: 'amber',
};

const MODE_LABEL: Record<string, string> = {
  material: 'Material Only',
  transport: 'Transport Only',
  both: 'Material + Transport',
};

function SupplierPOList() {
  const { suppliers, supplierPOs } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? 'Unknown';

  return (
    <Card className="animate-fade-up">
      <CardHeader title="Supplier Purchase Orders" action={<Badge tone="brand">{supplierPOs.length} POs</Badge>} />
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-5 py-3 font-semibold">PO Number</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 text-right font-semibold">PO Value</th>
              <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">Required Load</th>
              <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">Fulfilled</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-center font-semibold">Expand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {supplierPOs.map((po, i) => {
              const totals = calcSupplierPOTotals(po);
              const requiredLoad = po.items.reduce((s, it) => s + it.quantity, 0);
              const fulfilledLoad = po.items.reduce((s, it) => s + it.fulfilled, 0);
              const isOpen = expanded === po.id;
              return (
                <Fragment key={po.id}>
                  <tr
                    className="transition hover:bg-slate-50/60 animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-700">{po.poNumber}</td>
                    <td className="px-5 py-3 text-slate-600">{supplierName(po.supplierId)}</td>
                    <td className="px-5 py-3 text-slate-500">{po.date}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-700">{formatLKR(totals.grandTotal)}</td>
                    <td className="hidden px-5 py-3 text-right text-slate-500 md:table-cell">{formatMT(requiredLoad)}</td>
                    <td className="hidden px-5 py-3 text-right text-slate-500 md:table-cell">{formatMT(fulfilledLoad)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[po.status] ?? 'slate'}>{po.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setExpanded(isOpen ? null : po.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Icon name="ChevronDown" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="animate-fade-in">
                      <td colSpan={8} className="bg-slate-50/50 px-5 py-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Material Breakdown
                          </h4>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {po.items.map((item) => {
                              const amt = calcSupplierLineAmount(item);
                              const remaining = item.quantity - item.fulfilled;
                              return (
                                <div key={item.id} className="rounded-lg border border-slate-100 bg-white p-3.5">
                                  <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
                                      <Icon name="Package" className="h-3.5 w-3.5 text-brand-600" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{item.description}</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                      {MODE_LABEL[item.priceMode]}
                                    </span>
                                  </div>
                                  <dl className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <dt className="text-slate-400">Unit Price</dt>
                                      <dd className="font-semibold text-slate-600">
                                        {formatLKR(supplierLineUnitPrice(item))}
                                      </dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-slate-400">Value</dt>
                                      <dd className="font-semibold text-slate-700">{formatLKR(amt)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-slate-400">Required</dt>
                                      <dd className="font-semibold text-slate-600">{formatMT(item.quantity)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-slate-400">Fulfilled</dt>
                                      <dd className="font-semibold text-success-600">{formatMT(item.fulfilled)}</dd>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-50 pt-1">
                                      <dt className="text-slate-400">Remaining</dt>
                                      <dd className="font-semibold text-amber-600">{formatMT(remaining)}</dd>
                                    </div>
                                  </dl>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm sm:grid-cols-4">
                            <MiniStat label="Subtotal" value={formatLKR(totals.subtotal)} />
                            <MiniStat label="SSCL" value={formatLKR(totals.ssclAmount)} />
                            <MiniStat label="VAT" value={formatLKR(totals.vatAmount)} />
                            <MiniStat label="Grand Total" value={formatLKR(totals.grandTotal)} bold />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MiniStat({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <div className={`${bold ? 'text-sm font-bold text-brand-700' : 'text-sm font-semibold text-slate-700'}`}>
        {value}
      </div>
    </div>
  );
}
