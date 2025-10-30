"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface RepairLog {
  id?: string;
  item_name: string;
  device_type?: string;
  repair_date: Date;
  repair_location: string;
  repair_cost: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  file_urls?: string[];
}

interface RepairLogFormProps {
  initialData?: RepairLog;
  onSubmit: (data: RepairLog) => Promise<void>;
  onCancel?: () => void;
}

export default function RepairLogForm({
  initialData,
  onSubmit,
  onCancel,
}: RepairLogFormProps) {
  const [formData, setFormData] = useState<RepairLog>(
    initialData || {
      item_name: "",
      device_type: "",
      repair_date: new Date(),
      repair_location: "",
      repair_cost: 0,
      status: "pending",
      notes: "",
      file_urls: [],
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="item_name">Item Name *</Label>
          <Input
            id="item_name"
            value={formData.item_name}
            onChange={(e) =>
              setFormData({ ...formData, item_name: e.target.value })
            }
            required
            placeholder="Enter item name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="device_type">Device Type *</Label>
          <Select
            value={formData.device_type}
            onValueChange={(value) =>
              setFormData({ ...formData, device_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="printer">Printer</SelectItem>
              <SelectItem value="copier">Copier</SelectItem>
              <SelectItem value="scanner">Scanner</SelectItem>
              <SelectItem value="computer">Computer</SelectItem>
              <SelectItem value="laptop">Laptop</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
              <SelectItem value="keyboard">Keyboard</SelectItem>
              <SelectItem value="mouse">Mouse</SelectItem>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Repair Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.repair_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.repair_date ? (
                  format(formData.repair_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.repair_date}
                onSelect={(date) =>
                  date && setFormData({ ...formData, repair_date: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repair_location">Repair Location *</Label>
          <Input
            id="repair_location"
            value={formData.repair_location}
            onChange={(e) =>
              setFormData({ ...formData, repair_location: e.target.value })
            }
            required
            placeholder="Enter repair location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repair_cost">Repair Cost ($) *</Label>
          <Input
            id="repair_cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.repair_cost}
            onChange={(e) =>
              setFormData({
                ...formData,
                repair_cost: parseFloat(e.target.value) || 0,
              })
            }
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: RepairLog["status"]) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>File Attachments</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            File upload functionality coming soon
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Log" : "Add Log"}
        </Button>
      </div>
    </form>
  );
}