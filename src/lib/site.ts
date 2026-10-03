/**
 * site.ts — Keystatic removed. Site data comes from site.config.ts only.
 * =========================================================================
 * Update site.config.ts directly and git push to redeploy — no CMS layer.
 * Kept as a thin re-export (rather than having every page import
 * site.config.ts directly) so existing `import { site } from "../lib/site"`
 * calls across the codebase did not need to change.
 */

export { siteConfig as site } from "../site.config";
export { siteConfig } from "../site.config";
