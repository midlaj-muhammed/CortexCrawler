# 🧠 AI-Powered CSS Selector Assistant

## Overview

The AI-Powered CSS Selector Assistant is a new feature in CortexCrawler that uses artificial intelligence to analyze webpage structure and suggest optimal CSS selectors for data extraction. This feature significantly reduces the time and expertise required to create effective web scraping configurations.

## Features

### 🎯 **Core Capabilities**
- **Intelligent Analysis**: Uses AI to analyze webpage DOM structure and content
- **Smart Suggestions**: Generates multiple CSS selector options ranked by reliability
- **Real-time Testing**: Test selectors against live webpage content
- **Fallback Options**: Provides alternative selectors for robustness
- **Confidence Scoring**: Each suggestion includes a confidence percentage
- **Data Type Detection**: Automatically identifies common data types (titles, prices, links, etc.)

### 🔧 **Technical Features**
- **Gemini AI Integration**: Leverages Google's Gemini AI for intelligent analysis
- **Server-side HTML Parsing**: Uses jsdom for robust HTML processing
- **Firebase Authentication**: Seamlessly integrated with existing auth system
- **Responsive Design**: Matches CortexCrawler's design system
- **Error Handling**: Comprehensive error handling with fallback mechanisms

## User Interface

### 📱 **Dashboard Integration**
The AI Selector Assistant is integrated into the main dashboard as a new tab alongside the existing crawler configuration:

1. **Tab Navigation**: Switch between "Crawler Configuration" and "AI Selector Assistant"
2. **Quick Access**: Dedicated button in the Quick Actions sidebar
3. **Seamless Workflow**: Generated selectors can be used directly in the crawler

### 🎨 **Design Elements**
- **Color Scheme**: Follows CortexCrawler's brand colors (Deep Blue #3F51B5, Orange #FF9800)
- **Icons**: Uses Lucide React icons for consistency
- **Components**: Built with Shadcn/ui components
- **Responsive**: Mobile-first design approach

## How It Works

### 1. **Input Methods**
- **URL Analysis**: Provide a webpage URL for automatic fetching and analysis
- **HTML Upload**: Paste HTML content directly for analysis

### 2. **AI Analysis Process**
1. **Content Fetching**: Securely fetch webpage content (if URL provided)
2. **DOM Parsing**: Parse HTML structure using jsdom
3. **Metadata Extraction**: Extract page title, description, and other metadata
4. **AI Processing**: Send structured data to Gemini AI for analysis
5. **Selector Generation**: Generate optimized CSS selectors with explanations

### 3. **Results Display**
- **Suggestion Cards**: Each suggestion displayed with confidence score and reasoning
- **Data Type Icons**: Visual indicators for different data types
- **Test Functionality**: Real-time testing of selectors
- **Copy to Clipboard**: Easy copying of selectors
- **Selection Management**: Multi-select functionality for batch operations

## API Endpoints

### 🔗 **Core APIs**

#### `/api/ai/suggest-selectors`
**POST** - Generate AI-powered CSS selector suggestions
```json
{
  "url": "https://example.com",
  "htmlContent": "<html>...</html>",
  "targetDataTypes": ["title", "heading", "paragraph", "link", "image"]
}
```

#### `/api/ai/test-selector`
**POST** - Test a CSS selector against webpage content
```json
{
  "selector": "h1.title",
  "url": "https://example.com",
  "htmlContent": "<html>...</html>"
}
```

#### `/api/ai/fetch-webpage`
**POST** - Securely fetch webpage content
```json
{
  "url": "https://example.com"
}
```

#### `/api/ai/gemini-analyze`
**POST** - Direct Gemini AI analysis (internal)
```json
{
  "prompt": "...",
  "webpageAnalysis": {...}
}
```

## Data Types Supported

The AI can identify and suggest selectors for:

- 📰 **Title**: Main page titles and headings
- 📝 **Heading**: Section headings (h2, h3, etc.)
- 📄 **Paragraph**: Text content and descriptions
- 🔗 **Link**: Navigation and content links
- 🖼️ **Image**: Images and media content
- 💰 **Price**: Pricing information
- 📋 **Description**: Product/content descriptions
- 📅 **Date**: Date and time information
- 👤 **Author**: Author and contact information
- 🏷️ **Category**: Categories and tags
- ⭐ **Rating**: Ratings and reviews
- 📞 **Contact**: Contact information
- 🧭 **Navigation**: Navigation elements

## Security Features

### 🔒 **Safety Measures**
- **URL Validation**: Strict validation of input URLs
- **Protocol Restrictions**: Only HTTP/HTTPS allowed
- **Content Size Limits**: Maximum 5MB HTML content
- **Timeout Protection**: 30-second timeout for webpage fetching
- **Error Handling**: Comprehensive error handling and logging
- **Authentication**: Firebase auth integration

## Performance Optimizations

### ⚡ **Efficiency Features**
- **Caching**: Intelligent caching of analysis results
- **Lazy Loading**: Components loaded on demand
- **Debounced Requests**: Prevents excessive API calls
- **Fallback Mechanisms**: Graceful degradation when AI services are unavailable
- **Optimized Parsing**: Efficient DOM parsing with depth limits

## Usage Examples

### Example 1: E-commerce Product Page
```javascript
// Input
{
  "url": "https://shop.example.com/product/123",
  "targetDataTypes": ["title", "price", "description", "image"]
}

// Generated Suggestions
[
  {
    "selector": "h1.product-title",
    "dataType": "title",
    "confidence": 95,
    "reasoning": "Semantic H1 with product-specific class"
  },
  {
    "selector": ".price-current, .price",
    "dataType": "price",
    "confidence": 88,
    "reasoning": "Common price container patterns"
  }
]
```

### Example 2: News Article
```javascript
// Input
{
  "url": "https://news.example.com/article/456",
  "targetDataTypes": ["title", "author", "date", "paragraph"]
}

// Generated Suggestions
[
  {
    "selector": "h1.headline, .article-title",
    "dataType": "title",
    "confidence": 92,
    "reasoning": "Article headline patterns"
  },
  {
    "selector": ".byline .author, .article-author",
    "dataType": "author",
    "confidence": 85,
    "reasoning": "Common author attribution patterns"
  }
]
```

## Integration with Existing Workflow

### 🔄 **Seamless Integration**
1. **Generate Selectors**: Use AI Assistant to analyze target webpage
2. **Review Suggestions**: Examine AI-generated selectors with confidence scores
3. **Test Selectors**: Validate selectors against live content
4. **Select Best Options**: Choose optimal selectors for your use case
5. **Apply to Crawler**: Switch to Crawler tab and use generated selectors
6. **Run Extraction**: Execute scraping job with AI-optimized selectors

## Future Enhancements

### 🚀 **Planned Features**
- **Batch URL Analysis**: Analyze multiple URLs simultaneously
- **Selector Optimization**: ML-based selector performance optimization
- **Visual Selector Builder**: Point-and-click selector generation
- **Template Library**: Pre-built selector templates for common sites
- **Performance Analytics**: Track selector success rates over time
- **Advanced AI Models**: Integration with additional AI providers

## Troubleshooting

### 🔧 **Common Issues**
- **API Timeouts**: Increase timeout for complex pages
- **Selector Failures**: Use fallback selectors provided
- **Authentication Errors**: Ensure Firebase auth is properly configured
- **Rate Limiting**: Implement request throttling for high-volume usage

## Technical Architecture

### 🏗️ **System Components**
- **Frontend**: React/Next.js with TypeScript
- **UI Components**: Shadcn/ui component library
- **AI Service**: Google Gemini API integration
- **HTML Parsing**: jsdom for server-side DOM manipulation
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context

This AI-Powered CSS Selector Assistant represents a significant advancement in web scraping automation, making it accessible to users of all technical levels while maintaining the power and flexibility that advanced users require.
