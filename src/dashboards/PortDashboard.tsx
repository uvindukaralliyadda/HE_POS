import { useState } from "react";
import type { Role } from "@/data/mockData";
import {
  useApp,
  type Client,
  type ClientPO,
  type PortEntry,
  type PortTable,
  type Supplier,
  type SupplierPO,
} from "@/data/appState";
import { Card, CardHeader, Badge, Modal } from "@/components/ui";
import { DashboardHeader, DashboardWelcome } from "@/components/Controls";
import { Icon } from "@/components/Icon";
import { showToast } from "@/components/Toast";

const STATES: PortEntry["state"][] = ["Transport", "Material", "Both"];
const reviewerRole = (role: Role) =>
  role === "Admin" || role === "Office Staff";

export function PortDashboard({ role = "Port Staff" }: { role?: Role }) {
  const {
    materials,
    suppliers,
    clients,
    clientPOs,
    supplierPOs,
    portTables,
    portEntries,
    addPortTable,
    addPortEntry,
    updatePortEntry,
    deletePortEntry,
  } = useApp();
  const [form, setForm] = useState({ site: "", date: "", material: "" });
  const [filters, setFilters] = useState({
    site: "",
    material: "",
    from: "",
    to: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<PortTable | null>(null);
  const tables = portTables.filter(
    (table) =>
      (!filters.site || table.site === filters.site) &&
      (!filters.material || table.material === filters.material) &&
      (!filters.from || table.date >= filters.from) &&
      (!filters.to || table.date <= filters.to),
  );
  const selected = portTables.find((table) => table.id === selectedId);
  const entries = selected
    ? portEntries.filter((entry) => entry.tableId === selected.id)
    : [];

  const createTable = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.site.trim() || !form.date || !form.material) return;
    const existing = portTables.find(
      (table) =>
        table.site.toLowerCase() === form.site.trim().toLowerCase() &&
        table.date === form.date &&
        table.material === form.material,
    );
    if (existing) {
      setDuplicate(existing);
      return;
    }
    addPortTable({
      site: form.site.trim(),
      date: form.date,
      material: form.material,
    });
    setForm({ site: "", date: "", material: "" });
    showToast("Port entry table created successfully");
  };

  if (selected) {
    return (
      <TableView
        role={role}
        table={selected}
        entries={entries}
        suppliers={suppliers}
        clients={clients}
        clientPOs={clientPOs}
        supplierPOs={supplierPOs}
        onBack={() => {
          setSelectedId(null);
        }}
        onUpdate={updatePortEntry}
        addPortEntry={addPortEntry}
        onDelete={setDeleteId}
        deleteId={deleteId}
        onCancelDelete={() => setDeleteId(null)}
        onConfirmDelete={() => {
          if (deleteId) deletePortEntry(deleteId);
          setDeleteId(null);
          showToast("Port entry removed");
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <DashboardWelcome
        role={role}
        subtitle="Create and manage material delivery tables"
      />
      <Card className="animate-fade-up">
        <CardHeader title="Create Port Entry Table" />
        <form
          onSubmit={createTable}
          className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end"
        >
          <Field label="Site">
            <input
              value={form.site}
              onChange={(event) =>
                setForm({ ...form, site: event.target.value })
              }
              placeholder="e.g. ABC Construction Site"
              className="form-input min-h-11"
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
              className="form-input min-h-11"
            />
          </Field>
          <Field label="Material">
            <select
              value={form.material}
              onChange={(event) =>
                setForm({ ...form, material: event.target.value })
              }
              className="form-select min-h-11"
            >
              <option value="">Select material...</option>
              {materials
                .filter((item) => item.active)
                .map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
            </select>
          </Field>
          <button
            type="submit"
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Icon name="Plus" className="h-4 w-4" /> Create Table
          </button>
        </form>
        {duplicate && (
          <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 animate-fade-in">
            <span>
              A port entry table already exists for this site, date and
              material.
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedId(duplicate.id);
                setDuplicate(null);
              }}
              className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Open Existing Table
            </button>
          </div>
        )}
      </Card>
      <Card className="animate-fade-up">
        <CardHeader
          title="Port Entry Tables"
          action={<Badge tone="brand">{tables.length} tables</Badge>}
        />
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
          <Field label="Site">
            <select
              value={filters.site}
              onChange={(event) =>
                setFilters({ ...filters, site: event.target.value })
              }
              className="form-select"
            >
              <option value="">All sites</option>
              {[...new Set(portTables.map((table) => table.site))].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Material">
            <select
              value={filters.material}
              onChange={(event) =>
                setFilters({ ...filters, material: event.target.value })
              }
              className="form-select"
            >
              <option value="">All materials</option>
              {materials
                .filter((item) => item.active)
                .map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="From">
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters({ ...filters, from: event.target.value })
              }
              className="form-input"
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters({ ...filters, to: event.target.value })
              }
              className="form-input"
            />
          </Field>
          <button
            type="button"
            onClick={() =>
              setFilters({ site: "", material: "", from: "", to: "" })
            }
            className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"
          >
            Clear Filters
          </button>
        </div>
        {tables.length ? (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {tables.map((table, index) => (
              <TableCard
                key={table.id}
                table={table}
                entries={portEntries.filter(
                  (entry) => entry.tableId === table.id,
                )}
                reviewer={reviewerRole(role)}
                onOpen={() => setSelectedId(table.id)}
                delay={index * 40}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <div className="text-sm font-semibold text-slate-600">
              No port entry tables found
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your date, site or material filters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function TableCard({
  table,
  entries,
  reviewer,
  onOpen,
  delay,
}: {
  table: PortTable;
  entries: PortEntry[];
  reviewer: boolean;
  onOpen: () => void;
  delay: number;
}) {
  const net = entries.reduce((sum, entry) => sum + (entry.netWeight ?? 0), 0);
  const confirmed = entries.filter(
    (entry) => entry.verificationStatus === "Confirmed",
  ).length;
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${delay}ms` }}
      className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-elevated animate-fade-up"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-bold text-slate-800">{table.site}</div>
          <div className="mt-1 text-sm text-slate-500">
            {dateText(table.date)}
          </div>
        </div>
        <Icon name="ChevronRight" className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="font-semibold text-brand-700">{table.material}</div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <Badge tone="slate">{entries.length} Entries</Badge>
          <span>{net.toFixed(2)} Ton</span>
        </div>
        {reviewer && (
          <div className="mt-2 flex gap-2">
            <Badge tone="success">{confirmed} Confirmed</Badge>
            <Badge tone="amber">{entries.length - confirmed} Pending</Badge>
          </div>
        )}
      </div>
      <div className="mt-4 text-xs font-semibold text-brand-600">
        View Table →
      </div>
    </button>
  );
}

function TableView({
  role,
  table,
  entries,
  suppliers,
  clients,
  clientPOs,
  supplierPOs,
  onBack,
  onUpdate,
  addPortEntry,
  onDelete,
  deleteId,
  onCancelDelete,
  onConfirmDelete,
}: {
  role: Role;
  table: PortTable;
  entries: PortEntry[];
  suppliers: Supplier[];
  clients: Client[];
  clientPOs: ClientPO[];
  supplierPOs: SupplierPO[];
  onBack: () => void;
  onUpdate: (id: string, patch: Partial<PortEntry>) => void;
  addPortEntry: (entry: Omit<PortEntry, "id">) => string;
  onDelete: (id: string) => void;
  deleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const reviewer = reviewerRole(role);
  const [formEntry, setFormEntry] = useState<PortEntry | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const net = entries.reduce((sum, entry) => sum + (entry.netWeight ?? 0), 0);
  const pending = entries.filter(
    (entry) => entry.verificationStatus !== "Confirmed",
  ).length;
  const visible = entries.filter(
    (entry) =>
      filter === "All" ||
      (filter === "Confirmed"
        ? entry.verificationStatus === "Confirmed"
        : entry.verificationStatus !== "Confirmed"),
  );
  const truckOptions = suppliers.flatMap((supplier) =>
    supplier.truckNumbers.map((truckNumber) => ({ truckNumber, supplier })),
  );
  const openAdd = () =>
    setFormEntry({
      id: "",
      tableId: table.id,
      clientPOId: "",
      supplierPOId: "",
      site: table.site,
      date: table.date,
      material: table.material,
      truckNumber: "",
      billNo: "",
      grnNumber: "",
      supplierId: "",
      customerId: "",
      state: "Both",
      supplierAssignments: [{ supplierId: "", supplierPOId: "", state: "Both" }],
      priceMode: "both",
      grossWeight: null,
      tareWeight: null,
      netWeight: null,
      verificationStatus: "Pending",
    });
  return (
    <div className="space-y-5 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-brand-700"
      >
        ← Back to Port Entry Tables
      </button>
      <DashboardHeader
        title={table.site}
        subtitle={`${dateLong(table.date)}  •  Material: ${table.material}`}
      >
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Icon name="Plus" className="h-4 w-4" /> Add Row
        </button>
      </DashboardHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Summary label="Total Entries" value={entries.length} />
        <Summary label="Total Net Weight" value={`${net.toFixed(2)} Ton`} />
        <Summary label="Pending Confirmation" value={pending} />
        <Summary label="Confirmed" value={entries.length - pending} />
        <Summary
          label="Transport"
          value={entries.filter((entry) => entry.state === "Transport").length}
        />
        <Summary
          label="Material / Both"
          value={`${entries.filter((entry) => entry.state === "Material").length} / ${entries.filter((entry) => entry.state === "Both").length}`}
        />
      </div>
      <Card>
        <CardHeader
          title="Port Entry Table"
          action={
            reviewer ? (
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="form-select min-h-9 w-44 text-xs"
              >
                <option>All</option>
                <option>Pending Confirmation</option>
                <option>Confirmed</option>
              </select>
            ) : undefined
          }
        />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1450px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-semibold">Truck Number</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Gross Weight (Ton)
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  Tare Weight (Ton)
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  Net Weight (Ton)
                </th>
                <th className="px-5 py-3 font-semibold">Bill Number</th>
                <th className="px-5 py-3 font-semibold">GRN Number</th>
                <th className="px-5 py-3 font-semibold">Supplier Name</th>
                {reviewer && (
                  <>
                    <th className="px-5 py-3 font-semibold">Customer Name</th>
                    <th className="px-5 py-3 font-semibold">Client PO</th>
                    <th className="px-5 py-3 font-semibold">Supplier PO</th>
                    <th className="px-5 py-3 font-semibold">Confirmation</th>
                  </>
                )}
                <th className="px-5 py-3 font-semibold">State</th>
                <th className="sticky right-0 z-20 bg-slate-50 px-5 py-3 text-center font-semibold shadow-[-4px_0_8px_rgba(15,23,42,0.06)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visible.map((entry, index) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  suppliers={suppliers}
                  clients={clients}
                  clientPOs={clientPOs}
                  supplierPOs={supplierPOs}
                  truckOptions={truckOptions}
                  reviewer={reviewer}
                  editing={false}
                  onEdit={() => setFormEntry(entry)}
                  onSave={() => undefined}
                  onUpdate={onUpdate}
                  onDelete={() => onDelete(entry.id)}
                  onConfirm={() => setConfirmId(entry.id)}
                  delay={index * 35}
                />
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              No entries match this filter.
            </div>
          )}
        </div>
      </Card>
      {confirmId && (
        <ConfirmDialog
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            onUpdate(confirmId, {
              verificationStatus: "Confirmed",
              verifiedBy: role === "Admin" ? "Admin" : "Office Staff",
            });
            setConfirmId(null);
            showToast("Port entry confirmed successfully");
          }}
        />
      )}
      {deleteId && (
        <DeleteDialog onCancel={onCancelDelete} onConfirm={onConfirmDelete} />
      )}
      {formEntry && (
        <PortEntryForm
          entry={formEntry}
          role={role}
          suppliers={suppliers}
          clients={clients}
          clientPOs={clientPOs}
          supplierPOs={supplierPOs}
          onCancel={() => setFormEntry(null)}
          onSave={(entry) => {
            if (entry.id) {
              onUpdate(entry.id, entry);
            } else {
              addPortEntry(entry);
            }
            setFormEntry(null);
            showToast(entry.id ? "Port entry changes saved successfully" : "Port entry added successfully");
          }}
        />
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function PortEntryForm({
  entry,
  role,
  suppliers,
  clients,
  clientPOs,
  supplierPOs,
  onCancel,
  onSave,
}: {
  entry: PortEntry;
  role: Role;
  suppliers: Supplier[];
  clients: Client[];
  clientPOs: ClientPO[];
  supplierPOs: SupplierPO[];
  onCancel: () => void;
  onSave: (entry: PortEntry) => void;
}) {
  const reviewer = reviewerRole(role);
  const [draft, setDraft] = useState(() => ({
    ...entry,
    supplierAssignments: entry.supplierAssignments.length
      ? entry.supplierAssignments
      : [{ supplierId: entry.supplierId, supplierPOId: entry.supplierPOId, state: entry.state }],
  }));
  const [error, setError] = useState("");
  const truckOptions = [...new Set(suppliers.flatMap((supplier) => supplier.truckNumbers))];
  const clientOptions = clientPOs.filter((po) => po.clientId === draft.customerId);
  const assignments = draft.supplierAssignments;
  const syncAssignments = (nextAssignments: PortEntry["supplierAssignments"], state: PortEntry["state"] = draft.state) => {
    const primary = nextAssignments[0] ?? { supplierId: "", supplierPOId: "", state };
    setError("");
    setDraft((current) => ({ ...current, state, supplierAssignments: nextAssignments, supplierId: primary.supplierId, supplierPOId: primary.supplierPOId }));
  };
  const updateAssignment = (index: number, patch: Partial<PortEntry["supplierAssignments"][number]>) => {
    syncAssignments(assignments.map((assignment, assignmentIndex) => assignmentIndex === index ? { ...assignment, ...patch } : assignment));
  };
  const updateState = (state: PortEntry["state"]) => {
    const nextAssignments = state === "Both"
      ? [{ ...(assignments[0] ?? { supplierId: "", supplierPOId: "" }), state }]
      : [
          { ...(assignments[0] ?? { supplierId: "", supplierPOId: "" }), state },
          { ...(assignments[1] ?? { supplierId: "", supplierPOId: "" }), state },
        ];
    syncAssignments(nextAssignments, state);
  };
  const update = (patch: Partial<PortEntry>) => {
    setError("");
    setDraft((current) => ({ ...current, ...patch }));
  };
  const updateWeight = (field: "grossWeight" | "tareWeight", value: string) => {
    const number = value === "" ? null : Number(value);
    const gross = field === "grossWeight" ? number : draft.grossWeight;
    const tare = field === "tareWeight" ? number : draft.tareWeight;
    update({ [field]: number, netWeight: gross !== null && tare !== null && tare <= gross ? gross - tare : null });
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const invalidWeights = draft.grossWeight !== null && draft.tareWeight !== null && draft.tareWeight > draft.grossWeight;
    if (!draft.truckNumber || assignments.some((assignment) => !assignment.supplierId) || !draft.billNo.trim() || !draft.grnNumber.trim() || draft.grossWeight === null || draft.tareWeight === null || invalidWeights || (reviewer && (!draft.customerId || !draft.clientPOId || assignments.some((assignment) => !assignment.supplierPOId)))) {
      setError(invalidWeights ? "Tare weight cannot be greater than gross weight." : reviewer && (!draft.customerId || !draft.clientPOId || assignments.some((assignment) => !assignment.supplierPOId)) ? "Customer, Client PO and Supplier PO must be selected before saving." : "Truck, supplier, weights, bill number and GRN number are required.");
      return;
    }
    onSave(draft);
  };
  return (
    <Modal title={entry.id ? "Edit Port Entry" : "Add Port Entry"} onClose={onCancel}>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <Field label="Truck Number"><select value={draft.truckNumber} onChange={(event) => update({ truckNumber: event.target.value })} className="form-select"><option value="">Select truck...</option>{truckOptions.map((truckNumber) => <option key={truckNumber} value={truckNumber}>{truckNumber}</option>)}</select></Field>
        <Field label="Entry State"><select value={draft.state} onChange={(event) => updateState(event.target.value as PortEntry["state"])} className="form-select"><option>Transport</option><option>Material</option><option>Both</option></select></Field>
        <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="mb-3 text-sm font-bold text-slate-700">Supplier Assignments</div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{assignments.map((assignment, index) => { const supplierOptions = supplierPOs.filter((po) => po.supplierId === assignment.supplierId); return <div key={index} className="rounded-lg border border-slate-200 bg-white p-3"><div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Supplier {index + 1}</div><Field label="Supplier Name"><select value={assignment.supplierId} onChange={(event) => updateAssignment(index, { supplierId: event.target.value, supplierPOId: "" })} className="form-select"><option value="">Select supplier...</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></Field><div className="mt-3"><Field label="Supplier PO"><select value={assignment.supplierPOId} disabled={!reviewer || !assignment.supplierId} onChange={(event) => updateAssignment(index, { supplierPOId: event.target.value })} className="form-select"><option value="">Select Supplier PO...</option>{supplierOptions.map((po) => <option key={po.id} value={po.id}>{po.poNumber}</option>)}</select></Field></div><div className="mt-3"><Field label="State"><select value={assignment.state} onChange={(event) => updateAssignment(index, { state: event.target.value as PortEntry["state"] })} className="form-select">{STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></Field></div></div>; })}</div></div>
        <Field label="Bill Number"><input value={draft.billNo} onChange={(event) => update({ billNo: event.target.value })} className="form-input" /></Field>
        <Field label="GRN Number"><input value={draft.grnNumber} onChange={(event) => update({ grnNumber: event.target.value })} className="form-input" /></Field>
        <Field label="Gross Weight (Ton)"><input type="number" min="0" step="0.01" value={draft.grossWeight ?? ""} onChange={(event) => updateWeight("grossWeight", event.target.value)} className="form-input" /></Field>
        <Field label="Tare Weight (Ton)"><input type="number" min="0" step="0.01" value={draft.tareWeight ?? ""} onChange={(event) => updateWeight("tareWeight", event.target.value)} className="form-input" /></Field>
        {reviewer && <><Field label="Customer Name"><select value={draft.customerId} onChange={(event) => update({ customerId: event.target.value, clientPOId: "" })} className="form-select"><option value="">Select customer...</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></Field><Field label="Client PO"><select value={draft.clientPOId} disabled={!draft.customerId} onChange={(event) => update({ clientPOId: event.target.value })} className="form-select"><option value="">Select Client PO...</option>{clientOptions.map((po) => <option key={po.id} value={po.id}>{po.poNumber}</option>)}</select></Field></>}
        {error && <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sm:col-span-2"><button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">{entry.id ? "Save Changes" : "Add Entry"}</button></div>
      </form>
    </Modal>
  );
}

function EntryRow({
  entry,
  suppliers,
  clients,
  clientPOs,
  supplierPOs,
  truckOptions,
  reviewer,
  editing,
  onEdit,
  onSave,
  onUpdate,
  onDelete,
  onConfirm,
  delay,
}: {
  entry: PortEntry;
  suppliers: Supplier[];
  clients: Client[];
  clientPOs: ClientPO[];
  supplierPOs: SupplierPO[];
  truckOptions: { truckNumber: string; supplier: Supplier }[];
  reviewer: boolean;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (id: string, patch: Partial<PortEntry>) => void;
  onDelete: () => void;
  onConfirm: () => void;
  delay: number;
}) {
  const [error, setError] = useState("");
  const supplierNames = entry.supplierAssignments
    .map((assignment) => suppliers.find((item) => item.id === assignment.supplierId)?.name)
    .filter(Boolean)
    .join(" / ");
  const supplierPONumbers = entry.supplierAssignments
    .map((assignment) => supplierPOs.find((po) => po.id === assignment.supplierPOId)?.poNumber)
    .filter(Boolean)
    .join(" / ");
  const customer = clients.find((item) => item.id === entry.customerId);
  const clientOptions = clientPOs.filter(
    (po) => po.clientId === entry.customerId,
  );
  const supplierOptions = supplierPOs.filter(
    (po) => !entry.supplierId || po.supplierId === entry.supplierId,
  );
  const invalid =
    entry.grossWeight !== null &&
    entry.tareWeight !== null &&
    entry.tareWeight > entry.grossWeight;
  const update = (patch: Partial<PortEntry>) => {
    setError("");
    onUpdate(entry.id, patch);
  };
  const weight = (field: "grossWeight" | "tareWeight", value: string) => {
    const number = value === "" ? null : Number(value);
    const gross = field === "grossWeight" ? number : entry.grossWeight;
    const tare = field === "tareWeight" ? number : entry.tareWeight;
    update({
      [field]: number,
      netWeight:
        gross !== null && tare !== null && tare <= gross ? gross - tare : null,
    });
  };
  const save = () => {
    if (
      !entry.truckNumber ||
      !entry.supplierId ||
      !entry.billNo.trim() ||
      !entry.grnNumber.trim() ||
      entry.grossWeight === null ||
      entry.tareWeight === null ||
      invalid ||
      (reviewer && (!entry.customerId || !entry.clientPOId))
    ) {
      setError(
        invalid
          ? "Tare weight cannot be greater than gross weight."
          : reviewer && (!entry.customerId || !entry.clientPOId)
            ? "Customer and Client PO must be selected before saving."
            : "Truck, weights, bill number and GRN number are required.",
      );
      return;
    }
    onSave();
    showToast("Port entry changes saved successfully");
  };
  return (
    <tr
      className="align-top transition hover:bg-slate-50/60 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <td className="min-w-48 px-5 py-3">
        {editing ? (
          <select
            value={entry.truckNumber}
            onChange={(event) => {
              const found = truckOptions.find(
                (option) => option.truckNumber === event.target.value,
              );
              update({
                truckNumber: event.target.value,
                supplierId: found?.supplier.id ?? "",
                supplierPOId: "",
              });
            }}
            className="form-select min-h-10 text-xs"
          >
            <option value="">Select truck...</option>
            {truckOptions.map(({ truckNumber }) => (
              <option key={truckNumber} value={truckNumber}>
                {truckNumber}
              </option>
            ))}
          </select>
        ) : (
          entry.truckNumber || "—"
        )}
      </td>
      <td className="min-w-36 px-5 py-3">
        {editing ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={entry.grossWeight ?? ""}
            onChange={(event) => weight("grossWeight", event.target.value)}
            className="form-input min-h-10 text-right text-xs"
          />
        ) : (
          <Weight value={entry.grossWeight} />
        )}
      </td>
      <td className="min-w-36 px-5 py-3">
        {editing ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={entry.tareWeight ?? ""}
            onChange={(event) => weight("tareWeight", event.target.value)}
            className="form-input min-h-10 text-right text-xs"
          />
        ) : (
          <Weight value={entry.tareWeight} />
        )}
      </td>
      <td className="min-w-36 px-5 py-3">
        <div
          className={`rounded-lg px-3 py-2 text-right font-bold ${invalid ? "bg-rose-50 text-rose-700" : "bg-success-50 text-success-700"}`}
        >
          {entry.netWeight === null ? "—" : `${entry.netWeight.toFixed(2)} Ton`}
        </div>
      </td>
      <td className="min-w-36 px-5 py-3">
        {editing ? (
          <input
            value={entry.billNo}
            onChange={(event) => update({ billNo: event.target.value })}
            className="form-input min-h-10 text-xs"
          />
        ) : (
          entry.billNo || "—"
        )}
      </td>
      <td className="min-w-36 px-5 py-3">
        {editing ? (
          <input
            value={entry.grnNumber}
            onChange={(event) => update({ grnNumber: event.target.value })}
            className="form-input min-h-10 text-xs"
          />
        ) : (
          entry.grnNumber || "—"
        )}
      </td>
      <td className="min-w-40 px-5 py-3">
        <div className="rounded-lg border border-dashed border-brand-200 bg-brand-50/50 px-3 py-2 font-semibold text-brand-700">
          {supplierNames || "Select a supplier"}
        </div>
      </td>
      {reviewer && (
        <>
          <td className="min-w-48 px-5 py-3">
            {editing ? (
              <select
                value={entry.customerId}
                onChange={(event) =>
                  update({ customerId: event.target.value, clientPOId: "" })
                }
                className="form-select min-h-10 text-xs"
              >
                <option value="">Select customer...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            ) : (
              customer?.name || "—"
            )}
          </td>
          <td className="min-w-36 px-5 py-3">
            {editing ? (
              <select
                value={entry.clientPOId}
                disabled={!entry.customerId}
                onChange={(event) => update({ clientPOId: event.target.value })}
                className="form-select min-h-10 text-xs"
              >
                <option value="">Select Client PO...</option>
                {clientOptions.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber}
                  </option>
                ))}
              </select>
            ) : (
              clientPOs.find((po) => po.id === entry.clientPOId)?.poNumber ||
              "—"
            )}
          </td>
          <td className="min-w-40 px-5 py-3">
            {editing ? (
              <select
                value={entry.supplierPOId}
                disabled={!entry.supplierId}
                onChange={(event) =>
                  update({ supplierPOId: event.target.value })
                }
                className="form-select min-h-10 text-xs"
              >
                <option value="">Select Supplier PO...</option>
                {supplierOptions.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber}
                  </option>
                ))}
              </select>
            ) : (
              supplierPONumbers || "—"
            )}
          </td>
          <td className="min-w-40 px-5 py-3">
            {entry.verificationStatus === "Confirmed" ? (
              <Badge tone="success">Confirmed</Badge>
            ) : (
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-lg bg-success-50 px-3 py-2 text-xs font-semibold text-success-700"
              >
                Confirm
              </button>
            )}
          </td>
        </>
      )}
      {/* State is the existing Transport/Material/Both classification. */}
      <td className="min-w-36 px-5 py-3">
        {editing ? (
          <select
            value={entry.state}
            onChange={(event) =>
              update({ state: event.target.value as PortEntry["state"] })
            }
            className="form-select min-h-10 text-xs"
          >
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        ) : (
          <Badge
            tone={
              entry.state === "Transport"
                ? "amber"
                : entry.state === "Material"
                  ? "brand"
                  : "success"
            }
          >
            {entry.state}
          </Badge>
        )}
        {error && (
          <p className="mt-1 max-w-48 text-xs text-rose-600">{error}</p>
        )}
      </td>
      <td className="sticky right-0 z-10 bg-white px-5 py-3 text-center shadow-[-4px_0_8px_rgba(15,23,42,0.06)]">
        {editing ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            {reviewer && entry.verificationStatus !== "Confirmed" && (
              <button
                type="button"
                onClick={onConfirm}
                title="Confirm changes"
                className="rounded-lg bg-success-50 px-2 py-2 text-xs font-semibold text-success-700 hover:bg-success-100"
              >
                Confirm
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              title="Edit entry"
              className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
            >
              <Icon name="Pencil" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete entry"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            >
              <Icon name="Trash2" className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function Weight({ value }: { value: number | null }) {
  return (
    <span className="block text-right font-semibold text-slate-600">
      {value === null ? "—" : `${value.toFixed(2)} Ton`}
    </span>
  );
}
function DeleteDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      title="Remove this port entry?"
      description="This only removes the row from the frontend prototype."
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirm="Remove"
    />
  );
}
function ConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      title="Confirm this port entry?"
      description="Please make sure the truck, weight, customer, Client PO and Supplier PO information is correct before confirming."
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirm="Confirm Entry"
    />
  );
}
function Dialog({
  title,
  description,
  onCancel,
  onConfirm,
  confirm,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirm: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-elevated animate-scale-in">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-success-600 px-3 py-2 text-sm font-semibold text-white"
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
function dateText(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function dateLong(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
