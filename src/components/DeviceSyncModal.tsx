import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Smartphone, RefreshCw, Download, Info, CheckCircle2, Share2, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { StockItem, MenuItem, SauceItem, Expense, Transaction, DailyReport } from '../types';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  menuItems: MenuItem[];
  sauces: SauceItem[];
  expenses: Expense[];
  transactions: Transaction[];
  dailyReports: DailyReport[];
  onImportData: (data: {
    stockItems?: StockItem[];
    menuItems?: MenuItem[];
    sauces?: SauceItem[];
    expenses?: Expense[];
    transactions?: Transaction[];
    dailyReports?: DailyReport[];
  }) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  menuItems,
  sauces,
  expenses,
  transactions,
  dailyReports,
  onImportData,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedPartner, setCopiedPartner] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Public shared application URL for business partners
  const sharedAppUrl = 'https://ais-pre-3alefjxescgudgbjlrcrij-15418315132.asia-east1.run.app';

  // Current page URL for sync
  const currentUrl = window.location.origin + window.location.pathname;

  // Build current JSON payload
  const currentPayload = {
    stockItems,
    menuItems,
    sauces,
    expenses,
    transactions,
    dailyReports,
    syncedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(currentPayload);

  let syncLink = currentUrl;
  try {
    const encoded = btoa(encodeURIComponent(jsonString));
    syncLink = `${currentUrl}?syncData=${encoded}`;
  } catch (e) {
    syncLink = currentUrl;
  }

  // Generate QR Code on client-side reliably
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(syncLink, { margin: 1, width: 220 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Error generating QR code', err);
        // Fallback to simple QR code URL if needed
        setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(syncLink)}`);
      });
  }, [isOpen, syncLink]);

  if (!isOpen) return null;

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySyncLink = () => {
    navigator.clipboard.writeText(syncLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPartnerLink = () => {
    navigator.clipboard.writeText(sharedAppUrl);
    setCopiedPartner(true);
    setTimeout(() => setCopiedPartner(false), 2000);
  };

  const handlePerformImport = () => {
    if (!importInput.trim()) {
      setSyncStatus('Mohon masukkan atau tempelkan Kode Sync JSON terlebih dahulu.');
      return;
    }

    try {
      let parsedData;
      if (importInput.includes('syncData=')) {
        const urlParams = new URLSearchParams(importInput.substring(importInput.indexOf('?')));
        const rawParam = urlParams.get('syncData');
        if (rawParam) {
          parsedData = JSON.parse(decodeURIComponent(atob(rawParam)));
        }
      } else {
        parsedData = JSON.parse(importInput.trim());
      }

      if (parsedData && typeof parsedData === 'object') {
        onImportData(parsedData);
        setSyncStatus('✅ Berhasil menyinkronkan data dari Laptop/HP! Data kini sudah sama.');
        setImportInput('');
        setTimeout(() => {
          setSyncStatus(null);
          onClose();
        }, 1500);
      } else {
        setSyncStatus('❌ Format kode sync tidak valid.');
      }
    } catch (err) {
      setSyncStatus('❌ Terjadi kesalahan saat membaca kode sync. Pastikan teks disalin lengkap.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 text-stone-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-100 flex items-center gap-2">
                Akses Perangkat HP & Rekan Bisnis
              </h3>
              <p className="text-xs text-stone-400">
                Buka aplikasi di HP Anda atau bagikan link ke rekan bisnis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-lg font-bold p-1 rounded-lg hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Kirim Aplikasi ke Rekan Bisnis */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              1. Kirim Aplikasi ke Rekan Bisnis (Bisa Dibuka di HP Siapapun)
            </span>
            <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700">
              Link Publik
            </span>
          </div>

          <p className="text-xs text-stone-300">
            Cukup kirimkan link di bawah ini melalui WhatsApp/Telegram ke rekan bisnis Anda. Rekan Anda bisa langsung membuka aplikasi ini di browser HP (Chrome/Safari) tanpa perlu install apapun.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 truncate">
              {sharedAppUrl}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyPartnerLink}
                className="flex-1 sm:flex-none whitespace-nowrap py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedPartner ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPartner ? 'Link Disalin!' : 'Salin Link WA'}</span>
              </button>
              <a
                href={sharedAppUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                title="Buka di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Explanation Alert */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">2. Pindah Data Stok & Penjualan Hari Ini dari Laptop ke HP</p>
            <p className="text-amber-300/90 text-[11px] mt-0.5">
              Gunakan <strong>Scan QR Code</strong> atau <strong>Salin Kode Sync</strong> di bawah untuk memindahkan isi stok dan penjualan dari laptop ke HP Anda.
            </p>
          </div>
        </div>

        {/* Method 1: Scan QR Code with Mobile Phone */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <QrCode className="w-4 h-4" /> Scan QR Code dengan HP Anda
            </span>
            <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">
              Generated Real-Time
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-900 p-3 rounded-lg border border-stone-850">
            <div className="bg-white p-2 rounded-xl border border-stone-300 shrink-0 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Sync Data Laptop to HP"
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-stone-600 text-xs font-medium">
                  Memuat Barcode...
                </div>
              )}
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-stone-300 font-medium">
                1. Buka kamera HP Anda, lalu <strong>Arahkan & Scan QR Code</strong> ini.
              </p>
              <p className="text-stone-400 text-[11px]">
                2. Buka link hasil scan di browser HP Anda. Semua data stok, harga menu, dan penjualan hari ini akan langsung tersimpan di HP.
              </p>
              <button
                type="button"
                onClick={handleCopySyncLink}
                className="w-full py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Sync Disalin!' : 'Salin Link Sync Manual'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Method 2: Copy & Paste Sync Code */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3 text-xs">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" /> Salin & Tempel Kode Sync Manual
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export Action */}
            <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 space-y-2">
              <span className="font-bold text-stone-200 block text-[11px]">📤 Kirim Data dari Perangkat Ini:</span>
              <p className="text-[10px] text-stone-400">
                Klik tombol di bawah untuk menyalin seluruh data stok & penjualan perangkat ini.
              </p>
              <button
                type="button"
                onClick={handleCopySyncCode}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kode Sync Disalin!' : 'Salin Kode Sync'}</span>
              </button>
            </div>

            {/* Import Action */}
            <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 space-y-2">
              <span className="font-bold text-stone-200 block text-[11px]">📥 Terima Data di Perangkat Ini:</span>
              <input
                type="text"
                placeholder="Tempelkan Kode Sync di sini..."
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handlePerformImport}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Terapkan Sync Data</span>
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-center font-bold text-amber-300">
              {syncStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-stone-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

