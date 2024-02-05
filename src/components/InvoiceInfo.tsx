import { User } from "../hooks/User";
import { useParams } from "react-router-dom";

import Button from "./Button";
import { database } from "../ts/firebase/auth";
import { push, ref } from "firebase/database";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    // Get the current month in the format YYYY-MM
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);

    // Set the current month as the default value
    setMonth(currentMonth);
  }, []);

  const createInvoice = () => {
    const invoiceInput = document.getElementById(
      "invoice-number"
    ) as HTMLInputElement;
    const monthInput = document.getElementById(
      "invoice-month"
    ) as HTMLInputElement;

    let validationCheck = true;
    if (!invoiceInput.value) {
      invoiceInput.classList.add("invalid-field");
      validationCheck = false;
    }
    if (!monthInput.value) {
      monthInput.classList.add("invalid-field");
      validationCheck = false;
    }

    if (!validationCheck) {
      return;
    }

    const clientInvoiceList = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices`
    );

    const d = new Date(monthInput.value);
    push(clientInvoiceList, {
      invoiceNumber: invoiceInput.value,
      invoiceMonth: months[d.getUTCMonth()],
      invoiceYear: d.getUTCFullYear(),
      invoiceStatus: "Incomplete",
      invoiceSubtotal: 0,
      invoiceTotal: 0,
      invoiceSalesTax: 0,
      applySales: false,
    });

    changeShow();
  };

  return (
    <>
      <div
        id="create-client-form-container"
        className="bg-black bg-opacity-60 client-info-container fixed flex flex-col justify-center items-center px-8 inset-x-0 inset-y-0 m-auto"
      >
        <div className=" client-info-form w-full md:w-fit flex flex-col gap-6 bg-white shadow-2xl rounded-lg p-12">
          <div className="flex justify-between flex-col md:flex-row items-center gap-4">
            <label htmlFor="invoice-number">
              Invoice <span className="text-red-500">*</span>
            </label>

            <input
              id="invoice-number"
              type="number"
              required
              onFocus={(e) => {
                e.currentTarget.classList.remove("invalid-field");
              }}
              className="px-4 py-2 text-center w-36 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex justify-between flex-col items-center md:flex-row gap-4">
            <label htmlFor="invoice-month">
              Month <span className="text-red-500">*</span>
            </label>

            <input
              id="invoice-month"
              required
              type="month"
              defaultValue={month}
              onFocus={(e) => {
                e.currentTarget.classList.remove("invalid-field");
              }}
              className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
            />
          </div>
          <Button
            text="Cancel"
            color="bg-gray-500 self-center"
            id="create-client-btn"
            clickFunction={changeShow}
          />

          <Button
            text="Create Invoice"
            color="bg-kelly-green self-center"
            id="create-client-btn"
            clickFunction={createInvoice}
          />
        </div>
      </div>
    </>
  );
};

export default InvoiceInfo;
