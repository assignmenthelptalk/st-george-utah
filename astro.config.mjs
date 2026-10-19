import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/site.config.ts";

// Keystatic removed (phone-call-based rank-and-rent model — the operator
// edits site.config.ts directly and redeploys). No serverless routes are
// needed anymore, so the whole site builds as pure static output.
export default defineConfig({
  site: `https://${siteConfig.domain}`,
  output: "static",
  adapter: vercel(),
  integrations: [react(), sitemap()],
  image: {
    // Allows astro:assets's <Image /> to optimize the placehold.co hero
    // placeholder used until a city site is provisioned with a real photo.
    domains: ["placehold.co"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
