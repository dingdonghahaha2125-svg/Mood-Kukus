import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Utensils,
  Droplet,
  Package,
  CreditCard,
  User,
  AlertCircle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MenuItem, SauceItem, StockItem, Transaction, SaleTransactionItem } from '../types';
import { calculateMenuItemHpp, formatRp } from '../utils/calculations';

interface PosCashierProps {
  menuItems: MenuItem[];
  sauces: SauceItem[];
  stockItems: StockItem[];
  onProcessSale: (transaction: Transaction) => void;
  onOpenReceipt: (transaction: Transaction) => void;
  onOpenMenuEditor?: () => void;
}

export const PosCashier: React.FC<PosCashierProps> = ({
  menuItems,
  sauces,
  stockItems,
  onProcessSale,
  onOpenReceipt,
  onOpenMenuEditor,
}) => {
  const [cart, setCart] = useState<{
    menuItem: MenuItem;
    quantity: number;
    selectedSauceId?: string;
    packagingType?: string;
  }[]>([]);

  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash' | 'transfer'>('qris');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredMenuItems = menuItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((c) => c.menuItem.id === item.id);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...prevCart,
        {
          menuItem: item,
          quantity: 1,
          selectedSauceId: item.defaultSauceId || sauces[0]?.id,
          packagingType: item.category === 'paket' ? 'Besek Bambu' : 'Paper Box Eco',
        },
      ];
    });
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      const updated = [...cart];
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const handleSelectSauce = (index: number, sauceId: string) => {
    const updated = [...cart];
    updated[index].selectedSauceId = sauceId;
    setCart(updated);
  };

  const handleSelectPackaging = (index: number, pkg: string) => {
    const updated = [...cart];
    updated[index].packagingType = pkg;
    setCart(updated);
  };

  // Calculate Cart Totals
  let totalAmount = 0;
  let totalHpp = 0;

  cart.forEach((cartItem) => {
    const sauce = sauces.find((s) => s.id === cartItem.selectedSauceId);
    const extraPrice = sauce ? sauce.extraPrice : 0;
    const pricePerUnit = cartItem.menuItem.price + extraPrice;

    const itemHpp = calculateMenuItemHpp(
      cartItem.menuItem,
      cartItem.selectedSauceId,
      sauces,
      stockItems
    );

    totalAmount += pricePerUnit * cartItem.quantity;
    totalHpp += itemHpp * cartItem.quantity;
  });

  const netProfit = totalAmount - totalHpp;

  // Verify if stock is available for the order
  const checkStockAvailability = (): { isAvailable: boolean; missingItemName?: string } => {
    const requiredStockMap = new Map<string, number>();

    cart.forEach((cartItem) => {
      // Menu ingredients
      cartItem.menuItem.ingredients.forEach((ing) => {
        const current = requiredStockMap.get(ing.stockItemId) || 0;
        requiredStockMap.set(ing.stockItemId, current + ing.amount * cartItem.quantity);
      });

      // Sauce ingredients
      if (cartItem.selectedSauceId) {
        const sauce = sauces.find((s) => s.id === cartItem.selectedSauceId);
        if (sauce) {
          sauce.ingredients.forEach((ing) => {
            const current = requiredStockMap.get(ing.stockItemId) || 0;
            requiredStockMap.set(ing.stockItemId, current + ing.amount * cartItem.quantity);
          });
        }
      }
    });

    for (const [stockId, requiredAmt] of requiredStockMap.entries()) {
      const stockItem = stockItems.find((s) => s.id === stockId);
      if (!stockItem || stockItem.currentStock < requiredAmt) {
        return { isAvailable: false, missingItemName: stockItem?.name || stockId };
      }
    }

    return { isAvailable: true };
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const stockCheck = checkStockAvailability();
    if (!stockCheck.isAvailable) {
      alert(`Stok tidak mencukupi untuk item: ${stockCheck.missingItemName}. Silakan kurangi porsi atau lakukan Restock terlebih dahulu.`);
      return;
    }

    // Build Transaction Object
    const transactionItems: SaleTransactionItem[] = cart.map((cartItem) => {
      const sauce = sauces.find((s) => s.id === cartItem.selectedSauceId);
      const extraPrice = sauce ? sauce.extraPrice : 0;
      const hpp = calculateMenuItemHpp(cartItem.menuItem, cartItem.selectedSauceId, sauces, stockItems);

      return {
        menuItemId: cartItem.menuItem.id,
        menuName: cartItem.menuItem.name,
        quantity: cartItem.quantity,
        pricePerUnit: cartItem.menuItem.price,
        sauceId: sauce?.id,
        sauceName: sauce?.name,
        extraPrice,
        packagingType: cartItem.packagingType,
        calculatedHppPerUnit: hpp,
      };
    });

    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString(),
      items: transactionItems,
      totalAmount,
      totalHpp,
      netProfit,
      paymentMethod,
      customerName: customerName || 'Pelanggan Kasir',
      notes,
    };

    // Process sale (deduct stock, record transaction)
    onProcessSale(newTransaction);

    // Trigger confetti effect
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    // Open Digital Receipt
    onOpenReceipt(newTransaction);

    // Reset Cart
    setCart([]);
    setCustomerName('');
    setNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Catalog Section (2 Cols) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header & Category Pills */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                Katalog Kasir & Produk Jualan
              </h2>
              <p className="text-xs text-stone-400">
                Pilih makanan kukusan, air botol mineral, atau wadah packing
              </p>
            </div>

            {onOpenMenuEditor && (
              <button
                onClick={onOpenMenuEditor}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>✏️ Edit Harga & Tambah Menu</span>
              </button>
            )}
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Semua Produk' },
              { id: 'satuan', label: '🍌 Kukusan Satuan' },
              { id: 'paket', label: '📦 Paket Combo Besek' },
              { id: 'minuman', label: '🥤 Air Botol Mineral' },
              { id: 'kemasan', label: '🍱 Wadah Packing' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMenuItems.map((item) => {
            const hpp = calculateMenuItemHpp(item, item.defaultSauceId, sauces, stockItems);
            const profitPerItem = item.price - hpp;
            const marginPct = item.price > 0 ? Math.round((profitPerItem / item.price) * 100) : 0;

            const getBadge = () => {
              if (item.category === 'satuan') return '🍌 Kukusan Satuan';
              if (item.category === 'paket') return '📦 Paket Besek';
              if (item.category === 'minuman') return '🥤 Air Mineral';
              return '🍱 Wadah Packing';
            };

            return (
              <div
                key={item.id}
                className="bg-stone-900 border border-stone-800 hover:border-emerald-600/60 rounded-2xl p-4 space-y-3 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                      {getBadge()}
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-md">
                      Untung: +{formatRp(profitPerItem)}/unit ({marginPct}%)
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-100 text-sm sm:text-base leading-snug">{item.name}</h3>
                  <p className="text-xs text-stone-400 line-clamp-2">{item.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Modal (HPP):</span>
                      <div className="text-stone-400 font-medium">{formatRp(hpp)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Harga Jual:</span>
                      <div className="font-bold text-emerald-400 text-base">{formatRp(item.price)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-950/30"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Panel (1 Col) */}
      <div className="space-y-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl sticky top-24">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              Keranjang Pesanan ({cart.reduce((s, c) => s + c.quantity, 0)})
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-stone-500">
              <ShoppingCart className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-xs">Keranjang masih kosong.</p>
              <p className="text-[10px]">Klik menu di sebelah kiri untuk mulai transaksi.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {cart.map((cartItem, idx) => {
                const sauce = sauces.find((s) => s.id === cartItem.selectedSauceId);
                const extraPrice = sauce ? sauce.extraPrice : 0;
                const unitPrice = cartItem.menuItem.price + extraPrice;

                return (
                  <div
                    key={cartItem.menuItem.id + idx}
                    className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-stone-100 text-xs">{cartItem.menuItem.name}</div>
                      <button
                        onClick={() => handleUpdateQty(idx, 0)}
                        className="text-stone-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sauce Selector */}
                    <div className="flex items-center gap-1.5">
                      <Droplet className="w-3 h-3 text-amber-400 shrink-0" />
                      <select
                        value={cartItem.selectedSauceId}
                        onChange={(e) => handleSelectSauce(idx, e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-200"
                      >
                        {sauces.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.extraPrice > 0 ? `(+${formatRp(s.extraPrice)})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Packaging Selector */}
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-teal-400 shrink-0" />
                      <select
                        value={cartItem.packagingType}
                        onChange={(e) => handleSelectPackaging(idx, e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-200"
                      >
                        <option value="Besek Bambu">Besek Bambu Ramah Lingkungan</option>
                        <option value="Paper Box Eco">Paper Box Kraft Eco</option>
                        <option value="Daun Pisang Roll">Daun Pisang Tradisional</option>
                      </select>
                    </div>

                    {/* Qty & Price Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-700/50">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(idx, cartItem.quantity - 1)}
                          className="w-6 h-6 bg-stone-700 hover:bg-stone-600 rounded-md font-bold text-stone-200 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-bold text-stone-100 px-1">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(idx, cartItem.quantity + 1)}
                          className="w-6 h-6 bg-stone-700 hover:bg-stone-600 rounded-md font-bold text-stone-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-bold text-emerald-400">{formatRp(unitPrice * cartItem.quantity)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment Details & Customer Info */}
          {cart.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-800 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Nama Pelanggan (Opsional)</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Misal: Bu Nina / Walk-in"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-9 pr-3 py-1.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'qris', label: 'QRIS' },
                    { id: 'cash', label: 'Tunai' },
                    { id: 'transfer', label: 'Transfer' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`py-1.5 font-semibold text-[11px] rounded-lg transition-colors ${
                        paymentMethod === pm.id
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Order Profit Calculation Summary */}
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/80 space-y-1.5">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal Pemasukan:</span>
                  <span className="font-bold text-stone-100">{formatRp(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Total HPP Modal Bahan:</span>
                  <span className="text-stone-400">{formatRp(totalHpp)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-stone-700 pt-1">
                  <span>Laba Bersih Order Ini:</span>
                  <span>+{formatRp(netProfit)}</span>
                </div>
              </div>

              {/* Process Sale Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Proses Penjualan (Potong Stok)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
