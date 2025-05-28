// src/app/api/extract/css-selector/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface CSSExtractRequest {
  url: string;
  cssSelector: string;
  extractionType?: 'text' | 'html' | 'attributes' | 'all';
}

interface CSSExtractResponse {
  extractedData: string;
  elementsFound: number;
  selectors: string[];
  metadata: {
    url: string;
    extractedAt: string;
    extractionType: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url, cssSelector, extractionType = 'text' }: CSSExtractRequest = await request.json();
    
    if (!url || !cssSelector) {
      return NextResponse.json(
        { error: 'URL and CSS selector are required' },
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
    
    // Fetch webpage content
    let htmlContent: string;
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'CortexCrawler/1.0 (Web Scraping Bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(30000), // 30 seconds
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch webpage: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      htmlContent = await fetchResponse.text();
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch webpage content' },
        { status: 500 }
      );
    }
    
    // Extract data using CSS selectors
    const extractionResult = await extractWithCSSSelectors(htmlContent, cssSelector, extractionType);
    
    const response: CSSExtractResponse = {
      extractedData: extractionResult.data,
      elementsFound: extractionResult.elementsFound,
      selectors: extractionResult.selectors,
      metadata: {
        url: validUrl.toString(),
        extractedAt: new Date().toISOString(),
        extractionType
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in CSS selector extraction:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract data with CSS selectors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function extractWithCSSSelectors(
  htmlContent: string, 
  cssSelector: string, 
  extractionType: string
): Promise<{ data: string; elementsFound: number; selectors: string[] }> {
  try {
    // Parse HTML using jsdom
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;
    
    // Split multiple selectors (comma-separated)
    const selectors = cssSelector.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const extractedData: string[] = [];
    let totalElementsFound = 0;
    
    for (const selector of selectors) {
      try {
        const elements = doc.querySelectorAll(selector);
        totalElementsFound += elements.length;
        
        for (const element of elements) {
          let extractedContent = '';
          
          switch (extractionType) {
            case 'text':
              extractedContent = element.textContent?.trim() || '';
              break;
            case 'html':
              extractedContent = element.innerHTML || '';
              break;
            case 'attributes':
              const attrs: string[] = [];
              for (const attr of element.attributes) {
                attrs.push(`${attr.name}="${attr.value}"`);
              }
              extractedContent = attrs.join(' ');
              break;
            case 'all':
              const textContent = element.textContent?.trim() || '';
              const htmlContent = element.innerHTML || '';
              const attributes: string[] = [];
              for (const attr of element.attributes) {
                attributes.push(`${attr.name}="${attr.value}"`);
              }
              extractedContent = JSON.stringify({
                text: textContent,
                html: htmlContent,
                attributes: attributes.join(' '),
                tagName: element.tagName.toLowerCase()
              }, null, 2);
              break;
            default:
              extractedContent = element.textContent?.trim() || '';
          }
          
          if (extractedContent) {
            extractedData.push(extractedContent);
          }
        }
      } catch (selectorError) {
        console.error(`Error with selector "${selector}":`, selectorError);
        // Continue with other selectors
      }
    }
    
    // Format the extracted data
    let formattedData = '';
    if (extractedData.length > 0) {
      if (extractionType === 'all') {
        formattedData = extractedData.join('\n\n---\n\n');
      } else {
        formattedData = extractedData.join('\n');
      }
    } else {
      formattedData = 'No data found with the provided CSS selectors.';
    }
    
    return {
      data: formattedData,
      elementsFound: totalElementsFound,
      selectors
    };
    
  } catch (error) {
    console.error('Error extracting with CSS selectors:', error);
    throw error;
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
