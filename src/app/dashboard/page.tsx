
// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CrawlerForm, type CrawlerFormValues } from '@/components/crawler/crawler-form';
import { ResultsDisplay } from '@/components/crawler/results-display';
import { SummaryDisplay } from '@/components/crawler/summary-display';
import { SelectorAssistant } from '@/components/crawler/selector-assistant';
import { LogoIcon } from '@/components/icons/logo-icon';
// AI imports temporarily disabled for build
// import { smartExtract, type SmartExtractInput, type SmartExtractOutput } from '@/ai/flows/smart-extract';
// import { summarizeText, type SummarizeTextInput, type SummarizeTextOutput } from '@/ai/flows/summarize-text-flow';

// Temporary placeholder types and functions
type SmartExtractInput = { url: string };
type SmartExtractOutput = { extractedData: string };
type SummarizeTextInput = { textToSummarize: string };
type SummarizeTextOutput = {
  summary: string;
  stats?: {
    originalLength?: number;
    summaryLength?: number;
    compressionRatio?: number;
    processingTime?: number;
    summaryType?: string;
  };
};

const smartExtract = async (input: SmartExtractInput): Promise<SmartExtractOutput> => {
  try {
    const response = await fetch('/api/ai/smart-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: input.url,
        extractionFocus: 'general',
        customInstructions: 'Extract the most valuable and relevant information from this webpage, focusing on main content, key data points, and actionable information.'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform smart extraction');
    }

    const result = await response.json();

    // Format the extracted data with metadata and insights
    let formattedData = `SMART AI EXTRACTION RESULTS\n`;
    formattedData += `URL: ${result.metadata.url}\n`;
    formattedData += `Page Title: ${result.metadata.pageTitle}\n`;
    formattedData += `Page Type: ${result.metadata.pageType}\n`;
    formattedData += `Processing Time: ${result.metadata.processingTime}ms\n\n`;

    formattedData += `EXTRACTED CONTENT:\n`;
    formattedData += `${result.extractedData}\n\n`;

    if (result.insights.mainTopics.length > 0) {
      formattedData += `MAIN TOPICS:\n`;
      result.insights.mainTopics.forEach((topic, index) => {
        formattedData += `${index + 1}. ${topic}\n`;
      });
      formattedData += `\n`;
    }

    if (result.insights.keyDataPoints.length > 0) {
      formattedData += `KEY DATA POINTS:\n`;
      result.insights.keyDataPoints.forEach((point, index) => {
        formattedData += `• ${point}\n`;
      });
      formattedData += `\n`;
    }

    formattedData += `CONTENT QUALITY: ${result.insights.contentQuality.toUpperCase()}\n`;

    if (result.insights.recommendedActions.length > 0) {
      formattedData += `\nRECOMMENDED ACTIONS:\n`;
      result.insights.recommendedActions.forEach((action, index) => {
        formattedData += `${index + 1}. ${action}\n`;
      });
    }

    return { extractedData: formattedData };
  } catch (error) {
    console.error('Error calling Smart Extract AI API:', error);
    // Fallback to basic extraction if API fails
    const fallbackData = generateFallbackSmartExtraction(input.url);
    return { extractedData: fallbackData };
  }
};

// Fallback function for basic smart extraction
const generateFallbackSmartExtraction = (url: string): string => {
  return `SMART AI EXTRACTION (Fallback Mode)\nURL: ${url}\n\nNote: AI-powered extraction is temporarily unavailable. Please try again later or use CSS Selector mode for specific data extraction.\n\nFallback extraction attempted but requires AI service to be available for intelligent content analysis.`;
};

const summarizeText = async (input: SummarizeTextInput): Promise<SummarizeTextOutput> => {
  try {
    // Truncate text if it's too long for summarization (max 45,000 chars to leave buffer)
    let textToSummarize = input.textToSummarize;
    const maxLength = 45000;
    let wasTruncated = false;

    if (textToSummarize.length > maxLength) {
      textToSummarize = textToSummarize.substring(0, maxLength);
      wasTruncated = true;

      // Try to truncate at a natural break point
      const lastPeriod = textToSummarize.lastIndexOf('.');
      const lastNewline = textToSummarize.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > maxLength * 0.8) { // Only use break point if it's not too far back
        textToSummarize = textToSummarize.substring(0, breakPoint + 1);
      }

      textToSummarize += '\n\n[Note: Content was truncated for summarization due to length]';
    }

    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textToSummarize: textToSummarize,
        summaryType: 'key-insights',
        maxLength: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate summary');
    }

    const result = await response.json();

    // Adjust summary if content was truncated
    let summary = result.summary;
    if (wasTruncated) {
      summary += '\n\nNote: This summary is based on a truncated version of the extracted data due to size limitations.';
    }

    return {
      summary: summary,
      stats: {
        originalLength: input.textToSummarize.length, // Use original length
        summaryLength: summary.length,
        compressionRatio: Math.round((summary.length / input.textToSummarize.length) * 100),
        processingTime: result.processingTime,
        summaryType: result.summaryType + (wasTruncated ? ' (truncated)' : '')
      }
    };
  } catch (error) {
    console.error('Error calling summarization API:', error);
    // Fallback to basic summary if API fails
    const fallbackSummary = generateBasicSummary(input.textToSummarize);
    return {
      summary: fallbackSummary,
      stats: {
        originalLength: input.textToSummarize.length,
        summaryLength: fallbackSummary.length,
        compressionRatio: Math.round((fallbackSummary.length / input.textToSummarize.length) * 100),
        processingTime: 0,
        summaryType: 'fallback'
      }
    };
  }
};

// Fallback function for basic summarization
const generateBasicSummary = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return 'No content available to summarize.';
  }

  // Extract first few sentences as a basic summary
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 3).join('. ').trim();

  if (summary.length > 0) {
    return `Summary: ${summary}${summary.endsWith('.') ? '' : '.'}`;
  } else {
    return `Summary: Content extracted with ${text.length} characters of data.`;
  }
};
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { AuthButton } from '@/components/auth/auth-button';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Database,
  Settings,
  HelpCircle,
  Star,
  Download,
  Calendar,
  Users,
  Globe,
  Activity,
  Target,
  Lightbulb,
  ArrowRight,
  Plus,
  Wand2
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [isLoadingExtraction, setIsLoadingExtraction] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<{
    originalLength?: number;
    summaryLength?: number;
    compressionRatio?: number;
    processingTime?: number;
    summaryType?: string;
  } | null>(null);

  // Selector Assistant state
  const [activeTab, setActiveTab] = useState<'crawler' | 'selector-assistant'>('crawler');
  const [selectedSelectors, setSelectedSelectors] = useState<string[]>([]);

  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalExtractions: 127,
    successRate: 98.5,
    lastExtraction: '2 hours ago',
    activeProjects: 5,
    dataProcessed: '2.4GB',
    avgResponseTime: '1.2s'
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleFormSubmit = async (values: CrawlerFormValues) => {
    if (!user) {
       toast({
        title: "Authentication Required",
        description: "Please sign in to use the crawler.",
        variant: "destructive",
      });
      router.push('/auth/signin');
      return;
    }

    setIsLoadingExtraction(true);
    setExtractionError(null);
    setExtractedData(null);
    setSummary(null);
    setSummaryError(null);
    setIsLoadingSummary(false);

    // Handle Full Page Render mode
    if (values.scrapingMode === 'fullPageRender') {
      try {
        const response = await fetch('/api/extract/full-page-render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: values.url,
            waitTime: 5000, // Wait 5 seconds for dynamic content
            extractionType: 'text',
            enableJavaScript: true,
            viewport: { width: 1920, height: 1080 }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Full Page Render extraction failed');
        }

        const result = await response.json();

        // Format the extracted data with metadata
        let formattedData = `FULL PAGE RENDER RESULTS\n`;
        formattedData += `URL: ${result.metadata.url}\n`;
        formattedData += `Page Title: ${result.metadata.pageTitle}\n`;
        formattedData += `Final URL: ${result.metadata.finalUrl}\n`;
        formattedData += `JavaScript Enabled: ${result.metadata.jsEnabled ? 'Yes' : 'No'}\n`;
        formattedData += `Viewport: ${result.metadata.viewportSize}\n\n`;

        formattedData += `PERFORMANCE METRICS:\n`;
        formattedData += `Navigation Time: ${result.performance.navigationTime}ms\n`;
        formattedData += `Render Time: ${result.performance.renderTime}ms\n`;
        formattedData += `Total Time: ${result.performance.totalTime}ms\n`;
        formattedData += `Resources Loaded: ${result.performance.resourcesLoaded}\n\n`;

        formattedData += `PAGE ANALYSIS:\n`;
        formattedData += `Has JavaScript: ${result.pageInfo.hasJavaScript ? 'Yes' : 'No'}\n`;
        formattedData += `Single Page App: ${result.pageInfo.isSPA ? 'Yes' : 'No'}\n`;
        formattedData += `Dynamic Content: ${result.pageInfo.dynamicContent ? 'Yes' : 'No'}\n`;
        formattedData += `Redirects: ${result.pageInfo.redirects}\n\n`;

        formattedData += `EXTRACTED CONTENT:\n`;
        formattedData += `${result.extractedData}`;

        setExtractedData(formattedData);

        toast({
          title: "Full Page Render Successful",
          description: `Page rendered in ${result.performance.totalTime}ms. Now generating summary...`,
        });

        // Generate summary for Full Page Render extracted data
        setIsLoadingSummary(true);
        setSummaryError(null);

        try {
          const summaryInput: SummarizeTextInput = { textToSummarize: result.extractedData };
          const summaryResult: SummarizeTextOutput = await summarizeText(summaryInput);
          setSummary(summaryResult.summary);
          setSummaryStats(summaryResult.stats || null);
          toast({
            title: "Summary Generated",
            description: "AI summary has been generated for the rendered content.",
          });
        } catch (summaryError: any) {
          console.error("Summary generation error:", summaryError);
          setSummaryError(summaryError.message || "Failed to generate summary.");
          toast({
            title: "Summary Failed",
            description: "Page rendered successfully, but summary generation failed.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSummary(false);
        }

      } catch (e: any) {
        console.error("Full Page Render error:", e);
        const errorMessage = e.message || "An unknown error occurred during full page rendering.";
        setExtractionError(errorMessage);
        toast({
          title: "Full Page Render Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
    // Handle API Endpoint mode
    if (values.scrapingMode === 'apiEndpoint') {
      try {
        const response = await fetch('/api/extract/api-endpoint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: values.url,
            method: 'GET',
            responseFormat: 'json',
            authentication: { type: 'none' },
            pagination: { enabled: false },
            timeout: 30000
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API endpoint extraction failed');
        }

        const result = await response.json();

        // Format the extracted data with metadata
        let formattedData = `API ENDPOINT EXTRACTION RESULTS\n`;
        formattedData += `URL: ${result.metadata.url}\n`;
        formattedData += `Method: ${result.metadata.method}\n`;
        formattedData += `Status Code: ${result.metadata.statusCode}\n`;
        formattedData += `Response Format: ${result.metadata.responseFormat}\n`;
        formattedData += `Response Size: ${result.metadata.responseSize} bytes\n`;
        formattedData += `Pages Processed: ${result.metadata.pagesProcessed}\n\n`;

        formattedData += `PERFORMANCE METRICS:\n`;
        formattedData += `Request Time: ${result.performance.requestTime}ms\n`;
        formattedData += `Parse Time: ${result.performance.parseTime}ms\n`;
        formattedData += `Total Time: ${result.performance.totalTime}ms\n`;
        formattedData += `Rate Limited: ${result.performance.rateLimitHit ? 'Yes' : 'No'}\n`;
        formattedData += `Retry Count: ${result.performance.retryCount}\n\n`;

        formattedData += `API ANALYSIS:\n`;
        formattedData += `Authentication: ${result.apiInfo.hasAuthentication ? 'Yes' : 'No'}\n`;
        formattedData += `Content Type: ${result.apiInfo.contentType}\n`;
        formattedData += `Data Structure: ${result.apiInfo.dataStructure}\n`;
        formattedData += `Record Count: ${result.apiInfo.recordCount}\n\n`;

        formattedData += `EXTRACTED DATA:\n`;
        formattedData += `${result.extractedData}`;

        setExtractedData(formattedData);

        toast({
          title: "API Extraction Successful",
          description: `Extracted ${result.apiInfo.recordCount} records in ${result.performance.totalTime}ms. Now generating summary...`,
        });

        // Generate summary for API extracted data
        setIsLoadingSummary(true);
        setSummaryError(null);

        try {
          const summaryInput: SummarizeTextInput = { textToSummarize: result.extractedData };
          const summaryResult: SummarizeTextOutput = await summarizeText(summaryInput);
          setSummary(summaryResult.summary);
          setSummaryStats(summaryResult.stats || null);
          toast({
            title: "Summary Generated",
            description: "AI summary has been generated for the API data.",
          });
        } catch (summaryError: any) {
          console.error("Summary generation error:", summaryError);
          setSummaryError(summaryError.message || "Failed to generate summary.");
          toast({
            title: "Summary Failed",
            description: "API data extracted successfully, but summary generation failed.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSummary(false);
        }

      } catch (e: any) {
        console.error("API Endpoint extraction error:", e);
        const errorMessage = e.message || "An unknown error occurred during API extraction.";
        setExtractionError(errorMessage);
        toast({
          title: "API Extraction Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
    if (values.enablePagination) {
      toast({ title: "UI Demo", description: `Pagination (Depth: ${values.maxPaginationDepth || 'N/A'}) is a UI demonstration and not yet functional.`, duration: 7000 });
    }
    if (values.exportFormat === 'excel') {
      toast({ title: "UI Demo", description: "Excel export is a UI demonstration and not yet functional.", duration: 7000 });
    }
    if (values.webhookUrl) {
      toast({ title: "UI Demo", description: "Webhook notification is a UI demonstration and not yet functional.", duration: 7000 });
    }
     if (values.schedule !== "none") {
        toast({
            title: "Scheduling Information",
            description: `Task scheduling for '${values.schedule}' is a UI demonstration. Backend scheduling is not active.`,
            variant: "default",
            duration: 7000,
        });
    }


    if (values.scrapingMode === 'smartAI') { // Previously values.extractionType === 'smart'
      try {
        const extractInput: SmartExtractInput = { url: values.url };
        const extractResult: SmartExtractOutput = await smartExtract(extractInput);
        setExtractedData(extractResult.extractedData);
        toast({
          title: "Extraction Successful",
          description: "Data has been extracted. Now generating summary...",
        });

        if (extractResult.extractedData) {
          setIsLoadingSummary(true);
          try {
            const summarizeInput: SummarizeTextInput = { textToSummarize: extractResult.extractedData };
            const summaryResult: SummarizeTextOutput = await summarizeText(summarizeInput);
            setSummary(summaryResult.summary);
            setSummaryStats(summaryResult.stats || null);
            toast({
              title: "Summary Generated",
              description: "AI summary has been successfully created.",
            });
          } catch (e: any) {
            console.error("Summarization AI error:", e);
            const summaryErrorMessage = e.message || "An unknown error occurred during summarization.";
            setSummaryError(summaryErrorMessage);
            toast({
              title: "Summarization Failed",
              description: summaryErrorMessage,
              variant: "destructive",
            });
          } finally {
            setIsLoadingSummary(false);
          }
        }

      } catch (e: any) {
        console.error("Smart Extract AI error:", e);
        const errorMessage = e.message || "An unknown error occurred during smart extraction.";
        setExtractionError(errorMessage);
        toast({
          title: "Extraction Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else if (values.scrapingMode === 'cssSelector') { // CSS Selector extraction
      if (!values.cssSelector || values.cssSelector.trim() === '') {
        setExtractionError("CSS Selector is required for CSS Selector mode.");
        toast({
          title: "CSS Selector Required",
          description: "Please provide CSS selectors to extract data.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch('/api/extract/css-selector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: values.url,
            cssSelector: values.cssSelector,
            extractionType: 'text'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'CSS extraction failed');
        }

        const result = await response.json();
        setExtractedData(result.extractedData);

        toast({
          title: "CSS Extraction Successful",
          description: `Found ${result.elementsFound} elements. Now generating summary...`,
        });

        // Generate summary for CSS extracted data
        setIsLoadingSummary(true);
        setSummaryError(null);

        try {
          const summaryInput: SummarizeTextInput = { textToSummarize: result.extractedData };
          const summaryResult: SummarizeTextOutput = await summarizeText(summaryInput);
          setSummary(summaryResult.summary);
          setSummaryStats(summaryResult.stats || null);
          toast({
            title: "Summary Generated",
            description: "AI summary has been generated for the extracted data.",
          });
        } catch (summaryError: any) {
          console.error("Summary generation error:", summaryError);
          setSummaryError(summaryError.message || "Failed to generate summary.");
          toast({
            title: "Summary Failed",
            description: "Data extracted successfully, but summary generation failed.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSummary(false);
        }

      } catch (e: any) {
        console.error("CSS Selector extraction error:", e);
        const errorMessage = e.message || "An unknown error occurred during CSS extraction.";
        setExtractionError(errorMessage);
        toast({
          title: "CSS Extraction Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }

    setIsLoadingExtraction(false);
  };

  const handleSelectorsGenerated = (selectors: string[]) => {
    setSelectedSelectors(selectors);
    toast({
      title: "Selectors Selected",
      description: `${selectors.length} CSS selectors have been selected for your scraping configuration.`,
    });
  };

  const handleSelectorsCopied = (selectorsString: string) => {
    // Switch to crawler tab and CSS selector mode
    setActiveTab('crawler');

    // Set the CSS selector field value (this would need form context or ref)
    // For now, we'll show a helpful message
    toast({
      title: "Selectors Ready",
      description: "Switch to CSS Selector mode in the Crawler Configuration and paste the selectors.",
      duration: 5000,
    });
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-background p-4 md:p-8">
        <header className="w-full max-w-4xl mb-8">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">CortexCrawler</h1>
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </header>
        <main className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/20 backdrop-blur-xl">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <LogoIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CortexCrawler
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Pro Plan
            </Badge>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your data extraction projects.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Extractions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExtractions}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Target className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">Excellent performance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.dataProcessed}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-gray-600">Last 30 days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-gray-600">Lightning fast</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Three-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Quick Actions */}
          <div className="lg:col-span-3">
            <Card className="dashboard-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Extraction
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab('selector-assistant')}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Selector Assistant
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Task
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Smart AI Mode</p>
                  <p className="text-xs text-blue-600">Use Smart AI for best results on complex websites</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-1">Batch Processing</p>
                  <p className="text-xs text-green-600">Process multiple URLs at once for efficiency</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium mb-1">Export Formats</p>
                  <p className="text-xs text-purple-600">Choose JSON for APIs, CSV for spreadsheets</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium mb-1">AI Selector Assistant</p>
                  <p className="text-xs text-orange-600">Let AI analyze webpages and suggest optimal CSS selectors</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6">
            <Card className="dashboard-card mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Data Extraction Tools</CardTitle>
                <p className="text-gray-600">Configure your crawler or use AI to generate CSS selectors</p>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'crawler' | 'selector-assistant')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="crawler" className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Crawler Configuration
                    </TabsTrigger>
                    <TabsTrigger value="selector-assistant" className="flex items-center">
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI Selector Assistant
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="crawler" className="mt-6">
                    <CrawlerForm onSubmit={handleFormSubmit} isLoading={isLoadingExtraction || isLoadingSummary} />

                    {selectedSelectors.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">AI-Generated Selectors Available</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          You have {selectedSelectors.length} CSS selectors from the AI Assistant.
                          Switch to CSS Selector mode to use them.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSelectors.map((selector, index) => (
                            <code key={index} className="bg-white px-2 py-1 rounded text-xs text-blue-800 border border-blue-200">
                              {selector}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="selector-assistant" className="mt-6">
                    <SelectorAssistant
                      onSelectorsGenerated={handleSelectorsGenerated}
                      onSelectorsCopied={handleSelectorsCopied}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Results Section - Only show when on crawler tab */}
            {activeTab === 'crawler' && (
              <div className="space-y-6">
                <ResultsDisplay data={extractedData} isLoading={isLoadingExtraction} error={extractionError} />

                {(extractedData || isLoadingSummary || summaryError) && (
                  <SummaryDisplay
                    summary={summary}
                    isLoading={isLoadingSummary}
                    error={summaryError}
                    summaryStats={summaryStats}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Recent Activity & Status */}
          <div className="lg:col-span-3">
            <Card className="dashboard-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data extracted successfully</p>
                    <p className="text-xs text-gray-500">example.com • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Scheduled task completed</p>
                    <p className="text-xs text-gray-500">news-site.com • 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Export generated</p>
                    <p className="text-xs text-gray-500">data.csv • 6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">API endpoint updated</p>
                    <p className="text-xs text-gray-500">Settings • 1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Services</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Processing</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Export Services</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Usage This Month</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">8,400 / 12,500 requests</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}