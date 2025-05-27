"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, FileJson, FileText, AlertCircle, Loader2 } from "lucide-react";
import { exportToJson, exportToCsv } from "@/lib/export-utils";
import { useEffect, useState } from "react";

interface ResultsDisplayProps {
  data: string | null;
  isLoading: boolean;
  error: string | null;
}

export function ResultsDisplay({ data, isLoading, error }: ResultsDisplayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Extracting data, please wait...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (data) {
      let displayData = data;
      let isJsonString = false;
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          displayData = JSON.stringify(parsed, null, 2);
          isJsonString = true;
        }
      } catch (e) {
        // Not a JSON string, display as is
      }

      return (
        <>
          <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/20">
            <pre className="text-sm whitespace-pre-wrap break-all">
              <code>{displayData}</code>
            </pre>
          </ScrollArea>
          {isClient && (
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => exportToJson(isJsonString ? JSON.parse(data) : data, "extracted_data.json")}
              >
                <FileJson className="mr-2 h-4 w-4" /> Export as JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => exportToCsv(data, "extracted_data.csv")}
              >
                <FileText className="mr-2 h-4 w-4" /> Export as CSV
              </Button>
            </div>
          )}
        </>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Submit a URL to see extracted data here.</p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Extracted Data</CardTitle>
        <CardDescription>
          Review the data extracted from the URL. You can export it in JSON or CSV format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
