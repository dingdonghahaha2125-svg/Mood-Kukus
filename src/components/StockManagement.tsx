import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Edit2,
  Trash2,
  DollarSign,
  Layers,
  ChefHat,
  Tag,
  ArrowDownUp,
  FileText,
} from 'lucide-react';
import { StockItem, StockCategory, StockUnit, MenuItem, SauceItem } from '../types';
import { formatRp, formatDateOnly } from '../utils/calculations';

interface StockManagementProps {
  stockItems: StockItem[];
  menuItems: MenuItem[];
  sauces: SauceItem[];
  onAddStockItem: (item: StockItem) => void;
  onUpdateStockItem: (item: StockItem) => void;
  onDeleteStockItem: (id: string) => void;
  onRestock: (
    stockItemId: string,
    addedQty: number,
    purchaseCost: number,
    recordAsExpense: boolean,
    purchaseDate?: string
  ) => void;
  onUpdateMenuRecipe: (updatedMenu: MenuItem) => void;
  onAddMenuItem?: (newItem: MenuItem) => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  stockItems,
  menuItems,
  sauces,
  onAddStockItem,
  onUpdateStockItem,
  onDeleteStockItem,
  onRestock,
  onUpdateMenuRecipe,
  onAddMenuItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [autoCreateMenuItem, setAutoCreateMenuItem] = useState(true);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [restockTargetItem, setRestockTargetItem] = useState<StockItem | null>(null);
  const [recipeMenuTarget, setRecipeMenuTarget] = useState<MenuItem | null>(null);

  // Form states for adding/editing stock
  const [formData, setFormData] = useState<{
    name: string;
    category: StockCategory;
    currentStock: number | '';
    minStock: number | '';
    unit: StockUnit;
    unitCostPrice: number | '';
    supplier: string;
    notes: string;
  }>({
    name: '',
    category: 'bahan_utama',
    currentStock: 10,
    minStock: 5,
    unit: 'kg',
    unitCostPrice: 15000,
    supplier: '',
    notes: '',
  });

  // Restock modal state
  const [restockQty, setRestockQty] = useState<number | ''>(5);
  const [restockCost, setRestockCost] = useState<number | ''>(0);
  const [recordExpense, setRecordExpense] = useState<boolean>(true);
  const [restockDate, setRestockDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Filter logic
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'warning') {
      matchesStatus = item.currentStock <= item.minStock && item.currentStock > 0;
    } else if (selectedStatus === 'empty') {
      matchesStatus = item.currentStock <= 0;
    } else if (selectedStatus === 'safe') {
      matchesStatus = item.currentStock > item.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate metrics
  const totalStockValue = stockItems.reduce((sum, item) => sum + item.currentStock * item.unitCostPrice, 0);
  const lowStockCount = stockItems.filter((i) => i.currentStock <= i.minStock).length;
  const emptyStockCount = stockItems.filter((i) => i.currentStock <= 0).length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'bahan_utama',
      currentStock: 10,
      minStock: 5,
      unit: 'kg',
      unitCostPrice: 15000,
      supplier: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit,
      unitCostPrice: item.unitCostPrice,
      supplier: item.supplier || '',
      notes: item.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingItem) {
      onUpdateStockItem({
        ...editingItem,
        name: formData.name,
        category: formData.category,
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        unit: formData.unit,
        unitCostPrice: Number(formData.unitCostPrice),
        supplier: formData.supplier,
        notes: formData.notes,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      const newStockId = `stk-${Date.now()}`;
      onAddStockItem({
        id: newStockId,
        name: formData.name,
        category: formData.category,
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        unit: formData.unit,
        unitCostPrice: Number(formData.unitCostPrice),
        supplier: formData.supplier,
        notes: formData.notes,
        lastUpdated: new Date().toISOString(),
      });

      // Automatically sync / create a corresponding sellable MenuItem if requested
      if (autoCreateMenuItem && onAddMenuItem) {
        const existingMenu = menuItems.find((m) => m.name.toLowerCase() === formData.name.toLowerCase());
        if (!existingMenu) {
          const estimatedSellPrice = Math.max(Math.ceil((formData.unitCostPrice * 1.6) / 500) * 500, 5000);
          const newMenu: MenuItem = {
            id: `menu-${Date.now()}`,
            name: formData.name,
            category: formData.category === 'minuman' ? 'minuman' : formData.category === 'kemasan' ? 'kemasan' : 'satuan',
            price: estimatedSellPrice,
            description: `Olahan ${formData.name} khas kukus lokal`,
            preparedQty: Number(formData.currentStock),
            soldQty: 0,
            isAvailable: true,
            unitName: formData.unit === 'kg' ? 'porsi' : formData.unit,
            ingredients: [
              {
                stockItemId: newStockId,
                amount: 1,
              },
            ],
          };
          onAddMenuItem(newMenu);
        }
      }
    }

    setIsAddModalOpen(false);
  };

  const handleOpenRestockModal = (item: StockItem) => {
    setRestockTargetItem(item);
    setRestockQty(5);
    setRestockCost(5 * item.unitCostPrice);
    setRecordExpense(true);
    setRestockDate(new Date().toISOString().split('T')[0]);
  };

  const handleConfirmRestock = () => {
    if (!restockTargetItem || restockQty <= 0) return;

    onRestock(restockTargetItem.id, Number(restockQty), Number(restockCost), recordExpense, restockDate);
    setRestockTargetItem(null);
  };

  const getCategoryBadge = (cat: StockCategory) => {
    switch (cat) {
      case 'bahan_utama':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">Bahan Utama</span>;
      case 'bahan_saus':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">Bahan Saus</span>;
      case 'kemasan':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-800">Kemasan Eco</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700">Operasional</span>;
    }
  };

  const getStockStatusBadge = (item: StockItem, effectiveStock: number) => {
    if (effectiveStock <= 0) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
          <XCircle className="w-3 h-3" />
          Habis!
        </span>
      );
    }
    if (effectiveStock <= item.minStock) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
          <AlertTriangle className="w-3 h-3" />
          Menipis
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
        <CheckCircle2 className="w-3 h-3" />
        Aman
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-cyan-300" />
            Manajemen Stok Bahan Baku & Kemasan
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/80">
            Kelola persediaan pisang, ubi, singkong, telur, bahan saus, dan kemasan ramah lingkungan (Besek/Paper box).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecipeMenuTarget(menuItems[0] || null)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-sky-950 text-cyan-200 border border-sky-800/60 font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ChefHat className="w-4 h-4 text-cyan-300" />
            Kelola Resep (BOM)
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-sky-400/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Tambah Bahan
          </button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 backdrop-blur-sm">
          <div>
            <span className="text-xs text-sky-200/80 font-medium">Total Jenis Bahan & Kemasan</span>
            <div className="text-xl font-black text-slate-100 mt-1">{stockItems.length} Item</div>
          </div>
          <div className="p-3 bg-sky-950/80 border border-sky-700/60 rounded-xl text-cyan-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 backdrop-blur-sm">
          <div>
            <span className="text-xs text-sky-200/80 font-medium">Total Nilai Asset Persediaan</span>
            <div className="text-xl font-black text-cyan-300 mt-1">{formatRp(totalStockValue)}</div>
          </div>
          <div className="p-3 bg-sky-950/80 border border-sky-700/60 rounded-xl text-cyan-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 backdrop-blur-sm">
          <div>
            <span className="text-xs text-sky-200/80 font-medium">Alert Perlu Restock</span>
            <div className="text-xl font-black text-amber-300 mt-1">
              {lowStockCount} Menipis {emptyStockCount > 0 ? `(${emptyStockCount} Habis)` : ''}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-sky-800/40 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-sky-200/60" />
            <input
              type="text"
              placeholder="Cari bahan (pisang, ubi, besek, supplier)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-sky-800/60 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-sky-300/40 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Semua Status</option>
              <option value="safe">Stok Aman</option>
              <option value="warning">Stok Menipis</option>
              <option value="empty">Stok Habis</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'bahan_utama', label: 'Bahan Utama Kukusan' },
            { id: 'bahan_saus', label: 'Bahan Saus & Bumbu' },
            { id: 'kemasan', label: 'Kemasan Eco' },
            { id: 'operasional', label: 'Operasional' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-sky-400/20'
                  : 'bg-slate-950 text-sky-200/80 hover:text-cyan-200 border border-sky-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          // Calculate amount sold today based on menu items soldQty and recipes
          const soldDeductionToday = menuItems.reduce((sum, menu) => {
            const qty = menu.soldQty || 0;
            if (qty <= 0) return sum;

            if (menu.ingredients && menu.ingredients.length > 0) {
              const ing = menu.ingredients.find((i) => i.stockItemId === item.id);
              if (ing) return sum + ing.amount * qty;
            } else {
              if (menu.name.trim().toLowerCase() === item.name.trim().toLowerCase()) {
                return sum + qty;
              }
            }
            return sum;
          }, 0);

          const effectiveStock = Math.max(0, Number((item.currentStock - soldDeductionToday).toFixed(2)));
          const stockRatio = Math.min(100, Math.max(0, (effectiveStock / Math.max(1, item.minStock * 2)) * 100));
          const totalValue = effectiveStock * item.unitCostPrice;

          return (
            <div
              key={item.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 space-y-3 transition-all backdrop-blur-sm ${
                effectiveStock <= item.minStock
                  ? 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-950/30'
                  : 'border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryBadge(item.category)}
                    {getStockStatusBadge(item, effectiveStock)}
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">{item.name}</h3>
                  {item.supplier && <p className="text-[11px] text-sky-200/70">Supplier: {item.supplier}</p>}
                </div>
              </div>

              {/* Stock Quantity Gauge */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-sky-800/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-200/80">Sisa Stok Real-Time:</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {effectiveStock} {item.unit}
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-sky-900/40">
                  <div
                    className={`h-full rounded-full transition-all ${
                      effectiveStock <= 0
                        ? 'bg-rose-500'
                        : effectiveStock <= item.minStock
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${stockRatio}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-sky-200/70 pt-0.5">
                  <span>Stok Gudang: {item.currentStock} {item.unit}</span>
                  {soldDeductionToday > 0 ? (
                    <span className="text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
                      Terjual: -{soldDeductionToday} {item.unit}
                    </span>
                  ) : (
                    <span>Batas Min: {item.minStock} {item.unit}</span>
                  )}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-sky-900/40">
                <div>
                  <span className="text-[10px] text-sky-200/60">Nilai Aset Stok:</span>
                  <div className="font-semibold text-emerald-400">{formatRp(totalValue)}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenRestockModal(item)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Restock
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 bg-slate-950 hover:bg-sky-950 text-cyan-300 rounded-lg border border-sky-800/60 transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteStockItem(item.id)}
                    className="p-1.5 bg-slate-950 hover:bg-rose-950 text-sky-200/60 hover:text-rose-300 rounded-lg border border-sky-800/60 hover:border-rose-800 transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Add/Edit Stock Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-800/60 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <h3 className="font-bold text-lg text-slate-100">
                {editingItem ? 'Edit Bahan / Kemasan' : 'Tambah Bahan Baku / Kemasan Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-sky-200/60 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStockItem} className="space-y-4 text-xs sm:text-sm">
              {/* Quick Preset Choice Chips */}
              {!editingItem && (
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-sky-800/60">
                  <label className="block text-[11px] font-bold text-amber-300">
                    ⚡ Pilih Cepat Bahan Utama / Produk (Atau isi manual):
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { name: 'Pisang Kepok Kuning', cat: 'bahan_utama', unit: 'kg', price: 18000 },
                      { name: 'Ubi Cilembu Sweet', cat: 'bahan_utama', unit: 'kg', price: 16000 },
                      { name: 'Ubi Ungu Organik', cat: 'bahan_utama', unit: 'kg', price: 15000 },
                      { name: 'Telur Kampung Kukus', cat: 'bahan_utama', unit: 'pcs', price: 3000 },
                      { name: 'Singkong Keju Kukus', cat: 'bahan_utama', unit: 'kg', price: 12000 },
                      { name: 'Ayam Suwir Kukus', cat: 'bahan_utama', unit: 'kg', price: 38000 },
                      { name: 'Santan Kelapa Murni', cat: 'bahan_saus', unit: 'liter', price: 15000 },
                      { name: 'Gula Aren Cocol', cat: 'bahan_saus', unit: 'kg', price: 22000 },
                      { name: 'Air Mineral Botol 600ml', cat: 'operasional', unit: 'pcs', price: 2500 },
                      { name: 'Besek Bambu Tradisional', cat: 'kemasan', unit: 'pcs', price: 2000 },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            name: preset.name,
                            category: preset.cat as StockCategory,
                            unit: preset.unit as StockUnit,
                            unitCostPrice: preset.price,
                          });
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-sky-950 text-sky-200 border border-sky-800/60 rounded-lg text-[11px] font-semibold transition-all hover:border-amber-400"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sky-200/80 mb-1 font-medium">Nama Bahan / Stok Utama</label>
                <input
                  type="text"
                  required
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="Misal: Pisang Kepok Kuning / Singkong Keju / Besek Bambu"
                  value={formData.name}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/singkos/gi, 'Singkong');
                    setFormData({ ...formData, name: cleaned });
                  }}
                  className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Kategori Bahan</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as StockCategory })}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="bahan_utama">🍌 Bahan Utama Kukusan</option>
                    <option value="bahan_saus">🍯 Bahan Saus & Topping</option>
                    <option value="kemasan">🍱 Kemasan Eco / Besek</option>
                    <option value="operasional">🥤 Air Mineral & Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Satuan (Unit)</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as StockUnit })}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Pieces / Biji (pcs)</option>
                    <option value="liter">Liter (liter)</option>
                    <option value="pack">Pack / Dus</option>
                    <option value="ikat">Ikat</option>
                    <option value="roll">Roll</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Stok Awal</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.currentStock}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentStock: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Batas Min Alert</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.minStock}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStock: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Harga Modal / Unit (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.unitCostPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitCostPrice: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {!editingItem && (
                <div className="bg-sky-950/70 border border-sky-700/60 p-3 rounded-xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoCreateCheck"
                    checked={autoCreateMenuItem}
                    onChange={(e) => setAutoCreateMenuItem(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-cyan-400 shrink-0"
                  />
                  <label htmlFor="autoCreateCheck" className="text-xs text-sky-200 leading-snug cursor-pointer">
                    <span className="font-bold text-cyan-300 block">Hubungkan Otomatis ke Katalog Menu Jualan</span>
                    Bahan ini akan langsung dicantumkan ke daftar menu jualan sehingga bisa diedit laku terjualnya di Laporan Hari Ini & Kasir.
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sky-200/80 mb-1 font-medium">Supplier / Pemasok (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Pak Tani Pasar Induk / Pengrajin Tasik"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-sky-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-sky-800/60 text-sky-200/80 rounded-xl hover:bg-sky-950"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black rounded-xl shadow-md shadow-sky-400/20"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Restock Modal */}
      {restockTargetItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-800/60 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <h3 className="font-bold text-lg text-cyan-300 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-cyan-300" />
                Restock Stok: {restockTargetItem.name}
              </h3>
              <button onClick={() => setRestockTargetItem(null)} className="text-sky-200/60 hover:text-slate-100">
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl space-y-1 text-xs border border-sky-800/40">
              <div className="flex justify-between text-sky-200/80">
                <span>Stok Saat Ini:</span>
                <span className="font-bold text-cyan-300">
                  {restockTargetItem.currentStock} {restockTargetItem.unit}
                </span>
              </div>
              <div className="flex justify-between text-sky-200/80">
                <span>Batas Minimal Alert:</span>
                <span>
                  {restockTargetItem.minStock} {restockTargetItem.unit}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-sky-200/80 mb-1 font-medium">Jumlah Tambahan Restock</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={restockQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setRestockQty(val);
                      const numQty = typeof val === 'number' ? val : 0;
                      setRestockCost(numQty * restockTargetItem.unitCostPrice);
                    }}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-cyan-400"
                  />
                  <span className="font-bold text-sky-200/80 shrink-0">{restockTargetItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-sky-200/80 mb-1 font-medium flex items-center justify-between">
                  <span>Tanggal Pembelian / Restock Bahan:</span>
                  <span className="text-cyan-300 text-xs font-bold">
                    {formatDateOnly(restockDate + 'T12:00:00')}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    value={restockDate}
                    onChange={(e) => setRestockDate(e.target.value)}
                    onClick={(e) => {
                      try { (e.target as HTMLInputElement).showPicker(); } catch {}
                    }}
                    onFocus={(e) => {
                      try { (e.target as HTMLInputElement).showPicker(); } catch {}
                    }}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-cyan-400 text-xs sm:text-sm cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setRestockDate(new Date().toISOString().split('T')[0])}
                    className="px-2.5 py-2 bg-slate-950 hover:bg-sky-950 text-sky-200 rounded-xl border border-sky-800/60 text-xs shrink-0 font-medium"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setRestockDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-2 bg-slate-950 hover:bg-sky-950 text-sky-200 rounded-xl border border-sky-800/60 text-xs shrink-0 font-medium"
                  >
                    Kemarin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sky-200/80 mb-1 font-medium">Total Biaya Pembelian (Rp)</label>
                <input
                  type="number"
                  value={restockCost}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setRestockCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-sky-800/60">
                <input
                  type="checkbox"
                  id="expenseCheck"
                  checked={recordExpense}
                  onChange={(e) => setRecordExpense(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
                <label htmlFor="expenseCheck" className="text-xs text-slate-200 cursor-pointer">
                  Catat biaya pembelian ini secara otomatis ke Log Pengeluaran Operasional
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-sky-900/40">
              <button
                type="button"
                onClick={() => setRestockTargetItem(null)}
                className="px-4 py-2 bg-slate-950 border border-sky-800/60 text-sky-200/80 rounded-xl hover:bg-sky-950 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md"
              >
                Konfirmasi Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Recipe / Bill of Materials */}
      {recipeMenuTarget && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 text-stone-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Pemetaan Resep (BOM) & Potong Stok Otomatis
                </h3>
                <p className="text-xs text-stone-400">
                  Atur berapa kg pisang/ubi/kemasan yang terkurang tiap 1 porsi menu teruji.
                </p>
              </div>
              <button onClick={() => setRecipeMenuTarget(null)} className="text-stone-400 hover:text-stone-200">
                ✕
              </button>
            </div>

            {/* Select Menu Item */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300">Pilih Menu untuk Diset Resepnya:</label>
              <select
                value={recipeMenuTarget.id}
                onChange={(e) => {
                  const m = menuItems.find((item) => item.id === e.target.value);
                  if (m) setRecipeMenuTarget(m);
                }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100"
              >
                {menuItems.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name} ({formatRp(menu.price)})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Ingredient Mapping Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-200">
                Komposisi Bahan & Kemasan per 1 Porsi "{recipeMenuTarget.name}":
              </h4>

              <div className="space-y-2">
                {recipeMenuTarget.ingredients.map((ing, idx) => {
                  const stockItem = stockItems.find((s) => s.id === ing.stockItemId);
                  return (
                    <div
                      key={ing.stockItemId + idx}
                      className="flex items-center justify-between bg-stone-800/80 border border-stone-700/60 rounded-xl p-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-stone-200">{stockItem?.name || ing.stockItemId}</div>
                        <div className="text-[10px] text-stone-400">
                          Kategori: {stockItem?.category} | Biaya modal: {formatRp((stockItem?.unitCostPrice || 0) * ing.amount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          value={ing.amount}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            const newIngredients = [...recipeMenuTarget.ingredients];
                            newIngredients[idx] = { ...ing, amount: val };
                            const updated = { ...recipeMenuTarget, ingredients: newIngredients };
                            setRecipeMenuTarget(updated);
                            onUpdateMenuRecipe(updated);
                          }}
                          className="w-20 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-right text-stone-100 font-bold"
                        />
                        <span className="text-stone-400 font-medium">{stockItem?.unit || 'unit'}</span>
                        <button
                          onClick={() => {
                            const newIngredients = recipeMenuTarget.ingredients.filter((_, i) => i !== idx);
                            const updated = { ...recipeMenuTarget, ingredients: newIngredients };
                            setRecipeMenuTarget(updated);
                            onUpdateMenuRecipe(updated);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-400 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Component to Recipe */}
              <div className="bg-stone-800/40 border border-dashed border-stone-700 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-2">
                <select
                  id="addIngSelect"
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200"
                >
                  <option value="">+ Pilih Bahan / Kemasan untuk Ditambahkan...</option>
                  {stockItems
                    .filter((s) => !recipeMenuTarget.ingredients.some((ing) => ing.stockItemId === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.unit})
                      </option>
                    ))}
                </select>

                <button
                  onClick={() => {
                    const selectEl = document.getElementById('addIngSelect') as HTMLSelectElement;
                    if (!selectEl || !selectEl.value) return;

                    const stockId = selectEl.value;
                    const updated = {
                      ...recipeMenuTarget,
                      ingredients: [...recipeMenuTarget.ingredients, { stockItemId: stockId, amount: 0.1 }],
                    };
                    setRecipeMenuTarget(updated);
                    onUpdateMenuRecipe(updated);
                    selectEl.value = '';
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Tambahkan
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-stone-800">
              <button
                onClick={() => setRecipeMenuTarget(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Selesai Atur Resep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
