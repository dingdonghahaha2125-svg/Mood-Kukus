import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Healthcheck endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", appName: "Mood Kukus Mamuju API" });
  });

  // AI Business Evaluator & Financial Advisor Endpoint
  app.post("/api/evaluate-business", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: "GEMINI_API_KEY tidak dikonfigurasi di environment variable.",
        });
        return;
      }

      const { financialSummary, lowStockItems, topMenuItems, customQuery } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Kamu adalah "KukusBot", seorang konsultan bisnis kuliner profesional dan ahli keuangan UMKM khusus bisnis kuliner kukusan per-item "Mood Kukus Mamuju" (makanan sehat khas Mamuju: Pisang Rebus/Kukus, Ubi Kukus, Telur Rebus, Jagung Manis per item/biji & paket besek, lengkap dengan Saus Cocolan khas).
Berikut adalah data real-time bisnis Mood Kukus Mamuju saat ini:

--- RINGKASAN KEUANGAN ---
- Total Pemasukan / Penjualan: Rp ${financialSummary?.totalRevenue?.toLocaleString("id-ID") || 0}
- Total Modal / Pengeluaran: Rp ${financialSummary?.totalExpenses?.toLocaleString("id-ID") || 0}
- Modal Awal Terinvestasi: Rp ${financialSummary?.totalCapital?.toLocaleString("id-ID") || 0}
- Laba Bersih Real-time: Rp ${financialSummary?.netProfit?.toLocaleString("id-ID") || 0}
- Profit Margin: ${financialSummary?.profitMargin || 0}%

--- STOK MENIPIS / PERLU RESTOCK ---
${lowStockItems && lowStockItems.length > 0 ? lowStockItems.map((item: any) => `- ${item.name}: sisa ${item.currentStock} ${item.unit} (Batas min: ${item.minStock} ${item.unit})`).join("\n") : "Semua stok bahan baku aman."}

--- MENU & ITEM TERLARIS ---
${topMenuItems && topMenuItems.length > 0 ? topMenuItems.map((item: any) => `- ${item.name}: ${item.sold || 0} terjual`).join("\n") : "Belum ada histori data porsi/item."}

--- PERTANYAAN / PERMINTAAN PEMILIK MOOD KUKUS MAMUJU ---
${customQuery || "Berikan evaluasi keuangan umum, analisis profit, dan 3 saran strategis efisiensi bahan baku per-item & penjualan harian untuk Mood Kukus Mamuju."}

INSTRUKSI KHUSUS:
1. Berikan jawaban yang ramah, profesional, solutif, dan mudah dipahami dalam Bahasa Indonesia.
2. Gunakan format Markdown rapi dengan emoji yang relevan.
3. Fokus pada saran praktis usaha Mood Kukus Mamuju (pisang Kepok Mamuju, ubi manis, telur rebus, jagung kukus, saus cocolan gula aren / keju / cokelat, dan kemasan besek eco).
4. Berikan tips konkret mengoptimalkan HPP (Harga Pokok Penjualan) per item/biji, pengelolaan sisa bahan kukusan harian, dan strategi pencatatan stok per-item yang efektif.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({
        result: response.text,
      });
    } catch (err: any) {
      console.error("Error in AI Evaluation:", err);
      res.status(500).json({
        error: err.message || "Gagal menghasilkan analisis bisnis AI.",
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server KukusLokal running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
