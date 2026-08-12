import { StockItem, MenuItem, SauceItem, Expense, Transaction, DailyReport } from '../types';

export const INITIAL_STOCK_ITEMS: StockItem[] = [];

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
    id: 'menu-item-singkong',
    name: 'Singkong Keju Kukus (Per Potong)',
    category: 'satuan',
    price: 3500,
    unitName: 'potong',
    preparedQty: 35,
    soldQty: 0,
    description: '1 potong singkong keju mekar kukus empuk dan gurih.',
    isAvailable: true,
    defaultSauceId: 'sauce-1',
    ingredients: [
      { stockItemId: 'stk-3', amount: 0.12 },
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
];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: 'rep-2026-08-06',
    date: '2026-08-06',
    dateLabel: 'Kamis, 6 Agustus 2026',
    totalRevenue: 385000,
    totalHpp: 165000,
    totalProfit: 220000,
    totalItemsSold: 58,
    notes: 'Penjualan ramai sore hari jam 16:00 - 18:30. Pisang kukus & ubi cilembu favorit pembeli.',
    finalizedAt: '2026-08-06T20:30:00.000Z',
    items: [
      {
        menuItemId: 'menu-pisang-satuan',
        menuName: 'Pisang Kukus Kepok Kuning (Satuan)',
        unitName: 'biji',
        pricePerUnit: 3000,
        costPricePerUnit: 1200,
        soldQty: 30,
        totalRevenue: 90000,
        totalHpp: 36000,
        totalProfit: 54000,
      },
      {
        menuItemId: 'menu-ubi-satuan',
        menuName: 'Ubi Cilembu / Ungu Kukus (Satuan)',
        unitName: 'potong',
        pricePerUnit: 3500,
        costPricePerUnit: 1400,
        soldQty: 20,
        totalRevenue: 70000,
        totalHpp: 28000,
        totalProfit: 42000,
      },
      {
        menuItemId: 'menu-paket-besek',
        menuName: 'Paket Besek Mood Kukus Komplit (Oleh-oleh)',
        unitName: 'porsi',
        pricePerUnit: 25000,
        costPricePerUnit: 12500,
        soldQty: 7,
        totalRevenue: 175000,
        totalHpp: 87500,
        totalProfit: 87500,
      },
      {
        menuItemId: 'menu-air-botol',
        menuName: 'Air Mineral Botol 600ml Segar',
        unitName: 'botol',
        pricePerUnit: 5000,
        costPricePerUnit: 2500,
        soldQty: 10,
        totalRevenue: 50000,
        totalHpp: 25000,
        totalProfit: 25000,
      },
    ],
  },
  {
    id: 'rep-2026-08-05',
    date: '2026-08-05',
    dateLabel: 'Rabu, 5 Agustus 2026',
    totalRevenue: 310000,
    totalHpp: 132000,
    totalProfit: 178000,
    totalItemsSold: 44,
    notes: 'Hujan rintik sore hari, pesanan paket besek cocol gula aren paling diminati.',
    finalizedAt: '2026-08-05T21:00:00.000Z',
    items: [
      {
        menuItemId: 'menu-pisang-satuan',
        menuName: 'Pisang Kukus Kepok Kuning (Satuan)',
        unitName: 'biji',
        pricePerUnit: 3000,
        costPricePerUnit: 1200,
        soldQty: 25,
        totalRevenue: 75000,
        totalHpp: 30000,
        totalProfit: 45000,
      },
      {
        menuItemId: 'menu-jagung-satuan',
        menuName: 'Jagung Manis Kukus Pipil (Satuan)',
        unitName: 'tongkol',
        pricePerUnit: 4000,
        costPricePerUnit: 1800,
        soldQty: 15,
        totalRevenue: 60000,
        totalHpp: 27000,
        totalProfit: 33000,
      },
      {
        menuItemId: 'menu-paket-besek',
        menuName: 'Paket Besek Mood Kukus Komplit (Oleh-oleh)',
        unitName: 'porsi',
        pricePerUnit: 25000,
        costPricePerUnit: 12500,
        soldQty: 5,
        totalRevenue: 125000,
        totalHpp: 62500,
        totalProfit: 62500,
      },
      {
        menuItemId: 'menu-air-botol',
        menuName: 'Air Mineral Botol 600ml Segar',
        unitName: 'botol',
        pricePerUnit: 5000,
        costPricePerUnit: 2500,
        soldQty: 10,
        totalRevenue: 50000,
        totalHpp: 25000,
        totalProfit: 25000,
      },
    ],
  },
];

