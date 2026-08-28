import { useState } from 'react';
import { useApp } from '@/data/appState';
import { showToast } from '@/components/Toast';
import { Card, CardHeader, Badge } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { DashboardHeader } from '@/components/Controls';

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <DashboardHeader title="Settings" subtitle="Configure system materials and tax settings" />
      <MaterialsSection />
      <TaxSection />
    </div>
  );
}

/* ---------- Materials Management ---------- */

const UNITS = ['ton'];

function MaterialsSection() {
  const { materials, addMaterial, updateMaterial } = useApp();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('ton');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMaterial({ name: name.trim(), unit, active: true });
    showToast('Material added successfully');
    setName('');
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updateMaterial(id, { name: editName.trim() });
      showToast('Material updated successfully');
    }
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Add material form */}
      <div className="xl:col-span-2">
        <Card className="animate-fade-up">
          <CardHeader title="Add Material" />
          <form onSubmit={handleAdd} className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Material Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rock"
                className="form-input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="form-select">
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
            >
              <Icon name="Plus" className="h-4 w-4" />
              Add Material
            </button>
          </form>
        </Card>
      </div>

      {/* Materials list */}
      <div className="xl:col-span-3">
        <Card className="animate-fade-up">
          <CardHeader title="Materials" action={<Badge tone="brand">{materials.length} materials</Badge>} />
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-3 font-semibold">Material</th>
                  <th className="px-5 py-3 font-semibold">Unit</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {materials.map((m, i) => (
                  <tr
                    key={m.id}
                    className="transition hover:bg-slate-50/60 animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3">
                      {editingId === m.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(m.id)}
                          className="form-input"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                            <Icon name="Package" className="h-4 w-4 text-brand-600" />
                          </div>
                          <span className="font-semibold text-slate-700">{m.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{m.unit}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => updateMaterial(m.id, { active: !m.active })}>
                        <Badge tone={m.active ? 'success' : 'slate'}>{m.active ? 'Active' : 'Inactive'}</Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center gap-1">
                        {editingId === m.id ? (
                          <button
                            onClick={() => saveEdit(m.id)}
                            className="rounded-lg p-1.5 text-success-600 transition hover:bg-success-50"
                          >
                            <Icon name="Check" className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(m.id, m.name)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          >
                            <Icon name="Pencil" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Tax Settings ---------- */

function TaxSection() {
  const { tax, setTax } = useApp();

  return (
    <Card className="animate-fade-up max-w-md">
      <CardHeader title="Tax Settings" />
      <div className="grid grid-cols-2 gap-4 p-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">SSCL Percentage (%)</label>
          <input
            type="number"
            min={0}
            value={tax.ssclPercent}
            onChange={(e) => setTax({ ssclPercent: parseFloat(e.target.value) || 0 })}
            className="form-input text-right"
          />
          <p className="mt-1 text-[11px] text-slate-400">Applied to subtotal on new POs</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">VAT Percentage (%)</label>
          <input
            type="number"
            min={0}
            value={tax.vatPercent}
            onChange={(e) => setTax({ vatPercent: parseFloat(e.target.value) || 0 })}
            className="form-input text-right"
          />
          <p className="mt-1 text-[11px] text-slate-400">Applied to subtotal + SSCL on new POs</p>
        </div>
      </div>
    </Card>
  );
}
