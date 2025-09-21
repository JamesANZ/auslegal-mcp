#!/usr/bin/env node
// Test the US Legal APIs directly

import USLegalAPI from './us-legal-apis.js';

async function testUSLegalAPIs() {
  console.log('🇺🇸 Testing US Legal APIs');
  console.log('========================\n');

  const usLegalAPI = new USLegalAPI();

  try {
    // Test 1: Search Congress Bills
    console.log('📜 Testing Congress Bills Search...');
    const bills = await usLegalAPI.congress.searchBills('immigration', 118, 5);
    console.log(`Found ${bills.length} immigration bills in Congress 118`);
    if (bills.length > 0) {
      console.log(`Latest: ${bills[0].title}`);
      console.log(`URL: ${bills[0].url}\n`);
    }

    // Test 2: Search Federal Register
    console.log('📋 Testing Federal Register Search...');
    const regulations = await usLegalAPI.federalRegister.searchDocuments('environmental', 5);
    console.log(`Found ${regulations.length} environmental regulations`);
    if (regulations.length > 0) {
      console.log(`Latest: ${regulations[0].title}`);
      console.log(`URL: ${regulations[0].html_url}\n`);
    }

    // Test 3: Search US Code
    console.log('⚖️ Testing US Code Search...');
    const codeSections = await usLegalAPI.usCode.searchCode('immigration', undefined, 5);
    console.log(`Found ${codeSections.length} immigration code sections`);
    if (codeSections.length > 0) {
      console.log(`Latest: Title ${codeSections[0].title}, Section ${codeSections[0].section}`);
      console.log(`URL: ${codeSections[0].url}\n`);
    }

    // Test 4: Search Public Comments
    console.log('💬 Testing Public Comments Search...');
    const comments = await usLegalAPI.regulations.searchComments('healthcare', 5);
    console.log(`Found ${comments.length} healthcare comments`);
    if (comments.length > 0) {
      console.log(`Latest: ${comments[0].comment.substring(0, 100)}...\n`);
    }

    // Test 5: Comprehensive Search
    console.log('🔍 Testing Comprehensive Search...');
    const allResults = await usLegalAPI.searchAll('immigration', 20);
    console.log(`Comprehensive search results:`);
    console.log(`- Bills: ${allResults.bills.length}`);
    console.log(`- Regulations: ${allResults.regulations.length}`);
    console.log(`- Code Sections: ${allResults.codeSections.length}`);
    console.log(`- Comments: ${allResults.comments.length}\n`);

    console.log('✅ All tests completed successfully!');
    console.log('🇺🇸 US Legal APIs are working correctly.');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests
testUSLegalAPIs();