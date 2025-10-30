"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface PurchaseLog {
  id?: string;
  item_name: string;
  purchase_date: Date;
  purchase_location: string;
  purchase_cost: number;
  warranty_info?: string;
  notes?: string;
  file_urls?: string[];
}

interface PurchaseLogFormProps {
  initialData?: PurchaseLog;
  onSubmit: (data: PurchaseLog) => Promise<void>;
  onCancel?: () => void;
}

export default function PurchaseLogForm({
  initialData,
  onSubmit,
  onCancel,
}: PurchaseLogFormProps) {
  const [formData, setFormData] = useState<PurchaseLog>(
    initialData || {
      item_name: "",
      purchase_date: new Date(),
      purchase_location: "",
      purchase_cost: 0,
      warranty_info: "",
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
          <Label>Purchase Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.purchase_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.purchase_date ? (
                  format(formData.purchase_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.purchase_date}
                onSelect={(date) =>
                  date && setFormData({ ...formData, purchase_date: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_location">Purchase Location *</Label>
          <Input
            id="purchase_location"
            value={formData.purchase_location}
            onChange={(e) =>
              setFormData({ ...formData, purchase_location: e.target.value })
            }
            required
            placeholder="Enter purchase location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_cost">Purchase Cost ($) *</Label>
          <Input
            id="purchase_cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchase_cost}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchase_cost: parseFloat(e.target.value) || 0,
              })
            }
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="warranty_info">Warranty Information</Label>
          <Input
            id="warranty_info"
            value={formData.warranty_info}
            onChange={(e) =>
              setFormData({ ...formData, warranty_info: e.target.value })
            }
            placeholder="Enter warranty details (e.g., 2 years manufacturer warranty)"
          />
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