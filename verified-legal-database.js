// Verified Legal Database - Direct URLs to Working Legislation
// This provides immediate access to Australian legislation without relying on broken MCP tools

export const VERIFIED_LEGAL_DATABASE = {
  // NSW Legislation
  nsw: {
    "Jury Act 1977": {
      url: "https://www8.austlii.edu.au/cgi-bin/viewdoc/au/legis/nsw/consol_act/ja197791/index.html",
      fullTextUrl: "https://legislation.nsw.gov.au/view/whole/html/inforce/current/act-1977-018",
      exemptionsUrl: "https://www6.austlii.edu.au/cgi-bin/viewdoc/au/legis/nsw/consol_act/ja197791/sch2.html",
      goodCauseUrl: "https://www8.austlii.edu.au/cgi-bin/viewdoc/au/legis/nsw/consol_act/ja197791/s14A.html",
      year: 1977,
      description: "NSW legislation governing jury service, selection, and exemptions",
      exemptions: [
        "Clergy",
        "Vowed members of any religious order",
        "Persons practising as dentists", 
        "Persons practising as pharmacists",
        "Persons practising as medical practitioners",
        "Emergency services personnel (fire, ambulance, rescue)",
        "Recent jury service (3 years served, 12 months prepared to serve)",
        "Previous lengthy jury service",
        "Full-time carers of sick, infirm or disabled persons"
      ],
      goodCause: [
        "Undue hardship or serious inconvenience to person, family or public",
        "Disability that renders person unsuitable or incapable of serving",
        "Conflict of interest or knowledge affecting impartiality", 
        "Other reasons affecting ability to perform juror functions"
      ]
    },
    "Crimes Act 1900": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/nsw/consol_act/ca190082/",
      year: 1900,
      description: "NSW criminal law including offences, penalties, and procedures"
    },
    "Evidence Act 1995": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/nsw/consol_act/ea199580/",
      year: 1995,
      description: "NSW evidence law governing admissibility and procedures in court proceedings"
    }
  },
  
  // Federal Legislation
  federal: {
    "Migration Act 1958": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/ma1958118/",
      year: 1958,
      description: "Primary Commonwealth legislation governing all visa matters including student visas"
    },
    "Migration Regulations 1994": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_reg/mr1994227/",
      year: 1994,
      description: "Detailed regulations under the Migration Act prescribing visa requirements and procedures"
    },
    "Education Services for Overseas Students Act 2000": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/esfosa2000433/",
      year: 2000,
      description: "Legislation governing education providers for overseas students"
    },
    "Corporations Act 2001": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/ca2001172/",
      year: 2001,
      description: "Primary legislation governing corporations, securities, and financial services"
    },
    "Fair Work Act 2009": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/fwa2009114/",
      year: 2009,
      description: "Primary legislation governing workplace relations and employment conditions"
    },
    "Criminal Code Act 1995": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/cca1995115/",
      year: 1995,
      description: "Federal criminal law including offences against the Commonwealth"
    },
    "Constitution of Australia": {
      url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/coaca430/",
      year: 1901,
      description: "The Constitution of the Commonwealth of Australia"
    }
  }
};

// Search function for the verified database
export function searchVerifiedLegalDatabase(query, jurisdiction = null) {
  const results = [];
  const queryLower = query.toLowerCase();
  
  const searchScope = jurisdiction ? { [jurisdiction]: VERIFIED_LEGAL_DATABASE[jurisdiction] } : VERIFIED_LEGAL_DATABASE;
  
  for (const [juris, acts] of Object.entries(searchScope)) {
    for (const [title, data] of Object.entries(acts)) {
      let shouldInclude = false;
      
      // Check title match
      if (title.toLowerCase().includes(queryLower)) {
        shouldInclude = true;
      }
      
      // Check exemptions match for jury-related queries
      if (data.exemptions && (queryLower.includes('jury') || queryLower.includes('exemption'))) {
        // If query contains exemption, include if title has jury
        if (queryLower.includes('exemption') && title.toLowerCase().includes('jury')) {
          shouldInclude = true;
        }
        // Check if any exemption text matches query
        const exemptionMatch = data.exemptions.some(ex => ex.toLowerCase().includes(queryLower));
        if (exemptionMatch) {
          shouldInclude = true;
        }
      }
      
      // Check description match
      if (data.description && data.description.toLowerCase().includes(queryLower)) {
        shouldInclude = true;
      }
      
      if (shouldInclude && !results.some(r => r.title === title)) {
        results.push({
          title,
          jurisdiction: juris.toUpperCase(),
          url: data.url,
          year: data.year,
          description: data.description,
          exemptions: data.exemptions,
          goodCause: data.goodCause,
          fullTextUrl: data.fullTextUrl,
          exemptionsUrl: data.exemptionsUrl,
          goodCauseUrl: data.goodCauseUrl
        });
      }
    }
  }
  
  return results;
}

// Get all available legislation
export function getAllVerifiedLegislation() {
  const all = [];
  for (const [jurisdiction, acts] of Object.entries(VERIFIED_LEGAL_DATABASE)) {
    for (const [title, data] of Object.entries(acts)) {
      all.push({
        title,
        jurisdiction: jurisdiction.toUpperCase(),
        url: data.url,
        year: data.year,
        description: data.description
      });
    }
  }
  return all;
}

// Get specific legislation by title
export function getLegislationByTitle(title) {
  for (const [jurisdiction, acts] of Object.entries(VERIFIED_LEGAL_DATABASE)) {
    if (acts[title]) {
      return {
        title,
        jurisdiction: jurisdiction.toUpperCase(),
        ...acts[title]
      };
    }
  }
  return null;
}

// Demo usage - uncomment to test
/*
console.log("🔍 Verified Legal Database - Direct URLs");
console.log("=====================================\n");

const juryResults = searchVerifiedLegalDatabase("jury service exemption");
console.log(`Found ${juryResults.length} results for jury service exemption`);

const allLegislation = getAllVerifiedLegislation();
console.log(`Total legislation available: ${allLegislation.length}`);
*/

export default VERIFIED_LEGAL_DATABASE;