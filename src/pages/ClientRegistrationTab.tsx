import { useState } from 'react';
import { useApp, type Client } from '@/data/appState';
import { showToast } from '@/components/Toast';
import { Card, CardHeader, Badge, Modal } from '@/components/ui';
import { Icon } from '@/components/Icon';

const EMPTY = { name: '', tin: '', vatNumber: '', address: '', phone: '' };

export function ClientRegistrationTab() {
  const { clients, clientPOs, addClient, updateClient } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const poCount = (clientId: string) => clientPOs.filter((p) => p.clientId === clientId).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.tin.trim()) return;
    addClient(form);
    showToast('Client registered successfully');
    setForm(EMPTY);
  };

  return (
    <>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Registration form */}
      <div className="xl:col-span-2">
        <Card className="animate-fade-up">
          <CardHeader title="Register New Client" />
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <Field label="Client Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. ABC Construction"
                className="form-input"
              />
            </Field>
            <Field label="Client TIN" required>
              <input
                type="text"
                value={form.tin}
                onChange={(e) => setForm({ ...form, tin: e.target.value })}
                placeholder="e.g. 123456789"
                className="form-input"
              />
            </Field>
            <Field label="Client VAT No.">
              <input type="text" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} placeholder="e.g. VAT-123456" className="form-input" />
            </Field>
            <Field label="Client Address">
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address, city"
                rows={2}
                className="form-input resize-none"
              />
            </Field>
            <Field label="Client Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 077 123 4567"
                className="form-input"
              />
            </Field>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
            >
              <Icon name="UserPlus" className="h-4 w-4" />
              Register Client
            </button>
          </form>
        </Card>
      </div>

      {/* Client list */}
      <div className="xl:col-span-3">
        <Card className="animate-fade-up">
          <CardHeader title="Registered Clients" action={<Badge tone="brand">{clients.length} clients</Badge>} />
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-3 font-semibold">Client Name</th>
                  <th className="px-5 py-3 font-semibold">TIN</th>
                  <th className="px-5 py-3 font-semibold">VAT No.</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="hidden px-5 py-3 font-semibold lg:table-cell">Address</th>
                  <th className="px-5 py-3 text-center font-semibold">POs</th>
                  <th className="sticky right-0 z-20 bg-slate-50 px-5 py-3 text-center font-semibold shadow-[-4px_0_8px_rgba(15,23,42,0.06)]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.map((c, i) => (
                  <tr
                    key={c.id}
                    className="transition hover:bg-slate-50/60 animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                          <Icon name="Building2" className="h-4 w-4 text-brand-600" />
                        </div>
                        <span className="font-semibold text-slate-700">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{c.tin}</td>
                    <td className="px-5 py-3 text-slate-500">{c.vatNumber || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{c.phone}</td>
                    <td className="hidden px-5 py-3 text-slate-500 lg:table-cell">{c.address}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge tone={poCount(c.id) > 0 ? 'brand' : 'slate'}>{poCount(c.id)}</Badge>
                    </td>
                    <td className="sticky right-0 z-10 bg-white px-5 py-3 text-center shadow-[-4px_0_8px_rgba(15,23,42,0.06)]"><button type="button" onClick={() => setEditingClient(c)} title="Edit client" className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Icon name="Pencil" className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
    {editingClient && <ClientEditModal client={editingClient} onCancel={() => setEditingClient(null)} onSave={(patch) => { updateClient(editingClient.id, patch); setEditingClient(null); showToast('Client updated successfully'); }} />}
    </>
  );
}

function ClientEditModal({ client, onCancel, onSave }: { client: Client; onCancel: () => void; onSave: (patch: Omit<Client, 'id'>) => void }) {
  const [form, setForm] = useState<Omit<Client, 'id'>>({ name: client.name, tin: client.tin, vatNumber: client.vatNumber ?? '', address: client.address, phone: client.phone });
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!form.name.trim() || !form.tin.trim()) return; onSave({ ...form, name: form.name.trim(), tin: form.tin.trim() }); };
  return <Modal title="Edit Client" onClose={onCancel}><form onSubmit={submit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"><Field label="Client Name" required><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="form-input" /></Field><Field label="Client TIN" required><input value={form.tin} onChange={(event) => setForm({ ...form, tin: event.target.value })} className="form-input" /></Field><Field label="Client VAT No."><input value={form.vatNumber} onChange={(event) => setForm({ ...form, vatNumber: event.target.value })} className="form-input" /></Field><Field label="Client Phone Number"><input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="form-input" /></Field><Field label="Client Address"><textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={2} className="form-input resize-none sm:col-span-2" /></Field><div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sm:col-span-2"><button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Save Changes</button></div></form></Modal>;
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
