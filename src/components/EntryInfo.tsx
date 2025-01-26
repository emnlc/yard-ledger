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
import { useState } from "react";
import { format } from "date-fns";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

const EntryInfo = (props: Props) => {
  const months = [
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

  const currentUser = User();
  const { userUID, invoiceUID } = useParams();

  const changeShow = () => {
    props.setShow(!props.show);
  };

  // State for the selected dates
  const [dates, setDates] = useState<Date[]>();

  // State for the unit price
  const [unitPrice, setUnitPrice] = useState<string>("");

  // State for the total
  const [total, setTotal] = useState<string>("");

  // Handle unit price changes
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnitPrice(value);
    setTotal(value); // Update the total with the same value
  };

  // Handle total changes
  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotal(e.target.value); // Allow manual editing of the total
  };

  const createEntry = () => {
    const desc = document.getElementById(
      "invoice-entry-desc"
    ) as HTMLTextAreaElement;
    const unitType = document.getElementById(
      "invoice-entry-unit-type"
    ) as HTMLInputElement;

    let entryValidation = true;

    if (!desc.value) {
      desc.classList.add("border-red-500");
      entryValidation = false;
    }

    if (!unitPrice) {
      const unitPriceInput = document.getElementById(
        "invoice-entry-unit-price"
      ) as HTMLInputElement;
      unitPriceInput.classList.add("border-red-500");
      entryValidation = false;
    }

    if (!total) {
      const totalInput = document.getElementById(
        "invoice-entry-total"
      ) as HTMLInputElement;
      totalInput.classList.add("border-red-500");
      entryValidation = false;
    }

    if (!entryValidation) {
      return;
    }

    const entriesRef = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}/entries`
    );

    const unit = unitType.value
      ? `${unitPrice}/${unitType.value}`
      : `${unitPrice}`;

    if (dates && dates.length > 0) {
      // Create an entry for each selected date
      dates.forEach((date) => {
        const formattedDate = `${
          months[date.getUTCMonth()]
        } ${date.getUTCDate()}`;

        push(entriesRef, {
          date: formattedDate,
          description: desc.value,
          total: total,
          unitPrice: unit,
          unitType: "",
          rawDate: date.toUTCString(), // Add rawDate in UTC format
        });
      });
    } else {
      push(entriesRef, {
        date: "",
        description: desc.value,
        total: total,
        unitPrice: unit,
        unitType: "",
        rawDate: "",
      });
    }

    changeShow();
  };

  return (
    <>
      <div
        id="create-client-form-container"
        className="bg-black bg-opacity-60 client-info-container fixed flex flex-col justify-center items-center md:px-8 inset-x-0 inset-y-0 m-auto"
      >
        <div className="invoice-entry-form flex flex-col gap-8 justify-center items-center bg-white w-full md:w-fit h-full md:h-fit rounded-lg p-12">
          <div className="entry-fields-row-1 entry-group w-full flex flex-col">
            <Label htmlFor="invoice-entry-date">Date</Label>
            <Popover>
              <PopoverTrigger asChild className="mt-2">
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dates || dates.length === 0 ? "text-muted-foreground" : ""
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dates && dates.length > 0 ? (
                    <span>
                      {dates.length === 1
                        ? format(dates[0], "PPP") // Show the selected date if only one is selected
                        : `${dates.length} dates selected`}
                    </span>
                  ) : (
                    <span>Select date(s)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="multiple" // Enable multiple date selection
                  selected={dates}
                  onSelect={setDates}
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
              className="mt-2 focus:border-kelly-green"
              name="invoice-entry-desc"
              id="invoice-entry-desc"
              cols={30}
              rows={2}
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
              }}
            ></Textarea>
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
                  value={unitPrice}
                  onChange={handleUnitPriceChange}
                  className="mt-2 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onFocus={(e) => {
                    e.currentTarget.classList.remove("border-red-500");
                  }}
                ></Input>
              </div>
              <span className=" mt-6">/</span>
              <div className="unit-group flex flex-col">
                <Label htmlFor="invoice-entry-unit-type">Unit Type</Label>
                <Input
                  id="invoice-entry-unit-type"
                  type="text"
                  className="mt-2  focus:border-kelly-green"
                ></Input>
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
              type="number"
              value={total}
              onChange={handleTotalChange}
              className="w-36 mt-2  focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
              }}
            ></Input>
          </div>
          <div className="entry-fields-row-5 flex flex-col gap-8 md:flex-row">
            <Button
              className="bg-gray-800"
              id="cancel-entry-btn"
              onClick={changeShow}
            >
              Cancel
            </Button>
            <Button
              className="bg-kelly-green"
              id="create-entry-btn"
              onClick={createEntry}
            >
              Create Entries
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryInfo;
