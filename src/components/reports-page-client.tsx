"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Table as TableIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { RepairLog } from "@/components/repair-log-form";

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface ReportsPageClientProps {
  userId: string;
}

export default function ReportsPageClient({ userId }: ReportsPageClientProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [activeReport, setActiveReport] = useState<"repair" | "purchase">(
    "repair",
  );
  const [isLoading, setIsLoading] = useState(true);

  // ---------------- Repair logs ----------------
  const [repairLogs, setRepairLogs] = useState<RepairLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<RepairLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "cost" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);

  // ---------------- Purchase logs ----------------
  const [purchaseLogs, setPurchaseLogs] = useState<any[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<any[]>([]);
  const [searchPurchase, setSearchPurchase] = useState("");
  const [purchaseSortBy, setPurchaseSortBy] = useState<
    "date" | "cost" | "name"
  >("date");
  const [purchaseSortOrder, setPurchaseSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [purchaseStartDate, setPurchaseStartDate] = useState("");
  const [purchaseEndDate, setPurchaseEndDate] = useState("");

  // ---------------- Load data ----------------
  useEffect(() => {
    loadRepairLogs();
    loadPurchaseLogs();
  }, []);

  // ---------------- Repair log functions ----------------
  useEffect(
    () => applyRepairFilters(),
    [
      repairLogs,
      searchTerm,
      deviceTypeFilter,
      statusFilter,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    ],
  );

  const loadRepairLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("repair_logs")
        .select("*")
        .eq("user_id", userId)
        .order("repair_date", { ascending: false });
      if (error) throw error;
      if (data) {
        const logs = data.map((log: any) => ({
          ...log,
          repair_date: new Date(log.repair_date),
        }));
        setRepairLogs(logs);
        setDeviceTypes([
          ...new Set(logs.map((l: any) => l.device_type).filter(Boolean)),
        ]);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load repair logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyRepairFilters = () => {
    let filtered = [...repairLogs];
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.repair_location
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          log.device_type?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (deviceTypeFilter !== "all")
      filtered = filtered.filter((l) => l.device_type === deviceTypeFilter);
    if (statusFilter !== "all")
      filtered = filtered.filter((l) => l.status === statusFilter);
    if (startDate)
      filtered = filtered.filter(
        (l) => new Date(l.repair_date) >= new Date(startDate),
      );
    if (endDate)
      filtered = filtered.filter(
        (l) => new Date(l.repair_date) <= new Date(endDate),
      );
    filtered.sort((a, b) => {
      let comp = 0;
      if (sortBy === "date")
        comp =
          new Date(a.repair_date).getTime() - new Date(b.repair_date).getTime();
      else if (sortBy === "cost") comp = a.repair_cost - b.repair_cost;
      else comp = a.item_name.localeCompare(b.item_name);
      return sortOrder === "asc" ? comp : -comp;
    });
    setFilteredLogs(filtered);
  };

  const handleRepairDownload = (formatType: "csv" | "pdf") => {
    if (formatType === "csv") {
      const headers = [
        "Item Name",
        "Device Type",
        "Date",
        "Location",
        "Cost",
        "Status",
        "Notes",
      ];
      const rows = filteredLogs.map((log) => [
        log.item_name,
        log.device_type || "N/A",
        format(new Date(log.repair_date), "yyyy-MM-dd"),
        log.repair_location,
        log.repair_cost,
        log.status,
        log.notes || "",
      ]);
      const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `repair-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      toast({
        title: "Success",
        description: `Downloaded ${filteredLogs.length} repair records`,
      });
    } else {
      toast({ title: "PDF Export", description: "Coming soon" });
    }
  };

  // ---------------- Purchase log functions ----------------
  useEffect(
    () => applyPurchaseFilters(),
    [
      purchaseLogs,
      searchPurchase,
      purchaseSortBy,
      purchaseSortOrder,
      purchaseStartDate,
      purchaseEndDate,
    ],
  );

  const loadPurchaseLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("purchase_logs")
        .select("*")
        .eq("user_id", userId)
        .order("purchase_date", { ascending: false });
      if (error) throw error;
      if (data)
        setPurchaseLogs(
          data.map((p) => ({ ...p, purchase_date: new Date(p.purchase_date) })),
        );
    } catch {
      toast({
        title: "Error",
        description: "Failed to load purchase logs",
        variant: "destructive",
      });
    }
  };

  const applyPurchaseFilters = () => {
    let filtered = [...purchaseLogs];
    if (searchPurchase)
      filtered = filtered.filter(
        (log) =>
          log.item_name.toLowerCase().includes(searchPurchase.toLowerCase()) ||
          log.purchase_location
            .toLowerCase()
            .includes(searchPurchase.toLowerCase()),
      );
    if (purchaseStartDate)
      filtered = filtered.filter(
        (l) => new Date(l.purchase_date) >= new Date(purchaseStartDate),
      );
    if (purchaseEndDate)
      filtered = filtered.filter(
        (l) => new Date(l.purchase_date) <= new Date(purchaseEndDate),
      );
    filtered.sort((a, b) => {
      let comp = 0;
      if (purchaseSortBy === "date")
        comp =
          new Date(a.purchase_date).getTime() -
          new Date(b.purchase_date).getTime();
      else if (purchaseSortBy === "cost")
        comp = a.purchase_cost - b.purchase_cost;
      else comp = a.item_name.localeCompare(b.item_name);
      return purchaseSortOrder === "asc" ? comp : -comp;
    });
    setFilteredPurchases(filtered);
  };

  const handlePurchaseDownload = (formatType: "csv" | "pdf") => {
    if (formatType === "csv") {
      const headers = [
        "Item Name",
        "Date",
        "Location",
        "Cost",
        "Warranty Info",
        "Notes",
      ];
      const rows = filteredPurchases.map((log) => [
        log.item_name,
        format(new Date(log.purchase_date), "yyyy-MM-dd"),
        log.purchase_location,
        log.purchase_cost,
        log.warranty_info || "N/A",
        log.notes || "",
      ]);
      const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `purchase-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      toast({
        title: "Success",
        description: `Downloaded ${filteredPurchases.length} purchase records`,
      });
    } else {
      toast({ title: "PDF Export", description: "Coming soon" });
    }
  };

  // ---------------- Render ----------------
  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Toggle buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeReport === "repair" ? "default" : "outline"}
          onClick={() => setActiveReport("repair")}
        >
          Repair Logs
        </Button>
        <Button
          variant={activeReport === "purchase" ? "default" : "outline"}
          onClick={() => setActiveReport("purchase")}
        >
          Purchase Logs
        </Button>
      </div>

      {/* ---------------- Repair Logs UI ---------------- */}
      {activeReport === "repair" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Repair Reports</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive view of all repair logs with advanced filtering
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Repairs</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredLogs.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Cost</CardDescription>
                <CardTitle className="text-3xl">
                  $
                  {filteredLogs
                    .reduce((sum, log) => sum + log.repair_cost, 0)
                    .toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredLogs.filter((l) => l.status === "completed").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredLogs.filter((l) => l.status === "pending").length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>
                Filter and search through your repair logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select
                    value={deviceTypeFilter}
                    onValueChange={setDeviceTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="flex gap-2">
                    <Select
                      value={sortBy}
                      onValueChange={(v: any) => setSortBy(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setDeviceTypeFilter("all");
                    setStatusFilter("all");
                    setStartDate("");
                    setEndDate("");
                    setSortBy("date");
                    setSortOrder("desc");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRepairDownload("csv")}
                  className="gap-2"
                >
                  <TableIcon className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRepairDownload("pdf")}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Repair Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Repair Logs ({filteredLogs.length})</CardTitle>
              <CardDescription>
                Filtered results based on your criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No repair logs found.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.item_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.device_type || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(log.repair_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>{log.repair_location}</TableCell>
                          <TableCell>${log.repair_cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={statusColors[log.status]}
                            >
                              {log.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------------- Purchase Logs UI ---------------- */}
      {activeReport === "purchase" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Purchase Reports</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive view of all purchase logs with advanced filtering
            </p>
          </div>

          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Purchases</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredPurchases.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Cost</CardDescription>
                <CardTitle className="text-3xl">
                  $
                  {filteredPurchases
                    .reduce((sum, log) => sum + log.purchase_cost, 0)
                    .toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>
                Filter and search through your purchase logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchPurchase}
                      onChange={(e) => setSearchPurchase(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={purchaseStartDate}
                    onChange={(e) => setPurchaseStartDate(e.target.value)}
                    max={purchaseEndDate || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={purchaseEndDate}
                    onChange={(e) => setPurchaseEndDate(e.target.value)}
                    min={purchaseStartDate || undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="flex gap-2">
                    <Select
                      value={purchaseSortBy}
                      onValueChange={(v: any) => setPurchaseSortBy(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPurchaseSortOrder(
                          purchaseSortOrder === "asc" ? "desc" : "asc",
                        )
                      }
                    >
                      {purchaseSortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchPurchase("");
                    setPurchaseStartDate("");
                    setPurchaseEndDate("");
                    setPurchaseSortBy("date");
                    setPurchaseSortOrder("desc");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePurchaseDownload("csv")}
                  className="gap-2"
                >
                  <TableIcon className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePurchaseDownload("pdf")}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Logs ({filteredPurchases.length})</CardTitle>
              <CardDescription>
                Filtered results based on your criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">
                    No purchase logs found.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Warranty Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.item_name}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(log.purchase_date),
                              "MMM dd, yyyy",
                            )}
                          </TableCell>
                          <TableCell>{log.purchase_location}</TableCell>
                          <TableCell>${log.purchase_cost.toFixed(2)}</TableCell>
                          <TableCell>{log.warranty_info || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
