# 🇺🇸 US Legal MCP Server

A comprehensive Model Context Protocol (MCP) server for US legal data, providing access to Congress bills, Federal Register documents, US Code sections, and public comments on regulations.

## ✨ Features

### 📜 **Congress.gov Integration**
- Search bills and resolutions
- Get recent legislation
- Access voting records and member information
- Real-time legislative data

### 📋 **Federal Register Integration**
- Search regulations and executive orders
- Get recent agency documents
- Access public comments
- Full document text and metadata

### ⚖️ **US Code Integration**
- Search federal statutes
- Browse by title and section
- Historical versions
- Complete legal text

### 💬 **Regulations.gov Integration**
- Search public comments
- Access rulemaking documents
- Agency information
- Public input on regulations

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### Environment Variables (Optional)

```bash
# For enhanced Congress.gov access (free tier available)
export CONGRESS_API_KEY="your_congress_api_key"

# For Regulations.gov access
export REGULATIONS_GOV_API_KEY="your_regulations_gov_api_key"
```

### Running the Server

```bash
npm start
```

## 🛠️ Available Tools

### `search-congress-bills`
Search for bills and resolutions in Congress.gov
- **Query**: Search terms (e.g., "immigration", "healthcare")
- **Congress**: Optional Congress number (100-120)
- **Limit**: Number of results (1-50)

### `search-federal-register`
Search Federal Register documents (regulations, executive orders)
- **Query**: Search terms
- **Limit**: Number of results (1-50)

### `search-us-code`
Search US Code sections (federal statutes)
- **Query**: Search terms
- **Title**: Optional title number (1-54)
- **Limit**: Number of results (1-50)

### `search-public-comments`
Search public comments on regulations
- **Query**: Search terms
- **Limit**: Number of results (1-50)

### `search-us-legal`
Comprehensive search across all sources
- **Query**: Search terms
- **Limit**: Results per source (1-50)

### `get-recent-bills`
Get recently introduced bills
- **Congress**: Optional Congress number
- **Limit**: Number of results (1-50)

### `get-recent-regulations`
Get recently published Federal Register documents
- **Limit**: Number of results (1-50)

### `get-legal-sources`
Get information about available data sources

## 📊 Data Sources

| Source | Description | API | Auth Required |
|--------|-------------|-----|---------------|
| **Congress.gov** | Bills, resolutions, voting records | https://api.congress.gov/v3 | Optional |
| **Federal Register** | Regulations, executive orders | https://www.federalregister.gov/api/v1 | No |
| **US Code** | Federal statutes | https://uscode.house.gov/api | No |
| **Regulations.gov** | Public comments | https://api.regulations.gov/v4 | Yes |

## 🔑 API Keys

### Congress.gov API Key (Optional)
1. Visit [https://api.congress.gov/](https://api.congress.gov/)
2. Sign up for a free account
3. Get your API key
4. Set `CONGRESS_API_KEY` environment variable

### Regulations.gov API Key (Optional)
1. Visit [https://api.regulations.gov/](https://api.regulations.gov/)
2. Sign up for an account
3. Get your API key
4. Set `REGULATIONS_GOV_API_KEY` environment variable

## 📈 Why US Legal APIs are Superior

### ✅ **Comprehensive Coverage**
- Federal legislation (Congress)
- Federal regulations (Federal Register)
- Federal statutes (US Code)
- Public input (Regulations.gov)

### ✅ **Real-Time Data**
- Live updates from government sources
- No scraping required
- Official APIs maintained by government

### ✅ **Developer-Friendly**
- REST APIs with JSON responses
- Good documentation
- Generous rate limits
- No complex authentication

### ✅ **Historical Data**
- Access to historical legislation
- Version tracking
- Complete legislative history

## 🆚 Comparison with Other Countries

| Country | APIs Available | Coverage | Developer Support | Real-Time |
|---------|----------------|----------|-------------------|-----------|
| **🇺🇸 United States** | ✅ Multiple | Comprehensive | Excellent | ✅ Yes |
| 🇬🇧 United Kingdom | ❌ Limited | Basic | Poor | ❌ No |
| 🇨🇦 Canada | ❌ Limited | Basic | Poor | ❌ No |
| 🇦🇺 Australia | ❌ Limited | Basic | Poor | ❌ No |

## 🎯 Example Usage

### Search for Immigration Bills
```json
{
  "tool": "search-congress-bills",
  "arguments": {
    "query": "immigration",
    "congress": 118,
    "limit": 10
  }
}
```

### Search Federal Regulations
```json
{
  "tool": "search-federal-register",
  "arguments": {
    "query": "environmental protection",
    "limit": 5
  }
}
```

### Comprehensive Legal Search
```json
{
  "tool": "search-us-legal",
  "arguments": {
    "query": "healthcare",
    "limit": 20
  }
}
```

## 🔧 Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines and submit pull requests.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review API documentation for each source

---

**🇺🇸 The United States has the most comprehensive and accessible legal APIs among major Western countries, making it the ideal choice for legal data integration.**