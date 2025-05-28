// src/types/selector-assistant.ts

export interface WebpageAnalysis {
  url: string;
  title: string;
  htmlContent: string;
  domStructure: DOMElement[];
  metadata: {
    description?: string;
    keywords?: string;
    author?: string;
  };
}

export interface DOMElement {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  attributes: Record<string, string>;
  children: DOMElement[];
  xpath: string;
  cssSelector: string;
}

export interface SelectorSuggestion {
  id: string;
  selector: string;
  type: 'css' | 'xpath';
  confidence: number;
  description: string;
  reasoning: string;
  dataType: DataType;
  fallbackSelectors: string[];
  testResults?: {
    elementsFound: number;
    sampleContent: string[];
  };
}

export type DataType = 
  | 'title'
  | 'heading'
  | 'paragraph'
  | 'link'
  | 'image'
  | 'price'
  | 'description'
  | 'date'
  | 'author'
  | 'category'
  | 'rating'
  | 'review'
  | 'contact'
  | 'navigation'
  | 'custom';

export interface SelectorTestResult {
  selector: string;
  elementsFound: number;
  sampleContent: string[];
  isValid: boolean;
  error?: string;
}

export interface AIAnalysisRequest {
  url?: string;
  htmlContent?: string;
  targetDataTypes?: DataType[];
  customPrompt?: string;
}

export interface AIAnalysisResponse {
  suggestions: SelectorSuggestion[];
  analysis: {
    pageType: string;
    complexity: 'low' | 'medium' | 'high';
    recommendedApproach: string;
    potentialChallenges: string[];
  };
  processingTime: number;
}

export interface SelectorAssistantState {
  isLoading: boolean;
  error: string | null;
  webpageAnalysis: WebpageAnalysis | null;
  suggestions: SelectorSuggestion[];
  selectedSuggestions: string[];
  testResults: Record<string, SelectorTestResult>;
}
