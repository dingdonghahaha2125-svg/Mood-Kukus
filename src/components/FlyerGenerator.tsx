import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  Copy,
  Flame,
  UtensilsCrossed,
  PhoneCall,
  MapPin,
  RefreshCw,
  Sliders,
  Instagram,
  Facebook,
  Smartphone,
  Check,
} from 'lucide-react';
import { toJpeg, toPng } from 'html-to-image';
import { MenuItem, SauceItem } from '../types';
import { formatRp } from '../utils/calculations';

interface FlyerGeneratorProps {
  menuItems: MenuItem[];
  sauces: SauceItem[];
}

export type PlatformPreset = 'instagram_feed' | 'instagram_story' | 'threads_portrait' | 'facebook_post';

export interface AspectPresetConfig {
  id: PlatformPreset;
  name: string;
  icon: any;
  aspectClass: string;
  width: number;
  height: number;
  badge: string;
}

const PRESETS: AspectPresetConfig[] = [
  {
    id: 'instagram_feed',
    name: 'Instagram Feed (1:1)',
    icon: Instagram,
    aspectClass: 'aspect-square w-full max-w-[480px]',
    width: 1080,
    height: 1080,
    badge: '1080 x 1080 px',
  },
  {
    id: 'threads_portrait',
    name: 'Threads / IG Portrait (4:5)',
    icon: Smartphone,
    aspectClass: 'aspect-[4/5] w-full max-w-[420px]',
    width: 1080,
    height: 1350,
    badge: '1080 x 1350 px',
  },
  {
    id: 'instagram_story',
    name: 'Story / TikTok / Reels (9:16)',
    icon: Smartphone,
    aspectClass: 'aspect-[9/16] w-full max-w-[340px]',
    width: 1080,
    height: 1920,
    badge: '1080 x 1920 px',
  },
  {
    id: 'facebook_post',
    name: 'Facebook Banner (16:9)',
    icon: Facebook,
    aspectClass: 'aspect-[16/9] w-full max-w-[560px]',
    width: 1200,
    height: 675,
    badge: '1200 x 675 px',
  },
];

export const FlyerGenerator: React.FC<FlyerGeneratorProps> = ({ menuItems, sauces }) => {
  const flyerRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [selectedPreset, setSelectedPreset] = useState<PlatformPreset>('instagram_feed');
  const [templateTheme, setTemplateTheme] = useState<'bambu' | 'twilight' | 'sunset' | 'mint'>('bambu');
  const [headlineText, setHeadlineText] = useState('KUKUSAN SEHAT & SEGAR MAMUJU 🍌🌾');
  const [subHeadline, setSubHeadline] = useState('Anget-Anget Dari Pengukus! Siap Menemani Mood Hari Ini');
  const [promoBadge, setPromoBadge] = useState('PROMO SPESIAL BATCH HARI INI');
  const [sauceOffer, setSauceOffer] = useState('Gratis Saus Santan Gula Aren / Sambal Roa Khas Mamuju!');
  const [contactWa, setContactWa] = useState('0812-3456-7890');
  const [locationText, setLocationText] = useState('Mamuju, Sulawesi Barat');
  
  // Selected Menu items to show on flyer
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>(() =>
    menuItems.map((m) => m.id)
  );

  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'jpg' | 'png'>('jpg');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentPreset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];

  const handleToggleMenu = (id: string) => {
    if (selectedMenuIds.includes(id)) {
      if (selectedMenuIds.length > 1) {
        setSelectedMenuIds(selectedMenuIds.filter((item) => item !== id));
      }
    } else {
      setSelectedMenuIds([...selectedMenuIds, id]);
    }
  };

  // Download flyer image function
  const handleDownloadFlyer = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);

    try {
      const node = flyerRef.current;
      const options = {
        quality: 0.95,
        pixelRatio: 2, // Ultra crisp output
      };

      let dataUrl = '';
      if (downloadFormat === 'jpg') {
        dataUrl = await toJpeg(node, options);
      } else {
        dataUrl = await toPng(node, options);
      }

      const link = document.createElement('a');
      const filename = `MoodKukusMamuju_Flyer_${selectedPreset}_${new Date().toISOString().split('T')[0]}.${downloadFormat}`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Gagal mendownload gambar flyer. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  // Theme styling mapping
  const themeStyles = {
    bambu: {
      bg: 'bg-gradient-to-br from-stone-900 via-amber-950/40 to-stone-900',
      border: 'border-amber-600/50',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500 text-stone-950 font-black',
      cardBg: 'bg-stone-900/90 border-amber-800/40',
      cardBorder: 'border-amber-700/30',
      priceText: 'text-amber-300 font-extrabold',
      headerGradient: 'from-amber-500 to-emerald-500',
    },
    twilight: {
      bg: 'bg-gradient-to-br from-stone-950 via-emerald-950/60 to-stone-900',
      border: 'border-emerald-500/50',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-400 text-stone-950 font-black',
      cardBg: 'bg-stone-900/90 border-emerald-800/40',
      cardBorder: 'border-emerald-700/30',
      priceText: 'text-teal-300 font-extrabold',
      headerGradient: 'from-emerald-400 to-teal-300',
    },
    sunset: {
      bg: 'bg-gradient-to-br from-stone-900 via-rose-950/50 to-amber-950/40',
      border: 'border-rose-500/50',
      accentText: 'text-rose-400',
      badgeBg: 'bg-rose-500 text-white font-black',
      cardBg: 'bg-stone-900/90 border-rose-800/40',
      cardBorder: 'border-rose-700/30',
      priceText: 'text-amber-300 font-extrabold',
      headerGradient: 'from-rose-400 to-amber-400',
    },
    mint: {
      bg: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900',
      border: 'border-teal-400/50',
      accentText: 'text-teal-300',
      badgeBg: 'bg-teal-300 text-stone-950 font-black',
      cardBg: 'bg-stone-950/80 border-teal-800/40',
      cardBorder: 'border-teal-700/30',
      priceText: 'text-emerald-300 font-extrabold',
      headerGradient: 'from-teal-300 to-emerald-400',
    },
  }[templateTheme];

  const displayedMenuItems = menuItems.filter((m) => selectedMenuIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-stone-950 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-100">
              Pembuat Flyer Promosi Otomatis Harian
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">
            Generate gambar promosi instan siap posting di Instagram, Facebook, TikTok, & Threads lengkap dengan harga per item dan lokasi Mamuju.
          </p>
        </div>

        {/* Format Selector & Download Button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <div className="bg-stone-800 border border-stone-700 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setDownloadFormat('jpg')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                downloadFormat === 'jpg'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              JPG / JPEG
            </button>
            <button
              onClick={() => setDownloadFormat('png')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                downloadFormat === 'png'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              PNG
            </button>
          </div>

          <button
            onClick={handleDownloadFlyer}
            disabled={downloading}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Memproses Gambar...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" />
                <span>Download Flyer {downloadFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-5 shadow-xl">
          {/* 1. Platform Size Preset */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              1. Pilih Ukuran Platform Medsos:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-stone-800/60 border-stone-700/80 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="font-bold text-xs">{preset.name}</div>
                    <div className="text-[10px] text-stone-400">{preset.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Theme Selection */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              2. Tema & Warna Estetika Flyer:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bambu', label: 'Warm Eco Bambu', colorClass: 'from-amber-600 to-amber-900' },
                { id: 'twilight', label: 'Twilight Mamuju', colorClass: 'from-emerald-600 to-teal-900' },
                { id: 'sunset', label: 'Sunset Sulbar', colorClass: 'from-rose-600 to-amber-800' },
                { id: 'mint', label: 'Fresh Clean Mint', colorClass: 'from-teal-500 to-emerald-800' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTemplateTheme(theme.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    templateTheme === theme.id
                      ? 'bg-stone-800 border-stone-200 text-white ring-1 ring-stone-200'
                      : 'bg-stone-800/40 border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${theme.colorClass} border border-stone-400`} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Text & Copy Content */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              3. Teks Header & Promo Flyer:
            </label>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-400 block mb-1">Badge Headline Banner:</span>
                <input
                  type="text"
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="text-stone-400 block mb-1">Judul Utama Promosi:</span>
                <input
                  type="text"
                  value={headlineText}
                  onChange={(e) => setHeadlineText(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <span className="text-stone-400 block mb-1">Sub-Judul / Slogan:</span>
                <input
                  type="text"
                  value={subHeadline}
                  onChange={(e) => setSubHeadline(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="text-stone-400 block mb-1">Penawaran Saus Cocolan:</span>
                <input
                  type="text"
                  value={sauceOffer}
                  onChange={(e) => setSauceOffer(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block mb-1">No. WhatsApp Order:</span>
                  <input
                    type="text"
                    value={contactWa}
                    onChange={(e) => setContactWa(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">Lokasi Stand:</span>
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Menu Selection */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                4. Menu Item yang Ditampilkan:
              </span>
              <span className="text-[10px] text-stone-400">({selectedMenuIds.length} terpilih)</span>
            </label>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {menuItems.map((menu) => {
                const isChecked = selectedMenuIds.includes(menu.id);
                return (
                  <button
                    key={menu.id}
                    onClick={() => handleToggleMenu(menu.id)}
                    className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-stone-800 border-emerald-500/80 text-stone-100'
                        : 'bg-stone-800/30 border-stone-800 text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-stone-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-semibold line-clamp-1">{menu.name}</span>
                    </div>
                    <span className="font-bold text-emerald-400">{formatRp(menu.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Frame (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-300 font-bold text-sm">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Live Preview Flyer Promosi Medsos
            </div>
            <span className="text-xs bg-stone-800 text-stone-400 border border-stone-700 px-2.5 py-1 rounded-full font-mono">
              {currentPreset.badge}
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 sm:p-6 flex items-center justify-center overflow-hidden shadow-2xl min-h-[500px]">
            <div
              ref={flyerRef}
              className={`relative overflow-hidden rounded-2xl border ${themeStyles.border} ${themeStyles.bg} text-stone-100 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 ${currentPreset.aspectClass}`}
              style={{
                boxSizing: 'border-box',
              }}
            >
              {/* Background Decorative Ripples */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* TOP BRAND HEADER */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  {/* Brand Logo & Name */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-black shadow-lg">
                      <UtensilsCrossed className="w-6 h-6 text-stone-950" />
                    </div>
                    <div>
                      <h1 className="font-black text-lg sm:text-xl tracking-tight text-white uppercase leading-none">
                        MOOD KUKUS
                      </h1>
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                        MAMUJU • KULINER SEHAT
                      </span>
                    </div>
                  </div>

                  {/* Promo Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${themeStyles.badgeBg} shadow-md`}>
                    {promoBadge}
                  </span>
                </div>

                {/* Main Headlines */}
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <h2 className={`font-black text-xl sm:text-2xl leading-tight text-transparent bg-clip-text bg-gradient-to-r ${themeStyles.headerGradient}`}>
                    {headlineText}
                  </h2>
                  <p className="text-xs text-stone-300 font-medium leading-relaxed">{subHeadline}</p>
                </div>
              </div>

              {/* MIDDLE: MENU ITEMS GRID */}
              <div className="relative z-10 my-4 space-y-2 flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Menu Kukusan Siap Santap Hari Ini:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {displayedMenuItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border ${themeStyles.cardBg} backdrop-blur-md space-y-1 flex items-center justify-between shadow-md`}
                    >
                      <div>
                        <div className="font-extrabold text-xs text-stone-100 line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-stone-400">
                          {item.category === 'satuan' ? `Per ${item.unitName || 'biji'} kukus` : 'Porsi lengkap'}
                        </div>
                      </div>
                      <div className={`text-xs ${themeStyles.priceText} whitespace-nowrap ml-2`}>
                        {formatRp(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra Sauce Offer Box */}
                {sauceOffer && (
                  <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 shadow">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>{sauceOffer}</span>
                  </div>
                )}
              </div>

              {/* BOTTOM FOOTER: LOCATION & ORDER DETAILS */}
              <div className="relative z-10 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-300">
                <div className="flex items-center gap-1 font-semibold text-emerald-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{locationText}</span>
                </div>
                <div className="flex items-center gap-1 font-extrabold text-amber-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WA: {contactWa}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
