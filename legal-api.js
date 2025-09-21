#!/usr/bin/env node
// Legal API - Alternative to broken MCP tools
// Usage: node legal-api.js "search term" [jurisdiction]

import { searchVerifiedLegalDatabase, getAllVerifiedLegislation, getLegislationByTitle } from './verified-legal-database.js';

function formatResults(results) {
  if (results.length === 0) {
    return "No legislation found for your search.";
  }
  
  let output = `**Found ${results.length} result(s)**\n\n`;
  
  results.forEach((result, index) => {
    output += `${index + 1}. **${result.title}** (${result.jurisdiction})\n`;
    output += `   Year: ${result.year}\n`;
    output += `   Description: ${result.description}\n`;
    output += `   URL: ${result.url}\n`;
    
    if (result.exemptionsUrl) {
      output += `   Exemptions: ${result.exemptionsUrl}\n`;
    }
    if (result.goodCauseUrl) {
      output += `   Good Cause: ${result.goodCauseUrl}\n`;
    }
    if (result.fullTextUrl) {
      output += `   Full Text: ${result.fullTextUrl}\n`;
    }
    
    if (result.exemptions && result.exemptions.length > 0) {
      output += `\n   **Automatic Exemptions:**\n`;
      result.exemptions.forEach((exemption, i) => {
        output += `   ${i + 1}. ${exemption}\n`;
      });
    }
    
    if (result.goodCause && result.goodCause.length > 0) {
      output += `\n   **Good Cause Exemptions:**\n`;
      result.goodCause.forEach((cause, i) => {
        output += `   ${i + 1}. ${cause}\n`;
      });
    }
    
    output += `\n`;
  });
  
  return output;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("🔍 Legal API - Alternative to broken MCP tools");
    console.log("==============================================");
    console.log("\nUsage:");
    console.log("  node legal-api.js \"search term\" [jurisdiction]");
    console.log("\nExamples:");
    console.log("  node legal-api.js \"jury service exemption\"");
    console.log("  node legal-api.js \"migration\" federal");
    console.log("  node legal-api.js \"corporations\"");
    console.log("  node legal-api.js list  # Show all available legislation");
    console.log("\nAvailable jurisdictions: nsw, federal");
    return;
  }
  
  if (args[0] === "list") {
    console.log("📚 All Available Legislation:");
    console.log("=============================\n");
    const allLegislation = getAllVerifiedLegislation();
    allLegislation.forEach((leg, index) => {
      console.log(`${index + 1}. ${leg.title} (${leg.jurisdiction}) - ${leg.year}`);
      console.log(`   ${leg.description}`);
      console.log(`   ${leg.url}\n`);
    });
    return;
  }
  
  const query = args[0];
  const jurisdiction = args[1] || null;
  
  console.log(`🔍 Searching for: "${query}"`);
  if (jurisdiction) {
    console.log(`📍 Jurisdiction: ${jurisdiction}`);
  }
  console.log("=".repeat(50));
  
  const results = searchVerifiedLegalDatabase(query, jurisdiction);
  console.log(formatResults(results));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { formatResults, main };