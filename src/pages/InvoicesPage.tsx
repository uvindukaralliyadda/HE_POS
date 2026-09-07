import { useMemo, useState } from 'react';
import { useApp, formatLKR, type ClientPO, type PortEntry } from '@/data/appState';
import { Card, CardHeader, Badge } from '@/components/ui';
import { DashboardHeader } from '@/components/Controls';
import { Icon } from '@/components/Icon';
import { PrintedInvoicesTab } from './PrintedInvoicesTab';
import { renderTaxInvoiceHtml } from './invoiceDocument';
import { PerformaInvoicesTab } from './PerformaInvoicesTab';
import { showToast } from '@/components/Toast';

type InvoiceRow = PortEntry & { clientPO?: ClientPO; unitPrice: number; amount: number };

export function InvoicesPage() {
  const { clients, clientPOs, portEntries, materials, tax, companyInfo, addClientInvoice, addPerformaInvoice } = useApp();
  const [tab, setTab] = useState<'calculate' | 'performa' | 'tax'>('calculate');
  const [clientId, setClientId] = useState('');
  const [site, setSite] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [ssclEnabled, setSsclEnabled] = useState(true);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const sites = [...new Set(clientPOs.filter((po) => !clientId || po.clientId === clientId).map((po) => po.site))];
  const materialNames = [...new Set(materials.map((material) => material.name))];
  const allMaterialsSelected = selectedMaterials.length === 0 || selectedMaterials.length === materialNames.length;
  const selectedClient = clients.find((client) => client.id === clientId);
  const rows = useMemo<InvoiceRow[]>(() => portEntries.filter((entry) => entry.verificationStatus === 'Confirmed' && (!clientId || entry.clientId === clientId) && (!site || entry.site === site) && (!selectedMaterials.length || selectedMaterials.includes(entry.material)) && (!fromDate || entry.date >= fromDate) && (!toDate || entry.date <= toDate)).map((entry) => {
    const clientPO = clientPOs.filter((po) => po.clientId === entry.clientId && po.site === entry.site && po.date <= entry.date && po.items.some((item) => item.description === entry.material)).sort((a, b) => b.date.localeCompare(a.date))[0] ?? clientPOs.find((po) => po.id === entry.clientPOId);
    const unitPrice = clientPO?.items.find((item) => item.description === entry.material)?.unitPrice ?? 0;
    return { ...entry, clientPO, unitPrice, amount: unitPrice * (entry.netWeight ?? 0) };
  }), [clientId, clientPOs, fromDate, portEntries, selectedMaterials, site, toDate]);
  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);
    const sscl = ssclEnabled ? subtotal * tax.ssclPercent / 100 : 0;
    const totalAfterSscl = subtotal + sscl;
    const vat = vatEnabled ? totalAfterSscl * tax.vatPercent / 100 : 0;
    return { subtotal, sscl, totalAfterSscl, vat, total: totalAfterSscl + vat };
  }, [rows, ssclEnabled, tax, vatEnabled]);
  const generateInvoice = () => {
    const invoiceDate = new Date().toISOString().slice(0, 10);
    const invoiceId = addClientInvoice({
      clientId, clientName: selectedClient?.name ?? 'All clients', site: site || 'All sites', invoiceDate, fromDate, toDate,
      subtotal: totals.subtotal, ssclEnabled, sscl: totals.sscl, vatEnabled, vat: totals.vat, totalAmount: totals.total,
      paymentStatus: 'Pending', ssclPercent: tax.ssclPercent, vatPercent: tax.vatPercent,
      portEntryIds: rows.map((row) => row.id),
      lineItems: rows.map((row) => ({ reference: row.billNo || row.id, material: row.material, quantity: row.netWeight ?? 0, unitPrice: row.unitPrice, amount: row.amount })),
      companyInfo, clientInfo: selectedClient, additionalInformation, paymentMode,
    });
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) return;
    popup.document.write(renderTaxInvoiceHtml({ id: invoiceId, clientId, clientName: selectedClient?.name ?? 'All clients', site: site || 'All sites', invoiceDate, fromDate, toDate, subtotal: totals.subtotal, ssclEnabled, sscl: totals.sscl, vatEnabled, vat: totals.vat, totalAmount: totals.total, paymentStatus: 'Pending', ssclPercent: tax.ssclPercent, vatPercent: tax.vatPercent, lineItems: rows.map((row) => ({ reference: row.billNo || row.id, material: row.material, quantity: row.netWeight ?? 0, unitPrice: row.unitPrice, amount: row.amount })), companyInfo, clientInfo: selectedClient, additionalInformation, paymentMode }));
    popup.document.close();
  };
  const generatePerforma = () => {
    const performaId = addPerformaInvoice({
      clientId, clientName: selectedClient?.name ?? 'All clients', clientInfo: selectedClient, site: site || 'All sites', invoiceDate: new Date().toISOString().slice(0, 10), fromDate, toDate, additionalInformation,
      lineItems: rows.map((row) => ({ reference: row.billNo || row.id, material: row.material, unit: materials.find((material) => material.name === row.material)?.unit === 'Cube' ? 'Cube' : 'Ton', quantity: row.netWeight ?? 0, unitPrice: row.unitPrice, amount: row.amount })),
      subtotal: totals.subtotal, ssclEnabled, ssclPercent: tax.ssclPercent, sscl: totals.sscl, vatEnabled, vatPercent: tax.vatPercent, vat: totals.vat, totalAmount: totals.total, companyInfo, paymentMode, sourceCalculateReference: `${clientId}:${site}:${fromDate}:${toDate}`, conversionStatus: 'Open',
      portEntryIds: rows.map((row) => row.id),
    });
    showToast(`${performaId} created successfully`);
  };
  const toggleMaterial = (name: string) => {
    setSelectedMaterials((current) => {
      const currentIsAll = current.length === 0 || current.length === materialNames.length;
      if (currentIsAll) return materialNames.filter((materialName) => materialName !== name);
      return current.includes(name) ? current.filter((materialName) => materialName !== name) : [...current, name];
    });
  };
  const toggleAllMaterials = () => setSelectedMaterials(allMaterialsSelected ? materialNames : []);
  const clear = () => { setClientId(''); setSite(''); setSelectedMaterials([]); setFromDate(''); setToDate(''); };
  return <div className="space-y-5">
    <DashboardHeader title="Invoices" subtitle="Generate and print client invoices from confirmed transactions" />
    <div className="flex w-fit gap-1 rounded-lg border border-slate-200 bg-white p-1"><TabButton active={tab === 'calculate'} onClick={() => setTab('calculate')}>Calculate Invoice</TabButton><TabButton active={tab === 'performa'} onClick={() => setTab('performa')}>Performa Invoices</TabButton><TabButton active={tab === 'tax'} onClick={() => setTab('tax')}>Tax Invoices</TabButton></div>
    {tab === 'tax' ? <PrintedInvoicesTab /> : tab === 'performa' ? <PerformaInvoicesTab /> : <>
      <Card className="relative z-30 animate-fade-up"><CardHeader title="Invoice Filters" action={<div className="flex flex-wrap gap-2"><button type="button" onClick={generatePerforma} className="flex min-h-10 items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700"><Icon name="FileText" className="h-4 w-4" /> Generate Performa Invoice</button><button type="button" onClick={generateInvoice} className="flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white"><Icon name="Printer" className="h-4 w-4" /> Generate Tax Invoice</button></div>} /><div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_1.3fr_auto] lg:items-end"><Field label="Client"><select value={clientId} onChange={(event) => { setClientId(event.target.value); setSite(''); }} className="form-select min-h-11"><option value="">Select client...</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></Field><Field label="Site"><select value={site} onChange={(event) => setSite(event.target.value)} className="form-select min-h-11" disabled={!clientId}><option value="">All sites</option>{sites.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field><Field label="From Date"><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="form-input min-h-11" /></Field><Field label="To Date"><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="form-input min-h-11" /></Field><Field label="Materials"><details className="group relative"><summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-2 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:border-slate-300"><span className="truncate">{materialFilterLabel(selectedMaterials, materialNames)}</span><Icon name="ChevronDown" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary><div className="absolute left-0 right-0 z-50 mt-1 max-h-64 min-w-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-elevated animate-fade-in"><label className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm font-semibold hover:bg-slate-50"><input type="checkbox" checked={allMaterialsSelected} onChange={toggleAllMaterials} /> <span>All</span></label>{materialNames.map((name) => <label key={name} className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-50"><input type="checkbox" checked={allMaterialsSelected || selectedMaterials.includes(name)} onChange={() => toggleMaterial(name)} /> <span className="truncate">{name}</span></label>)}<button type="button" onClick={() => setSelectedMaterials([])} className="mt-1 w-full rounded px-2 py-2 text-left text-xs font-semibold text-slate-500 hover:bg-slate-50">Clear</button></div></details></Field><button type="button" onClick={clear} className="min-h-11 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600">Clear Filters</button></div><div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-5 sm:grid-cols-2"><Field label="Additional Key Information"><textarea value={additionalInformation} onChange={(event) => setAdditionalInformation(event.target.value)} rows={2} className="form-input resize-none" /></Field><Field label="Mode of Payment"><select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)} className="form-select"><option>Cash</option><option>Bank Transfer</option><option>Cheque</option><option>Other</option></select></Field></div></Card>
      <Card className="animate-fade-up"><CardHeader title="Invoice Transactions" action={<Badge tone="brand">{rows.length} lines</Badge>} /><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">QTY</th><th className="px-4 py-3 text-right">Unit Price</th><th className="px-4 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-50">{rows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-semibold">{row.billNo || row.id}</td><td className="px-4 py-3">{row.material}</td><td className="px-4 py-3 text-right">{(row.netWeight ?? 0).toFixed(2)}</td><td className="px-4 py-3 text-right">{formatLKR(row.unitPrice)}</td><td className="px-4 py-3 text-right font-semibold">{formatLKR(row.amount)}</td></tr>)}</tbody></table></div><div className="border-t border-slate-100 p-5"><div className="ml-auto max-w-sm space-y-2 text-sm"><Total label="Subtotal" value={totals.subtotal} /><label className="flex justify-between"><span><input type="checkbox" checked={ssclEnabled} onChange={(event) => setSsclEnabled(event.target.checked)} /> Add SSCL ({tax.ssclPercent}%)</span><span>{formatLKR(totals.sscl)}</span></label><Total label="Total After SSCL" value={totals.totalAfterSscl} /><label className="flex justify-between"><span><input type="checkbox" checked={vatEnabled} onChange={(event) => setVatEnabled(event.target.checked)} /> Add VAT ({tax.vatPercent}%)</span><span>{formatLKR(totals.vat)}</span></label><Total label="Total Amount" value={totals.total} /></div></div></Card>
    </>}
  </div>;
}
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`rounded-md px-4 py-2 text-sm font-semibold ${active ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{children}</button>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
function Total({ label, value }: { label: string; value: number }) { return <div className="flex justify-between"><span>{label}</span><span className="font-semibold">{formatLKR(value)}</span></div>; }
function materialFilterLabel(selected: string[], allMaterials: string[]) { if (!selected.length || selected.length === allMaterials.length) return 'All Materials'; if (selected.length <= 2) return selected.join(', '); return `${selected.slice(0, 2).join(', ')} +${selected.length - 2}`; }
