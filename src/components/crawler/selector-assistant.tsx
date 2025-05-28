// src/components/crawler/selector-assistant.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Wand2,
  Globe,
  Code,
  Target,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import type {
  SelectorSuggestion,
  AIAnalysisResponse,
  DataType,
  SelectorTestResult
} from '@/types/selector-assistant';

interface SelectorAssistantProps {
  onSelectorsGenerated?: (selectors: string[]) => void;
  onSelectorsCopied?: (selectorsString: string) => void;
  initialUrl?: string;
}

export function SelectorAssistant({ onSelectorsGenerated, onSelectorsCopied, initialUrl = '' }: SelectorAssistantProps) {
  const [url, setUrl] = useState(initialUrl);
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SelectorSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, SelectorTestResult>>({});
  const [activeTab, setActiveTab] = useState<'url' | 'html'>('url');

  const { toast } = useToast();

  const handleAnalyze = useCallback(async () => {
    if (!url && !htmlContent) {
      toast({
        title: "Input Required",
        description: "Please provide either a URL or HTML content to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setAnalysisResult(null);
    setTestResults({});

    try {
      const response = await fetch('/api/ai/suggest-selectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activeTab === 'url' ? url : undefined,
          htmlContent: activeTab === 'html' ? htmlContent : undefined,
          targetDataTypes: ['title', 'heading', 'paragraph', 'link', 'image', 'price', 'description'] as DataType[]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze webpage');
      }

      const result: AIAnalysisResponse = await response.json();
      setAnalysisResult(result);
      setSuggestions(result.suggestions);

      toast({
        title: "Analysis Complete",
        description: `Generated ${result.suggestions.length} selector suggestions in ${result.processingTime}ms`
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, htmlContent, activeTab, toast]);

  const handleTestSelector = useCallback(async (selector: string) => {
    if (!url && !htmlContent) {
      toast({
        title: "Cannot Test",
        description: "No webpage content available for testing.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/ai/test-selector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selector,
          url: activeTab === 'url' ? url : undefined,
          htmlContent: activeTab === 'html' ? htmlContent : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to test selector');
      }

      const result: SelectorTestResult = await response.json();
      setTestResults(prev => ({ ...prev, [selector]: result }));

      toast({
        title: "Selector Tested",
        description: `Found ${result.elementsFound} elements`,
        variant: result.isValid ? "default" : "destructive"
      });

    } catch (err) {
      toast({
        title: "Test Failed",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
    }
  }, [url, htmlContent, activeTab, toast]);

  const handleCopySelector = useCallback((selector: string) => {
    navigator.clipboard.writeText(selector);
    toast({
      title: "Copied",
      description: "Selector copied to clipboard"
    });
  }, [toast]);

  const handleCopyAllSelected = useCallback(() => {
    const selectedSelectors = suggestions
      .filter(s => selectedSuggestions.includes(s.id))
      .map(s => s.selector);

    if (selectedSelectors.length === 0) {
      toast({
        title: "No Selectors Selected",
        description: "Please select some selectors first.",
        variant: "destructive"
      });
      return;
    }

    const selectorsString = selectedSelectors.join(', ');
    navigator.clipboard.writeText(selectorsString);

    // Call the callback to populate the crawler form
    if (onSelectorsCopied) {
      onSelectorsCopied(selectorsString);
    }

    toast({
      title: "All Selected Selectors Copied",
      description: `${selectedSelectors.length} selectors copied and ready to use in CSS Selector mode.`
    });
  }, [suggestions, selectedSuggestions, onSelectorsCopied, toast]);

  const handleToggleSelection = useCallback((suggestionId: string, selector: string) => {
    setSelectedSuggestions(prev => {
      const isSelected = prev.includes(suggestionId);
      const newSelection = isSelected
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId];

      // Notify parent component of selected selectors
      if (onSelectorsGenerated) {
        const selectedSelectors = suggestions
          .filter(s => newSelection.includes(s.id))
          .map(s => s.selector);
        onSelectorsGenerated(selectedSelectors);
      }

      return newSelection;
    });
  }, [suggestions, onSelectorsGenerated]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDataTypeIcon = (dataType: DataType) => {
    switch (dataType) {
      case 'title': return '📰';
      case 'heading': return '📝';
      case 'paragraph': return '📄';
      case 'link': return '🔗';
      case 'image': return '🖼️';
      case 'price': return '💰';
      case 'description': return '📋';
      default: return '🎯';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Wand2 className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-2xl font-bold">AI Selector Assistant</h2>
        </div>
        <p className="text-muted-foreground">
          Let AI analyze your webpage and suggest optimal CSS selectors for data extraction
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Webpage Input
          </CardTitle>
          <CardDescription>
            Provide a URL or HTML content for AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'html')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="html" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                HTML
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="url">Target URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="html" className="space-y-4">
              <div>
                <Label htmlFor="html">HTML Content</Label>
                <Textarea
                  id="html"
                  placeholder="Paste your HTML content here..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || (!url && !htmlContent)}
              size="lg"
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Selectors
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Badge variant="outline">
                {analysisResult.processingTime}ms
              </Badge>
            </CardTitle>
            <CardDescription>
              Page Type: {analysisResult.analysis.pageType} •
              Complexity: {analysisResult.analysis.complexity}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Recommended Approach</h4>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.analysis.recommendedApproach}
                </p>
              </div>

              {analysisResult.analysis.potentialChallenges.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Potential Challenges</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analysisResult.analysis.potentialChallenges.map((challenge, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Display */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selector Suggestions</span>
              <Badge variant="secondary">
                {suggestions.length} suggestions
              </Badge>
            </CardTitle>
            <CardDescription>
              Click selectors to select them for your scraping configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getDataTypeIcon(suggestion.dataType)}</span>
                      <div>
                        <h4 className="font-medium capitalize">{suggestion.dataType}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {suggestion.confidence}% confidence
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {suggestion.selector}
                      </code>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopySelector(suggestion.selector)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestSelector(suggestion.selector)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={selectedSuggestions.includes(suggestion.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleSelection(suggestion.id, suggestion.selector)}
                        >
                          {selectedSuggestions.includes(suggestion.id) ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : null}
                          {selectedSuggestions.includes(suggestion.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>

                    {/* Test Results */}
                    {testResults[suggestion.selector] && (
                      <div className="bg-muted/50 p-2 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span>Test Result: {testResults[suggestion.selector].elementsFound} elements found</span>
                          <Badge variant={testResults[suggestion.selector].isValid ? "default" : "destructive"}>
                            {testResults[suggestion.selector].isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                        {testResults[suggestion.selector].sampleContent.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Sample content:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {testResults[suggestion.selector].sampleContent.slice(0, 3).map((content, index) => (
                                <li key={index} className="truncate">{content}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      <p><strong>Reasoning:</strong> {suggestion.reasoning}</p>
                      {suggestion.fallbackSelectors.length > 0 && (
                        <div className="mt-2">
                          <p><strong>Fallback selectors:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {suggestion.fallbackSelectors.map((fallback, index) => (
                              <code key={index} className="bg-muted px-1 py-0.5 rounded text-xs">
                                {fallback}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSuggestions.length > 0 && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Selected Selectors ({selectedSuggestions.length})</h4>
                  <Button
                    onClick={handleCopyAllSelected}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All & Use in Crawler
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions
                    .filter(s => selectedSuggestions.includes(s.id))
                    .map(s => (
                      <Badge key={s.id} variant="secondary">
                        {s.dataType}: {s.selector}
                      </Badge>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Copy All & Use in Crawler" to automatically populate the CSS Selector field in the Crawler Configuration tab.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
