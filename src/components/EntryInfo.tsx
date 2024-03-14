import { useParams } from "react-router-dom";
import { database } from "../ts/firebase/auth";
// import Button from "./Button";
import { User } from "../hooks/User";
import { push, ref } from "firebase/database";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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

  const createEntry = () => {
    const d = document.getElementById("invoice-entry-date") as HTMLInputElement;
    const desc = document.getElementById(
      "invoice-entry-desc"
    ) as HTMLTextAreaElement;
    const unitPrice = document.getElementById(
      "invoice-entry-unit-price"
    ) as HTMLInputElement;
    const unitType = document.getElementById(
      "invoice-entry-unit-type"
    ) as HTMLInputElement;
    const total = document.getElementById(
      "invoice-entry-total"
    ) as HTMLInputElement;

    let entryValidation = true;

    if (!desc.value) {
      desc.classList.add("border-red-500");
      entryValidation = false;
    }

    if (!unitPrice.value) {
      unitPrice.classList.add("border-red-500");
      entryValidation = false;
    }

    if (!total.value) {
      total.classList.add("border-red-500");
      entryValidation = false;
    }

    if (!entryValidation) {
      return;
    }

    const entriesRef = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}/entries`
    );

    const date = new Date(d.value);
    const formattedDate = d.value
      ? `${months[date.getUTCMonth()]} ${date.getUTCDate()}`
      : "";

    const unit = unitType.value
      ? `${unitPrice.value}/${unitType.value}`
      : `${unitPrice.value}`;

    push(entriesRef, {
      date: formattedDate,
      description: desc.value,
      total: total.value,
      unitPrice: unit,
    });

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
            <input
              className="border p-2 mt-2 rounded-md  outline-none text-base transition-colors focus:border-kelly-green"
              required
              type="date"
              id="invoice-entry-date"
            />
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
              Create Entry
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryInfo;
