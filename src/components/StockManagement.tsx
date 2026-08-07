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
  onRestock: (stockItemId: string, addedQty: number, purchaseCost: number, recordAsExpense: boolean) => void;
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
    currentStock: number;
    minStock: number;
    unit: StockUnit;
    unitCostPrice: number;
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
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockCost, setRestockCost] = useState<number>(0);
  const [recordExpense, setRecordExpense] = useState<boolean>(true);

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
  };

  const handleConfirmRestock = () => {
    if (!restockTargetItem || restockQty <= 0) return;

    onRestock(restockTargetItem.id, Number(restockQty), Number(restockCost), recordExpense);
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

  const getStockStatusBadge = (item: StockItem) => {
    if (item.currentStock <= 0) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
          <XCircle className="w-3 h-3" />
          Habis!
        </span>
      );
    }
    if (item.currentStock <= item.minStock) {
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
          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            Manajemen Stok Bahan Baku & Kemasan
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Kelola persediaan pisang, ubi, jagung, telur, bahan saus, dan kemasan ramah lingkungan (Besek/Paper box).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecipeMenuTarget(menuItems[0] || null)}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
          >
            <ChefHat className="w-4 h-4 text-emerald-400" />
            Kelola Resep (BOM)
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Bahan
          </button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Total Jenis Bahan & Kemasan</span>
            <div className="text-xl font-bold text-stone-100 mt-1">{stockItems.length} Item</div>
          </div>
          <div className="p-3 bg-stone-800 rounded-xl text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Total Nilai Asset Persediaan</span>
            <div className="text-xl font-bold text-teal-400 mt-1">{formatRp(totalStockValue)}</div>
          </div>
          <div className="p-3 bg-stone-800 rounded-xl text-teal-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Alert Perlu Restock</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {lowStockCount} Menipis {emptyStockCount > 0 ? `(${emptyStockCount} Habis)` : ''}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Cari bahan (pisang, ubi, besek, supplier)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-800/80 border border-stone-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-stone-800/80 border border-stone-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-emerald-500"
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

      {/* Stock Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const stockRatio = Math.min(100, Math.max(0, (item.currentStock / (item.minStock * 2)) * 100));
          const totalValue = item.currentStock * item.unitCostPrice;

          return (
            <div
              key={item.id}
              className={`bg-stone-900 border rounded-2xl p-4 space-y-3 transition-all ${
                item.currentStock <= item.minStock
                  ? 'border-amber-600/60 bg-amber-950/10 shadow-lg shadow-amber-950/20'
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryBadge(item.category)}
                    {getStockStatusBadge(item)}
                  </div>
                  <h3 className="font-bold text-stone-100 text-sm sm:text-base">{item.name}</h3>
                  {item.supplier && <p className="text-[11px] text-stone-400">Supplier: {item.supplier}</p>}
                </div>
              </div>

              {/* Stock Quantity Gauge */}
              <div className="space-y-1.5 bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Sisa Stok:</span>
                  <span className="font-bold text-stone-100 text-sm">
                    {item.currentStock} {item.unit}
                  </span>
                </div>

                <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.currentStock <= 0
                        ? 'bg-rose-500'
                        : item.currentStock <= item.minStock
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stockRatio}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span>Batas Min: {item.minStock} {item.unit}</span>
                  <span>HPP Unit: {formatRp(item.unitCostPrice)}</span>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800">
                <div>
                  <span className="text-[10px] text-stone-500">Nilai Aset Stok:</span>
                  <div className="font-semibold text-teal-400">{formatRp(totalValue)}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenRestockModal(item)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Restock
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteStockItem(item.id)}
                    className="p-1.5 bg-stone-800 hover:bg-rose-900/50 text-stone-400 hover:text-rose-300 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-100">
                {editingItem ? 'Edit Bahan / Kemasan' : 'Tambah Bahan Baku / Kemasan Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStockItem} className="space-y-4 text-xs sm:text-sm">
              {/* Quick Preset Choice Chips */}
              {!editingItem && (
                <div className="space-y-1.5 bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <label className="block text-[11px] font-bold text-amber-400">
                    ⚡ Pilih Cepat Bahan Utama / Produk (Atau isi manual):
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { name: 'Pisang Kepok Kuning', cat: 'bahan_utama', unit: 'kg', price: 18000 },
                      { name: 'Ubi Cilembu Sweet', cat: 'bahan_utama', unit: 'kg', price: 16000 },
                      { name: 'Ubi Ungu Organik', cat: 'bahan_utama', unit: 'kg', price: 15000 },
                      { name: 'Telur Kampung Kukus', cat: 'bahan_utama', unit: 'pcs', price: 3000 },
                      { name: 'Jagung Manis Pipil', cat: 'bahan_utama', unit: 'kg', price: 14000 },
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
                        className="px-2.5 py-1 bg-stone-850 hover:bg-stone-750 text-stone-200 border border-stone-700/80 rounded-lg text-[11px] font-semibold transition-all hover:border-amber-500/60"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Nama Bahan / Stok Utama</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pisang Kepok Kuning / Besek Bambu / Telur Kampung"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Kategori Bahan</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as StockCategory })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bahan_utama">🍌 Bahan Utama Kukusan</option>
                    <option value="bahan_saus">🍯 Bahan Saus & Topping</option>
                    <option value="kemasan">🍱 Kemasan Eco / Besek</option>
                    <option value="operasional">🥤 Air Mineral & Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Satuan (Unit)</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as StockUnit })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-stone-400 mb-1 font-medium">Stok Awal</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Batas Min Alert</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Harga Modal / Unit (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.unitCostPrice}
                    onChange={(e) => setFormData({ ...formData, unitCostPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {!editingItem && (
                <div className="bg-emerald-950/70 border border-emerald-800/80 p-3 rounded-xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoCreateCheck"
                    checked={autoCreateMenuItem}
                    onChange={(e) => setAutoCreateMenuItem(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-emerald-500 shrink-0"
                  />
                  <label htmlFor="autoCreateCheck" className="text-xs text-emerald-200 leading-snug cursor-pointer">
                    <span className="font-bold text-emerald-300 block">Hubungkan Otomatis ke Katalog Menu Jualan</span>
                    Bahan ini akan langsung dicantumkan ke daftar menu jualan sehingga bisa diedit laku terjualnya di Laporan Hari Ini & Kasir.
                  </label>
                </div>
              )}

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Supplier / Pemasok (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Pak Tani Pasar Induk / Pengrajin Tasik"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
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
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                <PackageCheck className="w-5 h-5" />
                Restock Stok: {restockTargetItem.name}
              </h3>
              <button onClick={() => setRestockTargetItem(null)} className="text-stone-400 hover:text-stone-200">
                ✕
              </button>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Stok Saat Ini:</span>
                <span className="font-bold">
                  {restockTargetItem.currentStock} {restockTargetItem.unit}
                </span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Batas Minimal Alert:</span>
                <span>
                  {restockTargetItem.minStock} {restockTargetItem.unit}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Jumlah Tambahan Restock</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={restockQty}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0;
                      setRestockQty(qty);
                      setRestockCost(qty * restockTargetItem.unitCostPrice);
                    }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="font-bold text-stone-300 shrink-0">{restockTargetItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Total Biaya Pembelian (Rp)</label>
                <input
                  type="number"
                  value={restockCost}
                  onChange={(e) => setRestockCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 bg-stone-800/60 p-3 rounded-xl border border-stone-700/60">
                <input
                  type="checkbox"
                  id="expenseCheck"
                  checked={recordExpense}
                  onChange={(e) => setRecordExpense(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <label htmlFor="expenseCheck" className="text-xs text-stone-300 cursor-pointer">
                  Catat biaya pembelian ini secara otomatis ke Log Pengeluaran Operasional
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setRestockTargetItem(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
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
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
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
