import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { database } from "../ts/firebase/auth";
import { ref, remove, update } from "firebase/database";
import { User } from "../hooks/User";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditInvoiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    number: number;
    month: string;
    year: number;
    status?: string;
    invoiceStatus?: string;
  };
  userUID: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EditInvoiceInfoModal = ({
  isOpen,
  onClose,
  invoice,
  userUID,
}: EditInvoiceInfoModalProps) => {
  const currentUser = User();

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    invoice.number.toString()
  );
  const [date, setDate] = useState<Date>(
    new Date(invoice.year, MONTHS.indexOf(invoice.month), 1)
  );
  const [selectedYear, setSelectedYear] = useState<number>(invoice.year);

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [errors, setErrors] = useState({
    invoiceNumber: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  const validateForm = () => {
    const newErrors = {
      invoiceNumber: !invoiceNumber.trim() || isNaN(parseInt(invoiceNumber)),
    };
    setErrors(newErrors);
    return !newErrors.invoiceNumber;
  };

  const handleSaveChanges = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;

    if (!currentUser?.uid) {
      console.error("Current user is missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceRef = ref(
        database,
        `users/${currentUser.uid}/clients/${userUID}/invoices/${invoice.id}`
      );

      const selectedMonth = MONTHS[date.getMonth()];
      const selectedYear = date.getFullYear();
      const rawDate = new Date(selectedYear, date.getMonth(), 1);

      await update(invoiceRef, {
        invoiceNumber: parseInt(invoiceNumber.trim()),
        invoiceMonth: selectedMonth,
        invoiceYear: selectedYear,
        rawDate: rawDate.toISOString(),
      });

      onClose();
    } catch (error) {
      console.error("Error updating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.uid) {
      console.error("Current user is missing.");
      return;
    }

    setIsDeleting(true);
    try {
      const invoiceRef = ref(
        database,
        `users/${currentUser.uid}/clients/${userUID}/invoices/${invoice.id}`
      );
      await remove(invoiceRef);
      setShowDeleteAlert(false);
      onClose();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const selectedDate = new Date(selectedYear, monthIndex, 1);
    setDate(selectedDate);
    setIsMonthPickerOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    const selectedDate = new Date(year, date.getMonth(), 1);
    setDate(selectedDate);
    setIsYearPickerOpen(false);
  };

  const renderMonthPicker = () => (
    <div className="grid grid-cols-3 gap-2 p-2">
      {MONTHS.map((month, index) => (
        <Button
          key={month}
          variant={date?.getMonth() === index ? "default" : "ghost"}
          onClick={() => handleMonthSelect(index)}
          size="sm"
        >
          {month.slice(0, 3)}
        </Button>
      ))}
    </div>
  );

  const renderYearPicker = () => (
    <div className="grid grid-cols-3 gap-2 p-2">
      {years.map((year) => (
        <Button
          key={year}
          variant={selectedYear === year ? "default" : "ghost"}
          onClick={() => handleYearSelect(year)}
          size="sm"
        >
          {year}
        </Button>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
        <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Invoice</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteAlert(true)}
              disabled={isSubmitting || isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete invoice</span>
            </Button>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-6">
            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-invoice-number">
                Invoice Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-invoice-number"
                type="number"
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  if (errors.invoiceNumber) {
                    setErrors((prev) => ({ ...prev, invoiceNumber: false }));
                  }
                }}
                className={cn(
                  errors.invoiceNumber && "border-destructive",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                placeholder="1001"
                disabled={isSubmitting}
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-destructive">
                  Valid invoice number is required
                </p>
              )}
            </div>

            {/* Month + Year Pickers */}
            <div className="space-y-2">
              <Label>
                Invoice Period <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-4">
                {/* Month Picker */}
                <Popover
                  modal={true}
                  open={isMonthPickerOpen}
                  onOpenChange={setIsMonthPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMMM") : <span>Pick a month</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    {renderMonthPicker()}
                  </PopoverContent>
                </Popover>

                {/* Year Picker */}
                <Popover
                  modal={true}
                  open={isYearPickerOpen}
                  onOpenChange={setIsYearPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-32 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "yyyy") : <span>Year</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    {renderYearPicker()}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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

      {/* Delete Confirmation Modal */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
          <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete{" "}
              <strong>
                Invoice #{invoice.number} ({invoice.month} {invoice.year})
              </strong>{" "}
              and all associated entries. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAlert(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditInvoiceInfoModal;
