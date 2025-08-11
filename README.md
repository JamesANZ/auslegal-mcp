# Legal MCP - Australian Legal Research Server

A Model Context Protocol (MCP) server that provides comprehensive Australian legal information by querying multiple authoritative legal databases including AustLII, Federal Register of Legislation, and state legal databases.

## Features

- **AustLII Search**: Search across all Australian legal materials including legislation, case law, and secondary materials
- **Federal Legislation**: Search Commonwealth Acts, Regulations, and legislative instruments
- **State Legislation**: Search legislation from all Australian states and territories
- **High Court Cases**: Search High Court of Australia judgments and decisions
- **Multi-Jurisdiction Search**: Comprehensive search across multiple Australian legal databases
- **Legal Database Information**: Get details about available legal databases and their jurisdictions

## Available Tools

### 1. `search-austlii`

Search AustLII (Australasian Legal Information Institute) for Australian legal materials.

- **Query**: Legal search terms (e.g., "criminal law", "family law", "contracts")
- **Jurisdiction**: Optional jurisdiction filter (CTH, NSW, VIC, QLD, WA, SA, TAS, NT, ACT)
- **Type**: Optional material type filter (Legislation, Case Law, Secondary Material)

### 2. `search-federal-legislation`

Search the Federal Register of Legislation for Commonwealth legislation.

- **Query**: Legislation search terms (e.g., "Corporations Act", "Income Tax Assessment Act")

### 3. `search-nsw-legislation`

Search New South Wales legislation database.

- **Query**: NSW legislation search terms (e.g., "Crimes Act", "Local Government Act")

### 4. `search-high-court-cases`

Search High Court of Australia cases.

- **Query**: Case search terms (e.g., "Mabo", "Lange", "constitutional law")

### 5. `get-legal-databases`

Get information about available Australian legal databases and their jurisdictions.

### 6. `search-australian-law`

Comprehensive search across multiple Australian legal databases.

- **Query**: Legal search terms
- **Jurisdictions**: Optional array of specific jurisdictions to search
- **Limit**: Number of results per jurisdiction

## Legal Databases Covered

- **AustLII**: Australasian Legal Information Institute (free access)
- **Federal Register of Legislation**: Official Commonwealth legislation source
- **High Court of Australia**: Official High Court website
- **State Legislation Databases**: All Australian states and territories
  - New South Wales
  - Victoria
  - Queensland
  - Western Australia
  - South Australia
  - Tasmania
  - Northern Territory
  - Australian Capital Territory

## Installation

```bash
npm install
npm run build
```

## Usage

The server runs on stdio and can be integrated with MCP-compatible clients.

```bash
node build/index.js
```

## Data Sources

All legal information is sourced from official Australian legal databases and government websites:

- **AustLII**: Free, authoritative legal information institute
- **Federal Register of Legislation**: Official Commonwealth legislation database
- **State Government Websites**: Official state and territory legislation sources
- **Court Websites**: Official court decision databases

## Legal Disclaimer

This tool provides access to publicly available legal information from official Australian sources. It is intended for research and educational purposes only. Users should verify all legal information independently and consult qualified legal professionals for legal advice.

## License

ISC License
