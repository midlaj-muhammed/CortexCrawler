// src/lib/ai/selector-ai.ts

import type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  SelectorSuggestion,
  DataType,
  WebpageAnalysis,
  DOMElement
} from '@/types/selector-assistant';

/**
 * Analyzes webpage content and generates AI-powered CSS selector suggestions
 */
export async function generateSelectorSuggestions(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  const startTime = Date.now();

  try {
    // Fetch webpage content if URL provided
    let htmlContent = request.htmlContent;
    if (request.url && !htmlContent) {
      htmlContent = await fetchWebpageContent(request.url);
    }

    if (!htmlContent) {
      throw new Error('No HTML content provided or fetched');
    }

    // Parse and analyze DOM structure
    const webpageAnalysis = await analyzeWebpageStructure(htmlContent, request.url);

    // Generate AI suggestions using Gemini
    const suggestions = await generateAISuggestions(webpageAnalysis, request);

    // Analyze page complexity and type
    const analysis = analyzePageComplexity(webpageAnalysis);

    const processingTime = Date.now() - startTime;

    return {
      suggestions,
      analysis,
      processingTime
    };
  } catch (error) {
    console.error('Error generating selector suggestions:', error);
    throw error;
  }
}

/**
 * Fetches webpage content from URL
 */
async function fetchWebpageContent(url: string): Promise<string> {
  try {
    // Direct fetch instead of calling our own API
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CortexCrawler/1.0 (Web Scraping Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.statusText}`);
    }

    const htmlContent = await response.text();
    return htmlContent;
  } catch (error) {
    console.error('Error fetching webpage:', error);
    throw error;
  }
}

/**
 * Analyzes webpage structure and extracts DOM elements
 */
async function analyzeWebpageStructure(
  htmlContent: string,
  url?: string
): Promise<WebpageAnalysis> {
  try {
    // Parse HTML using jsdom (server-side)
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // Extract metadata
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || '';

    // Build simplified DOM structure
    const domStructure = buildSimplifiedDOMStructure(doc.body);

    return {
      url: url || '',
      title,
      htmlContent,
      domStructure,
      metadata: {
        description,
        keywords,
        author
      }
    };
  } catch (error) {
    console.error('Error analyzing webpage structure:', error);
    // Return a basic structure if parsing fails
    return {
      url: url || '',
      title: 'Unknown',
      htmlContent,
      domStructure: [],
      metadata: {}
    };
  }
}

/**
 * Builds a simplified DOM structure for analysis
 */
function buildSimplifiedDOMStructure(element: Element, depth = 0): DOMElement[] {
  const elements: DOMElement[] = [];

  // Limit depth to prevent excessive recursion
  if (depth > 5) return elements;

  try {
    for (const child of element.children) {
      const domElement: DOMElement = {
        tagName: child.tagName.toLowerCase(),
        id: child.id || undefined,
        className: child.className || undefined,
        textContent: child.textContent?.slice(0, 100) || undefined,
        attributes: getBasicAttributes(child),
        children: buildSimplifiedDOMStructure(child, depth + 1),
        xpath: generateSimpleXPath(child),
        cssSelector: generateSimpleCSSSelector(child)
      };

      elements.push(domElement);
    }
  } catch (error) {
    console.error('Error building DOM structure:', error);
  }

  return elements;
}

/**
 * Gets basic attributes from an element
 */
function getBasicAttributes(element: Element): Record<string, string> {
  const attributes: Record<string, string> = {};

  try {
    // Only get the most important attributes
    if (element.id) attributes.id = element.id;
    if (element.className) attributes.class = element.className;
    if (element.getAttribute('href')) attributes.href = element.getAttribute('href') || '';
    if (element.getAttribute('src')) attributes.src = element.getAttribute('src') || '';
    if (element.getAttribute('alt')) attributes.alt = element.getAttribute('alt') || '';
    if (element.getAttribute('type')) attributes.type = element.getAttribute('type') || '';
  } catch (error) {
    console.error('Error getting attributes:', error);
  }

  return attributes;
}

/**
 * Generates simple XPath for an element
 */
function generateSimpleXPath(element: Element): string {
  try {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const tagName = element.tagName.toLowerCase();
    if (element.className) {
      const firstClass = element.className.split(' ')[0];
      return `//${tagName}[@class="${firstClass}"]`;
    }

    return `//${tagName}`;
  } catch (error) {
    return '//div';
  }
}

/**
 * Generates simple CSS selector for an element
 */
function generateSimpleCSSSelector(element: Element): string {
  try {
    if (element.id) {
      return `#${element.id}`;
    }

    const tagName = element.tagName.toLowerCase();
    if (element.className) {
      const firstClass = element.className.split(' ')[0];
      return `${tagName}.${firstClass}`;
    }

    return tagName;
  } catch (error) {
    return 'div';
  }
}

/**
 * Generates AI-powered selector suggestions using Gemini
 */
async function generateAISuggestions(
  webpageAnalysis: WebpageAnalysis,
  request: AIAnalysisRequest
): Promise<SelectorSuggestion[]> {
  const prompt = buildAIPrompt(webpageAnalysis, request);

  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback suggestions');
      return generateFallbackSuggestions(webpageAnalysis);
    }

    // Direct Gemini integration
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    let parsedResponse;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      return generateFallbackSuggestions(webpageAnalysis);
    }

    // Validate and enhance the response
    const enhancedResponse = enhanceAIResponse(parsedResponse, webpageAnalysis);
    return enhancedResponse.suggestions || generateFallbackSuggestions(webpageAnalysis);

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    // Return fallback suggestions
    return generateFallbackSuggestions(webpageAnalysis);
  }
}

/**
 * Builds the AI prompt for selector generation
 */
function buildAIPrompt(webpageAnalysis: WebpageAnalysis, request: AIAnalysisRequest): string {
  const targetTypes = request.targetDataTypes || ['title', 'heading', 'paragraph', 'link', 'image'];

  return `
Analyze this webpage and suggest optimal CSS selectors for extracting specific data types.

Webpage Title: ${webpageAnalysis.title}
URL: ${webpageAnalysis.url}
Description: ${webpageAnalysis.metadata.description || 'N/A'}

Target Data Types: ${targetTypes.join(', ')}

DOM Structure Summary:
${summarizeDOMStructure(webpageAnalysis.domStructure)}

Please provide CSS selector suggestions for each target data type with:
1. Primary selector (most reliable)
2. Fallback selectors (2-3 alternatives)
3. Confidence score (0-100)
4. Reasoning for selector choice
5. Expected data type and description

Focus on:
- Robustness across similar pages
- Specificity without being too fragile
- Performance considerations
- Handling dynamic content

Return suggestions in JSON format with the structure:
{
  "suggestions": [
    {
      "selector": "css-selector",
      "dataType": "title|heading|paragraph|etc",
      "confidence": 85,
      "description": "Brief description",
      "reasoning": "Why this selector was chosen",
      "fallbackSelectors": ["fallback1", "fallback2"]
    }
  ]
}
`;
}

/**
 * Summarizes DOM structure for AI analysis
 */
function summarizeDOMStructure(domStructure: DOMElement[]): string {
  const summary: string[] = [];

  function traverse(elements: DOMElement[], depth = 0) {
    if (depth > 3) return; // Limit depth for summary

    for (const element of elements) {
      const indent = '  '.repeat(depth);
      const attrs = element.id ? `#${element.id}` : element.className ? `.${element.className.split(' ')[0]}` : '';
      summary.push(`${indent}${element.tagName}${attrs}`);

      if (element.children.length > 0) {
        traverse(element.children, depth + 1);
      }
    }
  }

  traverse(domStructure);
  return summary.slice(0, 50).join('\n'); // Limit to 50 lines
}

/**
 * Enhances AI response with validation and defaults
 */
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
    return { suggestions: generateFallbackSuggestions(webpageAnalysis) };
  }

  return response;
}

/**
 * Generates fallback suggestions when AI fails
 */
function generateFallbackSuggestions(webpageAnalysis: WebpageAnalysis): SelectorSuggestion[] {
  const suggestions: SelectorSuggestion[] = [];

  // Add common fallback selectors
  const commonSelectors = [
    { selector: 'h1', dataType: 'title' as DataType, description: 'Main page title' },
    { selector: 'h2, h3', dataType: 'heading' as DataType, description: 'Section headings' },
    { selector: 'p', dataType: 'paragraph' as DataType, description: 'Paragraph content' },
    { selector: 'a[href]', dataType: 'link' as DataType, description: 'Links' },
    { selector: 'img[src]', dataType: 'image' as DataType, description: 'Images' }
  ];

  commonSelectors.forEach((item, index) => {
    suggestions.push({
      id: `fallback-${index}`,
      selector: item.selector,
      type: 'css',
      confidence: 60,
      description: item.description,
      reasoning: 'Fallback selector based on common HTML patterns',
      dataType: item.dataType,
      fallbackSelectors: []
    });
  });

  return suggestions;
}

/**
 * Analyzes page complexity and provides recommendations
 */
function analyzePageComplexity(webpageAnalysis: WebpageAnalysis) {
  const elementCount = countElements(webpageAnalysis.domStructure);
  const hasComplexStructure = elementCount > 100;
  const hasDynamicContent = webpageAnalysis.htmlContent.includes('data-react') ||
                           webpageAnalysis.htmlContent.includes('ng-') ||
                           webpageAnalysis.htmlContent.includes('vue-');

  let complexity: 'low' | 'medium' | 'high' = 'low';
  if (hasComplexStructure && hasDynamicContent) {
    complexity = 'high';
  } else if (hasComplexStructure || hasDynamicContent) {
    complexity = 'medium';
  }

  return {
    pageType: detectPageType(webpageAnalysis),
    complexity,
    recommendedApproach: getRecommendedApproach(complexity),
    potentialChallenges: getPotentialChallenges(complexity, hasDynamicContent)
  };
}

function countElements(elements: DOMElement[]): number {
  let count = elements.length;
  for (const element of elements) {
    count += countElements(element.children);
  }
  return count;
}

function detectPageType(analysis: WebpageAnalysis): string {
  const title = analysis.title.toLowerCase();
  const content = analysis.htmlContent.toLowerCase();

  if (content.includes('product') || content.includes('price') || content.includes('cart')) {
    return 'E-commerce Product Page';
  } else if (content.includes('article') || content.includes('blog')) {
    return 'Article/Blog Page';
  } else if (content.includes('search') || content.includes('results')) {
    return 'Search Results Page';
  } else {
    return 'General Content Page';
  }
}

function getRecommendedApproach(complexity: 'low' | 'medium' | 'high'): string {
  switch (complexity) {
    case 'low':
      return 'Use simple CSS selectors targeting semantic HTML elements';
    case 'medium':
      return 'Combine CSS selectors with attribute-based targeting';
    case 'high':
      return 'Consider using XPath selectors and implement fallback strategies';
    default:
      return 'Use CSS selectors with fallback options';
  }
}

function getPotentialChallenges(complexity: 'low' | 'medium' | 'high', hasDynamicContent: boolean): string[] {
  const challenges: string[] = [];

  if (complexity === 'high') {
    challenges.push('Complex DOM structure may require specific selectors');
  }

  if (hasDynamicContent) {
    challenges.push('Dynamic content may change element positions');
    challenges.push('Consider waiting for content to load before scraping');
  }

  if (challenges.length === 0) {
    challenges.push('Standard CSS selectors should work reliably');
  }

  return challenges;
}
