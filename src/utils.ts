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
import superagent from "superagent";
import puppeteer from "puppeteer";
import {
  AUSTLII_BASE,
  AUSTLII_API_BASE,
  FEDERAL_LEGISLATION_BASE,
  HIGH_COURT_BASE,
  FEDERAL_COURT_BASE,
  NSW_LEGISLATION_BASE,
  VIC_LEGISLATION_BASE,
  QLD_LEGISLATION_BASE,
  WA_LEGISLATION_BASE,
  SA_LEGISLATION_BASE,
  TAS_LEGISLATION_BASE,
  NT_LEGISLATION_BASE,
  ACT_LEGISLATION_BASE,
  USER_AGENT,
} from "./constants.js";

// Utility function to add random delay to avoid rate limiting
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Search AustLII for legal materials
export async function searchAustLII(
  query: string,
  jurisdiction?: keyof typeof AUSTRALIAN_JURISDICTIONS,
  type?: "Legislation" | "Case Law" | "Secondary Material",
  limit: number = 20,
): Promise<AustLIIResult[]> {
  try {
    await randomDelay(1000, 3000);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      // Build search URL
      let searchUrl = `${AUSTLII_BASE}/cgi-bin/sinosrch.cgi?query=${encodeURIComponent(query)}&metaname=all&path=all`;

      if (jurisdiction && jurisdiction !== "CTH") {
        searchUrl += `&jurisdiction=${jurisdiction.toLowerCase()}`;
      }

      if (type) {
        searchUrl += `&type=${type.toLowerCase().replace(" ", "_")}`;
      }

      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for results
      await page.waitForSelector(".result", { timeout: 15000 });

      return await page.evaluate(() => {
        const results: AustLIIResult[] = [];
        const resultElements = document.querySelectorAll(".result");

        resultElements.forEach((element) => {
          const titleElement = element.querySelector("h3 a, .title a");
          const title = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const snippetElement = element.querySelector(".snippet, .summary");
          const snippet = snippetElement?.textContent?.trim() || "";

          const databaseElement = element.querySelector(".database, .source");
          const database = databaseElement?.textContent?.trim() || "";

          const jurisdictionElement = element.querySelector(
            ".jurisdiction, .state",
          );
          const jurisdiction = jurisdictionElement?.textContent?.trim() || "";

          const dateElement = element.querySelector(".date, .year");
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
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("Error searching AustLII:", error);
    return [];
  }
}

// Search Federal Register of Legislation
export async function searchFederalLegislation(
  query: string,
  limit: number = 20,
): Promise<LegislationSearchResult[]> {
  try {
    await randomDelay(1000, 3000);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      const searchUrl = `${FEDERAL_LEGISLATION_BASE}/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for results
      await page.waitForSelector(".search-result, .result-item", {
        timeout: 15000,
      });

      return await page.evaluate(() => {
        const results: LegislationSearchResult[] = [];
        const resultElements = document.querySelectorAll(
          ".search-result, .result-item",
        );

        resultElements.forEach((element) => {
          const titleElement = element.querySelector("h3 a, .title a, .name a");
          const title = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const actNumberElement = element.querySelector(
            ".act-number, .number",
          );
          const actNumber = actNumberElement?.textContent?.trim() || "";

          const yearElement = element.querySelector(".year, .date");
          const yearText = yearElement?.textContent?.trim() || "";
          const year = yearText
            ? parseInt(yearText.match(/\d{4}/)?.[0] || "")
            : undefined;

          const statusElement = element.querySelector(".status, .state");
          const status = statusElement?.textContent?.trim() || "";

          const descriptionElement = element.querySelector(
            ".description, .summary",
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
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("Error searching Federal Legislation:", error);
    return [];
  }
}

// Search NSW Legislation
export async function searchNSWLegislation(
  query: string,
  limit: number = 20,
): Promise<LegislationSearchResult[]> {
  try {
    await randomDelay(1000, 3000);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      const searchUrl = `${NSW_LEGISLATION_BASE}/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for results
      await page.waitForSelector(".search-result, .result", { timeout: 15000 });

      return await page.evaluate(() => {
        const results: LegislationSearchResult[] = [];
        const resultElements = document.querySelectorAll(
          ".search-result, .result",
        );

        resultElements.forEach((element) => {
          const titleElement = element.querySelector("h3 a, .title a, .name a");
          const title = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const actNumberElement = element.querySelector(
            ".act-number, .number",
          );
          const actNumber = actNumberElement?.textContent?.trim() || "";

          const yearElement = element.querySelector(".year, .date");
          const yearText = yearElement?.textContent?.trim() || "";
          const year = yearText
            ? parseInt(yearText.match(/\d{4}/)?.[0] || "")
            : undefined;

          const statusElement = element.querySelector(".status, .state");
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
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("Error searching NSW Legislation:", error);
    return [];
  }
}

// Search High Court of Australia cases
export async function searchHighCourtCases(
  query: string,
  limit: number = 20,
): Promise<CaseLawSearchResult[]> {
  try {
    await randomDelay(1000, 3000);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      const searchUrl = `${HIGH_COURT_BASE}/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for results
      await page.waitForSelector(".search-result, .case-result", {
        timeout: 15000,
      });

      return await page.evaluate(() => {
        const results: CaseLawSearchResult[] = [];
        const resultElements = document.querySelectorAll(
          ".search-result, .case-result",
        );

        resultElements.forEach((element) => {
          const titleElement = element.querySelector(
            "h3 a, .title a, .case-name a",
          );
          const caseName = titleElement?.textContent?.trim() || "";
          const url = (titleElement as HTMLAnchorElement)?.href || "";

          const citationElement = element.querySelector(".citation, .cite");
          const citation = citationElement?.textContent?.trim() || "";

          const dateElement = element.querySelector(".date, .decision-date");
          const decisionDate = dateElement?.textContent?.trim() || "";

          const catchwordsElement = element.querySelector(
            ".catchwords, .keywords",
          );
          const catchwords =
            catchwordsElement?.textContent
              ?.trim()
              .split(",")
              .map((s) => s.trim()) || [];

          const summaryElement = element.querySelector(".summary, .headnote");
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
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("Error searching High Court cases:", error);
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
