import { StockItem, MenuItem, SauceItem, Expense, Transaction } from '../types';

export const INITIAL_STOCK_ITEMS: StockItem[] = [
  // Bahan Utama Kukusan Alami Mamuju
  {
    id: 'stk-1',
    name: 'Pisang Kepok Kuning Mamuju Fresh',
    category: 'bahan_utama',
    currentStock: 15.0,
    minStock: 5.0,
    unit: 'kg',
    unitCostPrice: 16000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Pak Tani Pasar Regional Mamuju',
    notes: 'Pisang kepok tua manis khas Mamuju',
  },
  {
    id: 'stk-2',
    name: 'Ubi Cilembu Madu & Ubi Ungu',
    category: 'bahan_utama',
    currentStock: 20.0,
    minStock: 6.0,
    unit: 'kg',
    unitCostPrice: 14000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Petani Lokal Sulawesi Barat',
    notes: 'Ubi manis alami leleh karamel',
  },
  {
    id: 'stk-3',
    name: 'Jagung Manis Segar Mamuju',
    category: 'bahan_utama',
    currentStock: 35.0,
    minStock: 10.0,
    unit: 'pcs',
    unitCostPrice: 3000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Kebun Jagung Mamuju',
    notes: 'Tongkol jagung renyah manis alami',
  },
  {
    id: 'stk-4',
    name: 'Telur Ayam Kampung Fresh',
    category: 'bahan_utama',
    currentStock: 45.0,
    minStock: 15.0,
    unit: 'pcs',
    unitCostPrice: 2500,
    lastUpdated: new Date().toISOString(),
    supplier: 'Peternakan Organik Mamuju',
    notes: 'Kuning telur kaya nutrisi',
  },

  // Bahan Saus & Bumbu Cocolan
  {
    id: 'stk-5',
    name: 'Santan Kelapa Murni',
    category: 'bahan_saus',
    currentStock: 8.0,
    minStock: 3.0,
    unit: 'liter',
    unitCostPrice: 20000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Pasar Sentral Mamuju',
  },
  {
    id: 'stk-6',
    name: 'Gula Aren Organik Sulawesi',
    category: 'bahan_saus',
    currentStock: 10.0,
    minStock: 3.0,
    unit: 'kg',
    unitCostPrice: 26000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Pengrajin Gula Aren Lokal',
  },
  {
    id: 'stk-7',
    name: 'Saus Sambal Roa Khas Sulawesi',
    category: 'bahan_saus',
    currentStock: 2.0,
    minStock: 1.5,
    unit: 'kg',
    unitCostPrice: 50000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Dapur Roa Mamuju',
  },
  {
    id: 'stk-8',
    name: 'Cokelat Lumer & Pandan Srikaya',
    category: 'bahan_saus',
    currentStock: 3.5,
    minStock: 2.0,
    unit: 'kg',
    unitCostPrice: 55000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Toko Bahan Kue',
  },

  // Kemasan Ramah Lingkungan
  {
    id: 'stk-9',
    name: 'Besek Bambu Mood Kukus (15x15 cm)',
    category: 'kemasan',
    currentStock: 60.0,
    minStock: 20.0,
    unit: 'pcs',
    unitCostPrice: 2200,
    lastUpdated: new Date().toISOString(),
    supplier: 'Pengrajin Bambu Sulbar',
  },
  {
    id: 'stk-10',
    name: 'Daun Pisang Fresh Potong',
    category: 'kemasan',
    currentStock: 12.0,
    minStock: 5.0,
    unit: 'roll',
    unitCostPrice: 5000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-11',
    name: 'Paper Box Eco Kraft Foodgrade',
    category: 'kemasan',
    currentStock: 100.0,
    minStock: 30.0,
    unit: 'pcs',
    unitCostPrice: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'stk-12',
    name: 'Cup Saus Paper Eco 50ml',
    category: 'kemasan',
    currentStock: 150.0,
    minStock: 50.0,
    unit: 'pcs',
    unitCostPrice: 350,
    lastUpdated: new Date().toISOString(),
  },
  // Minuman & Wadah Packing
  {
    id: 'stk-13',
    name: 'Air Mineral Botol 600ml (Kardus)',
    category: 'operasional',
    currentStock: 48.0,
    minStock: 12.0,
    unit: 'pcs',
    unitCostPrice: 2000,
    lastUpdated: new Date().toISOString(),
    supplier: 'Distributor Air Mineral Mamuju',
  },
  {
    id: 'stk-14',
    name: 'Air Mineral Cup Gelas 220ml',
    category: 'operasional',
    currentStock: 96.0,
    minStock: 24.0,
    unit: 'pcs',
    unitCostPrice: 400,
    lastUpdated: new Date().toISOString(),
    supplier: 'Distributor Air Mineral Mamuju',
  },
];

export const INITIAL_SAUCES: SauceItem[] = [
  {
    id: 'sauce-1',
    name: 'Saus Santan Gula Aren (Favorit)',
    description: 'Saus manis legit karamel gula aren Sulawesi dipadu santan gurih.',
    extraPrice: 0,
    ingredients: [
      { stockItemId: 'stk-6', amount: 0.03 },
      { stockItemId: 'stk-5', amount: 0.02 },
      { stockItemId: 'stk-12', amount: 1 },
    ],
  },
  {
    id: 'sauce-2',
    name: 'Sambal Roa Mamuju Pedas Gurih',
    description: 'Saus cocolan khas Sulawesi pedas mantap untuk ubi, pisang, & telur.',
    extraPrice: 3000,
    ingredients: [
      { stockItemId: 'stk-7', amount: 0.025 },
      { stockItemId: 'stk-12', amount: 1 },
    ],
  },
  {
    id: 'sauce-3',
    name: 'Srikaya Pandan Wangi',
    description: 'Saus srikaya lembut dengan wangi pandan alami.',
    extraPrice: 2000,
    ingredients: [
      { stockItemId: 'stk-5', amount: 0.025 },
      { stockItemId: 'stk-12', amount: 1 },
    ],
  },
  {
    id: 'sauce-4',
    name: 'Cokelat Aren Lumer',
    description: 'Perpaduan lelehan cokelat kental dan keharuman gula aren.',
    extraPrice: 3000,
    ingredients: [
      { stockItemId: 'stk-8', amount: 0.025 },
      { stockItemId: 'stk-12', amount: 1 },
    ],
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ITEM SATUAN KUKUSAN (Jualan Per Item Bahan)
  {
    id: 'menu-item-pisang',
    name: 'Pisang Kukus Kepok (Per Biji)',
    category: 'satuan',
    price: 3000,
    unitName: 'biji',
    preparedQty: 50, // Stok Siap Jual Hari Ini
    soldQty: 0,      // Belum ada yang terjual
    description: '1 biji pisang kepok tua khas Mamuju yang dikukus empuk dan manis alami.',
    isAvailable: true,
    defaultSauceId: 'sauce-1',
    ingredients: [
      { stockItemId: 'stk-1', amount: 0.08 }, // ~80g pisang
      { stockItemId: 'stk-10', amount: 0.02 }, // alas daun
    ],
  },
  {
    id: 'menu-item-ubi',
    name: 'Ubi Cilembu / Ungu Kukus (Per Potong)',
    category: 'satuan',
    price: 3500,
    unitName: 'potong',
    preparedQty: 40,
    soldQty: 0,
    description: '1 potong ubi cilembu madu / ubi ungu kukus manis hangat bernutrisi tinggi.',
    isAvailable: true,
    defaultSauceId: 'sauce-1',
    ingredients: [
      { stockItemId: 'stk-2', amount: 0.10 },
      { stockItemId: 'stk-10', amount: 0.02 },
    ],
  },
  {
    id: 'menu-item-telur',
    name: 'Telur Ayam Kampung Rebus (Per Biji)',
    category: 'satuan',
    price: 4000,
    unitName: 'biji',
    preparedQty: 30,
    soldQty: 0,
    description: '1 butir telur ayam kampung rebus hangat segar kaya akan protein.',
    isAvailable: true,
    defaultSauceId: 'sauce-2',
    ingredients: [
      { stockItemId: 'stk-4', amount: 1 },
    ],
  },
  {
    id: 'menu-item-jagung',
    name: 'Jagung Manis Kukus (Per Tongkol)',
    category: 'satuan',
    price: 4000,
    unitName: 'tongkol',
    preparedQty: 30,
    soldQty: 0,
    description: '1 tongkol jagung manis Mamuju kukus hangat renyah dan gurih.',
    isAvailable: true,
    defaultSauceId: 'sauce-1',
    ingredients: [
      { stockItemId: 'stk-3', amount: 1 },
    ],
  },

  // PAKET COMBO & PORSI BERBAGI
  {
    id: 'menu-paket-besek',
    name: 'Paket Besek Mood Kukus Complete (Isi 6 Item)',
    category: 'paket',
    price: 25000,
    unitName: 'porsi',
    preparedQty: 15,
    soldQty: 0,
    description: 'Kombinasi 2 Pisang Kepok, 2 Ubi Kukus, 1 Telur Kampung, 1 Jagung Kukus + Besek Bambu & Saus Pilihan.',
    isAvailable: true,
    defaultSauceId: 'sauce-1',
    ingredients: [
      { stockItemId: 'stk-1', amount: 0.16 },
      { stockItemId: 'stk-2', amount: 0.20 },
      { stockItemId: 'stk-3', amount: 1 },
      { stockItemId: 'stk-4', amount: 1 },
      { stockItemId: 'stk-9', amount: 1 }, // Besek bambu
      { stockItemId: 'stk-10', amount: 0.1 },
    ],
  },
  {
    id: 'menu-porsi-pisang-ubi',
    name: 'Porsi Duo Pisang & Ubi Cocol Aren',
    category: 'paket',
    price: 15000,
    unitName: 'porsi',
    preparedQty: 20,
    soldQty: 0,
    description: '3 biji pisang kepok + 2 potong ubi cilembu kukus hangat dalam kemasan paper box.',
    isAvailable: true,
    defaultSauceId: 'sauce-1',
    ingredients: [
      { stockItemId: 'stk-1', amount: 0.24 },
      { stockItemId: 'stk-2', amount: 0.20 },
      { stockItemId: 'stk-11', amount: 1 },
    ],
  },

  // MINUMAN SEGAR & AIR BOTOL MINERAL
  {
    id: 'menu-air-botol',
    name: 'Air Mineral Botol 600ml Segar',
    category: 'minuman',
    price: 4000,
    unitName: 'botol',
    preparedQty: 48,
    soldQty: 0,
    description: 'Air mineral dingin/segar botol 600ml teman santap kukusan hangat.',
    isAvailable: true,
    ingredients: [
      { stockItemId: 'stk-13', amount: 1 },
    ],
  },
  {
    id: 'menu-air-cup',
    name: 'Air Mineral Cup Gelas 220ml',
    category: 'minuman',
    price: 1000,
    unitName: 'cup',
    preparedQty: 96,
    soldQty: 0,
    description: 'Air mineral kemasan cup gelas hemat & praktis.',
    isAvailable: true,
    ingredients: [
      { stockItemId: 'stk-14', amount: 1 },
    ],
  },

  // WADAH / TEMPAT PACKING EKSTRA
  {
    id: 'menu-wadah-besek',
    name: 'Wadah Besek Bambu Tradisional (Ekstra Packing)',
    category: 'kemasan',
    price: 4000,
    unitName: 'pcs',
    preparedQty: 30,
    soldQty: 0,
    description: 'Wadah besek bambu khas Sulawesi untuk kemasan oleh-oleh / hampers cantik.',
    isAvailable: true,
    ingredients: [
      { stockItemId: 'stk-9', amount: 1 },
    ],
  },
  {
    id: 'menu-wadah-paperbox',
    name: 'Wadah Paper Box Foodgrade (Ekstra Packing)',
    category: 'kemasan',
    price: 2000,
    unitName: 'box',
    preparedQty: 50,
    soldQty: 0,
    description: 'Wadah kotak kertas ramah lingkungan tahan panas untuk takeaway.',
    isAvailable: true,
    ingredients: [
      { stockItemId: 'stk-11', amount: 1 },
    ],
  },
];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

