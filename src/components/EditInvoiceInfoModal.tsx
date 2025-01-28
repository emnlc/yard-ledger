import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { database } from "../ts/firebase/auth";
import { ref, remove, update } from "firebase/database";
import { User } from "../hooks/User";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
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

const EditInvoiceInfoModal = ({
  isOpen,
  onClose,
  invoice,
  userUID,
}: EditInvoiceInfoModalProps) => {
  const currentUser = User();

  const deleteInvoice = (id: string) => {
    const targetInvoice = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices/${id}`
    );
    remove(targetInvoice);
  };

  const months = [
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

  // Initialize date state with the invoice's month and year
  const [date, setDate] = useState<Date>(() => {
    return new Date(invoice.year, months.indexOf(invoice.month), 1); // First day of the invoice's month
  });

  // State for the selected year
  const [selectedYear, setSelectedYear] = useState<number>(invoice.year);

  // State to control the open/close state of the month and year pickers
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  // State for the invoice number
  const [invoiceNumber, setInvoiceNumber] = useState<number>(invoice.number);

  // Generate a range of years (2 years before and after the current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  // Handle saving changes to Firebase
  const handleSaveChanges = () => {
    if (!currentUser || !userUID) {
      console.error("Current user or userUID is missing.");
      return;
    }

    const invoiceRef = ref(
      database,
      `users/${currentUser.uid}/clients/${userUID}/invoices/${invoice.id}`
    );

    // Extract month and year from the `date` state
    const selectedMonth = months[date.getMonth()]; // Get the month name (e.g., "January")
    const selectedYear = date.getFullYear(); // Get the year (e.g., 2023)

    update(invoiceRef, {
      invoiceNumber: invoiceNumber, // Use the updated invoice number
      invoiceMonth: selectedMonth, // Use the selected month
      invoiceYear: selectedYear, // Use the selected year
      invoiceStatus: invoice.invoiceStatus || invoice.status, // Fallback for older invoices
    })
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error("Error updating invoice:", error);
      });
  };

  // Handle invoice number changes
  const handleInvoiceNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setInvoiceNumber(value);
    }
  };

  // Custom Month Picker
  const renderMonthPicker = () => {
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((month, index) => (
          <Button
            key={month}
            variant={date?.getMonth() === index ? "default" : "ghost"}
            onClick={() => {
              const selectedDate = new Date(selectedYear, index, 1);
              setDate(selectedDate);
              setIsMonthPickerOpen(false); // Close the month picker
            }}
          >
            {month}
          </Button>
        ))}
      </div>
    );
  };

  // Custom Year Picker
  const renderYearPicker = () => {
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {years.map((year) => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "ghost"}
            onClick={() => {
              setSelectedYear(year);
              const selectedDate = new Date(year, date.getMonth(), 1);
              setDate(selectedDate);
              setIsYearPickerOpen(false); // Close the year picker
            }}
          >
            {year}
          </Button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="client-info-form w-full md:w-fit flex flex-col gap-6 bg-white shadow-2xl rounded-lg p-12">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-bold ">Edit Invoice</h2>
          <Button
            size={"sm"}
            variant={"destructive"}
            onClick={() => {
              deleteInvoice(invoice.id);
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between flex-col md:flex-row items-center gap-4">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="number"
              type="number"
              value={invoiceNumber}
              onChange={handleInvoiceNumberChange}
              className="px-4 py-2 text-center md:w-36 border rounded-md outline-none transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="flex justify-between items-center flex-row gap-4">
            {/* Month Picker */}
            <Popover
              open={isMonthPickerOpen}
              onOpenChange={setIsMonthPickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-36 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
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
            <Popover open={isYearPickerOpen} onOpenChange={setIsYearPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-36 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy") : <span>Pick a year</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {renderYearPicker()}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="button-create-container flex flex-row justify-between">
          <Button className="bg-gray-800 self-center" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="bg-kelly-green self-center"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceInfoModal;
