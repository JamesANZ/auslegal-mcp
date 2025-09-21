#!/usr/bin/env node

// Simple US Legal MCP Server
// This provides the core functionality without complex MCP SDK integration

import USLegalAPI from "./us-legal-apis.js";

// Initialize US Legal API
const usLegalAPI = new USLegalAPI({
  congress: process.env.CONGRESS_API_KEY,
  regulationsGov: process.env.REGULATIONS_GOV_API_KEY
});

console.log("🇺🇸 US Legal MCP Server");
console.log("Available tools:");
console.log("1. search-congress-bills - Search Congress.gov for bills and resolutions");
console.log("2. search-federal-register - Search Federal Register for regulations");
console.log("3. search-us-legal - Comprehensive search across all sources");
console.log("4. get-recent-bills - Get recently introduced bills");
console.log("5. get-recent-regulations - Get recently published regulations");
console.log("");

// Example usage
async function demonstrate() {
  try {
    console.log("🔍 Testing Federal Register search...");
    const regulations = await usLegalAPI.federalRegister.searchDocuments("environmental", 3);
    console.log(`Found ${regulations.length} regulations:`);
    regulations.forEach((reg, i) => {
      console.log(`${i + 1}. ${reg.title}`);
      console.log(`   ${reg.document_number} - ${reg.agency_names?.[0] || 'Unknown agency'}`);
      console.log(`   ${reg.html_url}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run demonstration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrate();
}

export { usLegalAPI };