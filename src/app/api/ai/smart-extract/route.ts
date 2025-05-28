// src/app/api/ai/smart-extract/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SmartExtractRequest {
  url: string;
  extractionFocus?: 'general' | 'business' | 'product' | 'article' | 'contact' | 'data';
  customInstructions?: string;
}

interface SmartExtractResponse {
  extractedData: string;
  metadata: {
    url: string;
    extractedAt: string;
    pageTitle: string;
    pageType: string;
    contentLength: number;
    processingTime: number;
    extractionFocus: string;
  };
  insights: {
    mainTopics: string[];
    keyDataPoints: string[];
    contentQuality: 'high' | 'medium' | 'low';
    recommendedActions: string[];
  };
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { url, extractionFocus = 'general', customInstructions }: SmartExtractRequest = await request.json();
    
    if (!url || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'URL is required for Smart Extract AI' },
        { status: 400 }
      );
    }
    
    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Security check - only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }
    
    // Fetch webpage content
    let htmlContent: string;
    let pageTitle = '';
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'CortexCrawler/1.0 (AI-Powered Web Scraper)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(30000), // 30 seconds
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch webpage: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      htmlContent = await fetchResponse.text();
      
      // Extract page title
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      pageTitle = titleMatch ? titleMatch[1].trim() : 'Unknown Page';
      
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch webpage content' },
        { status: 500 }
      );
    }
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, returning fallback extraction');
      return NextResponse.json(generateFallbackExtraction(htmlContent, url, pageTitle, extractionFocus, startTime));
    }
    
    try {
      // Perform AI-powered smart extraction
      const extractionResult = await performSmartExtraction(htmlContent, url, extractionFocus, customInstructions);
      
      const processingTime = Date.now() - startTime;
      
      const response: SmartExtractResponse = {
        extractedData: extractionResult.extractedData,
        metadata: {
          url: validUrl.toString(),
          extractedAt: new Date().toISOString(),
          pageTitle,
          pageType: extractionResult.pageType,
          contentLength: htmlContent.length,
          processingTime,
          extractionFocus
        },
        insights: extractionResult.insights
      };
      
      return NextResponse.json(response);
      
    } catch (aiError) {
      console.error('Gemini AI error during smart extraction:', aiError);
      
      // Return fallback extraction if AI fails
      return NextResponse.json(generateFallbackExtraction(htmlContent, url, pageTitle, extractionFocus, startTime));
    }
    
  } catch (error) {
    console.error('Error in smart extract API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to perform smart extraction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function performSmartExtraction(
  htmlContent: string, 
  url: string, 
  extractionFocus: string,
  customInstructions?: string
): Promise<{
  extractedData: string;
  pageType: string;
  insights: {
    mainTopics: string[];
    keyDataPoints: string[];
    contentQuality: 'high' | 'medium' | 'low';
    recommendedActions: string[];
  };
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Clean HTML content for AI analysis
    const cleanedContent = cleanHtmlForAI(htmlContent);
    
    // Build extraction prompt based on focus
    const prompt = buildSmartExtractionPrompt(cleanedContent, url, extractionFocus, customInstructions);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Parse AI response
    const parsedResult = parseAIExtractionResponse(aiResponse);
    
    return parsedResult;
    
  } catch (error) {
    console.error('Error in AI extraction:', error);
    throw error;
  }
}

function cleanHtmlForAI(htmlContent: string): string {
  // Remove scripts, styles, and other non-content elements
  let cleaned = htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Limit content length for AI processing
  if (cleaned.length > 15000) {
    cleaned = cleaned.substring(0, 15000) + '...';
  }
  
  return cleaned;
}

function buildSmartExtractionPrompt(content: string, url: string, focus: string, customInstructions?: string): string {
  const basePrompt = `You are an AI-powered web scraping assistant. Analyze the following webpage content and extract the most valuable and relevant information.

URL: ${url}
EXTRACTION FOCUS: ${focus}
${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

WEBPAGE CONTENT:
---
${content}
---

Please provide a comprehensive extraction in the following JSON format:
{
  "extractedData": "Detailed extracted information organized logically",
  "pageType": "Type of webpage (e.g., product, article, business, contact, etc.)",
  "insights": {
    "mainTopics": ["topic1", "topic2", "topic3"],
    "keyDataPoints": ["data1", "data2", "data3"],
    "contentQuality": "high|medium|low",
    "recommendedActions": ["action1", "action2"]
  }
}

EXTRACTION GUIDELINES based on focus:`;

  switch (focus) {
    case 'business':
      return basePrompt + `
- Company name, description, and services
- Contact information (address, phone, email)
- Business hours and location details
- Key personnel and team information
- Products/services offered
- Pricing information if available`;

    case 'product':
      return basePrompt + `
- Product name, description, and specifications
- Pricing and availability information
- Features and benefits
- Customer reviews and ratings
- Technical specifications
- Related products or alternatives`;

    case 'article':
      return basePrompt + `
- Article title and main content
- Author information and publication date
- Key points and main arguments
- Supporting data and statistics
- Conclusions and takeaways
- Related articles or references`;

    case 'contact':
      return basePrompt + `
- All contact information (phone, email, address)
- Social media profiles and links
- Business hours and availability
- Contact forms and methods
- Location and directions
- Key personnel contact details`;

    case 'data':
      return basePrompt + `
- Structured data and statistics
- Tables, lists, and organized information
- Numerical data and metrics
- Charts and graph information
- Database-like content
- Downloadable resources and files`;

    default: // general
      return basePrompt + `
- Main content and key information
- Important headings and sections
- Contact details if available
- Links and references
- Any structured data present
- Notable features or highlights

Focus on extracting the most valuable and actionable information from this webpage.`;
  }
}

function parseAIExtractionResponse(aiResponse: string): {
  extractedData: string;
  pageType: string;
  insights: {
    mainTopics: string[];
    keyDataPoints: string[];
    contentQuality: 'high' | 'medium' | 'low';
    recommendedActions: string[];
  };
} {
  try {
    // Try to parse JSON response
    const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      extractedData: parsed.extractedData || 'AI extraction completed',
      pageType: parsed.pageType || 'general',
      insights: {
        mainTopics: Array.isArray(parsed.insights?.mainTopics) ? parsed.insights.mainTopics : [],
        keyDataPoints: Array.isArray(parsed.insights?.keyDataPoints) ? parsed.insights.keyDataPoints : [],
        contentQuality: ['high', 'medium', 'low'].includes(parsed.insights?.contentQuality) ? parsed.insights.contentQuality : 'medium',
        recommendedActions: Array.isArray(parsed.insights?.recommendedActions) ? parsed.insights.recommendedActions : []
      }
    };
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    
    // Fallback: treat entire response as extracted data
    return {
      extractedData: aiResponse || 'AI extraction completed but response format was unexpected',
      pageType: 'general',
      insights: {
        mainTopics: [],
        keyDataPoints: [],
        contentQuality: 'medium',
        recommendedActions: []
      }
    };
  }
}

function generateFallbackExtraction(
  htmlContent: string, 
  url: string, 
  pageTitle: string, 
  extractionFocus: string, 
  startTime: number
): SmartExtractResponse {
  // Basic text extraction as fallback
  const cleanedContent = cleanHtmlForAI(htmlContent);
  const sentences = cleanedContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const extractedData = sentences.slice(0, 10).join('. ').trim();
  
  const processingTime = Date.now() - startTime;
  
  return {
    extractedData: extractedData || 'Content extracted from webpage',
    metadata: {
      url,
      extractedAt: new Date().toISOString(),
      pageTitle,
      pageType: 'general',
      contentLength: htmlContent.length,
      processingTime,
      extractionFocus
    },
    insights: {
      mainTopics: ['webpage content'],
      keyDataPoints: [`${sentences.length} content sections found`],
      contentQuality: 'medium',
      recommendedActions: ['Review extracted content', 'Consider using CSS selectors for specific data']
    }
  };
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
