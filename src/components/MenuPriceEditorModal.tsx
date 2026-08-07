import React, { useState } from 'react';
import {
  X,
  Edit3,
  Plus,
  Check,
  TrendingUp,
  Trash2,
  UtensilsCrossed,
  DollarSign,
  Coffee,
  Package,
  Layers,
} from 'lucide-react';
import { MenuItem, SauceItem, StockItem } from '../types';
import { calculateMenuItemHpp, formatRp } from '../utils/calculations';

interface MenuPriceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  sauces: SauceItem[];
  stockItems: StockItem[];
  onUpdateMenuItem: (updatedItem: MenuItem) => void;
  onAddMenuItem: (newItem: MenuItem) => void;
  onDeleteMenuItem?: (id: string) => void;
}

export const MenuPriceEditorModal: React.FC<MenuPriceEditorModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  sauces,
  stockItems,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // New Menu Item Form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'satuan' | 'minuman' | 'kemasan'>('satuan');
  const [newPrice, setNewPrice] = useState<number>(5000);
  const [newUnitName, setNewUnitName] = useState('botol');
  const [newDescription, setNewDescription] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setTempPrice(item.price);
  };

  const handleSaveEdit = (item: MenuItem) => {
    onUpdateMenuItem({
      ...item,
      price: Math.max(0, tempPrice),
    });
    setEditingId(null);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: MenuItem = {
      id: `menu-custom-${Date.now()}`,
      name: newName,
      category: newCategory,
      price: Math.max(0, newPrice),
      unitName: newUnitName || 'pcs',
      description: newDescription || 'Menu tambahan usaha kukusan Mamuju.',
      isAvailable: true,
      preparedQty: 30,
      soldQty: 0,
      ingredients: [],
    };

    onAddMenuItem(created);
    setIsAddingNew(false);
    setNewName('');
    setNewPrice(5000);
    setNewDescription('');
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'satuan':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-bold">🍌 Kukusan Satuan</span>;
      case 'paket':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">📦 Paket Combo</span>;
      case 'minuman':
        return <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] px-2 py-0.5 rounded font-bold">🥤 Air & Minuman</span>;
      case 'kemasan':
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-bold">🍱 Wadah Packing</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
                Atur Harga Jual & Ketahui Keuntungan Per Unit
              </h2>
              <p className="text-xs text-stone-400">
                Edit harga jual menu item untuk langsung mengetahui untung bersih per porsi/biji
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Top Banner Action */}
          <div className="flex items-center justify-between bg-stone-800/80 border border-stone-700/80 rounded-xl p-3.5">
            <div className="text-xs text-stone-300">
              <span className="font-bold text-amber-400">💡 Tips Penjualan:</span> Pastikan harga jual berada di atas Modal (HPP) agar setiap unit yang laku menghasilkan keuntungan bersih positif.
            </div>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNew ? 'Batal Tambah' : 'Tambah Menu Baru'}</span>
            </button>
          </div>

          {/* Form Add New Menu Item */}
          {isAddingNew && (
            <form onSubmit={handleSaveNewItem} className="bg-stone-800/90 border border-emerald-500/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4" />
                Tambah Menu / Minuman / Wadah Packing Baru
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Nama Menu / Produk:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Air Mineral Cleo 600ml / Box Thinwall"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Kategori Produk:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="satuan">🍌 Kukusan Satuan (Per Biji)</option>
                    <option value="minuman">🥤 Air Botol & Minuman</option>
                    <option value="kemasan">🍱 Wadah Packing / Tempat</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Harga Jual per Unit (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Satuan Hitungan:</label>
                  <input
                    type="text"
                    placeholder="botol / biji / box / porsi"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all"
                >
                  Simpan Menu Baru
                </button>
              </div>
            </form>
          )}

          {/* Menu Items Table List */}
          <div className="space-y-3">
            {menuItems
              .filter(
                (item) =>
                  item.category !== 'paket' &&
                  !item.name.toLowerCase().includes('paket') &&
                  !item.name.toLowerCase().includes('combo')
              )
              .map((item) => {
              const hpp = calculateMenuItemHpp(item, item.defaultSauceId, sauces, stockItems);
              const isEditing = editingId === item.id;
              const currentPrice = isEditing ? tempPrice : item.price;
              const unitProfit = currentPrice - hpp;
              const marginPct = currentPrice > 0 ? Math.round((unitProfit / currentPrice) * 100) : 0;
              const isProfitable = unitProfit > 0;

              return (
                <div
                  key={item.id}
                  className="bg-stone-800/60 border border-stone-700/80 hover:border-amber-500/40 rounded-xl p-3.5 sm:p-4 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(item.category)}
                        <span className="text-[10px] text-stone-400">Satuan: {item.unitName || 'unit'}</span>
                      </div>
                      <h4 className="font-bold text-stone-100 text-sm sm:text-base">{item.name}</h4>
                      <p className="text-xs text-stone-400 line-clamp-1">{item.description}</p>
                    </div>

                    {/* Price & Unit Profit Metrics */}
                    <div className="flex items-center gap-3 bg-stone-900/80 border border-stone-700/60 rounded-xl p-3 shrink-0">
                      {/* Price Edit Box */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-400 block">Harga Jual:</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(Number(e.target.value))}
                              className="w-24 bg-stone-800 border border-amber-500 rounded px-2 py-1 text-xs font-bold text-amber-300 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEdit(item)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-stone-100">{formatRp(item.price)}</span>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-amber-400 hover:text-amber-300 hover:bg-stone-800 rounded transition-all"
                              title="Edit Harga"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="h-8 w-px bg-stone-700" />

                      {/* Modal/HPP */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-400 block">Modal (HPP):</span>
                        <span className="font-semibold text-xs text-stone-300">{formatRp(hpp)}</span>
                      </div>

                      <div className="h-8 w-px bg-stone-700" />

                      {/* Keuntungan Per Unit */}
                      <div className="space-y-0.5 text-right">
                        <span className="text-[10px] text-stone-400 block">Untung / {item.unitName || 'biji'}:</span>
                        <div
                          className={`font-black text-xs sm:text-sm flex items-center justify-end gap-0.5 ${
                            isProfitable ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{formatRp(unitProfit)} ({marginPct}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-900 border-t border-stone-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow"
          >
            Selesai Atur Menu
          </button>
        </div>
      </div>
    </div>
  );
};
