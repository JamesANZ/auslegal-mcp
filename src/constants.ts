// Australian Legal Database URLs for Web Scraping
export const AUSTLII_BASE = "https://www.austlii.edu.au";
export const AUSTLII_SEARCH_BASE =
  "https://www.austlii.edu.au/cgi-bin/sinosrch.cgi";
export const FEDERAL_LEGISLATION_BASE = "https://www.legislation.gov.au";
export const FEDERAL_LEGISLATION_SEARCH =
  "https://www.legislation.gov.au/search";
export const HIGH_COURT_BASE = "https://www.hcourt.gov.au";
export const HIGH_COURT_SEARCH = "https://www.hcourt.gov.au/search";
export const FEDERAL_COURT_BASE = "https://www.fedcourt.gov.au";
export const NSW_LEGISLATION_BASE = "https://legislation.nsw.gov.au";
export const NSW_LEGISLATION_SEARCH = "https://legislation.nsw.gov.au/search";
export const VIC_LEGISLATION_BASE = "https://www.legislation.vic.gov.au";
export const VIC_LEGISLATION_SEARCH =
  "https://www.legislation.vic.gov.au/search";
export const QLD_LEGISLATION_BASE = "https://www.legislation.qld.gov.au";
export const QLD_LEGISLATION_SEARCH =
  "https://www.legislation.qld.gov.au/search";
export const WA_LEGISLATION_BASE = "https://www.legislation.wa.gov.au";
export const WA_LEGISLATION_SEARCH = "https://www.legislation.wa.gov.au/search";
export const SA_LEGISLATION_BASE = "https://www.legislation.sa.gov.au";
export const SA_LEGISLATION_SEARCH = "https://www.legislation.sa.gov.au/search";
export const TAS_LEGISLATION_BASE = "https://www.legislation.tas.gov.au";
export const TAS_LEGISLATION_SEARCH =
  "https://www.legislation.tas.gov.au/search";
export const NT_LEGISLATION_BASE = "https://legislation.nt.gov.au";
export const NT_LEGISLATION_SEARCH = "https://legislation.nt.gov.au/search";
export const ACT_LEGISLATION_BASE = "https://www.legislation.act.gov.au";
export const ACT_LEGISLATION_SEARCH =
  "https://www.legislation.act.gov.au/search";

// User agent for web scraping
export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Web scraping configuration
export const SCRAPING_CONFIG = {
  TIMEOUT: 30000,
  WAIT_FOR_SELECTOR_TIMEOUT: 15000,
  RANDOM_DELAY_MIN: 1000,
  RANDOM_DELAY_MAX: 3000,
  VIEWPORT: { width: 1920, height: 1080 },
  BROWSER_ARGS: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
    "--disable-web-security",
    "--disable-features=VizDisplayCompositor",
  ],
};

// CSS selectors for different websites
export const SELECTORS = {
  AUSTLII: {
    results: ".result, .search-result, .item",
    title: "h3 a, .title a, .name a",
    snippet: ".snippet, .summary, .description",
    database: ".database, .source, .jurisdiction",
    jurisdiction: ".jurisdiction, .state, .region",
    date: ".date, .year, .published",
  },
  FEDERAL_LEGISLATION: {
    results: ".search-result, .result-item, .item, .legislation-item",
    title: "h3 a, .title a, .name a, .legislation-title a",
    actNumber: ".act-number, .number, .legislation-number",
    year: ".year, .date, .legislation-year",
    status: ".status, .state, .legislation-status",
    description: ".description, .summary, .legislation-description",
  },
  NSW_LEGISLATION: {
    results: ".search-result, .result, .item, .legislation-item",
    title: "h3 a, .title a, .name a, .legislation-title a",
    actNumber: ".act-number, .number, .legislation-number",
    year: ".year, .date, .legislation-year",
    status: ".status, .state, .legislation-status",
  },
  HIGH_COURT: {
    results: ".search-result, .case-result, .item, .case-item",
    title: "h3 a, .title a, .case-name a, .name a",
    citation: ".citation, .cite, .case-citation",
    date: ".date, .decision-date, .case-date",
    catchwords: ".catchwords, .keywords, .case-catchwords",
    summary: ".summary, .headnote, .case-summary",
  },
};
