// US Legal APIs Integration
// Comprehensive integration with US government legal data sources

import axios from "axios";

// API Base URLs
export const API_ENDPOINTS = {
  CONGRESS: "https://api.congress.gov/v3",
  FEDERAL_REGISTER: "https://www.federalregister.gov/api/v1",
  US_CODE: "https://uscode.house.gov/api",
  REGULATIONS_GOV: "https://api.regulations.gov/v4",
  GPO: "https://api.govinfo.gov",
} as const;

// Types for US Legal Data
export interface CongressBill {
  congress: number;
  type: string;
  number: number;
  title: string;
  shortTitle?: string;
  summary?: string;
  url: string;
  introducedDate: string;
  latestAction?: {
    actionDate: string;
    text: string;
  };
  subjects?: string[];
  sponsors?: Array<{
    bioguideId: string;
    firstName: string;
    lastName: string;
    party: string;
    state: string;
  }>;
}

export interface FederalRegisterDocument {
  document_number: string;
  title: string;
  abstract?: string;
  publication_date: string;
  effective_date?: string;
  agency_names: string[];
  document_type: string;
  pdf_url: string;
  html_url: string;
  json_url: string;
  sections?: Array<{
    title: string;
    content: string;
  }>;
}

export interface USCodeSection {
  title: number;
  section: string;
  text: string;
  url: string;
  last_updated: string;
  source: string;
}

export interface RegulationComment {
  id: string;
  comment: string;
  posted_date: string;
  agency_id: string;
  document_id: string;
  submitter_name?: string;
  organization?: string;
}

// Congress.gov API Functions
export class CongressAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CONGRESS_API_KEY || "";
  }

  async searchBills(
    query: string,
    congress?: number,
    limit: number = 20,
  ): Promise<CongressBill[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        format: "json",
        ...(this.apiKey && { api_key: this.apiKey }),
        ...(congress && { congress: congress.toString() }),
      });

      const response = await axios.get(
        `${API_ENDPOINTS.CONGRESS}/bill?${params}`,
      );

      return (
        response.data.bills?.map((bill: any) => ({
          congress: bill.congress,
          type: bill.type,
          number: bill.number,
          title: bill.title,
          shortTitle: bill.shortTitle,
          summary: bill.summary?.text,
          url: bill.url,
          introducedDate: bill.introducedDate,
          latestAction: bill.latestAction
            ? {
                actionDate: bill.latestAction.actionDate,
                text: bill.latestAction.text,
              }
            : undefined,
          subjects: bill.subjects?.map((s: any) => s.name),
          sponsors: bill.sponsors?.map((s: any) => ({
            bioguideId: s.bioguideId,
            firstName: s.firstName,
            lastName: s.lastName,
            party: s.party,
            state: s.state,
          })),
        })) || []
      );
    } catch (error) {
      console.error("Congress API error:", error);
      return [];
    }
  }

  async getBillDetails(
    congress: number,
    billType: string,
    billNumber: number,
  ): Promise<CongressBill | null> {
    try {
      const params = new URLSearchParams({
        format: "json",
        ...(this.apiKey && { api_key: this.apiKey }),
      });

      const response = await axios.get(
        `${API_ENDPOINTS.CONGRESS}/bill/${congress}/${billType}/${billNumber}?${params}`,
      );

      const bill = response.data.bill;
      return {
        congress: bill.congress,
        type: bill.type,
        number: bill.number,
        title: bill.title,
        shortTitle: bill.shortTitle,
        summary: bill.summary?.text,
        url: bill.url,
        introducedDate: bill.introducedDate,
        latestAction: bill.latestAction
          ? {
              actionDate: bill.latestAction.actionDate,
              text: bill.latestAction.text,
            }
          : undefined,
        subjects: bill.subjects?.map((s: any) => s.name),
        sponsors: bill.sponsors?.map((s: any) => ({
          bioguideId: s.bioguideId,
          firstName: s.firstName,
          lastName: s.lastName,
          party: s.party,
          state: s.state,
        })),
      };
    } catch (error) {
      console.error("Congress API error:", error);
      return null;
    }
  }

  async getRecentBills(
    congress?: number,
    limit: number = 20,
  ): Promise<CongressBill[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        format: "json",
        ...(this.apiKey && { api_key: this.apiKey }),
        ...(congress && { congress: congress.toString() }),
      });

      const response = await axios.get(
        `${API_ENDPOINTS.CONGRESS}/bill?${params}`,
      );

      return (
        response.data.bills?.map((bill: any) => ({
          congress: bill.congress,
          type: bill.type,
          number: bill.number,
          title: bill.title,
          shortTitle: bill.shortTitle,
          summary: bill.summary?.text,
          url: bill.url,
          introducedDate: bill.introducedDate,
          latestAction: bill.latestAction
            ? {
                actionDate: bill.latestAction.actionDate,
                text: bill.latestAction.text,
              }
            : undefined,
          subjects: bill.subjects?.map((s: any) => s.name),
          sponsors: bill.sponsors?.map((s: any) => ({
            bioguideId: s.bioguideId,
            firstName: s.firstName,
            lastName: s.lastName,
            party: s.party,
            state: s.state,
          })),
        })) || []
      );
    } catch (error) {
      console.error("Congress API error:", error);
      return [];
    }
  }
}

// Federal Register API Functions
export class FederalRegisterAPI {
  async searchDocuments(
    query: string,
    limit: number = 20,
  ): Promise<FederalRegisterDocument[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        per_page: limit.toString(),
        order: "relevance",
      });

      const response = await axios.get(
        `${API_ENDPOINTS.FEDERAL_REGISTER}/documents?${params}`,
      );

      return (
        response.data.results?.map((doc: any) => ({
          document_number: doc.document_number,
          title: doc.title,
          abstract: doc.abstract,
          publication_date: doc.publication_date,
          effective_date: doc.effective_date,
          agency_names: doc.agency_names,
          document_type: doc.document_type,
          pdf_url: doc.pdf_url,
          html_url: doc.html_url,
          json_url: doc.json_url,
        })) || []
      );
    } catch (error) {
      console.error("Federal Register API error:", error);
      return [];
    }
  }

  async getRecentDocuments(
    limit: number = 20,
  ): Promise<FederalRegisterDocument[]> {
    try {
      const params = new URLSearchParams({
        per_page: limit.toString(),
        order: "newest",
      });

      const response = await axios.get(
        `${API_ENDPOINTS.FEDERAL_REGISTER}/documents?${params}`,
      );

      return (
        response.data.results?.map((doc: any) => ({
          document_number: doc.document_number,
          title: doc.title,
          abstract: doc.abstract,
          publication_date: doc.publication_date,
          effective_date: doc.effective_date,
          agency_names: doc.agency_names,
          document_type: doc.document_type,
          pdf_url: doc.pdf_url,
          html_url: doc.html_url,
          json_url: doc.json_url,
        })) || []
      );
    } catch (error) {
      console.error("Federal Register API error:", error);
      return [];
    }
  }

  async getDocumentDetails(
    documentNumber: string,
  ): Promise<FederalRegisterDocument | null> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.FEDERAL_REGISTER}/documents/${documentNumber}.json`,
      );

      const doc = response.data;
      return {
        document_number: doc.document_number,
        title: doc.title,
        abstract: doc.abstract,
        publication_date: doc.publication_date,
        effective_date: doc.effective_date,
        agency_names: doc.agency_names,
        document_type: doc.document_type,
        pdf_url: doc.pdf_url,
        html_url: doc.html_url,
        json_url: doc.json_url,
        sections: doc.sections?.map((s: any) => ({
          title: s.title,
          content: s.content,
        })),
      };
    } catch (error) {
      console.error("Federal Register API error:", error);
      return null;
    }
  }
}

// US Code API Functions
export class USCodeAPI {
  async searchCode(
    query: string,
    title?: number,
    limit: number = 20,
  ): Promise<USCodeSection[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        ...(title && { title: title.toString() }),
      });

      const response = await axios.get(
        `${API_ENDPOINTS.US_CODE}/search?${params}`,
      );

      return (
        response.data.results?.map((section: any) => ({
          title: section.title,
          section: section.section,
          text: section.text,
          url: section.url,
          last_updated: section.last_updated,
          source: section.source,
        })) || []
      );
    } catch (error) {
      console.error("US Code API error:", error);
      return [];
    }
  }

  async getSection(
    title: number,
    section: string,
  ): Promise<USCodeSection | null> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.US_CODE}/title/${title}/section/${section}`,
      );

      const data = response.data;
      return {
        title: data.title,
        section: data.section,
        text: data.text,
        url: data.url,
        last_updated: data.last_updated,
        source: data.source,
      };
    } catch (error) {
      console.error("US Code API error:", error);
      return null;
    }
  }
}

// Regulations.gov API Functions
export class RegulationsGovAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REGULATIONS_GOV_API_KEY || "";
  }

  async searchComments(
    query: string,
    limit: number = 20,
  ): Promise<RegulationComment[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        "page[size]": limit.toString(),
        sort: "-postedDate",
        ...(this.apiKey && { api_key: this.apiKey }),
      });

      const response = await axios.get(
        `${API_ENDPOINTS.REGULATIONS_GOV}/comments?${params}`,
      );

      return (
        response.data.data?.map((comment: any) => ({
          id: comment.id,
          comment: comment.attributes.comment,
          posted_date: comment.attributes.postedDate,
          agency_id: comment.attributes.agencyId,
          document_id: comment.attributes.documentId,
          submitter_name: comment.attributes.submitterName,
          organization: comment.attributes.organization,
        })) || []
      );
    } catch (error) {
      console.error("Regulations.gov API error:", error);
      return [];
    }
  }
}

// Main US Legal API Class
export class USLegalAPI {
  public congress: CongressAPI;
  public federalRegister: FederalRegisterAPI;
  public usCode: USCodeAPI;
  public regulations: RegulationsGovAPI;

  constructor(apiKeys?: { congress?: string; regulationsGov?: string }) {
    this.congress = new CongressAPI(apiKeys?.congress);
    this.federalRegister = new FederalRegisterAPI();
    this.usCode = new USCodeAPI();
    this.regulations = new RegulationsGovAPI(apiKeys?.regulationsGov);
  }

  // Comprehensive search across all sources
  async searchAll(
    query: string,
    limit: number = 20,
  ): Promise<{
    bills: CongressBill[];
    regulations: FederalRegisterDocument[];
    codeSections: USCodeSection[];
    comments: RegulationComment[];
  }> {
    const [bills, regulations, codeSections, comments] = await Promise.all([
      this.congress.searchBills(query, undefined, Math.ceil(limit / 4)),
      this.federalRegister.searchDocuments(query, Math.ceil(limit / 4)),
      this.usCode.searchCode(query, undefined, Math.ceil(limit / 4)),
      this.regulations.searchComments(query, Math.ceil(limit / 4)),
    ]);

    return {
      bills,
      regulations,
      codeSections,
      comments,
    };
  }
}

export default USLegalAPI;
