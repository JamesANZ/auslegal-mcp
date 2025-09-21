#!/usr/bin/env node
// Simple US Legal API Server (without MCP SDK for now)

import USLegalAPI from './us-legal-apis.js';

// Simple command-line interface for testing
async function main() {
  const usLegalAPI = new USLegalAPI();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🇺🇸 US Legal API Server');
    console.log('======================');
    console.log('\nUsage:');
    console.log('  node dist/simple-server.js bills "immigration"');
    console.log('  node dist/simple-server.js regulations "environmental"');
    console.log('  node dist/simple-server.js code "immigration"');
    console.log('  node dist/simple-server.js comments "healthcare"');
    console.log('  node dist/simple-server.js all "immigration"');
    console.log('\nExamples:');
    console.log('  node dist/simple-server.js bills "immigration" 5');
    console.log('  node dist/simple-server.js regulations "environmental" 10');
    return;
  }

  const command = args[0];
  const query = args[1] || '';
  const limit = parseInt(args[2]) || 10;

  try {
    switch (command) {
      case 'bills':
        console.log(`📜 Searching Congress bills for: "${query}"`);
        const bills = await usLegalAPI.congress.searchBills(query, 118, limit);
        console.log(`Found ${bills.length} bills:\n`);
        bills.forEach((bill, i) => {
          console.log(`${i + 1}. ${bill.title}`);
          console.log(`   ${bill.congress}-${bill.type.toUpperCase()}-${bill.number}`);
          console.log(`   ${bill.url}\n`);
        });
        break;

      case 'regulations':
        console.log(`📋 Searching Federal Register for: "${query}"`);
        const regulations = await usLegalAPI.federalRegister.searchDocuments(query, limit);
        console.log(`Found ${regulations.length} documents:\n`);
        regulations.forEach((doc, i) => {
          console.log(`${i + 1}. ${doc.title}`);
          console.log(`   ${doc.document_number} - ${doc.document_type}`);
          console.log(`   ${doc.html_url}\n`);
        });
        break;

      case 'code':
        console.log(`⚖️ Searching US Code for: "${query}"`);
        const codeSections = await usLegalAPI.usCode.searchCode(query, undefined, limit);
        console.log(`Found ${codeSections.length} sections:\n`);
        codeSections.forEach((section, i) => {
          console.log(`${i + 1}. Title ${section.title}, Section ${section.section}`);
          console.log(`   ${section.url}\n`);
        });
        break;

      case 'comments':
        console.log(`💬 Searching public comments for: "${query}"`);
        const comments = await usLegalAPI.regulations.searchComments(query, limit);
        console.log(`Found ${comments.length} comments:\n`);
        comments.forEach((comment, i) => {
          console.log(`${i + 1}. Comment ${comment.id}`);
          console.log(`   ${comment.comment.substring(0, 100)}...\n`);
        });
        break;

      case 'all':
        console.log(`🔍 Comprehensive search for: "${query}"`);
        const allResults = await usLegalAPI.searchAll(query, limit);
        console.log(`\nResults:`);
        console.log(`- Bills: ${allResults.bills.length}`);
        console.log(`- Regulations: ${allResults.regulations.length}`);
        console.log(`- Code Sections: ${allResults.codeSections.length}`);
        console.log(`- Comments: ${allResults.comments.length}\n`);
        
        if (allResults.bills.length > 0) {
          console.log('📜 Recent Bills:');
          allResults.bills.slice(0, 3).forEach((bill, i) => {
            console.log(`${i + 1}. ${bill.title}`);
            console.log(`   ${bill.url}\n`);
          });
        }
        break;

      default:
        console.log(`Unknown command: ${command}`);
        console.log('Available commands: bills, regulations, code, comments, all');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main();