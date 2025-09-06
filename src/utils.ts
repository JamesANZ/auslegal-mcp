import {
  Legislation,
  CaseLaw,
  LegalResearch,
  AustLIIResult,
  LegislationSearchResult,
  CaseLawSearchResult,
  LegalDatabase,
  AUSTRALIAN_JURISDICTIONS,
} from "./types.js";
import puppeteer from "puppeteer";
import {
  AUSTLII_BASE,
  AUSTLII_SEARCH_BASE,
  FEDERAL_LEGISLATION_BASE,
  FEDERAL_LEGISLATION_SEARCH,
  HIGH_COURT_BASE,
  HIGH_COURT_SEARCH,
  FEDERAL_COURT_BASE,
  NSW_LEGISLATION_BASE,
  NSW_LEGISLATION_SEARCH,
  VIC_LEGISLATION_BASE,
  VIC_LEGISLATION_SEARCH,
  QLD_LEGISLATION_BASE,
  QLD_LEGISLATION_SEARCH,
  WA_LEGISLATION_BASE,
  WA_LEGISLATION_SEARCH,
  SA_LEGISLATION_BASE,
  SA_LEGISLATION_SEARCH,
  TAS_LEGISLATION_BASE,
  TAS_LEGISLATION_SEARCH,
  NT_LEGISLATION_BASE,
  NT_LEGISLATION_SEARCH,
  ACT_LEGISLATION_BASE,
  ACT_LEGISLATION_SEARCH,
  USER_AGENT,
  SCRAPING_CONFIG,
  SELECTORS,
} from "./constants.js";

// Utility function to add random delay to avoid rate limiting
function randomDelay(): Promise<void> {
  const delay =
    Math.random() *
      (SCRAPING_CONFIG.RANDOM_DELAY_MAX - SCRAPING_CONFIG.RANDOM_DELAY_MIN) +
    SCRAPING_CONFIG.RANDOM_DELAY_MIN;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Utility function to wait for any of multiple selectors
async function waitForAnySelector(
  page: any,
  selectors: string[],
  timeout: number = SCRAPING_CONFIG.WAIT_FOR_SELECTOR_TIMEOUT,
): Promise<string | null> {
  const promises = selectors.map((selector) =>
    page
      .waitForSelector(selector, { timeout })
      .then(() => selector)
      .catch(() => null),
  );

  const results = await Promise.allSettled(promises);
  const successful = results.find(
    (result) => result.status === "fulfilled" && result.value !== null,
  );
  return successful
    ? (successful as PromiseFulfilledResult<string>).value
    : null;
}

// Search AustLII for legal materials
export async function searchAustLII(
  query: string,
  jurisdiction?: keyof typeof AUSTRALIAN_JURISDICTIONS,
  type?: "Legislation" | "Case Law" | "Secondary Material",
  limit: number = 20,
): Promise<AustLIIResult[]> {
  try {
    await randomDelay();

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [...SCRAPING_CONFIG.BROWSER_ARGS, `--user-agent=${USER_AGENT}`],
      });

      const page = await browser.newPage();
      await page.setViewport(SCRAPING_CONFIG.VIEWPORT);
      await page.setUserAgent(USER_AGENT);

      // Build search URL
      let searchUrl = `${AUSTLII_SEARCH_BASE}?query=${encodeURIComponent(query)}&metaname=all&path=all`;

      if (jurisdiction && jurisdiction !== "CTH") {
        searchUrl += `&jurisdiction=${jurisdiction.toLowerCase()}`;
      }

      if (type) {
        searchUrl += `&type=${type.toLowerCase().replace(" ", "_")}`;
      }

      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: SCRAPING_CONFIG.TIMEOUT,
      });

      // Wait for results using multiple selectors
      const foundSelector = await waitForAnySelector(
        page,
        SELECTORS.AUSTLII.results.split(", "),
      );
      if (!foundSelector) {
        return [];
      }

      return await page.evaluate((selectors) => {
        const results: AustLIIResult[] = [];
        const resultElements = document.querySelectorAll(selectors.results);

        resultElements.forEach((element) => {
          const titleElement = element.querySelector(selectors.title);
          const title = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const snippetElement = element.querySelector(selectors.snippet);
          const snippet = snippetElement?.textContent?.trim() || "";

          const databaseElement = element.querySelector(selectors.database);
          const database = databaseElement?.textContent?.trim() || "";

          const jurisdictionElement = element.querySelector(
            selectors.jurisdiction,
          );
          const jurisdiction = jurisdictionElement?.textContent?.trim() || "";

          const dateElement = element.querySelector(selectors.date);
          const date = dateElement?.textContent?.trim() || "";

          if (title && title.length > 5) {
            results.push({
              title,
              url,
              snippet,
              database,
              jurisdiction,
              date,
              type: database.toLowerCase().includes("act")
                ? "Legislation"
                : database.toLowerCase().includes("case")
                  ? "Case Law"
                  : "Secondary Material",
            });
          }
        });

        return results;
      }, SELECTORS.AUSTLII);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    return [];
  }
}

// Search Federal Register of Legislation
export async function searchFederalLegislation(
  query: string,
  limit: number = 20,
): Promise<LegislationSearchResult[]> {
  try {
    await randomDelay();

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [...SCRAPING_CONFIG.BROWSER_ARGS, `--user-agent=${USER_AGENT}`],
      });

      const page = await browser.newPage();
      await page.setViewport(SCRAPING_CONFIG.VIEWPORT);
      await page.setUserAgent(USER_AGENT);

      const searchUrl = `${FEDERAL_LEGISLATION_SEARCH}?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: SCRAPING_CONFIG.TIMEOUT,
      });

      // Wait for results using multiple selectors
      const foundSelector = await waitForAnySelector(
        page,
        SELECTORS.FEDERAL_LEGISLATION.results.split(", "),
      );
      if (!foundSelector) {
        return [];
      }

      return await page.evaluate((selectors) => {
        const results: LegislationSearchResult[] = [];
        const resultElements = document.querySelectorAll(selectors.results);

        resultElements.forEach((element) => {
          const titleElement = element.querySelector(selectors.title);
          const title = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const actNumberElement = element.querySelector(selectors.actNumber);
          const actNumber = actNumberElement?.textContent?.trim() || "";

          const yearElement = element.querySelector(selectors.year);
          const yearText = yearElement?.textContent?.trim() || "";
          const year = yearText
            ? parseInt(yearText.match(/\d{4}/)?.[0] || "")
            : undefined;

          const statusElement = element.querySelector(selectors.status);
          const status = statusElement?.textContent?.trim() || "";

          const descriptionElement = element.querySelector(
            selectors.description,
          );
          const description = descriptionElement?.textContent?.trim() || "";

          if (title && title.length > 5) {
            results.push({
              title,
              jurisdiction: "CTH",
              actNumber,
              year,
              status,
              url,
              description,
            });
          }
        });

        return results.slice(0, limit);
      }, SELECTORS.FEDERAL_LEGISLATION);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    return [];
  }
}

// Search NSW Legislation
export async function searchNSWLegislation(
  query: string,
  limit: number = 20,
): Promise<LegislationSearchResult[]> {
  try {
    await randomDelay();

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [...SCRAPING_CONFIG.BROWSER_ARGS, `--user-agent=${USER_AGENT}`],
      });

      const page = await browser.newPage();
      await page.setViewport(SCRAPING_CONFIG.VIEWPORT);
      await page.setUserAgent(USER_AGENT);

      const searchUrl = `${NSW_LEGISLATION_SEARCH}?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: SCRAPING_CONFIG.TIMEOUT,
      });

      // Wait for results using multiple selectors
      const foundSelector = await waitForAnySelector(
        page,
        SELECTORS.NSW_LEGISLATION.results.split(", "),
      );
      if (!foundSelector) {
        return [];
      }

      return await page.evaluate((selectors) => {
        const results: LegislationSearchResult[] = [];
        const resultElements = document.querySelectorAll(selectors.results);

        resultElements.forEach((element) => {
          const titleElement = element.querySelector(selectors.title);
          const title = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const actNumberElement = element.querySelector(selectors.actNumber);
          const actNumber = actNumberElement?.textContent?.trim() || "";

          const yearElement = element.querySelector(selectors.year);
          const yearText = yearElement?.textContent?.trim() || "";
          const year = yearText
            ? parseInt(yearText.match(/\d{4}/)?.[0] || "")
            : undefined;

          const statusElement = element.querySelector(selectors.status);
          const status = statusElement?.textContent?.trim() || "";

          if (title && title.length > 5) {
            results.push({
              title,
              jurisdiction: "NSW",
              actNumber,
              year,
              status,
              url,
            });
          }
        });

        return results.slice(0, limit);
      }, SELECTORS.NSW_LEGISLATION);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    return [];
  }
}

// Search High Court of Australia cases
export async function searchHighCourtCases(
  query: string,
  limit: number = 20,
): Promise<CaseLawSearchResult[]> {
  try {
    await randomDelay();

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [...SCRAPING_CONFIG.BROWSER_ARGS, `--user-agent=${USER_AGENT}`],
      });

      const page = await browser.newPage();
      await page.setViewport(SCRAPING_CONFIG.VIEWPORT);
      await page.setUserAgent(USER_AGENT);

      const searchUrl = `${HIGH_COURT_SEARCH}?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: SCRAPING_CONFIG.TIMEOUT,
      });

      // Wait for results using multiple selectors
      const foundSelector = await waitForAnySelector(
        page,
        SELECTORS.HIGH_COURT.results.split(", "),
      );
      if (!foundSelector) {
        return [];
      }

      return await page.evaluate((selectors) => {
        const results: CaseLawSearchResult[] = [];
        const resultElements = document.querySelectorAll(selectors.results);

        resultElements.forEach((element) => {
          const titleElement = element.querySelector(selectors.title);
          const caseName = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const citationElement = element.querySelector(selectors.citation);
          const citation = citationElement?.textContent?.trim() || "";

          const dateElement = element.querySelector(selectors.date);
          const decisionDate = dateElement?.textContent?.trim() || "";

          const catchwordsElement = element.querySelector(selectors.catchwords);
          const catchwords =
            catchwordsElement?.textContent
              ?.trim()
              .split(",")
              .map((s) => s.trim()) || [];

          const summaryElement = element.querySelector(selectors.summary);
          const summary = summaryElement?.textContent?.trim() || "";

          if (caseName && caseName.length > 5) {
            results.push({
              caseName,
              citation,
              court: "High Court of Australia",
              jurisdiction: "CTH",
              decisionDate,
              catchwords,
              url,
              summary,
            });
          }
        });

        return results.slice(0, limit);
      }, SELECTORS.HIGH_COURT);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    return [];
  }
}

// Get available legal databases
export function getAvailableLegalDatabases(): LegalDatabase[] {
  return [
    {
      name: "AustLII",
      baseUrl: AUSTLII_BASE,
      jurisdiction: "All",
      type: "Both",
      description:
        "Australasian Legal Information Institute - Free access to Australian legal materials",
      requiresSubscription: false,
    },
    {
      name: "Federal Register of Legislation",
      baseUrl: FEDERAL_LEGISLATION_BASE,
      jurisdiction: "CTH",
      type: "Primary",
      description: "Official source for Commonwealth legislation",
      requiresSubscription: false,
    },
    {
      name: "High Court of Australia",
      baseUrl: HIGH_COURT_BASE,
      jurisdiction: "CTH",
      type: "Primary",
      description: "Official website of the High Court of Australia",
      requiresSubscription: false,
    },
    {
      name: "NSW Legislation",
      baseUrl: NSW_LEGISLATION_BASE,
      jurisdiction: "NSW",
      type: "Primary",
      description: "Official source for New South Wales legislation",
      requiresSubscription: false,
    },
    {
      name: "Victoria Legislation",
      baseUrl: VIC_LEGISLATION_BASE,
      jurisdiction: "VIC",
      type: "Primary",
      description: "Official source for Victoria legislation",
      requiresSubscription: false,
    },
    {
      name: "Queensland Legislation",
      baseUrl: QLD_LEGISLATION_BASE,
      jurisdiction: "QLD",
      type: "Primary",
      description: "Official source for Queensland legislation",
      requiresSubscription: false,
    },
    {
      name: "Western Australia Legislation",
      baseUrl: WA_LEGISLATION_BASE,
      jurisdiction: "WA",
      type: "Primary",
      description: "Official source for Western Australia legislation",
      requiresSubscription: false,
    },
    {
      name: "South Australia Legislation",
      baseUrl: SA_LEGISLATION_BASE,
      jurisdiction: "SA",
      type: "Primary",
      description: "Official source for South Australia legislation",
      requiresSubscription: false,
    },
    {
      name: "Tasmania Legislation",
      baseUrl: TAS_LEGISLATION_BASE,
      jurisdiction: "TAS",
      type: "Primary",
      description: "Official source for Tasmania legislation",
      requiresSubscription: false,
    },
    {
      name: "Northern Territory Legislation",
      baseUrl: NT_LEGISLATION_BASE,
      jurisdiction: "NT",
      type: "Primary",
      description: "Official source for Northern Territory legislation",
      requiresSubscription: false,
    },
    {
      name: "ACT Legislation",
      baseUrl: ACT_LEGISLATION_BASE,
      jurisdiction: "ACT",
      type: "Primary",
      description:
        "Official source for Australian Capital Territory legislation",
      requiresSubscription: false,
    },
  ];
}
