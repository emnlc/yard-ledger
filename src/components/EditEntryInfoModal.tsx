import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { database } from "../ts/firebase/auth";
import { ref, update } from "firebase/database";
import { User } from "../hooks/User";
import { Calendar as CalendarIcon } from "lucide-react";
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
    rawDate?: string; // Make rawDate optional
  };
  userUID: string;
  invoiceUID: string;
}

const EditEntryInfoModal = ({
  isOpen,
  onClose,
  entry,
  userUID,
  invoiceUID,
}: EditEntryInfoModalProps) => {
  const currentUser = User();

  // Parse the rawDate into a Date object if it exists, otherwise set to null
  const parsedDate = entry.rawDate ? new Date(entry.rawDate) : null;

  // State for the selected date (can be null)
  const [date, setDate] = useState<Date | null>(parsedDate);

  // State for the entry fields
  const [desc, setDesc] = useState(entry.desc);
  const [unitPrice, setUnitPrice] = useState<string | number>(
    entry.unitPrice ?? ""
  ); // Allow string for empty input
  const [unitType, setUnitType] = useState(entry.unitType);
  const [total, setTotal] = useState<string | number>(entry.total); // Allow string for empty input
  const [isTotalManuallySet, setIsTotalManuallySet] = useState(false); // Track if total is manually set

  // Update total when unitPrice changes (if total hasn't been manually set)
  useEffect(() => {
    if (!isTotalManuallySet) {
      const parsedUnitPrice =
        typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
      setTotal(isNaN(parsedUnitPrice) ? "" : parsedUnitPrice); // Set to empty string if unitPrice is empty or invalid
    }
  }, [unitPrice, isTotalManuallySet]);

  // Handle saving changes to Firebase
  const handleSaveChanges = () => {
    if (!currentUser || !userUID || !invoiceUID) {
      console.error("Current user, userUID, or invoiceUID is missing.");
      return;
    }

    const entryRef = ref(
      database,
      `users/${currentUser.uid}/clients/${userUID}/invoices/${invoiceUID}/entries/${entry.id}`
    );

    const parsedUnitPrice =
      typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
    const parsedTotal = typeof total === "string" ? parseFloat(total) : total;

    update(entryRef, {
      date: date ? format(date, "MMM dd") : "", // Format the date as "Oct 01" or empty string if no date
      description: desc,
      unitPrice: isNaN(parsedUnitPrice) ? 0 : parsedUnitPrice, // Save 0 if unitPrice is empty or invalid
      total: isNaN(parsedTotal) ? 0 : parsedTotal, // Save 0 if total is empty or invalid
      unitType: unitType ? unitType : "",
      rawDate: date ? date.toUTCString() : "", // Update rawDate in UTC format or empty string if no date
    })
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error("Error updating entry:", error);
        alert("Failed to update entry. Please try again.");
      });
  };

  // Validate input to allow only numeric characters and a single decimal point
  const validateNumericInput = (value: string): string => {
    // Allow empty string
    if (value === "") return value;

    // Allow only numbers and a single decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value)) {
      return value;
    }

    // If the input is invalid, return the previous value
    return value.slice(0, -1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Entry</h2>

        <div className="space-y-4">
          <div className="entry-fields-row-1 entry-group w-full flex flex-col">
            <Label htmlFor="invoice-entry-date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date ?? undefined} // Pass undefined if date is null
                  onSelect={(newDate) => {
                    setDate(newDate ?? null); // Set to null if newDate is undefined
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="entry-fields-row-2 entry-group w-full flex flex-col">
            <Label htmlFor="invoice-entry-desc">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="mt-2 focus:border-kelly-green"
              id="invoice-entry-desc"
              cols={30}
              rows={2}
            />
          </div>

          <div className="entry-fields-row-3 entry-group items-center w-full flex gap-4">
            <div className="flex gap-8 items-center">
              <div className="unit-group flex flex-col">
                <Label htmlFor="invoice-entry-unit-price">
                  Unit Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoice-entry-unit-price"
                  required
                  value={unitPrice} // Allow empty string for a cleaner look
                  onChange={(e) => {
                    const validatedValue = validateNumericInput(e.target.value);
                    setUnitPrice(validatedValue); // Allow only numeric characters
                  }}
                  className="mt-2 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="mt-6">/</span>
              <div className="unit-group flex flex-col">
                <Label htmlFor="invoice-entry-unit-type">Unit Type</Label>
                <Input
                  id="invoice-entry-unit-type"
                  type="text"
                  value={unitType ?? ""} // Use empty string if unitType is undefined
                  onChange={(e) => setUnitType(e.target.value || undefined)} // Set to undefined if the value is empty
                  className="mt-2 focus:border-kelly-green"
                />
              </div>
            </div>
          </div>

          <div className="entry-fields-row-4 entry-group w-full flex flex-col">
            <Label htmlFor="invoice-entry-total">
              Total <span className="text-red-500">*</span>
            </Label>
            <Input
              id="invoice-entry-total"
              required
              value={total} // Allow empty string for a cleaner look
              onChange={(e) => {
                const validatedValue = validateNumericInput(e.target.value);
                setTotal(validatedValue); // Allow only numeric characters
                setIsTotalManuallySet(true); // Mark total as manually set
              }}
              className="w-36 mt-2 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-kelly-green" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEntryInfoModal;
