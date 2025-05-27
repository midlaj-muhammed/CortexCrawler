
// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CrawlerForm, type CrawlerFormValues } from '@/components/crawler/crawler-form';
import { ResultsDisplay } from '@/components/crawler/results-display';
import { SummaryDisplay } from '@/components/crawler/summary-display';
import { LogoIcon } from '@/components/icons/logo-icon';
import { smartExtract, type SmartExtractInput, type SmartExtractOutput } from '@/ai/flows/smart-extract';
import { summarizeText, type SummarizeTextInput, type SummarizeTextOutput } from '@/ai/flows/summarize-text-flow';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { AuthButton } from '@/components/auth/auth-button';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Plus
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

    // Handle UI-only feature toasts
    if (values.scrapingMode === 'fullPageRender') {
      toast({ title: "UI Demo", description: "Full Page Render scraping is a UI demonstration and not yet functional.", duration: 7000 });
    }
    if (values.scrapingMode === 'apiEndpoint') {
      toast({ title: "UI Demo", description: "API Endpoint scraping is a UI demonstration and not yet functional.", duration: 7000 });
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
    } else if (values.scrapingMode === 'cssSelector') { // Previously values.extractionType === 'css'
      setExtractionError("CSS Selector extraction is not implemented in this demo if 'Smart AI' is not the primary mode. Please use Smart Extract AI for functional data extraction.");
      toast({
        title: "CSS Selector Not Fully Implemented",
        description: "CSS Selector mode (without Smart AI) is a UI demonstration. Use Smart Extract AI for extraction.",
        variant: "destructive",
      });
    }

    setIsLoadingExtraction(false);
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6">
            <Card className="dashboard-card mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Configure Your Crawler</CardTitle>
                <p className="text-gray-600">Set up your data extraction parameters</p>
              </CardHeader>
              <CardContent>
                <CrawlerForm onSubmit={handleFormSubmit} isLoading={isLoadingExtraction || isLoadingSummary} />
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              <ResultsDisplay data={extractedData} isLoading={isLoadingExtraction} error={extractionError} />

              {(extractedData || isLoadingSummary || summaryError) && (
                <SummaryDisplay summary={summary} isLoading={isLoadingSummary} error={summaryError} />
              )}
            </div>
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