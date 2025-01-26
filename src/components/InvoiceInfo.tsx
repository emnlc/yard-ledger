import { User } from "../hooks/User";
import { useParams } from "react-router-dom";
import { database } from "../ts/firebase/auth";
import { push, ref } from "firebase/database";
import { useEffect, useState } from "react";
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

const InvoiceInfo = (props: Props) => {
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
  const currentUser = User();
  const { userUID } = useParams();

  const changeShow = () => {
    props.setShow(!props.show);
  };

  const [month, setMonth] = useState("");

  // Initialize date state with the current month and year
  const [date, setDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  });

  // State for the selected year
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // State to control the open/close state of the month and year pickers
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  useEffect(() => {
    // Get the current month in the format YYYY-MM
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    setMonth(currentMonth);
  }, []);

  const createInvoice = () => {
    const invoiceInput = document.getElementById(
      "invoice-number"
    ) as HTMLInputElement;

    let validationCheck = true;
    if (!invoiceInput.value) {
      invoiceInput.classList.add("border-red-500");
      validationCheck = false;
    }
    if (!date) {
      alert("Please select a month and year.");
      validationCheck = false;
    }

    if (!validationCheck) return;

    const clientInvoiceList = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices`
    );

    // Extract month and year from the `date` state
    const selectedMonth = months[date.getMonth()]; // Get the month name (e.g., "January")
    const selectedYear = date.getFullYear(); // Get the year (e.g., 2023)

    push(clientInvoiceList, {
      invoiceNumber: invoiceInput.value,
      invoiceMonth: selectedMonth, // Use the selected month
      invoiceYear: selectedYear, // Use the selected year
      invoiceStatus: "Incomplete",
      invoiceSubtotal: 0,
      invoiceTotal: 0,
      invoiceSalesTax: 0,
      applySales: false,
    });

    changeShow();
  };

  // Generate a list of years (e.g., from 2020 to 2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

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

  return (
    <>
      <div
        id="create-client-form-container"
        className="bg-black bg-opacity-60 client-info-container fixed flex flex-col justify-center items-center px-8 inset-x-0 inset-y-0 m-auto"
      >
        <div className="client-info-form w-full md:w-fit flex flex-col gap-6 bg-white shadow-2xl rounded-lg p-12">
          <div className="flex justify-between flex-col md:flex-row items-center gap-4">
            <Label htmlFor="invoice-number">
              Invoice Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="invoice-number"
              type="number"
              required
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
              }}
              className="px-4 py-2 text-center md:w-36 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          <div className="button-create-container flex flex-row justify-between">
            <Button
              className="bg-gray-800 self-center font-bold"
              id="create-client-btn"
              onClick={changeShow}
            >
              Cancel
            </Button>

            <Button
              className="bg-kelly-green self-center font-bold"
              id="create-client-btn"
              onClick={createInvoice}
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceInfo;
