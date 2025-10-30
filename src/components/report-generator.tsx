"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, FileText, Table as TableIcon, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface ReportGeneratorProps {
  onGenerateReport: (
    type: "repair" | "purchase",
    dateRange: DateRange | undefined,
    format: "pdf" | "csv"
  ) => Promise<void>;
}

export default function ReportGenerator({
  onGenerateReport,
}: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<"repair" | "purchase">("repair");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (exportFormat: "pdf" | "csv") => {
    setIsGenerating(true);
    try {
      const dateRange: DateRange | undefined = startDate
        ? {
            from: new Date(startDate),
            to: endDate ? new Date(endDate) : undefined,
          }
        : undefined;
      await onGenerateReport(reportType, dateRange, exportFormat);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Generate Report
        </CardTitle>
        <CardDescription>
          Export your logs with optional date filtering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select
            value={reportType}
            onValueChange={(value: "repair" | "purchase") =>
              setReportType(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="repair">Repair Logs</SelectItem>
              <SelectItem value="purchase">Purchase Logs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Date Range (Optional)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm text-muted-foreground">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm text-muted-foreground">
                To
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>
          {startDate && (
            <p className="text-sm text-muted-foreground">
              {endDate
                ? `Filtering from ${format(new Date(startDate), "MMM dd, yyyy")} to ${format(new Date(endDate), "MMM dd, yyyy")}`
                : `Filtering from ${format(new Date(startDate), "MMM dd, yyyy")} onwards`}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Download As</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleGenerate("csv")}
              disabled={isGenerating}
              className="gap-2 h-auto py-4 flex-col"
            >
              <TableIcon className="h-6 w-6" />
              <span className="font-semibold">CSV</span>
              <span className="text-xs text-muted-foreground">Spreadsheet</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleGenerate("pdf")}
              disabled={isGenerating}
              className="gap-2 h-auto py-4 flex-col"
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">PDF</span>
              <span className="text-xs text-muted-foreground">Document</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}