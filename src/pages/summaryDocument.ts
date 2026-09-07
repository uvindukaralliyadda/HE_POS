import type { ClientInvoice, CompanyInfo, PerformaInvoice, PortEntry } from '@/data/appState';

type SummaryInvoice = Pick<ClientInvoice | PerformaInvoice, 'id' | 'clientName' | 'site' | 'invoiceDate' | 'companyInfo'> & {
  clientInfo?: ClientInvoice['clientInfo'];
  fromDate?: string;
  toDate?: string;
  portEntryIds?: string[];
};

const dateText = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const totalDateText = (value: string) => value ? `${new Date(`${value}T00:00:00`).toLocaleDateString('en-GB')}-Total` : '—-Total';
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const numberText = (value: number | null | undefined) => value === null || value === undefined ? '—' : value.toFixed(3);

export function renderSummarySheetHtml(invoice: SummaryInvoice, invoiceType: 'Performa Invoice' | 'Tax Invoice', entries: PortEntry[], autoPrint = true): string {
  const company: CompanyInfo = invoice.companyInfo ?? { name: 'Harith Engineering & Company (Pvt) Ltd', tin: '', vatNumber: '', ssclNumber: '', stampDRN: '', address: '', telephone: '' };
  const scopeEntries = entries
    .filter((entry) => invoice.portEntryIds?.includes(entry.id) && entry.verificationStatus === 'Confirmed' && entry.verifiedBy === 'Office Staff')
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const grouped = scopeEntries.reduce<Map<string, PortEntry[]>>((groups, entry) => {
    const dateEntries = groups.get(entry.date) ?? [];
    dateEntries.push(entry);
    groups.set(entry.date, dateEntries);
    return groups;
  }, new Map());
  let totalNetTon = 0;
  const rows = [...grouped.entries()].map(([date, dateEntries]) => {
    const entryRows = dateEntries.map((entry) => {
      const netTon = entry.netWeight;
      const netKg = netTon === null ? null : netTon * 1000;
      if (netTon !== null) totalNetTon += netTon;
      return `<tr><td>${dateText(entry.date)}</td><td>${escapeHtml(entry.material)}</td><td>${escapeHtml(entry.billNo || '—')}</td><td>${escapeHtml(entry.truckNumber || '—')}</td><td>${escapeHtml(entry.grnNumber || '—')}</td><td>${numberText(entry.grossWeight)}</td><td>${numberText(entry.tareWeight)}</td><td>—</td><td>${numberText(netKg)}</td><td>${numberText(netTon)}</td></tr>`;
    }).join('');
    const dateTotal = dateEntries.reduce((sum, entry) => sum + (entry.netWeight ?? 0), 0);
    return `${entryRows}<tr class="daily-total"><td>${totalDateText(date)}</td><td colspan="8"></td><td>${dateTotal.toFixed(3)}</td></tr>`;
  }).join('');
  const printScript = autoPrint ? '<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>' : '';
  return `<html><head><title>Summary Sheet ${escapeHtml(invoice.id)}</title><style>@page{size:A4 portrait;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;font-size:10px}h1{margin:0 0 18px;font-size:24px}h2{font-size:14px;margin:24px 0 8px}.header{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;border-bottom:2px solid #172033;padding-bottom:14px}.label{color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:.04em}.value{font-size:11px;font-weight:600;margin-top:2px}table{width:100%;border-collapse:collapse;margin-top:18px;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid}th,td{border:1px solid #cbd5e1;padding:6px 5px;text-align:left;vertical-align:top;word-break:break-word}th{background:#e2e8f0;font-size:9px}td:nth-child(n+6),th:nth-child(n+6){text-align:right}.daily-total{font-weight:700;background:#f8fafc}.daily-total td{text-align:right}.daily-total td:first-child{text-align:left}.total{display:flex;justify-content:flex-end;gap:28px;margin-top:18px;padding-top:10px;border-top:2px solid #172033;font-size:13px;font-weight:700}.empty{text-align:center;color:#64748b;padding:18px}.footer{margin-top:28px;color:#64748b;font-size:9px}@media screen{body{max-width:210mm;margin:0 auto;padding:24px;background:white}}@media print{.footer{display:none}}</style></head><body><h1>Summary Sheet</h1><div class="header"><div><div class="label">Invoice Number</div><div class="value">${escapeHtml(invoice.id)}</div></div><div><div class="label">Invoice Type</div><div class="value">${invoiceType}</div></div><div><div class="label">Client Name</div><div class="value">${escapeHtml(invoice.clientInfo?.name ?? invoice.clientName)}</div></div><div><div class="label">Site / Project</div><div class="value">${escapeHtml(invoice.site || '—')}</div></div><div><div class="label">Invoice Date</div><div class="value">${dateText(invoice.invoiceDate)}</div></div><div><div class="label">Date Range</div><div class="value">${dateText(invoice.fromDate ?? invoice.invoiceDate)} to ${dateText(invoice.toDate ?? invoice.invoiceDate)}</div></div></div><h2>${escapeHtml(company.name)}</h2><table><thead><tr><th>Date</th><th>Description</th><th>Bill Number</th><th>Truck Number</th><th>GRN Number</th><th>Gross weight (Ton)</th><th>Tare Weight (Ton)</th><th>Deduction</th><th>NET Kg</th><th>Net TON</th></tr></thead><tbody>${rows || '<tr><td colspan="10" class="empty">No Office Staff validated Port Entries are associated with this invoice.</td></tr>'}</tbody></table><div class="total"><span>Total Net TON:</span><span>${totalNetTon.toFixed(3)}</span></div><div class="footer">Generated from the saved Port Entries associated with this invoice. This document does not modify invoice or Port Entry data.</div>${printScript}</body></html>`;
}