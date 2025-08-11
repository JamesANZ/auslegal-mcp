import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchAustLII,
  searchFederalLegislation,
  searchNSWLegislation,
  searchHighCourtCases,
  getAvailableLegalDatabases,
} from "./utils.js";

const server = new McpServer({
  name: "legal-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// MCP Tools

// Search AustLII for legal materials
server.tool(
  "search-austlii",
  "Search AustLII (Australasian Legal Information Institute) for Australian legal materials including legislation, case law, and secondary materials",
  {
    query: z
      .string()
      .describe(
        "Legal search query (e.g., 'criminal law', 'family law', 'contracts')",
      ),
    jurisdiction: z
      .enum(["CTH", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
      .optional()
      .describe("Australian jurisdiction to search (optional)"),
    type: z
      .enum(["Legislation", "Case Law", "Secondary Material"])
      .optional()
      .describe("Type of legal material to search for (optional)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({ query, jurisdiction, type, limit }) => {
    try {
      const results = await searchAustLII(query, jurisdiction, type, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No legal materials found in AustLII for "${query}"${jurisdiction ? ` in ${jurisdiction}` : ""}${type ? ` of type ${type}` : ""}. Try a different search term or broaden your search.`,
            },
          ],
        };
      }

      let result = `**AustLII Search Results for "${query}"**\n\n`;
      if (jurisdiction) {
        result += `Jurisdiction: ${jurisdiction}\n`;
      }
      if (type) {
        result += `Type: ${type}\n`;
      }
      result += `Found ${results.length} result(s)\n\n`;

      results.forEach((item, index) => {
        result += `${index + 1}. **${item.title}**\n`;
        result += `   Database: ${item.database}\n`;
        result += `   Jurisdiction: ${item.jurisdiction}\n`;
        result += `   Type: ${item.type}\n`;
        if (item.date) {
          result += `   Date: ${item.date}\n`;
        }
        if (item.snippet) {
          result += `   Summary: ${item.snippet.substring(0, 200)}${item.snippet.length > 200 ? "..." : ""}\n`;
        }
        result += `   URL: ${item.url}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching AustLII: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search Federal Legislation
server.tool(
  "search-federal-legislation",
  "Search the Federal Register of Legislation for Commonwealth Acts, Regulations, and other legislative instruments",
  {
    query: z
      .string()
      .describe(
        "Legislation search query (e.g., 'Corporations Act', 'Income Tax Assessment Act', 'Migration Act')",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({ query, limit }) => {
    try {
      const results = await searchFederalLegislation(query, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No federal legislation found for "${query}". Try a different search term or check the spelling.`,
            },
          ],
        };
      }

      let result = `**Federal Legislation Search Results for "${query}"**\n\n`;
      result += `Found ${results.length} result(s)\n\n`;

      results.forEach((item, index) => {
        result += `${index + 1}. **${item.title}**\n`;
        if (item.actNumber) {
          result += `   Act Number: ${item.actNumber}\n`;
        }
        if (item.year) {
          result += `   Year: ${item.year}\n`;
        }
        result += `   Status: ${item.status}\n`;
        if (item.description) {
          result += `   Description: ${item.description.substring(0, 200)}${item.description.length > 200 ? "..." : ""}\n`;
        }
        result += `   URL: ${item.url}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching Federal Legislation: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search NSW Legislation
server.tool(
  "search-nsw-legislation",
  "Search New South Wales legislation database for Acts, Regulations, and other legislative instruments",
  {
    query: z
      .string()
      .describe(
        "NSW legislation search query (e.g., 'Crimes Act', 'Local Government Act', 'Planning Act')",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({ query, limit }) => {
    try {
      const results = await searchNSWLegislation(query, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No NSW legislation found for "${query}". Try a different search term or check the spelling.`,
            },
          ],
        };
      }

      let result = `**NSW Legislation Search Results for "${query}"**\n\n`;
      result += `Found ${results.length} result(s)\n\n`;

      results.forEach((item, index) => {
        result += `${index + 1}. **${item.title}**\n`;
        if (item.actNumber) {
          result += `   Act Number: ${item.actNumber}\n`;
        }
        if (item.year) {
          result += `   Year: ${item.year}\n`;
        }
        result += `   Status: ${item.status}\n`;
        result += `   URL: ${item.url}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching NSW Legislation: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search High Court Cases
server.tool(
  "search-high-court-cases",
  "Search High Court of Australia cases for judgments, decisions, and legal precedents",
  {
    query: z
      .string()
      .describe(
        "High Court case search query (e.g., 'Mabo', 'Lange', 'Kable', 'constitutional law')",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({ query, limit }) => {
    try {
      const results = await searchHighCourtCases(query, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No High Court cases found for "${query}". Try a different search term or check the spelling.`,
            },
          ],
        };
      }

      let result = `**High Court Cases Search Results for "${query}"**\n\n`;
      result += `Found ${results.length} case(s)\n\n`;

      results.forEach((item, index) => {
        result += `${index + 1}. **${item.caseName}**\n`;
        if (item.citation) {
          result += `   Citation: ${item.citation}\n`;
        }
        result += `   Court: ${item.court}\n`;
        result += `   Decision Date: ${item.decisionDate}\n`;
        if (item.catchwords && item.catchwords.length > 0) {
          result += `   Catchwords: ${item.catchwords.slice(0, 5).join(", ")}${item.catchwords.length > 5 ? "..." : ""}\n`;
        }
        if (item.summary) {
          result += `   Summary: ${item.summary.substring(0, 200)}${item.summary.length > 200 ? "..." : ""}\n`;
        }
        result += `   URL: ${item.url}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching High Court cases: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Get available legal databases
server.tool(
  "get-legal-databases",
  "Get information about available Australian legal databases and their jurisdictions",
  {},
  async () => {
    try {
      const databases = getAvailableLegalDatabases();

      let result = `**Available Australian Legal Databases**\n\n`;
      result += `Found ${databases.length} database(s)\n\n`;

      databases.forEach((db, index) => {
        result += `${index + 1}. **${db.name}**\n`;
        result += `   Jurisdiction: ${db.jurisdiction}\n`;
        result += `   Type: ${db.type}\n`;
        result += `   Description: ${db.description}\n`;
        result += `   Subscription Required: ${db.requiresSubscription ? "Yes" : "No"}\n`;
        result += `   URL: ${db.baseUrl}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting legal databases: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search across multiple jurisdictions
server.tool(
  "search-australian-law",
  "Comprehensive search across multiple Australian legal databases for legislation, case law, and legal materials",
  {
    query: z
      .string()
      .describe(
        "Legal search query to search across Australian legal databases",
      ),
    jurisdictions: z
      .array(
        z.enum(["CTH", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"]),
      )
      .optional()
      .describe("Specific jurisdictions to search (optional, defaults to all)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(30)
      .optional()
      .default(15)
      .describe("Number of results per jurisdiction (max 30)"),
  },
  async ({ query, jurisdictions, limit }) => {
    try {
      const searchJurisdictions = jurisdictions || [
        "CTH",
        "NSW",
        "VIC",
        "QLD",
        "WA",
        "SA",
        "TAS",
        "NT",
        "ACT",
      ];
      let allResults: any[] = [];
      let result = `**Comprehensive Australian Legal Search for "${query}"**\n\n`;

      // Search AustLII for general results
      const austliiResults = await searchAustLII(
        query,
        undefined,
        undefined,
        limit,
      );
      if (austliiResults.length > 0) {
        result += `**AustLII Results (${austliiResults.length}):**\n`;
        austliiResults.slice(0, 5).forEach((item, index) => {
          result += `${index + 1}. ${item.title}\n`;
          result += `   ${item.database} - ${item.jurisdiction}\n`;
          result += `   ${item.url}\n\n`;
        });
        if (austliiResults.length > 5) {
          result += `... and ${austliiResults.length - 5} more results\n\n`;
        }
        allResults.push(...austliiResults);
      }

      // Search Federal legislation if Commonwealth is included
      if (searchJurisdictions.includes("CTH")) {
        const federalResults = await searchFederalLegislation(query, limit);
        if (federalResults.length > 0) {
          result += `**Federal Legislation Results (${federalResults.length}):**\n`;
          federalResults.slice(0, 3).forEach((item, index) => {
            result += `${index + 1}. ${item.title}\n`;
            result += `   ${item.actNumber || "No number"} - ${item.status}\n`;
            result += `   ${item.url}\n\n`;
          });
          if (federalResults.length > 3) {
            result += `... and ${federalResults.length - 3} more results\n\n`;
          }
          allResults.push(...federalResults);
        }
      }

      // Search NSW legislation if included
      if (searchJurisdictions.includes("NSW")) {
        const nswResults = await searchNSWLegislation(query, limit);
        if (nswResults.length > 0) {
          result += `**NSW Legislation Results (${nswResults.length}):**\n`;
          nswResults.slice(0, 3).forEach((item, index) => {
            result += `${index + 1}. ${item.title}\n`;
            result += `   ${item.actNumber || "No number"} - ${item.status}\n`;
            result += `   ${item.url}\n\n`;
          });
          if (nswResults.length > 3) {
            result += `... and ${nswResults.length - 3} more results\n\n`;
          }
          allResults.push(...nswResults);
        }
      }

      // Search High Court cases if Commonwealth is included
      if (searchJurisdictions.includes("CTH")) {
        const highCourtResults = await searchHighCourtCases(query, limit);
        if (highCourtResults.length > 0) {
          result += `**High Court Cases (${highCourtResults.length}):**\n`;
          highCourtResults.slice(0, 3).forEach((item, index) => {
            result += `${index + 1}. ${item.caseName}\n`;
            result += `   ${item.citation || "No citation"} - ${item.decisionDate}\n`;
            result += `   ${item.url}\n\n`;
          });
          if (highCourtResults.length > 3) {
            result += `... and ${highCourtResults.length - 3} more results\n\n`;
          }
          allResults.push(...highCourtResults);
        }
      }

      if (allResults.length === 0) {
        result += `No legal materials found for "${query}" across the specified jurisdictions. Try a different search term or broaden your search.`;
      } else {
        result += `**Total Results: ${allResults.length}**\n`;
        result += `\n*Note: This search covers multiple Australian legal databases. For more detailed results, use the specific jurisdiction search tools.*`;
      }

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error performing comprehensive legal search: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Australian Legal MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
