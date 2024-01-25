import { useParams } from "react-router-dom";
import { database } from "../ts/firebase/auth";
import Button from "./Button";
import { User } from "../hooks/User";
import { push, ref } from "firebase/database";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

const EntryInfo = (props: Props) => {
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
      "invoice-entry-unit"
    ) as HTMLInputElement;
    const total = document.getElementById(
      "invoice-entry-total"
    ) as HTMLInputElement;

    let entryValidation = true;

    if (!desc.value) {
      desc.classList.add("invalid-field");
      entryValidation = false;
    }

    if (!entryValidation) {
      return;
    }

    const entriesRef = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}/entries`
    );

    push(entriesRef, {
      date: d.value,
      description: desc.value,
      total: total.value,
      unitPrice: unitPrice.value,
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
          <div className="entry-group w-full flex flex-col">
            <label htmlFor="invoice-entry-date">Date</label>
            <input required type="date" id="invoice-entry-date" />
          </div>
          <div className="entry-group w-full flex flex-col">
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
            ></textarea>
          </div>
          <div className="entry-group w-full flex gap-4">
            <div className="unit-group flex flex-col">
              <label htmlFor="invoice-entry-unit">Unit Price</label>
              <input
                type="number"
                pattern="\d*"
                id="invoice-entry-unit"
                className="px-4 py-2 w-36 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="unit-group flex flex-col">
              <label htmlFor="invoice-entry-unit">Unit Count</label>
              <input
                type="number"
                pattern="\d*"
                id="invoice-entry-unit-count"
                className="px-4 py-2 w-36 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="entry-group w-full flex flex-col">
            <label htmlFor="invoice-entry-total">Total $</label>
            <span className="flex gap-1">
              <input
                type="number"
                pattern="\d*"
                id="invoice-entry-total"
                className="px-4 py-2 w-36 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </span>
          </div>
          <Button
            text="Create Entry"
            color="bg-kelly-green self-center"
            id="create-client-btn"
            clickFunction={createEntry}
          />
          <Button
            text="Cancel"
            color="bg-gray-500 self-center"
            id="create-client-btn"
            clickFunction={changeShow}
          />
        </div>
      </div>
    </>
  );
};

export default EntryInfo;
