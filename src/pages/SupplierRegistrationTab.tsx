import { useState, Fragment } from 'react';
import { useApp, type Supplier } from '@/data/appState';
import { showToast } from '@/components/Toast';
import { Card, CardHeader, Badge, Modal } from '@/components/ui';
import { Icon } from '@/components/Icon';

const EMPTY = { name: '', tin: '', address: '', phone: '' };

export function SupplierRegistrationTab() {
  const { suppliers, supplierPOs, addSupplier, updateSupplier } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [trucks, setTrucks] = useState<string[]>(['']);
  const [expandedTrucks, setExpandedTrucks] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const poCount = (supplierId: string) => supplierPOs.filter((p) => p.supplierId === supplierId).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.tin.trim()) return;
    const cleanTrucks = trucks.map((t) => t.trim()).filter(Boolean);
    addSupplier({ ...form, truckNumbers: cleanTrucks });
    showToast('Supplier registered successfully');
    setForm(EMPTY);
    setTrucks(['']);
  };

  const updateTruck = (idx: number, value: string) => {
    setTrucks((prev) => prev.map((t, i) => (i === idx ? value : t)));
  };
  const addTruck = () => setTrucks((prev) => [...prev, '']);
  const removeTruck = (idx: number) => setTrucks((prev) => prev.filter((_, i) => i !== idx));

  return (
    <>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Registration form */}
      <div className="xl:col-span-2">
        <Card className="animate-fade-up">
          <CardHeader title="Register New Supplier" />
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <Field label="Supplier Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Supplier A"
                className="form-input"
              />
            </Field>
            <Field label="Supplier TIN" required>
              <input
                type="text"
                value={form.tin}
                onChange={(e) => setForm({ ...form, tin: e.target.value })}
                placeholder="e.g. 111222333"
                className="form-input"
              />
            </Field>
            <Field label="Supplier Address">
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address, city"
                rows={2}
                className="form-input resize-none"
              />
            </Field>
            <Field label="Supplier Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 077 111 2222"
                className="form-input"
              />
            </Field>

            {/* Truck numbers */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Truck Numbers</label>
                <button
                  type="button"
                  onClick={addTruck}
                  className="flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-600 transition hover:bg-brand-100"
                >
                  <Icon name="Plus" className="h-3 w-3" />
                  Add Truck
                </button>
              </div>
              <div className="space-y-2">
                {trucks.map((truck, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-fade-up">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Icon name="Truck" className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={truck}
                      onChange={(e) => updateTruck(idx, e.target.value)}
                      placeholder="e.g. NA-1234"
                      className="form-input"
                    />
                    {trucks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTruck(idx)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
            >
              <Icon name="Warehouse" className="h-4 w-4" />
              Register Supplier
            </button>
          </form>
        </Card>
      </div>

      {/* Supplier list */}
      <div className="xl:col-span-3">
        <Card className="animate-fade-up">
          <CardHeader title="Registered Suppliers" action={<Badge tone="brand">{suppliers.length} suppliers</Badge>} />
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-3 font-semibold">Supplier Name</th>
                  <th className="px-5 py-3 font-semibold">TIN</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Trucks</th>
                  <th className="px-5 py-3 text-center font-semibold">POs</th>
                  <th className="sticky right-0 z-20 bg-slate-50 px-5 py-3 text-center font-semibold shadow-[-4px_0_8px_rgba(15,23,42,0.06)]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {suppliers.map((s, i) => {
                  const isOpen = expandedTrucks === s.id;
                  return (
                    <Fragment key={s.id}>
                      <tr
                        className="transition hover:bg-slate-50/60 animate-fade-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                              <Icon name="Warehouse" className="h-4 w-4 text-brand-600" />
                            </div>
                            <span className="font-semibold text-slate-700">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{s.tin}</td>
                        <td className="px-5 py-3 text-slate-500">{s.phone}</td>
                        <td className="hidden px-5 py-3 md:table-cell">
                          <button
                            onClick={() => setExpandedTrucks(isOpen ? null : s.id)}
                            className="flex items-center gap-1.5 text-slate-500 transition hover:text-brand-600"
                          >
                            <Badge tone="slate">{s.truckNumbers.length}</Badge>
                            <Icon name="ChevronDown" className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge tone={poCount(s.id) > 0 ? 'brand' : 'slate'}>{poCount(s.id)}</Badge>
                        </td>
                        <td className="sticky right-0 z-10 bg-white px-5 py-3 text-center shadow-[-4px_0_8px_rgba(15,23,42,0.06)]"><button type="button" onClick={() => setEditingSupplier(s)} title="Edit supplier" className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Icon name="Pencil" className="h-4 w-4" /></button></td>
                      </tr>
                      {isOpen && (
                        <tr key={`${s.id}-trucks`} className="animate-fade-in">
                          <td colSpan={6} className="bg-slate-50/50 px-5 py-3">
                            <div className="flex flex-wrap gap-2">
                              {s.truckNumbers.map((t, ti) => (
                                <span
                                  key={ti}
                                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                                >
                                  <Icon name="Truck" className="h-3.5 w-3.5 text-brand-500" />
                                  {t}
                                </span>
                              ))}
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
      </div>
    </div>
    {editingSupplier && <SupplierEditModal supplier={editingSupplier} onCancel={() => setEditingSupplier(null)} onSave={(patch) => { updateSupplier(editingSupplier.id, patch); setEditingSupplier(null); showToast('Supplier updated successfully'); }} />}
    </>
  );
}

function SupplierEditModal({ supplier, onCancel, onSave }: { supplier: Supplier; onCancel: () => void; onSave: (patch: Omit<Supplier, 'id'>) => void }) {
  const [form, setForm] = useState({ name: supplier.name, tin: supplier.tin, address: supplier.address, phone: supplier.phone });
  const [trucks, setTrucks] = useState(supplier.truckNumbers.length ? supplier.truckNumbers : ['']);
  const updateTruck = (index: number, value: string) => setTrucks((current) => current.map((truck, itemIndex) => itemIndex === index ? value : truck));
  const submit = (event: React.FormEvent) => { event.preventDefault(); const cleanTrucks = trucks.map((truck) => truck.trim()).filter(Boolean); if (!form.name.trim() || !form.tin.trim()) return; onSave({ ...form, name: form.name.trim(), tin: form.tin.trim(), truckNumbers: cleanTrucks }); };
  return <Modal title="Edit Supplier" onClose={onCancel}><form onSubmit={submit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"><Field label="Supplier Name" required><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="form-input" /></Field><Field label="Supplier TIN" required><input value={form.tin} onChange={(event) => setForm({ ...form, tin: event.target.value })} className="form-input" /></Field><Field label="Supplier Address"><textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={2} className="form-input resize-none sm:col-span-2" /></Field><Field label="Supplier Phone Number"><input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="form-input" /></Field><div className="sm:col-span-2"><div className="mb-1.5 text-xs font-semibold text-slate-600">Truck Numbers</div><div className="space-y-2">{trucks.map((truck, index) => <div key={index} className="flex gap-2"><input value={truck} onChange={(event) => updateTruck(index, event.target.value)} className="form-input" placeholder="e.g. NA-1234" />{trucks.length > 1 && <button type="button" onClick={() => setTrucks((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Icon name="Trash2" className="h-4 w-4" /></button>}</div>)}</div><button type="button" onClick={() => setTrucks((current) => [...current, ''])} className="mt-2 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-600">Add Truck</button></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sm:col-span-2"><button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Save Changes</button></div></form></Modal>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
