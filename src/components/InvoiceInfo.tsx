import { User } from "../hooks/User";
import { useParams } from "react-router-dom";
import { database } from "../ts/firebase/auth";
import { push, ref } from "firebase/database";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
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

const InvoiceInfo = ({ show, setShow }: Props) => {
  const currentUser = User();
  const { userUID } = useParams();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [errors, setErrors] = useState({
    invoiceNumber: false,
    date: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  // Validate form
  const validateForm = () => {
    const newErrors = {
      invoiceNumber: !invoiceNumber.trim(),
      date: !date,
    };
    setErrors(newErrors);
    return !newErrors.invoiceNumber && !newErrors.date;
  };

  // Handle submit
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const clientInvoiceList = ref(
        database,
        `users/${currentUser?.uid}/clients/${userUID}/invoices`
      );

      const selectedMonth = MONTHS[date.getMonth()];
      const selectedYear = date.getFullYear();
      const rawDate = new Date(selectedYear, date.getMonth(), 1);

      await push(clientInvoiceList, {
        invoiceNumber: parseInt(invoiceNumber.trim()),
        invoiceMonth: selectedMonth,
        invoiceYear: selectedYear,
        rawDate: rawDate.toISOString(),
        invoiceStatus: "Incomplete",
        invoiceSubtotal: 0,
        invoiceFinalTotal: 0,
        invoiceSalesTax: 0,
        applySales: false,
      });

      setInvoiceNumber("");
      setDate(new Date(currentYear, new Date().getMonth(), 1));
      setErrors({ invoiceNumber: false, date: false });
      setShow(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setInvoiceNumber("");
      setErrors({ invoiceNumber: false, date: false });
      setShow(false);
    }
  };

  // Month picker
  const renderMonthPicker = () => (
    <div className="grid grid-cols-3 gap-2 p-2">
      {MONTHS.map((month, index) => (
        <Button
          key={month}
          variant={date?.getMonth() === index ? "default" : "ghost"}
          onClick={() => {
            const selectedDate = new Date(selectedYear, index, 1);
            setDate(selectedDate);
            setIsMonthPickerOpen(false);
            if (errors.date) setErrors((prev) => ({ ...prev, date: false }));
          }}
          size="sm"
        >
          {month.slice(0, 3)}
        </Button>
      ))}
    </div>
  );

  // Year picker
  const renderYearPicker = () => (
    <div className="grid grid-cols-3 gap-2 p-2">
      {years.map((year) => (
        <Button
          key={year}
          variant={selectedYear === year ? "default" : "ghost"}
          onClick={() => {
            setSelectedYear(year);
            const selectedDate = new Date(year, date.getMonth(), 1);
            setDate(selectedDate);
            setIsYearPickerOpen(false);
            if (errors.date) setErrors((prev) => ({ ...prev, date: false }));
          }}
          size="sm"
        >
          {year}
        </Button>
      ))}
    </div>
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">New Invoice</h2>
          <p className="text-sm text-muted-foreground">
            Create a new invoice. All fields are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Number */}
          <div className="space-y-2">
            <Label htmlFor="invoice-number">
              Invoice Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invoice-number"
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
                Invoice number is required
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
                      !date && "text-muted-foreground",
                      errors.date && "border-destructive"
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
                      !date && "text-muted-foreground",
                      errors.date && "border-destructive"
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
            {errors.date && (
              <p className="text-sm text-destructive">
                Please select a month and year
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceInfo;
