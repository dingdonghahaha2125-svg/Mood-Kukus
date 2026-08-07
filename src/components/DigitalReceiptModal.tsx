import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRp, formatDate } from '../utils/calculations';
import { Printer, Copy, Check, X, UtensilsCrossed } from 'lucide-react';

interface DigitalReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopyText = () => {
    const textLines = [
      `================================`,
      `      MOOD KUKUS MAMUJU `,
      ` Kuliner Kukusan Sehat Per-Item Mamuju`,
      `================================`,
      `No. Struk  : ${transaction.id}`,
      `Tanggal    : ${formatDate(transaction.date)}`,
      `Pelanggan  : ${transaction.customerName || 'Walk-in'}`,
      `Pembayaran : ${transaction.paymentMethod.toUpperCase()}`,
      `--------------------------------`,
      ...transaction.items.map(
        (it) =>
          `${it.quantity}x ${it.menuName}\n  (${it.sauceName || 'Saus Standar'}) - ${formatRp(
            (it.pricePerUnit + it.extraPrice) * it.quantity
          )}`
      ),
      `--------------------------------`,
      `TOTAL PEMBAYARAN : ${formatRp(transaction.totalAmount)}`,
      `================================`,
      `Terima kasih telah memesan di`,
      `        MOOD KUKUS MAMUJU! `,
      `================================`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-stone-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Struk Card */}
        <div id="printable-receipt" className="bg-stone-950 border border-stone-800 rounded-xl p-5 space-y-4 text-xs font-mono text-stone-200">
          <div className="text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm tracking-wide text-stone-100 uppercase">Mood Kukus Mamuju</h3>
            <p className="text-[10px] text-stone-400">Jualan Per-Item Makanan Kukusan Sehat Mamuju</p>
            <div className="text-[10px] text-stone-500 border-b border-dashed border-stone-800 pb-2">
              Struk Penjualan #{transaction.id}
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-400">Tanggal:</span>
              <span>{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Pelanggan:</span>
              <span>{transaction.customerName || 'Walk-in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Pembayaran:</span>
              <span className="uppercase font-bold text-emerald-400">{transaction.paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-stone-800 py-2 space-y-2">
            {transaction.items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>
                    {it.quantity}x {it.menuName}
                  </span>
                  <span>{formatRp((it.pricePerUnit + it.extraPrice) * it.quantity)}</span>
                </div>
                <div className="text-[10px] text-stone-400 pl-3">
                  + {it.sauceName || 'Saus Standar'} ({it.packagingType || 'Paper Box'})
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-sm pt-1">
            <div className="flex justify-between font-bold text-emerald-400 text-base">
              <span>TOTAL:</span>
              <span>{formatRp(transaction.totalAmount)}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-500 pt-2 border-t border-dashed border-stone-800">
            Terima kasih! Camilan Sehat & Eco-Friendly.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Struk Text'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};
