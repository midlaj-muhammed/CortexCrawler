
"use client";

import React from 'react'; // Added this line
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Info, Settings2, FileDown, Webhook } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  extractionType: z.enum(["smart", "css"], { // Retained for compatibility, Smart AI will be one of scrapingMode
    // This can be eventually deprecated if scrapingMode fully replaces it.
    // For now, 'smart' maps to 'smartAI' scrapingMode if 'scrapingMode' isn't explicitly set by a new UI.
    required_error: "You need to select an extraction type.",
  }).default("smart"),
  scrapingMode: z.enum(["smartAI", "cssSelector", "fullPageRender", "apiEndpoint"]).default("smartAI"),
  cssSelector: z.string().optional(),
  enablePagination: z.boolean().default(false).optional(),
  maxPaginationDepth: z.coerce.number().min(1).max(100).optional(),
  schedule: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  exportFormat: z.enum(["json", "csv", "excel"]).default("json"),
  webhookUrl: z.string().url({ message: "Please enter a valid URL for the webhook." }).optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.scrapingMode === "cssSelector" && (!data.cssSelector || data.cssSelector.trim() === "")) {
      return false;
    }
    return true;
  },
  {
    message: "CSS selector is required if scraping mode is 'CSS Selector'.",
    path: ["cssSelector"],
  }
).refine(
  (data) => {
    if (data.enablePagination && (data.maxPaginationDepth === undefined || data.maxPaginationDepth < 1)) {
      return false;
    }
    return true;
  },
  {
    message: "Max pagination depth must be at least 1 if pagination is enabled.",
    path: ["maxPaginationDepth"],
  }
);

export type CrawlerFormValues = z.infer<typeof formSchema>;

interface CrawlerFormProps {
  onSubmit: (values: CrawlerFormValues) => Promise<void>;
  isLoading: boolean;
}

export function CrawlerForm({ onSubmit, isLoading }: CrawlerFormProps) {
  const form = useForm<CrawlerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      extractionType: "smart", // Keep for now, will be driven by scrapingMode
      scrapingMode: "smartAI",
      cssSelector: "",
      enablePagination: false,
      maxPaginationDepth: 5,
      schedule: "none",
      exportFormat: "json",
      webhookUrl: "",
    },
  });

  const currentScrapingMode = form.watch("scrapingMode");
  const paginationEnabled = form.watch("enablePagination");

  // Sync extractionType with scrapingMode for backward compatibility or simplified logic elsewhere
  // This ensures the core 'smart' vs 'css' logic can still rely on extractionType if needed
  // while the UI presents the more detailed 'scrapingMode'.
  React.useEffect(() => {
    if (currentScrapingMode === 'smartAI') {
      form.setValue('extractionType', 'smart');
    } else if (currentScrapingMode === 'cssSelector') {
      form.setValue('extractionType', 'css');
    }
    // Other scraping modes might not map directly to 'extractionType' or would be handled as 'smart' internally
  }, [currentScrapingMode, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                Enter the full URL of the webpage you want to scrape.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scrapingMode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" /> Scraping Mode</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md hover:border-primary transition-colors">
                    <FormControl>
                      <RadioGroupItem value="smartAI" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Smart Extract AI (Recommended)
                      <FormDescription className="text-xs">AI identifies and extracts main content.</FormDescription>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md hover:border-primary transition-colors">
                    <FormControl>
                      <RadioGroupItem value="cssSelector" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      CSS Selector
                      <FormDescription className="text-xs">Specify exact elements to extract.</FormDescription>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md hover:border-primary transition-colors">
                    <FormControl>
                      <RadioGroupItem value="fullPageRender" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Full Page Render (JS-heavy sites) <span className="text-xs text-muted-foreground">(UI Only)</span>
                      <FormDescription className="text-xs">Simulates browser; slower, for complex sites.</FormDescription>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md hover:border-primary transition-colors">
                    <FormControl>
                      <RadioGroupItem value="apiEndpoint" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      API Endpoint <span className="text-xs text-muted-foreground">(UI Only)</span>
                      <FormDescription className="text-xs">Directly query an API if available.</FormDescription>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentScrapingMode === "cssSelector" && (
          <FormField
            control={form.control}
            name="cssSelector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CSS Selector(s)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., h1, .product-title, #main-content p"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter CSS selectors. (Note: CSS Selector functionality is UI only for this demo if not using 'Smart AI' mode.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="enablePagination"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Enable Pagination (UI Only)
                </FormLabel>
                <FormDescription>
                  Attempt to follow 'next page' links. (Backend not implemented)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {paginationEnabled && (
          <FormField
            control={form.control}
            name="maxPaginationDepth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Pagination Depth (UI Only)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="100" placeholder="e.g., 5" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum number of pages to crawl. (Backend not implemented)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Task (UI Only)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Schedule (Run Manually)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set an automated schedule. (Backend scheduling is not implemented)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exportFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><FileDown className="mr-2 h-5 w-5 text-primary" /> Export Format (UI Only for Excel)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (UI Only)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the format for exported data. (Excel export backend not implemented)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Webhook className="mr-2 h-5 w-5 text-primary" /> Webhook URL (Optional, UI Only)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://your-service.com/webhook" {...field} />
              </FormControl>
              <FormDescription>
                Send data to this URL upon completion. (Backend not implemented)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {(currentScrapingMode === "cssSelector" || currentScrapingMode === "fullPageRender" || currentScrapingMode === "apiEndpoint" || paginationEnabled || form.getValues("schedule") !== "none" || form.getValues("exportFormat") === "excel" || form.getValues("webhookUrl") ) && (
            <Alert variant="default" className="bg-accent/10 border-accent/50 text-accent-foreground">
              <Info className="h-4 w-4 !text-accent-foreground" />
              <AlertTitle>Advanced Feature Notice</AlertTitle>
              <AlertDescription>
                Some selected advanced features like CSS Selector (when not using Smart AI), Full Page Render, API Endpoint scraping, Pagination, Scheduling, Excel export, and Webhooks are currently UI demonstrations.
                Only Smart Extract AI with JSON/CSV export is fully functional for extraction and summarization.
              </AlertDescription>
            </Alert>
        )}


        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-h-[48px] border-none"
          style={{
            background: 'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)',
            color: 'white',
            border: 'none',
            minHeight: '48px',
            fontWeight: '600',
            zIndex: 100
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Crawling...
            </>
          ) : (
            "Start Crawling"
          )}
        </Button>
      </form>
    </Form>
  );
}


