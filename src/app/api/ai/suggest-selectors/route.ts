// src/app/api/ai/suggest-selectors/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateSelectorSuggestions } from '@/lib/ai/selector-ai';
import type { AIAnalysisRequest } from '@/types/selector-assistant';

export async function POST(request: NextRequest) {
  try {
    const body: AIAnalysisRequest = await request.json();
    
    // Validate request
    if (!body.url && !body.htmlContent) {
      return NextResponse.json(
        { error: 'Either URL or HTML content must be provided' },
        { status: 400 }
      );
    }
    
    // Validate URL format if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }
    
    // Generate suggestions
    const result = await generateSelectorSuggestions(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in suggest-selectors API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate selector suggestions',
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
