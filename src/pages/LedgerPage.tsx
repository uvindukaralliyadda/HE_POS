import { useMemo, useState } from 'react';
import { useApp, formatLKR, supplierLineUnitPrice } from '@/data/appState';
import { Card, CardHeader, Badge } from '@/components/ui';
import { DashboardHeader } from '@/components/Controls';
import { Icon } from '@/components/Icon';

type Filters = { account: string; from: string; to: string };
type LedgerLine = { accountName: string; description?: string; ref: string; date: string; debit: number; credit: number; balance: number; clientRow?: boolean };
const EMPTY_FILTERS: Filters = { account: 'all', from: '', to: '' };

export function LedgerPage() {
  const { clients, clientInvoices, portEntries, suppliers, supplierVouchers } = useApp();
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [error, setError] = useState('');
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const ledger = useMemo<LedgerLine[]>(() => {
    if (invalidRange) return [];
    const selectedInvoices = clientInvoices.filter((invoice) => invoice.paymentStatus === 'Received' && (!filters.account || filters.account === 'all' || invoice.clientId === filters.account) && (!filters.from || invoice.invoiceDate >= filters.from) && (!filters.to || invoice.invoiceDate <= filters.to));
    const paidVouchers = supplierVouchers.filter((voucher) => voucher.paymentStatus === 'Paid' && (!filters.from || voucher.voucherDate >= filters.from) && (!filters.to || voucher.voucherDate <= filters.to));
    const result: Omit<LedgerLine, 'balance'>[] = [];
    const clientIds = [...new Set([...selectedInvoices.map((invoice) => invoice.clientId), ...paidVouchers.flatMap((voucher) => {
      const match = portEntries.find((entry) => entry.verificationStatus === 'Confirmed' && entry.supplierId === voucher.supplierId && entry.date >= voucher.fromDate && entry.date <= voucher.toDate);
      return match?.customerId ?? [];
    })])].filter((clientId) => !filters.account || filters.account === 'all' || clientId === filters.account);
    clientIds.forEach((clientId) => {
      const invoices = selectedInvoices.filter((invoice) => invoice.clientId === clientId);
      const client = clients.find((item) => item.id === clientId);
      const vouchers = paidVouchers.filter((voucher) => portEntries.some((entry) => entry.verificationStatus === 'Confirmed' && entry.customerId === clientId && entry.supplierId === voucher.supplierId && entry.date >= voucher.fromDate && entry.date <= voucher.toDate));
      if (!client) return;
      result.push({ accountName: client.name, ref: invoices.map((invoice) => invoice.id).join(', ') || '—', date: invoices[0]?.invoiceDate ?? vouchers[0]?.voucherDate ?? '', debit: invoices.reduce((total, invoice) => total + invoice.totalAmount, 0), credit: 0, clientRow: true });
      vouchers.sort((a, b) => a.voucherDate.localeCompare(b.voucherDate)).forEach((voucher) => {
        const supplier = suppliers.find((item) => item.id === voucher.supplierId);
        result.push({ accountName: supplier?.name ?? voucher.supplierName, description: `↳ ${supplier?.name ?? voucher.supplierName} expense`, ref: voucher.id, date: voucher.voucherDate, debit: 0, credit: voucher.grandTotal });
      });
    });
    let balance = 0;
    return result.map((line) => { balance += line.debit - line.credit; return { ...line, balance }; });
  }, [clientInvoices, clients, filters, invalidRange, portEntries, supplierVouchers, suppliers]);
  const totals = ledger.reduce((result, line) => ({ debit: result.debit + line.debit, credit: result.credit + line.credit, balance: line.balance }), { debit: 0, credit: 0, balance: 0 });
  const apply = () => { if (draft.from && draft.to && draft.from > draft.to) { setError('Starting Date cannot be later than Ending Date.'); return; } setError(''); setFilters(draft); };
  const clear = () => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setError(''); };
  return <div className="space-y-5"><DashboardHeader title="General Ledger" subtitle="Client accounts with linked supplier expenses" /><Card className="animate-fade-up"><CardHeader title="Ledger Filters" /><div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-[1.4fr_1fr_1fr_auto_auto] sm:items-end"><Field label="Account"><select value={draft.account} onChange={(event) => setDraft({ ...draft, account: event.target.value })} className="form-select min-h-11"><option value="all">All</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></Field><Field label="Starting Date"><input type="date" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} className="form-input min-h-11" /></Field><Field label="Ending Date"><input type="date" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} className="form-input min-h-11" /></Field><button type="button" onClick={apply} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"><Icon name="Search" className="h-4 w-4" /> Apply Filters</button><button type="button" onClick={clear} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Clear Filters</button></div>{(error || invalidRange) && <p className="border-t border-rose-100 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700">{error || 'Starting Date cannot be later than Ending Date.'}</p>}</Card><Card className="animate-fade-up"><CardHeader title="General Ledger" action={<Badge tone="brand">{ledger.length} entries</Badge>} /><div className="overflow-x-auto scrollbar-thin"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-5 py-3 font-semibold">Account Name / Description</th><th className="px-5 py-3 font-semibold">Ref</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 text-right font-semibold">Debit</th><th className="px-5 py-3 text-right font-semibold">Credit</th><th className="px-5 py-3 text-right font-semibold">Balance</th></tr></thead><tbody className="divide-y divide-slate-50">{ledger.map((line) => <tr key={`${line.ref}-${line.date}-${line.accountName}`} className={`${line.clientRow ? 'bg-brand-50/60 font-bold' : 'hover:bg-slate-50/60'} transition`}><td className={`px-5 py-3 ${line.clientRow ? 'text-slate-800' : 'pl-10 text-slate-600'}`}>{line.clientRow ? `${line.accountName} — Client` : line.description || line.accountName}</td><td className="px-5 py-3 text-slate-500">{line.ref}</td><td className="px-5 py-3 text-slate-500">{dateText(line.date)}</td><td className="px-5 py-3 text-right text-slate-700">{line.debit ? formatLKR(line.debit) : '—'}</td><td className="px-5 py-3 text-right text-rose-700">{line.credit ? formatLKR(line.credit) : '—'}</td><td className="px-5 py-3 text-right font-bold text-brand-700">{formatLKR(line.balance)}</td></tr>)}</tbody></table>{ledger.length === 0 && !invalidRange && <div className="px-5 py-12 text-center text-sm text-slate-400">No ledger transactions match the selected filters.</div>}</div><div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-3"><Summary label="Total Debit" value={totals.debit} /><Summary label="Total Credit" value={totals.credit} /><Summary label="Closing Balance" value={totals.balance} emphasized /></div></Card></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
function Summary({ label, value, emphasized = false }: { label: string; value: number; emphasized?: boolean }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><div className="text-xs font-medium text-slate-500">{label}</div><div className={`mt-1 text-lg font-bold ${emphasized ? 'text-brand-700' : 'text-slate-800'}`}>{formatLKR(value)}</div></div>; }
function dateText(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }