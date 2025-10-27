import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { database } from "../ts/firebase/auth";
import { ref, remove, update } from "firebase/database";
import { User } from "../hooks/User";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface EditEntryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: {
    id: string;
    date: string;
    desc: string;
    unitPrice?: number;
    total: number;
    unitType?: string;
    rawDate?: string;
  };
  userUID: string;
  invoiceUID: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EditEntryInfoModal = ({
  isOpen,
  onClose,
  entry,
  userUID,
  invoiceUID,
}: EditEntryInfoModalProps) => {
  const currentUser = User();

  // Form state
  const [date, setDate] = useState<Date | undefined>(
    entry.rawDate ? new Date(entry.rawDate) : undefined
  );
  const [description, setDescription] = useState(entry.desc);
  const [unitPrice, setUnitPrice] = useState(entry.unitPrice?.toString() ?? "");
  const [unitType, setUnitType] = useState(entry.unitType ?? "");
  const [total, setTotal] = useState(entry.total.toString());

  // UI state
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [errors, setErrors] = useState({
    description: false,
    unitPrice: false,
    total: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {
      description: !description.trim(),
      unitPrice: !unitPrice.trim() || isNaN(parseFloat(unitPrice)),
      total: !total.trim() || isNaN(parseFloat(total)),
    };
    setErrors(newErrors);
    return !newErrors.description && !newErrors.unitPrice && !newErrors.total;
  };

  // Handle save changes
  const handleSaveChanges = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser?.uid) {
      console.error("Current user is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const entryRef = ref(
        database,
        `users/${currentUser.uid}/clients/${userUID}/invoices/${invoiceUID}/entries/${entry.id}`
      );

      const formattedDate = date
        ? `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
        : "";

      await update(entryRef, {
        date: formattedDate,
        description: description.trim(),
        unitPrice: parseFloat(unitPrice),
        total: parseFloat(total),
        unitType: unitType.trim() || null,
        rawDate: date ? date.toISOString() : null,
      });

      onClose();
    } catch (error) {
      console.error("Error updating entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentUser?.uid) {
      console.error("Current user is missing.");
      return;
    }

    setIsDeleting(true);

    try {
      const entryRef = ref(
        database,
        `users/${currentUser.uid}/clients/${userUID}/invoices/${invoiceUID}/entries/${entry.id}`
      );

      await remove(entryRef);
      setShowDeleteAlert(false);
      onClose();
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
        <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-lg font-semibold">Edit Entry</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isSubmitting || isDeleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete entry</span>
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveChanges} className=" pt-2">
            <div className="space-y-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="edit-invoice-entry-date">Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="invoice-entry-desc">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="invoice-entry-desc"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: false }));
                    }
                  }}
                  className={cn(errors.description && "border-destructive")}
                  placeholder="Mowing, trimming, edging..."
                  rows={3}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    Description is required
                  </p>
                )}
              </div>

              {/* Unit Price and Unit Type */}
              <div className="space-y-2">
                <Label>
                  Unit Price <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="invoice-entry-unit-price"
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => {
                      setUnitPrice(e.target.value);
                      if (errors.unitPrice) {
                        setErrors((prev) => ({ ...prev, unitPrice: false }));
                      }
                    }}
                    className={cn(
                      "flex-1",
                      errors.unitPrice && "border-destructive",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    )}
                    placeholder="50.00"
                    disabled={isSubmitting}
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    id="invoice-entry-unit-type"
                    type="text"
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="flex-1"
                    placeholder="hour, yard, etc."
                    disabled={isSubmitting}
                  />
                </div>
                {errors.unitPrice && (
                  <p className="text-sm text-destructive">
                    Valid unit price is required
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="space-y-2">
                <Label htmlFor="invoice-entry-total">
                  Total <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoice-entry-total"
                  type="number"
                  step="0.01"
                  value={total}
                  onChange={(e) => {
                    setTotal(e.target.value);
                    if (errors.total) {
                      setErrors((prev) => ({ ...prev, total: false }));
                    }
                  }}
                  className={cn(
                    "w-40",
                    errors.total && "border-destructive",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  )}
                  placeholder="50.00"
                  disabled={isSubmitting}
                />
                {errors.total && (
                  <p className="text-sm text-destructive">
                    Valid total is required
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog - Keep this as AlertDialog since it doesn't have calendar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this entry. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Entry"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditEntryInfoModal;
