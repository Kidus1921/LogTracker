"use client";

import { useState } from "react";
import { RepairLog } from "./repair-log-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Search, Trash2, Eye, Wrench, Paperclip } from "lucide-react";
import { format } from "date-fns";

interface RepairLogListProps {
  logs: RepairLog[];
  onEdit: (log: RepairLog) => void;
  onDelete: (id: string) => Promise<void>;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function RepairLogList({
  logs,
  onEdit,
  onDelete,
}: RepairLogListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewLog, setPreviewLog] = useState<RepairLog | null>(null);

  const filteredLogs = logs.filter(
    (log) =>
      log.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.repair_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by item name, location, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No repair logs found matching your search."
              : "No repair logs yet. Add your first repair log above."}
          </p>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{log.item_name}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewLog(log)}
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(log)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(log.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewLog} onOpenChange={() => setPreviewLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Repair Details
            </DialogTitle>
            <DialogDescription>Full information including attachments</DialogDescription>
          </DialogHeader>
          {previewLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Item Name</p>
                  <p className="font-medium">{previewLog.item_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Device Type</p>
                  <p className="font-medium">{previewLog.device_type || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Repair Date</p>
                  <p className="font-medium">{format(new Date(previewLog.repair_date), "PPP")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{previewLog.repair_location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="font-medium">${previewLog.repair_cost.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={statusColors[previewLog.status]}>
                    {previewLog.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {previewLog.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{previewLog.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Attachments</p>
                {previewLog.file_urls && previewLog.file_urls.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {previewLog.file_urls.map((url, i) => {
                      const isImage = /(jpg|jpeg|png|gif|webp)$/i.test(url.split("?")[0]);
                      const name = url.split("/").pop() || `file-${i+1}`;
                      return (
                        <div key={i} className="border rounded-md p-2 flex items-center gap-3">
                          {isImage ? (
                            <img src={url} alt={name} className="h-16 w-16 object-cover rounded" />
                          ) : (
                            <Paperclip className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{name}</p>
                            <div className="flex gap-2 mt-1">
                              <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary">Open</a>
                              <a href={url} download className="text-xs text-primary">Download</a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm">No attachments</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repair Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this repair log? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}