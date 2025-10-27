import { useParams } from "react-router-dom";
import { database } from "../ts/firebase/auth";
import { User } from "../hooks/User";
import { push, ref } from "firebase/database";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, FormEvent } from "react";
import { format } from "date-fns";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
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

const EntryInfo = ({ show, setShow }: Props) => {
  const currentUser = User();
  const { userUID, invoiceUID } = useParams();

  // Form state
  const [dates, setDates] = useState<Date[] | undefined>();
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitType, setUnitType] = useState("");
  const [total, setTotal] = useState("");

  // UI state
  const [errors, setErrors] = useState({
    description: false,
    unitPrice: false,
    total: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle unit price changes
  const handleUnitPriceChange = (value: string) => {
    setUnitPrice(value);
    setTotal(value);
    if (errors.unitPrice) {
      setErrors((prev) => ({ ...prev, unitPrice: false }));
    }
    if (errors.total && value) {
      setErrors((prev) => ({ ...prev, total: false }));
    }
  };

  // Handle total changes
  const handleTotalChange = (value: string) => {
    setTotal(value);
    if (errors.total) {
      setErrors((prev) => ({ ...prev, total: false }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      description: !description.trim(),
      unitPrice: !unitPrice.trim(),
      total: !total.trim(),
    };
    setErrors(newErrors);
    return !newErrors.description && !newErrors.unitPrice && !newErrors.total;
  };

  // Handle form submission
  const handleSubmit = async (e?: FormEvent) => {
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
      const entriesRef = ref(
        database,
        `users/${currentUser.uid}/clients/${userUID}/invoices/${invoiceUID}/entries`
      );

      if (dates && dates.length > 0) {
        const promises = dates.map((date) => {
          const formattedDate = `${
            MONTHS[date.getUTCMonth()]
          } ${date.getUTCDate()}`;
          return push(entriesRef, {
            date: formattedDate,
            description: description.trim(),
            total: parseFloat(total),
            unitPrice: parseFloat(unitPrice),
            unitType: unitType.trim() || null,
            rawDate: date.toISOString(),
          });
        });
        await Promise.all(promises);
      } else {
        await push(entriesRef, {
          date: "",
          description: description.trim(),
          total: parseFloat(total),
          unitPrice: parseFloat(unitPrice),
          unitType: unitType.trim() || null,
          rawDate: null,
        });
      }

      // Reset form and close
      setDates(undefined);
      setDescription("");
      setUnitPrice("");
      setUnitType("");
      setTotal("");
      setErrors({ description: false, unitPrice: false, total: false });
      setShow(false);
    } catch (error) {
      console.error("Error creating entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setDates(undefined);
      setDescription("");
      setUnitPrice("");
      setUnitType("");
      setTotal("");
      setErrors({ description: false, unitPrice: false, total: false });
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">Edit Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="invoice-entry-date">Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    (!dates || dates.length === 0) && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dates && dates.length > 0 ? (
                    <span>
                      {dates.length === 1
                        ? format(dates[0], "PPP")
                        : `${dates.length} dates selected`}
                    </span>
                  ) : (
                    <span>Select date(s)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={dates}
                  onSelect={setDates}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Leave blank or select multiple dates to create entries in bulk
            </p>
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
                onChange={(e) => handleUnitPriceChange(e.target.value)}
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
              <p className="text-sm text-destructive">Unit price is required</p>
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
              onChange={(e) => handleTotalChange(e.target.value)}
              className={cn(
                "w-40",
                errors.total && "border-destructive",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
              placeholder="50.00"
              disabled={isSubmitting}
            />
            {errors.total && (
              <p className="text-sm text-destructive">Total is required</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Creating..."
                : dates && dates.length > 1
                ? `Create ${dates.length} Entries`
                : "Create Entry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryInfo;
