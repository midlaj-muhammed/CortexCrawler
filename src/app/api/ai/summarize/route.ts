// src/app/api/ai/summarize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SummarizeRequest {
  textToSummarize: string;
  summaryType?: 'brief' | 'detailed' | 'bullet-points' | 'key-insights';
  maxLength?: number;
}

interface SummarizeResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  processingTime: number;
  summaryType: string;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { textToSummarize, summaryType = 'brief', maxLength = 500 }: SummarizeRequest = await request.json();

    if (!textToSummarize || textToSummarize.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text to summarize is required' },
        { status: 400 }
      );
    }

    // Validate text length (prevent extremely large inputs)
    if (textToSummarize.length > 50000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 50,000 characters allowed.' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, returning fallback summary');
      return NextResponse.json(generateFallbackSummary(textToSummarize, summaryType, startTime));
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build the summarization prompt based on type
      const prompt = buildSummarizationPrompt(textToSummarize, summaryType, maxLength);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();

      const processingTime = Date.now() - startTime;

      const summarizeResponse: SummarizeResponse = {
        summary,
        originalLength: textToSummarize.length,
        summaryLength: summary.length,
        compressionRatio: Math.round((summary.length / textToSummarize.length) * 100),
        processingTime,
        summaryType
      };

      return NextResponse.json(summarizeResponse);

    } catch (aiError) {
      console.error('Gemini AI error during summarization:', aiError);

      // Return fallback summary if AI fails
      return NextResponse.json(generateFallbackSummary(textToSummarize, summaryType, startTime));
    }

  } catch (error) {
    console.error('Error in summarize API:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildSummarizationPrompt(text: string, summaryType: string, maxLength: number): string {
  const basePrompt = `You are an AI assistant specialized in analyzing web-scraped content. Please analyze and summarize the following data that was extracted from a webpage:

---
EXTRACTED CONTENT:
${text}
---

`;

  switch (summaryType) {
    case 'brief':
      return basePrompt + `Create a brief, professional summary in ${maxLength} characters or less. Focus on:
- Main topic or purpose of the webpage
- Key information or data points
- Primary value or message
Write in clear, business-appropriate language suitable for data analysis reports.`;

    case 'detailed':
      return basePrompt + `Provide a comprehensive summary that covers:
- Main content themes and topics
- Important data points and information
- Context and purpose of the content
- Any notable patterns or insights
Organize logically and maintain professional tone. Aim for approximately ${maxLength} characters.`;

    case 'bullet-points':
      return basePrompt + `Create a structured bullet-point summary with:
- Main topic/purpose as first bullet
- Key data points and information
- Important details or insights
- Any actionable information
Use clear, concise language. Maximum ${Math.floor(maxLength / 50)} bullet points.`;

    case 'key-insights':
      return basePrompt + `Extract and present the most valuable insights from this web content:
- What is the main purpose/topic of this page?
- What are the key data points or information?
- What would be most valuable for someone analyzing this data?
- Any patterns, trends, or notable findings?
Focus on actionable intelligence and significant details. Keep under ${maxLength} characters.`;

    default:
      return basePrompt + `Provide a clear, informative summary of the scraped content including:
- Main topic and purpose
- Key information and data points
- Important details worth noting
Keep it concise but comprehensive, under ${maxLength} characters.`;
  }
}

function generateFallbackSummary(text: string, summaryType: string, startTime: number): SummarizeResponse {
  // Generate a basic extractive summary as fallback
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const topSentences = sentences.slice(0, 3).join('. ').trim();

  let fallbackSummary = '';

  switch (summaryType) {
    case 'brief':
      fallbackSummary = topSentences.length > 200 ? topSentences.substring(0, 200) + '...' : topSentences;
      break;
    case 'bullet-points':
      const bullets = sentences.slice(0, 5).map(s => `• ${s.trim()}`).join('\n');
      fallbackSummary = bullets;
      break;
    case 'key-insights':
      fallbackSummary = `Key content extracted: ${topSentences}`;
      break;
    default:
      fallbackSummary = topSentences;
  }

  if (!fallbackSummary) {
    fallbackSummary = 'Summary: The extracted content contains information that has been processed for analysis.';
  }

  const processingTime = Date.now() - startTime;

  return {
    summary: fallbackSummary,
    originalLength: text.length,
    summaryLength: fallbackSummary.length,
    compressionRatio: Math.round((fallbackSummary.length / text.length) * 100),
    processingTime,
    summaryType
  };
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
