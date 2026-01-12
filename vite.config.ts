import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";

const SITE_URL = "https://j2ltextiles.fr";

function generateProductSlug(sku: string, name?: string | null): string {
  const skuLower = sku.toLowerCase();
  if (!name) return skuLower;

  const nameSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  return `${skuLower}-${nameSlug}`;
}

function generateSitemapProductsPlugin(mode: string) {
  return {
    name: "generate-sitemap-products",
    async buildStart() {
      try {
        const env = loadEnv(mode, process.cwd(), "");
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          console.warn(
            "[sitemap] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY; skipping sitemap-products.xml generation.",
          );
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const pageSize = 1000;
        let offset = 0;
        const products: Array<{ sku: string; name: string | null; updated_at: string | null }> = [];

        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select("sku,name,updated_at")
            .order("sku", { ascending: true })
            .range(offset, offset + pageSize - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          products.push(...data);

          if (data.length < pageSize) break;
          offset += pageSize;
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for (const p of products) {
          const slug = generateProductSlug(p.sku, p.name);
          const lastmod = p.updated_at
            ? new Date(p.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

          xml += `  <url>\n    <loc>${SITE_URL}/produit/${encodeURIComponent(slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }

        xml += `</urlset>\n`;

        await fs.writeFile("public/sitemap-products.xml", xml, "utf8");
        console.log(`[sitemap] Wrote public/sitemap-products.xml with ${products.length} products.`);
      } catch (e) {
        console.warn("[sitemap] Failed to generate sitemap-products.xml:", e);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    generateSitemapProductsPlugin(mode),
    // Gzip compression for production
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    // Brotli compression for production
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
          ],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
    // Use esbuild for minification (built-in, no extra dependency)
    minify: "esbuild",
    // Target modern browsers for smaller bundles
    target: "es2020",
    // CSS code splitting
    cssCodeSplit: true,
  },
}));
