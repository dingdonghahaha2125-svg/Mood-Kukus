import React, { useState } from 'react';
import {
  Calculator,
  ChefHat,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  DollarSign,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MenuItem, SauceItem, StockItem } from '../types';
import { calculateMenuItemHpp, formatRp } from '../utils/calculations';

interface HppCalculatorProps {
  menuItems: MenuItem[];
  sauces: SauceItem[];
  stockItems: StockItem[];
}

export const HppCalculator: React.FC<HppCalculatorProps> = ({
  menuItems,
  sauces,
  stockItems,
}) => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>(menuItems[0]?.id || '');
  const [selectedSauceId, setSelectedSauceId] = useState<string>(sauces[0]?.id || '');
  const [targetMargin, setTargetMargin] = useState<number>(55); // 55% target margin

  // Custom simulator ingredients override
  const activeMenu = menuItems.find((m) => m.id === selectedMenuId) || menuItems[0];

  const calculatedHpp = activeMenu
    ? calculateMenuItemHpp(activeMenu, selectedSauceId, sauces, stockItems)
    : 10000;

  // Selling price formula based on margin: Price = HPP / (1 - Margin%)
  const marginDecimal = targetMargin / 100;
  const suggestedPrice = Math.ceil(calculatedHpp / (1 - marginDecimal) / 1000) * 1000;
  const actualProfit = activeMenu ? activeMenu.price - calculatedHpp : 0;
  const actualMargin = activeMenu && activeMenu.price > 0 ? Math.round((actualProfit / activeMenu.price) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-100 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-amber-400" />
          🧮 Hitung Modal Bahan & Harga Jual
        </h2>
        <p className="text-xs sm:text-sm text-stone-400">
          Cari tahu modal bahan per biji/porsi (pisang, ubi, telur, jagung, saus, kemasan) agar Anda tidak rugi dan bisa menentukan harga jual yang menguntungkan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Menu Selector & Ingredient Breakdown */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300">Pilih Menu Kukusan:</label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 font-bold focus:outline-none focus:border-amber-500"
            >
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Harga Jual Saat Ini: {formatRp(m.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300">Saus Cocolan Pelengkap:</label>
            <select
              value={selectedSauceId}
              onChange={(e) => setSelectedSauceId(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-200"
            >
              {sauces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.extraPrice > 0 ? `(+${formatRp(s.extraPrice)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Ingredient Details Table */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center justify-between">
              <span>Komposisi Rincian Biaya Bahan & Kemasan:</span>
              <span className="text-xs text-amber-400 font-semibold">Total HPP: {formatRp(calculatedHpp)}</span>
            </h3>

            <div className="space-y-2">
              {activeMenu?.ingredients.map((ing, idx) => {
                const stockItem = stockItems.find((s) => s.id === ing.stockItemId);
                const cost = (stockItem?.unitCostPrice || 0) * ing.amount;

                return (
                  <div
                    key={ing.stockItemId + idx}
                    className="flex items-center justify-between bg-stone-800/80 border border-stone-700/60 rounded-xl p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-stone-200">{stockItem?.name || ing.stockItemId}</div>
                      <div className="text-[10px] text-stone-400">
                        {ing.amount} {stockItem?.unit} x {formatRp(stockItem?.unitCostPrice || 0)}/{stockItem?.unit}
                      </div>
                    </div>
                    <div className="font-bold text-stone-100">{formatRp(cost)}</div>
                  </div>
                );
              })}

              {/* Add Sauce Ingredients */}
              {selectedSauceId && (() => {
                const sauce = sauces.find((s) => s.id === selectedSauceId);
                return sauce?.ingredients.map((ing, idx) => {
                  const stockItem = stockItems.find((s) => s.id === ing.stockItemId);
                  const cost = (stockItem?.unitCostPrice || 0) * ing.amount;
                  return (
                    <div
                      key={'sauce-' + ing.stockItemId + idx}
                      className="flex items-center justify-between bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-amber-300">
                          [Saus] {stockItem?.name || ing.stockItemId}
                        </div>
                        <div className="text-[10px] text-amber-200/70">
                          {ing.amount} {stockItem?.unit} x {formatRp(stockItem?.unitCostPrice || 0)}
                        </div>
                      </div>
                      <div className="font-bold text-amber-300">{formatRp(cost)}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Right Column: Target Profit Margin & Price Optimizer */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-5 shadow-lg">
          <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Optimasi Profit & Target Margin
          </h3>

          {/* Slider for Target Margin */}
          <div className="space-y-2 bg-stone-800/80 p-4 rounded-xl border border-stone-700/80">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300 font-medium">Target Margin Keuntungan:</span>
              <span className="font-bold text-amber-400 text-base">{targetMargin}%</span>
            </div>

            <input
              type="range"
              min={30}
              max={80}
              step={5}
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-stone-500">
              <span>30% (Standard)</span>
              <span>55% (Sangat Sehat)</span>
              <span>80% (Premium)</span>
            </div>
          </div>

          {/* Pricing Comparison Cards */}
          <div className="space-y-3">
            {/* Calculated Recommended Price */}
            <div className="bg-gradient-to-br from-emerald-950/60 to-stone-900 border border-emerald-700/60 rounded-xl p-4 space-y-1">
              <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                Rekomendasi Harga Jual ({targetMargin}% Margin)
              </span>
              <div className="text-2xl font-bold text-emerald-400">{formatRp(suggestedPrice)}</div>
              <p className="text-[10px] text-emerald-200/80">
                Laba bersih per porsi: +{formatRp(suggestedPrice - calculatedHpp)}
              </p>
            </div>

            {/* Current Actual Price Comparison */}
            {activeMenu && (
              <div className="bg-stone-800/80 border border-stone-700 rounded-xl p-4 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-400 font-medium">Harga Jual Menu Saat Ini:</span>
                  <span className="font-bold text-stone-100 text-sm">{formatRp(activeMenu.price)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Margin Aktual Saat Ini:</span>
                  <span className={`font-bold ${actualMargin >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {actualMargin}% ({formatRp(actualProfit)} profit)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Business Tips */}
          <div className="bg-stone-800/40 border border-stone-700/60 p-3.5 rounded-xl text-xs space-y-1.5 text-stone-300">
            <div className="font-bold text-stone-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              Tips Efisiensi HPP Kukusan:
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Porsi kombinasi pisang & ubi madu memiliki margin tertinggi (hingga 65%). Wadah Besek Bambu menambah
              estetika nilai jual sehingga menu paket bisa dipatok harga lebih premium (28rb+).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
