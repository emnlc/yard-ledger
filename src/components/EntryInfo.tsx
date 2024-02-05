import { useParams } from "react-router-dom";
import { database } from "../ts/firebase/auth";
import Button from "./Button";
import { User } from "../hooks/User";
import { push, ref } from "firebase/database";
import { useEffect, useState } from "react";

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

  const [today, setToday] = useState("");

  useEffect(() => {
    // Get the current month in the format YYYY-MM
    const date = new Date();

    const formattedDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;

    setToday(formattedDate);
  }, []);

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
      desc.classList.add("invalid-field");
      entryValidation = false;
    }

    if (!unitPrice.value) {
      unitPrice.classList.add("invalid-field");
      entryValidation = false;
    }

    if (!total.value) {
      total.classList.add("invalid-field");
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
    const formattedDate = `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
    const unit = unitType.value
      ? `$${unitPrice.value} / ${unitType.value}`
      : `${unitPrice.value}`;

    console.log(unit);

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
            <label htmlFor="invoice-entry-date">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
              required
              type="date"
              defaultValue={today}
              id="invoice-entry-date"
            />
          </div>
          <div className="entry-fields-row-2 entry-group w-full flex flex-col">
            <label htmlFor="invoice-entry-desc">
              Description <span className=" text-red-500">*</span>
            </label>
            <textarea
              required
              className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              name="invoice-entry-desc"
              id="invoice-entry-desc"
              cols={30}
              rows={2}
              onFocus={(e) => {
                e.currentTarget.classList.remove("invalid-field");
              }}
            ></textarea>
          </div>
          <div className="entry-fields-row-3 entry-group items-center w-full flex gap-4">
            <div className="flex gap-8 items-center">
              <div className="unit-group flex flex-col">
                <label htmlFor="invoice-entry-unit">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  pattern="\d*"
                  required
                  id="invoice-entry-unit-price"
                  className="px-4 py-2 w-full border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onFocus={(e) => {
                    e.currentTarget.classList.remove("invalid-field");
                  }}
                />
              </div>
              <span className=" mt-6">/</span>
              <div className="unit-group flex flex-col">
                <label htmlFor="invoice-entry-unit-type">Unit Type</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="invoice-entry-unit-type"
                    className="px-4 py-2 w-full border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onFocus={(e) => {
                      e.currentTarget.classList.remove("invalid-field");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="entry-fields-row-4 entry-group w-full flex flex-col">
            <label htmlFor="invoice-entry-total">
              Total $ <span className=" text-red-500">*</span>
            </label>
            <span className="flex gap-1">
              <input
                required
                type="number"
                pattern="\d*"
                id="invoice-entry-total"
                className="px-4 py-2 w-36 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("invalid-field");
                }}
              />
            </span>
          </div>
          <div className="entry-fields-row-5 flex flex-col gap-8 md:flex-row">
            <Button
              text="Cancel"
              color="bg-gray-500 self-center"
              id="create-client-btn"
              clickFunction={changeShow}
            />
            <Button
              text="Create Entry"
              color="bg-kelly-green self-center"
              id="create-client-btn"
              clickFunction={createEntry}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryInfo;
