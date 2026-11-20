import path from "path"
import fs from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const SITE = "https://mazen.manhaaji.com"

// After build: SPA fallback (404.html) + a sitemap that lists every project.
function postBuild(): Plugin {
  return {
    name: "post-build",
    apply: "build",
    writeBundle() {
      fs.copyFileSync("dist/index.html", "dist/404.html")
      const data = JSON.parse(fs.readFileSync("src/data/projects.json", "utf8"))
      const today = new Date().toISOString().slice(0, 10)
      const urls = [
        { loc: `${SITE}/`, pr: "1.0", mod: today },
        { loc: `${SITE}/portfolio`, pr: "0.9", mod: today },
        ...data.projects
          .filter((p: { hidden?: boolean }) => !p.hidden)
          .map((p: { id: string; added?: string }) => ({ loc: `${SITE}/portfolio/${p.id}`, pr: "0.8", mod: p.added || today })),
      ]
      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.mod}</lastmod><priority>${u.pr}</priority></url>`).join("\n") +
        `\n</urlset>\n`
      fs.writeFileSync("dist/sitemap.xml", xml)
      // Real pages for every route, so GitHub Pages answers 200 (not the 404 fallback) — better for Google and link previews.
      const html = fs.readFileSync("dist/index.html", "utf8")
      const routes = ["portfolio", ...data.projects.filter((p: { hidden?: boolean }) => !p.hidden).map((p: { id: string }) => `portfolio/${p.id}`)]
      for (const r of routes) {
        fs.mkdirSync(`dist/${r}`, { recursive: true })
        fs.writeFileSync(`dist/${r}/index.html`, html)
      }
    },
  }
}

// Live preview for Mazen Studio: a saved data file reloads the whole page
// (hot-swapping the language context would crash the running app).
function dataReload(): Plugin {
  return {
    name: "data-full-reload",
    apply: "serve",
    handleHotUpdate({ file, server }) {
      if (/[\\/]src[\\/]data[\\/][^\\/]+\.json$/.test(file)) {
        server.ws.send({ type: "full-reload" })
        return []
      }
    },
  }
}

export default defineConfig({
  base: "/",
  plugins: [react(), postBuild(), dataReload()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: a content update only re-downloads app code.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["gsap", "lenis", "framer-motion"],
        },
      },
    },
  },
})
