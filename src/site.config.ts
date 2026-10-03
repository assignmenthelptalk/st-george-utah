/**
 * site.config.ts — the ONLY file you change per city.
 * ======================================================
 * This is the factory template's single source of truth for everything
 * that differs between city sites: identity, water hardness data, SEO
 * targeting, local geography, and monetisation links.
 *
 * It is intentionally city-agnostic. Every value below is a placeholder
 * token in SCREAMING_SNAKE_CASE so a half-provisioned site is immediately
 * obvious in the rendered output — if you see "CITY_NAME" on a live page,
 * this file was never filled in.
 *
 * No CMS layer (Keystatic was removed — this is a phone-call-based
 * rank-and-rent model). To update the phone number, email, or any other
 * detail after a tenant signs, edit the fields below directly and
 * `git push` — Vercel rebuilds and redeploys automatically. See
 * PROVISION.md's "CMS — No Keystatic" section for the full workflow.
 *
 * See PROVISION.md for the full step-by-step process of turning this
 * boilerplate into a live city site.
 */

export interface ServiceAreaNeighbourhood {
  /** Real, named residential community only — never a road, highway, or
   * recreation area. Run the neighbourhood verification checklist in
   * PROVISION.md Step 5c before adding any entry here. */
  name: string;
  /** Optional one-line description of this community. */
  note?: string;
}

export interface ServiceAreaFaq {
  question: string;
  answer: string;
}

/**
 * ServiceArea — one entry per surrounding city a provisioner has verified
 * via the QDP test (PROVISION.md Step 5c). A page is only generated for an
 * entry once qdp.verified === true AND qdp.verdict === 'PASS' — see
 * src/pages/[serviceArea]/index.astro's getStaticPaths filter.
 */
export interface ServiceArea {
  // ── Identity ────────────────────────────────────────────────────────────
  /** URL slug e.g. "eastville" → /eastville/ */
  slug: string;
  /** Display city name e.g. "Eastville" */
  city: string;
  /** Two-letter state abbreviation e.g. "OH" */
  stateAbbr: string;
  /** County name e.g. "Example County" */
  county: string;
  /** Verified population e.g. "16,000" */
  population: string;
  /** Verified ZIP codes */
  zipCodes: string[];

  // ── Water data — must be verified against real utility data ───────────
  /** Lower bound of local hardness range */
  gpgLow: number;
  /** Upper bound of local hardness range */
  gpgHigh: number;
  /** WQA classification e.g. "Very Hard" */
  gpgLabel: string;
  /** Exact official name of the water authority */
  waterAuthority: string;
  /** Water source description */
  waterSource: string;

  // ── Distance and relationship to the primary city ──────────────────────
  /** e.g. "7 miles southeast" */
  distanceFromPrimary: string;
  /** e.g. "separately incorporated city" or "unincorporated county community" */
  relationship: string;

  // ── Page content ────────────────────────────────────────────────────────
  /** Under 60 chars */
  metaTitle: string;
  /** Under 160 chars */
  metaDesc: string;
  /** Page H1 — must contain city + state */
  h1: string;
  /** H1 subheading — one line */
  h1Sub: string;
  /** e.g. "12–16 GPG" */
  heroStat: string;
  /** e.g. "Eastville Water Hardness" */
  heroStatLabel: string;
  /** e.g. "VERY HARD" */
  heroStatBadge: string;
  /** City-specific GPG explanation paragraph */
  gpgNote: string;
  /** WQA classification note */
  wqaNote: string;

  /** VERIFIED residential areas only — no road names, recreation areas, or
   * vague descriptors. Empty array is valid and must render gracefully. */
  neighbourhoods: ServiceAreaNeighbourhood[];

  /** 4 city-specific benefits — not copy-pasted from the primary city */
  benefits: string[];

  /** 3+ city-specific FAQs */
  faqs: ServiceAreaFaq[];

  // ── Internal linking ────────────────────────────────────────────────────
  /** Page slugs this service area page links to, e.g. ["water-quality"].
   * Reserved for provisioners extending internal-linking automation —
   * not rendered by the base ServiceAreaLayout component. */
  internalLinksTo: string[];
  /** Links to other service area pages */
  nearbyAreas: { name: string; slug: string }[];

  // ── Testimonial placeholder ─────────────────────────────────────────────
  testimonial: {
    quote: string;
    name: string;
    location: string;
    /** Must be true until a real review exists */
    placeholder: boolean;
  };

  // ── QDP verification — required before a page is generated ─────────────
  qdp: {
    /** Must be true before a page is built for this entry */
    verified: boolean;
    /** Evidence of search volume */
    searchDemand: string;
    /** How this city differs from the primary city */
    differentFrom: string;
    verdict: "PASS" | "FAIL";
    /** ISO date e.g. "2026-09-12" */
    verifiedDate: string;
    /** Who verified e.g. "manual research" */
    verifiedBy: string;
  };

  // ── Data verification ────────────────────────────────────────────────────
  /** Must be true — all figures verified */
  dataVerified: boolean;
  /** URL or source used to verify data */
  verificationSource: string;
}

export interface SiteConfig {
  // ── Identity ────────────────────────────────────────────────────────────
  /** City name, e.g. "Las Vegas" */
  city: string;
  /** Full state name, e.g. "Nevada" */
  state: string;
  /** Two-letter state abbreviation, e.g. "NV" */
  stateAbbr: string;
  /** Live domain, no protocol, no trailing slash, e.g. "lasvegaswatersoftener.com" */
  domain: string;

  // ── Water hardness data ────────────────────────────────────────────────
  /** Lower bound of local hardness range, in grains per gallon (GPG) */
  gpgLow: number;
  /** Upper bound of local hardness range, in grains per gallon (GPG) */
  gpgHigh: number;
  /** Human label for the hardness range, e.g. "Very Hard" | "Extreme" */
  gpgLabel: string;
  /** Where the city's tap water comes from, e.g. "Municipal reservoir supply" */
  waterSource: string;
  /** The utility/authority that manages the water supply */
  waterAuthority: string;

  // ── SEO ─────────────────────────────────────────────────────────────────
  /** Primary exact-match keyword this domain targets */
  primaryKeyword: string;
  /** Monthly search volume for primaryKeyword, from keyword research */
  searchVol: number;
  /** Default meta description for the homepage */
  metaDescription: string;

  // ── Local data ──────────────────────────────────────────────────────────
  /** City population, formatted for display, e.g. "641,900" */
  population: string;
  /** Full county name including any suffix the county actually uses, e.g. "Example County" or "Orleans Parish" — pages interpolate this value as-is, with no " County" appended */
  county: string;
  /** 3+ real neighbourhoods/suburbs, used by neighbourhood.astro */
  neighbourhoods: string[];
  /** 3+ real ZIP codes served, used by the water-quality ZIP table */
  zipCodes: string[];

  // ── Monetisation ────────────────────────────────────────────────────────
  /** SpringWell affiliate link — softener */
  affiliateSoftener: string;
  /** SpringWell affiliate link — softener/filter combo */
  affiliateCombo: string;
  /** SpringWell affiliate link — reverse osmosis */
  affiliateRO: string;

  // ── Business identity — edit directly, no CMS ────────────────────────────
  /** The brand mention used everywhere across the site: nav logo, footer,
   * meta titles, every page's opening-paragraph brand-link, the homepage
   * H1/H3/hero paragraphs, and the LocalBusiness schema name. This is the
   * single source of truth for the brand string — no page hardcodes it.
   *
   * Two accepted formats, chosen per city based on domain availability
   * (check whichever domain you're buying before picking one):
   *   - "[City] Water Softener"   (city-first — use when this domain,
   *     e.g. albuquerquewatersoftener.com, is available)
   *   - "Water Softeners of [City]" (fallback — use when the city-first
   *     domain is taken, e.g. watersoftenerof[city].com is available instead)
   * Prefer city-first when both are available. Do not mix formats within
   * one site, and do not invent a third format — every page assumes one
   * of these two exact shapes. */
  businessName: string;
  /** Phone number — SCREAMING_SNAKE_CASE placeholder until a tenant signs.
   * Every phone display checks for this exact placeholder string (not just
   * truthiness) before rendering, so a half-provisioned site never shows
   * a fake number. Also used as the formsubmit.co destination via
   * businessEmail below — phone is the primary contact method, the
   * QuoteForm is a secondary option for homeowners who prefer a form. */
  phoneNumber: string;
  /** Business email — used as the formsubmit.co destination for QuoteForm
   * submissions. SCREAMING_SNAKE_CASE placeholder until a tenant signs. */
  businessEmail: string;
  /** Physical or service-area address — blank (not a placeholder token)
   * until a tenant signs; every usage hides gracefully when empty. */
  address: string;
  /** Google Business Profile URL — blank until claimed; used as the
   * footer link and the LocalBusiness schema's sameAs URL. */
  googleBusinessUrl: string;
  /** Fully-qualified site URL derived from `domain`, e.g. "https://example.com" */
  siteUrl: string;

  // ── About page facts — edit directly, no CMS ─────────────────────────────
  /** Founder/team name(s) shown on the About page — SCREAMING_SNAKE_CASE
   * placeholder until a tenant provides real names. Never invent a name. */
  founderNames: string;
  /** Year the tenant business was founded — SCREAMING_SNAKE_CASE placeholder
   * until a tenant confirms. Never invent a date. */
  foundedYear: string;
  /** Approximate customers served, shown in the About page Key Facts table —
   * SCREAMING_SNAKE_CASE placeholder until a tenant provides a real figure.
   * If used illustratively before a tenant signs, label it "(illustrative)"
   * or similar rather than presenting it as a real, unverified statistic. */
  customersServed: string;
  /** Approximate projects delivered, shown in the About page Key Facts
   * table — same placeholder rule as customersServed. */
  projectsDelivered: string;

  // ── Design tokens (deep teal + warm orange defaults; other cities override) ─────
  design: {
    /** Primary brand color — deep teal or navy, hex */
    primaryColor: string;
    /** Light tint of the primary color, used for backgrounds/highlights */
    primaryLight: string;
    /** CTA/accent color — warm orange or amber, hex */
    accentColor: string;
    /** Heading font family name */
    headingFont: string;
    /** Body font family name */
    bodyFont: string;
    /** Default border radius for cards/buttons */
    borderRadius: string;
    /** Color used for the GPG stat callout component */
    gpgStatColor: string;
  };

  // ── Service area subpages ────────────────────────────────────────────────
  /** Empty array if no service areas built yet. Populate only after each
   * entry passes the QDP test — see PROVISION.md Step 5c. */
  serviceAreas: ServiceArea[];
}

// Declared separately so siteUrl below can derive from it without
// duplicating the literal.
const domain = "watersoftenerstgeorgeutah.com";

export const siteConfig: SiteConfig = {
  // Identity
  city: "St George",
  state: "Utah",
  stateAbbr: "UT",
  domain,

  // Water hardness data
  gpgLow: 13,
  gpgHigh: 24,
  gpgLabel: "Very Hard",
  waterSource: "Virgin River water treated at the Quail Creek plant and delivered by the Washington County Water Conservancy District (about 70%), plus city-owned groundwater wells and springs in the Navajo Sandstone aquifer (about 30%)",
  waterAuthority: "City of St. George Water Services",

  // SEO
  primaryKeyword: "water softener st george utah",
  searchVol: 0, // unverified — no keyword-tool access
  metaDescription: "Water softener installation and repair in St George, UT. City water runs 13-24 GPG (very hard). Get a free quote from a local team today.",

  // Local data
  population: "95,342",
  county: "Washington County",
  neighbourhoods: ["Bloomington", "Bloomington Hills", "Green Valley", "Sun River", "Little Valley"],
  zipCodes: ["84770", "84790", "84791"],

  // Monetisation
  affiliateSoftener: "https://springwellwater.com/follow/softener/",
  affiliateCombo: "https://springwellwater.com/follow/combo/",
  affiliateRO: "https://springwellwater.com/follow/ro/",

  // Business identity — edit directly, no CMS
  businessName: "St George Water Softener",
  phoneNumber: "PHONE_NUMBER",
  businessEmail: "BUSINESS_EMAIL",
  address: "",
  googleBusinessUrl: "",
  siteUrl: `https://${domain}`,

  // About page facts — edit directly, no CMS
  founderNames: "FOUNDER_NAMES",
  foundedYear: "FOUNDED_YEAR",
  customersServed: "CUSTOMERS_SERVED",
  projectsDelivered: "PROJECTS_DELIVERED",

  // Design tokens (deep teal + warm orange defaults — other cities override these)
  design: {
    primaryColor: "#17496B",
    primaryLight: "#E6EFF5",
    accentColor: "#C2562B",
    headingFont: "DM Serif Display",
    bodyFont: "Inter",
    borderRadius: "8px",
    gpgStatColor: "#17496B",
  },

  serviceAreas: [],
  // Populate this array when adding service area pages.
  // Each entry must pass the QDP test before the page is built.
  // See PROVISION.md Step 5c for the full QDP checklist.
  // All neighbourhood names must be verified residential communities —
  // do not list road names, recreation areas, or vague descriptors.
};
