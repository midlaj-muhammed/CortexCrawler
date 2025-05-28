// src/app/api/ai/test-selector/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { SelectorTestResult } from '@/types/selector-assistant';

export async function POST(request: NextRequest) {
  try {
    const { selector, url, htmlContent } = await request.json();

    if (!selector) {
      return NextResponse.json(
        { error: 'Selector is required' },
        { status: 400 }
      );
    }

    if (!url && !htmlContent) {
      return NextResponse.json(
        { error: 'Either URL or HTML content must be provided' },
        { status: 400 }
      );
    }

    let content = htmlContent;

    // Fetch content if URL provided
    if (url && !content) {
      try {
        const fetchResponse = await fetch('/api/ai/fetch-webpage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!fetchResponse.ok) {
          throw new Error('Failed to fetch webpage');
        }

        const fetchData = await fetchResponse.json();
        content = fetchData.htmlContent;
      } catch (fetchError) {
        return NextResponse.json(
          { error: 'Failed to fetch webpage for testing' },
          { status: 500 }
        );
      }
    }

    // Test the selector
    const testResult = await testSelectorOnContent(selector, content);

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('Error testing selector:', error);

    return NextResponse.json(
      {
        error: 'Failed to test selector',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function testSelectorOnContent(selector: string, htmlContent: string): Promise<SelectorTestResult> {
  try {
    // Use jsdom for server-side HTML parsing
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    const elements = doc.querySelectorAll(selector);
    const elementsFound = elements.length;

    // Extract sample content
    const sampleContent: string[] = [];
    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const element = elements[i];
      let content = '';

      // Get appropriate content based on element type
      if (element.tagName.toLowerCase() === 'img') {
        content = element.getAttribute('src') || element.getAttribute('alt') || '[Image]';
      } else if (element.tagName.toLowerCase() === 'a') {
        content = element.textContent?.trim() || element.getAttribute('href') || '[Link]';
      } else {
        content = element.textContent?.trim() || '[No text content]';
      }

      if (content && content.length > 0) {
        sampleContent.push(content.substring(0, 100)); // Limit to 100 chars
      }
    }

    return {
      selector,
      elementsFound,
      sampleContent,
      isValid: elementsFound > 0,
    };

  } catch (error) {
    console.error('Error testing selector:', error);

    return {
      selector,
      elementsFound: 0,
      sampleContent: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function testSelectorServerSide(selector: string, htmlContent: string): SelectorTestResult {
  try {
    // Simple server-side testing using regex patterns
    // This is a fallback and not as accurate as DOM parsing

    let elementsFound = 0;
    const sampleContent: string[] = [];

    // Handle common selector patterns
    if (selector.includes('#')) {
      // ID selector
      const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        const id = idMatch[1];
        const regex = new RegExp(`id=["']${id}["'][^>]*>([^<]*)<`, 'gi');
        const matches = htmlContent.match(regex);
        elementsFound = matches ? matches.length : 0;

        if (matches) {
          matches.slice(0, 5).forEach(match => {
            const contentMatch = match.match(/>([^<]*)</);
            if (contentMatch && contentMatch[1].trim()) {
              sampleContent.push(contentMatch[1].trim().substring(0, 100));
            }
          });
        }
      }
    } else if (selector.includes('.')) {
      // Class selector
      const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
      if (classMatch) {
        const className = classMatch[1];
        const regex = new RegExp(`class=["'][^"']*${className}[^"']*["'][^>]*>([^<]*)<`, 'gi');
        const matches = htmlContent.match(regex);
        elementsFound = matches ? matches.length : 0;

        if (matches) {
          matches.slice(0, 5).forEach(match => {
            const contentMatch = match.match(/>([^<]*)</);
            if (contentMatch && contentMatch[1].trim()) {
              sampleContent.push(contentMatch[1].trim().substring(0, 100));
            }
          });
        }
      }
    } else {
      // Tag selector
      const tagName = selector.toLowerCase();
      const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'gi');
      const matches = htmlContent.match(regex);
      elementsFound = matches ? matches.length : 0;

      if (matches) {
        matches.slice(0, 5).forEach(match => {
          const contentMatch = match.match(/>([^<]*)</);
          if (contentMatch && contentMatch[1].trim()) {
            sampleContent.push(contentMatch[1].trim().substring(0, 100));
          }
        });
      }
    }

    return {
      selector,
      elementsFound,
      sampleContent,
      isValid: elementsFound > 0,
    };

  } catch (error) {
    return {
      selector,
      elementsFound: 0,
      sampleContent: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Server-side testing failed'
    };
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
