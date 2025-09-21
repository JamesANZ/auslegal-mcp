#!/usr/bin/env node

// Note: MCP SDK imports will be resolved at runtime
// For now, we'll create a simple test version
import { z } from "zod";
import USLegalAPI, {
  CongressBill,
  FederalRegisterDocument,
  USCodeSection,
  RegulationComment,
} from "./us-legal-apis.js";

// Initialize US Legal API
const usLegalAPI = new USLegalAPI({
  congress: process.env.CONGRESS_API_KEY,
  regulationsGov: process.env.REGULATIONS_GOV_API_KEY,
});

const server = new McpServer({
  name: "us-legal-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Search Congress Bills
server.tool(
  "search-congress-bills",
  "Search for bills and resolutions in Congress.gov",
  {
    query: z
      .string()
      .describe(
        "Search query for bills (e.g., 'immigration', 'healthcare', 'infrastructure')",
      ),
    congress: z
      .number()
      .int()
      .min(100)
      .max(120)
      .optional()
      .describe("Congress number (e.g., 118 for current Congress)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({
    query,
    congress,
    limit,
  }: {
    query: string;
    congress?: number;
    limit?: number;
  }) => {
    try {
      const bills = await usLegalAPI.congress.searchBills(
        query,
        congress,
        limit,
      );

      if (bills.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No bills found for "${query}"${congress ? ` in Congress ${congress}` : ""}. Try a different search term.`,
            },
          ],
        };
      }

      let result = `**Congress Bills Search Results for "${query}"**\n\n`;
      result += `Found ${bills.length} bill(s)\n\n`;

      bills.forEach((bill, index) => {
        result += `${index + 1}. **${bill.title}**\n`;
        result += `   Congress: ${bill.congress}\n`;
        result += `   Type: ${bill.type.toUpperCase()}\n`;
        result += `   Number: ${bill.number}\n`;
        result += `   Introduced: ${new Date(bill.introducedDate).toLocaleDateString()}\n`;
        if (bill.shortTitle) {
          result += `   Short Title: ${bill.shortTitle}\n`;
        }
        if (bill.summary) {
          result += `   Summary: ${bill.summary.substring(0, 200)}${bill.summary.length > 200 ? "..." : ""}\n`;
        }
        if (bill.latestAction) {
          result += `   Latest Action: ${bill.latestAction.text} (${new Date(bill.latestAction.actionDate).toLocaleDateString()})\n`;
        }
        if (bill.sponsors && bill.sponsors.length > 0) {
          result += `   Sponsor: ${bill.sponsors[0].firstName} ${bill.sponsors[0].lastName} (${bill.sponsors[0].party}-${bill.sponsors[0].state})\n`;
        }
        if (bill.subjects && bill.subjects.length > 0) {
          result += `   Subjects: ${bill.subjects.slice(0, 3).join(", ")}${bill.subjects.length > 3 ? "..." : ""}\n`;
        }
        result += `   URL: ${bill.url}\n\n`;
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
            text: `Error searching Congress bills: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search Federal Register Documents
server.tool(
  "search-federal-register",
  "Search for documents in the Federal Register (regulations, executive orders, etc.)",
  {
    query: z
      .string()
      .describe(
        "Search query for Federal Register documents (e.g., 'immigration', 'environmental protection', 'healthcare')",
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
  async ({ query, limit }: { query: string; limit?: number }) => {
    try {
      const documents = await usLegalAPI.federalRegister.searchDocuments(
        query,
        limit,
      );

      if (documents.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No Federal Register documents found for "${query}". Try a different search term.`,
            },
          ],
        };
      }

      let result = `**Federal Register Search Results for "${query}"**\n\n`;
      result += `Found ${documents.length} document(s)\n\n`;

      documents.forEach((doc, index) => {
        result += `${index + 1}. **${doc.title}**\n`;
        result += `   Document Number: ${doc.document_number}\n`;
        result += `   Type: ${doc.document_type}\n`;
        result += `   Publication Date: ${new Date(doc.publication_date).toLocaleDateString()}\n`;
        if (doc.effective_date) {
          result += `   Effective Date: ${new Date(doc.effective_date).toLocaleDateString()}\n`;
        }
        if (doc.agency_names && doc.agency_names.length > 0) {
          result += `   Agency: ${doc.agency_names.join(", ")}\n`;
        }
        if (doc.abstract) {
          result += `   Abstract: ${doc.abstract.substring(0, 200)}${doc.abstract.length > 200 ? "..." : ""}\n`;
        }
        result += `   PDF: ${doc.pdf_url}\n`;
        result += `   HTML: ${doc.html_url}\n\n`;
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
            text: `Error searching Federal Register: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search US Code
server.tool(
  "search-us-code",
  "Search for sections in the US Code (federal statutes)",
  {
    query: z
      .string()
      .describe(
        "Search query for US Code sections (e.g., 'immigration', 'tax', 'criminal')",
      ),
    title: z
      .number()
      .int()
      .min(1)
      .max(54)
      .optional()
      .describe("Specific title number to search (1-54)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({
    query,
    title,
    limit,
  }: {
    query: string;
    title?: number;
    limit?: number;
  }) => {
    try {
      const sections = await usLegalAPI.usCode.searchCode(query, title, limit);

      if (sections.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No US Code sections found for "${query}"${title ? ` in Title ${title}` : ""}. Try a different search term.`,
            },
          ],
        };
      }

      let result = `**US Code Search Results for "${query}"**\n\n`;
      result += `Found ${sections.length} section(s)\n\n`;

      sections.forEach((section, index) => {
        result += `${index + 1}. **Title ${section.title}, Section ${section.section}**\n`;
        result += `   Last Updated: ${new Date(section.last_updated).toLocaleDateString()}\n`;
        result += `   Source: ${section.source}\n`;
        result += `   Text: ${section.text.substring(0, 300)}${section.text.length > 300 ? "..." : ""}\n`;
        result += `   URL: ${section.url}\n\n`;
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
            text: `Error searching US Code: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Search Public Comments
server.tool(
  "search-public-comments",
  "Search for public comments on regulations from Regulations.gov",
  {
    query: z
      .string()
      .describe(
        "Search query for public comments (e.g., 'environmental', 'healthcare', 'immigration')",
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
  async ({ query, limit }: { query: string; limit?: number }) => {
    try {
      const comments = await usLegalAPI.regulations.searchComments(
        query,
        limit,
      );

      if (comments.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No public comments found for "${query}". Try a different search term.`,
            },
          ],
        };
      }

      let result = `**Public Comments Search Results for "${query}"**\n\n`;
      result += `Found ${comments.length} comment(s)\n\n`;

      comments.forEach((comment, index) => {
        result += `${index + 1}. **Comment ID: ${comment.id}**\n`;
        result += `   Posted: ${new Date(comment.posted_date).toLocaleDateString()}\n`;
        result += `   Agency: ${comment.agency_id}\n`;
        result += `   Document ID: ${comment.document_id}\n`;
        if (comment.submitter_name) {
          result += `   Submitter: ${comment.submitter_name}\n`;
        }
        if (comment.organization) {
          result += `   Organization: ${comment.organization}\n`;
        }
        result += `   Comment: ${comment.comment.substring(0, 300)}${comment.comment.length > 300 ? "..." : ""}\n\n`;
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
            text: `Error searching public comments: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Comprehensive Search
server.tool(
  "search-us-legal",
  "Comprehensive search across all US legal sources (Congress, Federal Register, US Code, Comments)",
  {
    query: z.string().describe("Search query across all US legal sources"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return per source (max 50)"),
  },
  async ({ query, limit }: { query: string; limit?: number }) => {
    try {
      const results = await usLegalAPI.searchAll(query, limit);

      let result = `**Comprehensive US Legal Search Results for "${query}"**\n\n`;

      // Congress Bills
      if (results.bills.length > 0) {
        result += `## 📜 Congress Bills (${results.bills.length})\n\n`;
        results.bills.slice(0, 5).forEach((bill, index) => {
          result += `${index + 1}. **${bill.title}**\n`;
          result += `   ${bill.congress}-${bill.type.toUpperCase()}-${bill.number}\n`;
          result += `   ${bill.url}\n\n`;
        });
      }

      // Federal Register
      if (results.regulations.length > 0) {
        result += `## 📋 Federal Register (${results.regulations.length})\n\n`;
        results.regulations.slice(0, 5).forEach((doc, index) => {
          result += `${index + 1}. **${doc.title}**\n`;
          result += `   ${doc.document_number} - ${doc.document_type}\n`;
          result += `   ${doc.html_url}\n\n`;
        });
      }

      // US Code
      if (results.codeSections.length > 0) {
        result += `## ⚖️ US Code (${results.codeSections.length})\n\n`;
        results.codeSections.slice(0, 5).forEach((section, index) => {
          result += `${index + 1}. **Title ${section.title}, Section ${section.section}**\n`;
          result += `   ${section.url}\n\n`;
        });
      }

      // Public Comments
      if (results.comments.length > 0) {
        result += `## 💬 Public Comments (${results.comments.length})\n\n`;
        results.comments.slice(0, 5).forEach((comment, index) => {
          result += `${index + 1}. **Comment ${comment.id}**\n`;
          result += `   ${comment.comment.substring(0, 100)}...\n\n`;
        });
      }

      if (
        results.bills.length === 0 &&
        results.regulations.length === 0 &&
        results.codeSections.length === 0 &&
        results.comments.length === 0
      ) {
        result += `No results found for "${query}" across any US legal sources.`;
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
            text: `Error in comprehensive search: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Get Recent Bills
server.tool(
  "get-recent-bills",
  "Get the most recently introduced bills in Congress",
  {
    congress: z
      .number()
      .int()
      .min(100)
      .max(120)
      .optional()
      .describe("Congress number (e.g., 118 for current Congress)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({ congress, limit }: { congress?: number; limit?: number }) => {
    try {
      const bills = await usLegalAPI.congress.getRecentBills(congress, limit);

      if (bills.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No recent bills found${congress ? ` for Congress ${congress}` : ""}.`,
            },
          ],
        };
      }

      let result = `**Recent Bills${congress ? ` (Congress ${congress})` : ""}**\n\n`;
      result += `Found ${bills.length} recent bill(s)\n\n`;

      bills.forEach((bill, index) => {
        result += `${index + 1}. **${bill.title}**\n`;
        result += `   ${bill.congress}-${bill.type.toUpperCase()}-${bill.number}\n`;
        result += `   Introduced: ${new Date(bill.introducedDate).toLocaleDateString()}\n`;
        if (bill.sponsors && bill.sponsors.length > 0) {
          result += `   Sponsor: ${bill.sponsors[0].firstName} ${bill.sponsors[0].lastName} (${bill.sponsors[0].party}-${bill.sponsors[0].state})\n`;
        }
        result += `   ${bill.url}\n\n`;
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
            text: `Error getting recent bills: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Get Recent Federal Register Documents
server.tool(
  "get-recent-regulations",
  "Get the most recently published Federal Register documents",
  {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Number of results to return (max 50)"),
  },
  async ({ limit }: { limit?: number }) => {
    try {
      const documents =
        await usLegalAPI.federalRegister.getRecentDocuments(limit);

      if (documents.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No recent Federal Register documents found.",
            },
          ],
        };
      }

      let result = `**Recent Federal Register Documents**\n\n`;
      result += `Found ${documents.length} recent document(s)\n\n`;

      documents.forEach((doc, index) => {
        result += `${index + 1}. **${doc.title}**\n`;
        result += `   ${doc.document_number} - ${doc.document_type}\n`;
        result += `   Published: ${new Date(doc.publication_date).toLocaleDateString()}\n`;
        if (doc.agency_names && doc.agency_names.length > 0) {
          result += `   Agency: ${doc.agency_names.join(", ")}\n`;
        }
        result += `   ${doc.html_url}\n\n`;
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
            text: `Error getting recent regulations: ${error.message || "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Get Available Legal Sources
server.tool(
  "get-legal-sources",
  "Get information about available US legal data sources",
  {},
  async () => {
    const sources = {
      "Congress.gov": {
        description:
          "Bills, resolutions, voting records, and legislative information",
        api: "https://api.congress.gov/v3",
        features: [
          "Bills",
          "Resolutions",
          "Voting Records",
          "Member Information",
          "Committee Data",
        ],
        authentication: "API Key recommended (free tier available)",
      },
      "Federal Register": {
        description:
          "Federal regulations, executive orders, and agency documents",
        api: "https://www.federalregister.gov/api/v1",
        features: [
          "Regulations",
          "Executive Orders",
          "Agency Documents",
          "Public Comments",
        ],
        authentication: "None required",
      },
      "US Code": {
        description: "Federal statutes and laws",
        api: "https://uscode.house.gov/api",
        features: [
          "Federal Statutes",
          "Title Search",
          "Section Search",
          "Historical Versions",
        ],
        authentication: "None required",
      },
      "Regulations.gov": {
        description: "Public comments on proposed regulations",
        api: "https://api.regulations.gov/v4",
        features: [
          "Public Comments",
          "Rulemaking Documents",
          "Agency Information",
        ],
        authentication: "API Key required",
      },
    };

    let result = `**Available US Legal Data Sources**\n\n`;

    Object.entries(sources).forEach(([name, info]) => {
      result += `## ${name}\n`;
      result += `**Description:** ${info.description}\n`;
      result += `**API:** ${info.api}\n`;
      result += `**Features:** ${info.features.join(", ")}\n`;
      result += `**Authentication:** ${info.authentication}\n\n`;
    });

    result += `**Total Sources:** ${Object.keys(sources).length}\n`;
    result += `**Coverage:** Federal legislation, regulations, executive orders, and public input\n`;
    result += `**Update Frequency:** Real-time or near real-time\n`;

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("US Legal MCP server running on stdio");
}

main().catch(console.error);
