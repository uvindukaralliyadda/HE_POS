import { Modal } from '@/components/ui';
import type { ClientInvoice, PerformaInvoice, PortEntry } from '@/data/appState';
import { renderSummarySheetHtml } from './summaryDocument';

type SummaryInvoice = ClientInvoice | PerformaInvoice;

export function SummarySheetPreview({ invoice, invoiceType, portEntries, onClose }: { invoice: SummaryInvoice; invoiceType: 'Performa Invoice' | 'Tax Invoice'; portEntries: PortEntry[]; onClose: () => void }) {
  const print = () => {
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) return;
    popup.document.write(renderSummarySheetHtml(invoice, invoiceType, portEntries));
    popup.document.close();
  };
  return <Modal title={`Summary Sheet ${invoice.id}`} onClose={onClose} className="max-w-6xl"><div className="flex h-[78vh] flex-col"><iframe title={`Summary Sheet ${invoice.id}`} srcDoc={renderSummarySheetHtml(invoice, invoiceType, portEntries, false)} className="min-h-0 flex-1 border-0 bg-slate-100" /><div className="flex justify-end gap-2 border-t border-slate-100 p-4"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Close</button><button type="button" onClick={print} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Print</button></div></div></Modal>;
}