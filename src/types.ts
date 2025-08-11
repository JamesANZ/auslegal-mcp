// Australian Legal Types

// Define the jurisdiction type first
export type AustralianJurisdiction =
  | "CTH"
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "NT"
  | "ACT";

// Export the jurisdictions object
export const AUSTRALIAN_JURISDICTIONS: Record<AustralianJurisdiction, string> =
  {
    CTH: "Commonwealth",
    NSW: "New South Wales",
    VIC: "Victoria",
    QLD: "Queensland",
    WA: "Western Australia",
    SA: "South Australia",
    TAS: "Tasmania",
    NT: "Northern Territory",
    ACT: "Australian Capital Territory",
  } as const;

export type Legislation = {
  title: string;
  shortTitle?: string;
  jurisdiction: AustralianJurisdiction;
  actNumber?: string;
  year?: number;
  status: "In Force" | "Repealed" | "Amended" | "Expired";
  commencementDate?: string;
  repealDate?: string;
  url: string;
  sections?: LegislationSection[];
  amendments?: Amendment[];
  explanatoryNotes?: string;
  longTitle?: string;
};

export type LegislationSection = {
  sectionNumber: string;
  title?: string;
  content: string;
  subsections?: LegislationSubsection[];
  notes?: string;
};

export type LegislationSubsection = {
  subsectionNumber: string;
  content: string;
  paragraphs?: string[];
};

export type Amendment = {
  amendingAct: string;
  date: string;
  description: string;
  sections: string[];
};

export type CaseLaw = {
  caseName: string;
  citation: string;
  neutralCitation?: string;
  court: string;
  jurisdiction: AustralianJurisdiction;
  judges: string[];
  decisionDate: string;
  catchwords: string[];
  headnote?: string;
  summary?: string;
  url: string;
  pdfUrl?: string;
  relatedCases?: string[];
  legislationCited?: string[];
  casesCited?: string[];
};

export type LegalResearch = {
  title: string;
  authors: string[];
  publication: string;
  year?: number;
  abstract?: string;
  keywords: string[];
  url: string;
  doi?: string;
  type: "Journal Article" | "Book" | "Report" | "Commentary" | "Practice Note";
  jurisdiction?: AustralianJurisdiction;
  practiceArea?: string;
};

export type AustLIIResult = {
  title: string;
  url: string;
  snippet: string;
  database: string;
  jurisdiction: string;
  date?: string;
  type: "Legislation" | "Case Law" | "Secondary Material";
};

export type LegislationSearchResult = {
  title: string;
  jurisdiction: AustralianJurisdiction;
  actNumber?: string;
  year?: number;
  status: string;
  url: string;
  lastUpdated?: string;
  description?: string;
};

export type CaseLawSearchResult = {
  caseName: string;
  citation: string;
  court: string;
  jurisdiction: AustralianJurisdiction;
  decisionDate: string;
  catchwords: string[];
  url: string;
  summary?: string;
};

export type LegalDatabase = {
  name: string;
  baseUrl: string;
  jurisdiction: AustralianJurisdiction | "All";
  type: "Primary" | "Secondary" | "Both";
  description: string;
  requiresSubscription: boolean;
};
