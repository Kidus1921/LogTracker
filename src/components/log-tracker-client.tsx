"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wrench, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RepairLogForm, { RepairLog } from "@/components/repair-log-form";
import RepairLogList from "@/components/repair-log-list";
import PurchaseLogForm, { PurchaseLog } from "@/components/purchase-log-form";
import PurchaseLogList from "@/components/purchase-log-list";
import ReportGenerator from "@/components/report-generator";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LogTrackerClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("repair");
  const [repairLogs, setRepairLogs] = useState<RepairLog[]>([]);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);
  const [isRepairFormOpen, setIsRepairFormOpen] = useState(false);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [editingRepairLog, setEditingRepairLog] = useState<RepairLog | null>(null);
  const [editingPurchaseLog, setEditingPurchaseLog] = useState<PurchaseLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const [repairResult, purchaseResult] = await Promise.all([
        supabase
          .from("repair_logs")
          .select("*")
          .eq("user_id", userId)
          .order("repair_date", { ascending: false }),
        supabase
          .from("purchase_logs")
          .select("*")
          .eq("user_id", userId)
          .order("purchase_date", { ascending: false }),
      ]);

      if (repairResult.data) {
        setRepairLogs(
          repairResult.data.map((log: any) => ({
            ...log,
            repair_date: new Date(log.repair_date),
          }))
        );
      }

      if (purchaseResult.data) {
        setPurchaseLogs(
          purchaseResult.data.map((log: any) => ({
            ...log,
            purchase_date: new Date(log.purchase_date),
          }))
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRepairLog = async (data: RepairLog) => {
    try {
      const { error } = await supabase.from("repair_logs").insert({
        user_id: userId,
        item_name: data.item_name,
        device_type: data.device_type,
        repair_date: format(data.repair_date, "yyyy-MM-dd"),
        repair_location: data.repair_location,
        repair_cost: data.repair_cost,
        status: data.status,
        notes: data.notes,
        file_urls: data.file_urls,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Repair log added successfully",
      });
      setIsRepairFormOpen(false);
      loadLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add repair log",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRepairLog = async (data: RepairLog) => {
    if (!editingRepairLog?.id) return;

    try {
      const { error } = await supabase
        .from("repair_logs")
        .update({
          item_name: data.item_name,
          device_type: data.device_type,
          repair_date: format(data.repair_date, "yyyy-MM-dd"),
          repair_location: data.repair_location,
          repair_cost: data.repair_cost,
          status: data.status,
          notes: data.notes,
          file_urls: data.file_urls,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingRepairLog.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Repair log updated successfully",
      });
      setEditingRepairLog(null);
      loadLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update repair log",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRepairLog = async (id: string) => {
    try {
      const { error } = await supabase.from("repair_logs").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Repair log deleted successfully",
      });
      loadLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete repair log",
        variant: "destructive",
      });
    }
  };

  const handleAddPurchaseLog = async (data: PurchaseLog) => {
    try {
      const { error } = await supabase.from("purchase_logs").insert({
        user_id: userId,
        item_name: data.item_name,
        purchase_date: format(data.purchase_date, "yyyy-MM-dd"),
        purchase_location: data.purchase_location,
        purchase_cost: data.purchase_cost,
        warranty_info: data.warranty_info,
        notes: data.notes,
        file_urls: data.file_urls,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase log added successfully",
      });
      setIsPurchaseFormOpen(false);
      loadLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add purchase log",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePurchaseLog = async (data: PurchaseLog) => {
    if (!editingPurchaseLog?.id) return;

    try {
      const { error } = await supabase
        .from("purchase_logs")
        .update({
          item_name: data.item_name,
          purchase_date: format(data.purchase_date, "yyyy-MM-dd"),
          purchase_location: data.purchase_location,
          purchase_cost: data.purchase_cost,
          warranty_info: data.warranty_info,
          notes: data.notes,
          file_urls: data.file_urls,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPurchaseLog.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase log updated successfully",
      });
      setEditingPurchaseLog(null);
      loadLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase log",
        variant: "destructive",
      });
    }
  };

  const handleDeletePurchaseLog = async (id: string) => {
    try {
      const { error } = await supabase.from("purchase_logs").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase log deleted successfully",
      });
      loadLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete purchase log",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async (
    type: "repair" | "purchase",
    dateRange: DateRange | undefined,
    exportFormat: "pdf" | "csv"
  ) => {
    try {
      const logs = type === "repair" ? repairLogs : purchaseLogs;
      let filteredLogs: RepairLog[] | PurchaseLog[] = logs;

      if (dateRange?.from) {
        if (type === "repair") {
          filteredLogs = (logs as RepairLog[]).filter((log) => {
            const logDate = new Date(log.repair_date);
            
            if (dateRange.to && dateRange.from) {
              return logDate >= dateRange.from && logDate <= dateRange.to;
            }
            return dateRange.from && logDate >= dateRange.from;
          });
        } else {
          filteredLogs = (logs as PurchaseLog[]).filter((log) => {
            const logDate = new Date(log.purchase_date);
            
            if (dateRange.to && dateRange.from) {
              return logDate >= dateRange.from && logDate <= dateRange.to;
            }
            return dateRange.from && logDate >= dateRange.from;
          });
        }
      }

      if (exportFormat === "csv") {
        const headers =
          type === "repair"
            ? ["Item Name", "Date", "Location", "Cost", "Status", "Notes"]
            : ["Item Name", "Date", "Location", "Cost", "Warranty", "Notes"];

        const rows = filteredLogs.map((log) => {
          if (type === "repair") {
            const repairLog = log as RepairLog;
            return [
              repairLog.item_name,
              format(new Date(repairLog.repair_date), "yyyy-MM-dd"),
              repairLog.repair_location,
              repairLog.repair_cost,
              repairLog.status,
              repairLog.notes || "",
            ];
          } else {
            const purchaseLog = log as PurchaseLog;
            return [
              purchaseLog.item_name,
              format(new Date(purchaseLog.purchase_date), "yyyy-MM-dd"),
              purchaseLog.purchase_location,
              purchaseLog.purchase_cost,
              purchaseLog.warranty_info || "",
              purchaseLog.notes || "",
            ];
          }
        });

        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
      } else {
        const doc = new jsPDF();
        const title = type === "repair" ? "Repair Logs" : "Purchase Logs";
        doc.text(title, 14, 16);
        // @ts-ignore
        autoTable(doc, {
          startY: 22,
          head:
            type === "repair"
              ? [["Item Name", "Date", "Location", "Cost", "Status"]]
              : [["Item Name", "Date", "Location", "Cost", "Warranty"]],
          body:
            type === "repair"
              ? (filteredLogs as RepairLog[]).map((l) => [
                  l.item_name,
                  format(new Date(l.repair_date), "yyyy-MM-dd"),
                  l.repair_location,
                  `$${l.repair_cost.toFixed(2)}`,
                  l.status,
                ])
              : (filteredLogs as PurchaseLog[]).map((l) => [
                  l.item_name,
                  format(new Date(l.purchase_date), "yyyy-MM-dd"),
                  l.purchase_location,
                  `$${l.purchase_cost.toFixed(2)}`,
                  l.warranty_info || "N/A",
                ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
        });
        doc.save(`${type}-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      }

      toast({
        title: "Success",
        description: `Report generated with ${filteredLogs.length} records`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Log Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your repair and purchase logs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="repair" className="gap-2">
                <Wrench className="h-4 w-4" />
                Repair Logs
              </TabsTrigger>
              <TabsTrigger value="purchase" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Purchase Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="repair" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Add Repair Log</CardTitle>
                      <CardDescription>
                        Record a new repair for tracking
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsRepairFormOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Repair
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Repair Logs ({repairLogs.length})</CardTitle>
                  <CardDescription>View and manage your repair history</CardDescription>
                </CardHeader>
                <CardContent>
                  <RepairLogList
                    logs={repairLogs}
                    onEdit={(log) => setEditingRepairLog(log)}
                    onDelete={handleDeleteRepairLog}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchase" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Add Purchase Log</CardTitle>
                      <CardDescription>
                        Record a new purchase for tracking
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsPurchaseFormOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Purchase
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchase Logs ({purchaseLogs.length})</CardTitle>
                  <CardDescription>View and manage your purchase history</CardDescription>
                </CardHeader>
                <CardContent>
                  <PurchaseLogList
                    logs={purchaseLogs}
                    onEdit={(log) => setEditingPurchaseLog(log)}
                    onDelete={handleDeletePurchaseLog}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <ReportGenerator onGenerateReport={handleGenerateReport} />
        </div>
      </div>

      <Dialog open={isRepairFormOpen} onOpenChange={setIsRepairFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Repair Log</DialogTitle>
            <DialogDescription>
              Fill in the details of the repair
            </DialogDescription>
          </DialogHeader>
          <RepairLogForm
            onSubmit={handleAddRepairLog}
            onCancel={() => setIsRepairFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingRepairLog}
        onOpenChange={() => setEditingRepairLog(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Repair Log</DialogTitle>
            <DialogDescription>
              Update the repair details
            </DialogDescription>
          </DialogHeader>
          {editingRepairLog && (
            <RepairLogForm
              initialData={editingRepairLog}
              onSubmit={handleUpdateRepairLog}
              onCancel={() => setEditingRepairLog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPurchaseFormOpen} onOpenChange={setIsPurchaseFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Purchase Log</DialogTitle>
            <DialogDescription>
              Fill in the details of the purchase
            </DialogDescription>
          </DialogHeader>
          <PurchaseLogForm
            onSubmit={handleAddPurchaseLog}
            onCancel={() => setIsPurchaseFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingPurchaseLog}
        onOpenChange={() => setEditingPurchaseLog(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Log</DialogTitle>
            <DialogDescription>
              Update the purchase details
            </DialogDescription>
          </DialogHeader>
          {editingPurchaseLog && (
            <PurchaseLogForm
              initialData={editingPurchaseLog}
              onSubmit={handleUpdatePurchaseLog}
              onCancel={() => setEditingPurchaseLog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}