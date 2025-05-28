// src/app/api/extract/api-endpoint/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface ApiEndpointRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  authentication?: {
    type: 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth';
    credentials?: {
      apiKey?: string;
      apiKeyHeader?: string;
      token?: string;
      username?: string;
      password?: string;
      oauthToken?: string;
    };
  };
  responseFormat?: 'json' | 'xml' | 'csv' | 'text';
  dataMapping?: {
    rootPath?: string;
    fields?: Record<string, string>;
  };
  pagination?: {
    enabled: boolean;
    type?: 'offset' | 'cursor' | 'page';
    pageParam?: string;
    limitParam?: string;
    maxPages?: number;
  };
  timeout?: number;
}

interface ApiEndpointResponse {
  extractedData: string;
  metadata: {
    url: string;
    method: string;
    extractedAt: string;
    responseFormat: string;
    statusCode: number;
    responseSize: number;
    processingTime: number;
    pagesProcessed: number;
  };
  performance: {
    requestTime: number;
    parseTime: number;
    totalTime: number;
    rateLimitHit: boolean;
    retryCount: number;
  };
  apiInfo: {
    hasAuthentication: boolean;
    responseHeaders: Record<string, string>;
    contentType: string;
    dataStructure: string;
    recordCount: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      authentication = { type: 'none' },
      responseFormat = 'json',
      dataMapping,
      pagination = { enabled: false },
      timeout = 30000
    }: ApiEndpointRequest = await request.json();

    if (!url || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'API endpoint URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid API endpoint URL format' },
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

    try {
      const result = await performApiExtraction({
        url,
        method,
        headers,
        body,
        authentication,
        responseFormat,
        dataMapping,
        pagination,
        timeout,
        startTime
      });

      return NextResponse.json(result);

    } catch (apiError) {
      console.error('API extraction error:', apiError);

      // Return detailed error information
      return NextResponse.json(
        {
          error: 'API extraction failed',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
          metadata: {
            url,
            method,
            extractedAt: new Date().toISOString(),
            responseFormat,
            statusCode: 0,
            responseSize: 0,
            processingTime: Date.now() - startTime,
            pagesProcessed: 0
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in API endpoint extraction:', error);

    return NextResponse.json(
      {
        error: 'Failed to process API endpoint request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function performApiExtraction(options: any): Promise<ApiEndpointResponse> {
  const {
    url,
    method,
    headers,
    body,
    authentication,
    responseFormat,
    dataMapping,
    pagination,
    timeout,
    startTime
  } = options;

  const requestStart = Date.now();
  let retryCount = 0;
  let rateLimitHit = false;
  let allData: any[] = [];
  let pagesProcessed = 0;
  let finalStatusCode = 200;
  let finalResponseHeaders: Record<string, string> = {};
  let totalResponseSize = 0;

  // Build request headers with authentication
  const requestHeaders = { ...headers };

  // Add authentication headers
  if (authentication.type === 'api-key' && authentication.credentials?.apiKey) {
    const headerName = authentication.credentials.apiKeyHeader || 'X-API-Key';
    requestHeaders[headerName] = authentication.credentials.apiKey;
  } else if (authentication.type === 'bearer' && authentication.credentials?.token) {
    requestHeaders['Authorization'] = `Bearer ${authentication.credentials.token}`;
  } else if (authentication.type === 'basic' && authentication.credentials?.username && authentication.credentials?.password) {
    const credentials = btoa(`${authentication.credentials.username}:${authentication.credentials.password}`);
    requestHeaders['Authorization'] = `Basic ${credentials}`;
  } else if (authentication.type === 'oauth' && authentication.credentials?.oauthToken) {
    requestHeaders['Authorization'] = `Bearer ${authentication.credentials.oauthToken}`;
  }

  // Set content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(method) && body && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  try {
    let currentUrl = url;
    let hasMorePages = true;
    const maxPages = pagination.maxPages || 10;

    while (hasMorePages && pagesProcessed < maxPages) {
      try {
        const response = await fetch(currentUrl, {
          method,
          headers: requestHeaders,
          body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined,
          signal: AbortSignal.timeout(timeout)
        });

        finalStatusCode = response.status;
        finalResponseHeaders = Object.fromEntries(response.headers.entries());

        if (!response.ok) {
          if (response.status === 429) {
            rateLimitHit = true;
            // Wait and retry for rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            retryCount++;
            if (retryCount < 3) continue;
          }
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        totalResponseSize += responseText.length;
        pagesProcessed++;

        // Parse response based on format
        const parsedData = parseApiResponse(responseText, responseFormat, dataMapping);

        if (Array.isArray(parsedData)) {
          allData.push(...parsedData);
        } else {
          allData.push(parsedData);
        }

        // Handle pagination
        if (pagination.enabled && pagesProcessed < maxPages) {
          const nextUrl = getNextPageUrl(response, parsedData, pagination, currentUrl, pagesProcessed);
          if (nextUrl && nextUrl !== currentUrl) {
            currentUrl = nextUrl;
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }

      } catch (pageError) {
        if (pagesProcessed === 0) {
          throw pageError; // Fail if first page fails
        } else {
          console.warn(`Failed to fetch page ${pagesProcessed + 1}:`, pageError);
          hasMorePages = false; // Stop pagination on error
        }
      }
    }

    const requestTime = Date.now() - requestStart;
    const parseStart = Date.now();

    // Format extracted data
    const formattedData = formatExtractedData(allData, responseFormat, dataMapping);

    const parseTime = Date.now() - parseStart;
    const totalTime = Date.now() - startTime;

    // Analyze data structure
    const dataStructure = analyzeDataStructure(allData);

    const result: ApiEndpointResponse = {
      extractedData: formattedData,
      metadata: {
        url,
        method,
        extractedAt: new Date().toISOString(),
        responseFormat,
        statusCode: finalStatusCode,
        responseSize: totalResponseSize,
        processingTime: totalTime,
        pagesProcessed
      },
      performance: {
        requestTime,
        parseTime,
        totalTime,
        rateLimitHit,
        retryCount
      },
      apiInfo: {
        hasAuthentication: authentication.type !== 'none',
        responseHeaders: finalResponseHeaders,
        contentType: finalResponseHeaders['content-type'] || 'unknown',
        dataStructure,
        recordCount: Array.isArray(allData) ? allData.length : 1
      }
    };

    return result;

  } catch (error) {
    console.error('API extraction error:', error);
    throw error;
  }
}

function parseApiResponse(responseText: string, format: string, dataMapping?: any): any {
  try {
    switch (format) {
      case 'json':
        const jsonData = JSON.parse(responseText);
        return extractDataFromJson(jsonData, dataMapping);

      case 'xml':
        return parseXmlResponse(responseText, dataMapping);

      case 'csv':
        return parseCsvResponse(responseText, dataMapping);

      case 'text':
      default:
        return responseText;
    }
  } catch (error) {
    console.error('Error parsing API response:', error);
    return responseText; // Return raw text if parsing fails
  }
}

function extractDataFromJson(data: any, dataMapping?: any): any {
  if (!dataMapping || !dataMapping.rootPath) {
    return data;
  }

  // Navigate to root path
  const pathParts = dataMapping.rootPath.split('.');
  let current = data;

  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return data; // Return original if path not found
    }
  }

  // Apply field mapping if specified
  if (dataMapping.fields && Array.isArray(current)) {
    return current.map(item => {
      const mapped: any = {};
      for (const [newKey, oldKey] of Object.entries(dataMapping.fields)) {
        if (item && typeof item === 'object' && oldKey in item) {
          mapped[newKey] = item[oldKey as string];
        }
      }
      return Object.keys(mapped).length > 0 ? mapped : item;
    });
  }

  return current;
}

function parseXmlResponse(xmlText: string, dataMapping?: any): any {
  // Basic XML parsing - in production, use a proper XML parser
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Convert XML to JSON-like structure
    const result = xmlToJson(xmlDoc.documentElement);
    return extractDataFromJson(result, dataMapping);
  } catch (error) {
    console.error('XML parsing error:', error);
    return xmlText;
  }
}

function xmlToJson(xml: Element): any {
  const result: any = {};

  // Handle attributes
  if (xml.attributes.length > 0) {
    result['@attributes'] = {};
    for (let i = 0; i < xml.attributes.length; i++) {
      const attr = xml.attributes[i];
      result['@attributes'][attr.name] = attr.value;
    }
  }

  // Handle child nodes
  if (xml.children.length > 0) {
    for (let i = 0; i < xml.children.length; i++) {
      const child = xml.children[i];
      const childName = child.tagName;

      if (result[childName]) {
        if (!Array.isArray(result[childName])) {
          result[childName] = [result[childName]];
        }
        result[childName].push(xmlToJson(child));
      } else {
        result[childName] = xmlToJson(child);
      }
    }
  } else {
    result['#text'] = xml.textContent;
  }

  return result;
}

function parseCsvResponse(csvText: string, dataMapping?: any): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return data;
}

function getNextPageUrl(response: Response, data: any, pagination: any, currentUrl: string, currentPage: number): string | null {
  if (!pagination.enabled) return null;

  try {
    const url = new URL(currentUrl);

    switch (pagination.type) {
      case 'offset':
        const currentOffset = parseInt(url.searchParams.get(pagination.pageParam || 'offset') || '0');
        const limit = parseInt(url.searchParams.get(pagination.limitParam || 'limit') || '10');
        url.searchParams.set(pagination.pageParam || 'offset', (currentOffset + limit).toString());
        return url.toString();

      case 'page':
        const currentPageNum = parseInt(url.searchParams.get(pagination.pageParam || 'page') || '1');
        url.searchParams.set(pagination.pageParam || 'page', (currentPageNum + 1).toString());
        return url.toString();

      case 'cursor':
        // Look for cursor in response data or headers
        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
          const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          if (nextMatch) return nextMatch[1];
        }

        // Look for cursor in data
        if (data && typeof data === 'object' && data.next_cursor) {
          url.searchParams.set(pagination.pageParam || 'cursor', data.next_cursor);
          return url.toString();
        }
        return null;

      default:
        return null;
    }
  } catch (error) {
    console.error('Error generating next page URL:', error);
    return null;
  }
}

function formatExtractedData(data: any[], format: string, dataMapping?: any): string {
  if (data.length === 0) return 'No data extracted from API endpoint.';

  let formattedData = `API ENDPOINT EXTRACTION RESULTS\n`;
  formattedData += `Records Extracted: ${data.length}\n`;
  formattedData += `Response Format: ${format.toUpperCase()}\n\n`;

  // Limit data size for large datasets to prevent overwhelming the system
  const maxRecordsToShow = data.length > 20 ? 10 : Math.min(data.length, 5);
  const sampleData = data.slice(0, maxRecordsToShow);

  if (format === 'json') {
    formattedData += `EXTRACTED DATA (JSON) - Showing ${maxRecordsToShow} of ${data.length} records:\n`;
    formattedData += JSON.stringify(sampleData, null, 2);

    if (data.length > maxRecordsToShow) {
      formattedData += `\n\n... and ${data.length - maxRecordsToShow} more records (truncated for display)`;

      // Add summary statistics for large datasets
      formattedData += `\n\nDATASET SUMMARY:`;
      formattedData += `\nTotal Records: ${data.length}`;

      if (data.length > 0 && typeof data[0] === 'object') {
        const sampleRecord = data[0];
        const fields = Object.keys(sampleRecord);
        formattedData += `\nFields per Record: ${fields.length}`;
        formattedData += `\nSample Fields: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`;

        // Show data distribution if applicable
        if (sampleRecord.userId) {
          const uniqueUsers = [...new Set(data.map(item => item.userId))];
          formattedData += `\nUnique Users: ${uniqueUsers.length}`;
        }
      }
    }
  } else {
    formattedData += `EXTRACTED DATA - Showing ${maxRecordsToShow} of ${data.length} records:\n`;

    for (let i = 0; i < maxRecordsToShow; i++) {
      formattedData += `\nRecord ${i + 1}:\n`;
      if (typeof sampleData[i] === 'object') {
        formattedData += JSON.stringify(sampleData[i], null, 2);
      } else {
        formattedData += sampleData[i].toString();
      }
    }

    if (data.length > maxRecordsToShow) {
      formattedData += `\n\n... and ${data.length - maxRecordsToShow} more records (truncated for display)`;
    }
  }

  // Ensure the total length doesn't exceed reasonable limits
  if (formattedData.length > 25000) {
    formattedData = formattedData.substring(0, 25000) + '\n\n[Content truncated due to size - full data available for export]';
  }

  return formattedData;
}

function analyzeDataStructure(data: any[]): string {
  if (data.length === 0) return 'Empty dataset';

  const sample = data[0];

  if (Array.isArray(sample)) {
    return 'Array of arrays';
  } else if (typeof sample === 'object' && sample !== null) {
    const keys = Object.keys(sample);
    return `Object with ${keys.length} fields: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
  } else {
    return `Primitive values (${typeof sample})`;
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
