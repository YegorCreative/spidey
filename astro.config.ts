import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { site } from "./src/config/site";

export default defineConfig({
  site: site.origin,
  base: site.base,
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("search-index"),
    }),
  ],
  build: {
    format: "directory",
  },
});
