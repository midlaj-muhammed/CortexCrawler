// src/app/api/ai/gemini-analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WebpageAnalysis } from '@/types/selector-assistant';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { prompt, webpageAnalysis }: { prompt: string; webpageAnalysis: WebpageAnalysis } = await request.json();
    
    if (!prompt || !webpageAnalysis) {
      return NextResponse.json(
        { error: 'Prompt and webpage analysis are required' },
        { status: 400 }
      );
    }
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, returning mock response');
      return NextResponse.json(generateMockResponse(webpageAnalysis));
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Enhanced prompt with specific instructions for CSS selector generation
      const enhancedPrompt = `
${prompt}

Additional Instructions:
- Provide CSS selectors that are robust and unlikely to break with minor page changes
- Consider semantic HTML elements when possible
- Avoid overly specific selectors that depend on exact DOM structure
- Include data-* attributes if they appear stable
- Suggest both broad and specific selectors for different use cases
- Explain the trade-offs between specificity and robustness

Webpage Analysis Context:
Title: ${webpageAnalysis.title}
URL: ${webpageAnalysis.url}
DOM Elements Count: ${countDOMElements(webpageAnalysis.domStructure)}

Please respond with valid JSON only, no additional text.
`;
      
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      let parsedResponse;
      try {
        // Clean the response text (remove markdown code blocks if present)
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        console.log('Raw response:', text);
        
        // Fallback to mock response if parsing fails
        return NextResponse.json(generateMockResponse(webpageAnalysis));
      }
      
      // Validate and enhance the response
      const enhancedResponse = enhanceAIResponse(parsedResponse, webpageAnalysis);
      
      return NextResponse.json(enhancedResponse);
      
    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      
      // Return mock response as fallback
      return NextResponse.json(generateMockResponse(webpageAnalysis));
    }
    
  } catch (error) {
    console.error('Error in gemini-analyze API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze with AI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function countDOMElements(elements: any[]): number {
  let count = elements.length;
  for (const element of elements) {
    if (element.children) {
      count += countDOMElements(element.children);
    }
  }
  return count;
}

function generateMockResponse(webpageAnalysis: WebpageAnalysis) {
  return {
    suggestions: [
      {
        id: 'mock-title',
        selector: 'h1, .title, [data-title]',
        type: 'css',
        confidence: 85,
        description: 'Main page title or heading',
        reasoning: 'Targets common title patterns including semantic h1 tags, title classes, and data attributes',
        dataType: 'title',
        fallbackSelectors: ['h1:first-of-type', '.page-title', '#title']
      },
      {
        id: 'mock-content',
        selector: 'p, .content, .description, [data-content]',
        type: 'css',
        confidence: 75,
        description: 'Main content paragraphs and descriptions',
        reasoning: 'Captures paragraph content and common content container patterns',
        dataType: 'paragraph',
        fallbackSelectors: ['.main-content p', 'article p', '.post-content p']
      },
      {
        id: 'mock-links',
        selector: 'a[href]:not([href^="#"]):not([href^="javascript:"])',
        type: 'css',
        confidence: 90,
        description: 'External and internal navigation links',
        reasoning: 'Selects all links while excluding anchors and javascript links',
        dataType: 'link',
        fallbackSelectors: ['a[href]', 'nav a', '.menu a']
      },
      {
        id: 'mock-images',
        selector: 'img[src], picture img, [data-src]',
        type: 'css',
        confidence: 80,
        description: 'Images including lazy-loaded ones',
        reasoning: 'Covers standard images and common lazy-loading patterns',
        dataType: 'image',
        fallbackSelectors: ['img', '.image img', 'figure img']
      }
    ]
  };
}

function enhanceAIResponse(response: any, webpageAnalysis: WebpageAnalysis) {
  // Ensure all suggestions have required fields
  if (response.suggestions && Array.isArray(response.suggestions)) {
    response.suggestions = response.suggestions.map((suggestion: any, index: number) => ({
      id: suggestion.id || `ai-suggestion-${index}`,
      selector: suggestion.selector || '',
      type: suggestion.type || 'css',
      confidence: Math.min(Math.max(suggestion.confidence || 50, 0), 100),
      description: suggestion.description || 'AI-generated selector',
      reasoning: suggestion.reasoning || 'Generated by AI analysis',
      dataType: suggestion.dataType || 'custom',
      fallbackSelectors: Array.isArray(suggestion.fallbackSelectors) ? suggestion.fallbackSelectors : []
    }));
  } else {
    // If no valid suggestions, return mock response
    return generateMockResponse(webpageAnalysis);
  }
  
  return response;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
