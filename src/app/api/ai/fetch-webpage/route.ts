// src/app/api/ai/fetch-webpage/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CortexCrawler/1.0 (Web Scraping Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      // Set timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch webpage: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'URL does not return HTML content' },
        { status: 400 }
      );
    }
    
    const htmlContent = await response.text();
    
    // Basic validation - ensure we got HTML
    if (!htmlContent.includes('<html') && !htmlContent.includes('<HTML')) {
      return NextResponse.json(
        { error: 'Response does not appear to be valid HTML' },
        { status: 400 }
      );
    }
    
    // Limit content size (prevent memory issues)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (htmlContent.length > maxSize) {
      return NextResponse.json(
        { error: 'Webpage content is too large (max 5MB)' },
        { status: 413 }
      );
    }
    
    return NextResponse.json({
      htmlContent,
      url: validUrl.toString(),
      contentLength: htmlContent.length,
      contentType,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching webpage:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - webpage took too long to load' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Failed to connect to the webpage' },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch webpage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
