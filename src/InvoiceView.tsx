import { onValue, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { database } from "./ts/firebase/auth";
import { User } from "./hooks/User";

import Button from "./components/Button";
import EntryInfo from "./components/EntryInfo";

interface Invoice {
  key: string | null;
  number: number;
  month: string;
  year: number;
  status: string;
  finalTotal: number;
  salesTax: number;
  applySales: boolean;
  subtotal: number;
}

interface Entry {
  date: string;
  desc: string;
  unitPrice?: number;
  total: number;
  id: string;
}

const InvoiceView = () => {
  const currentUser = User();
  const [showEntry, setShowEntry] = useState(false);
  const { userUID, invoiceUID } = useParams();
  const [invoice, setInvoice] = useState<Invoice>();
  const [entries, setEntries] = useState<Entry[]>([]);

  const showEntryForm = () => {
    setShowEntry(!showEntry);
  };

  const invoiceRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}`
  );

  const entriesRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}/entries`
  );

  const deleteEntry = (id: string) => {
    const invoiceToDelete = ref(
      database,
      `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}/entries/${id}`
    );

    remove(invoiceToDelete);
  };

  const applySalesTax = () => {
    const salesTaxStatus = (
      document.getElementById("sales-tax-checkbox") as HTMLInputElement
    ).checked;

    update(invoiceRef, {
      applySales: salesTaxStatus,
    });

    const salesTax = (
      document.getElementById("sales-tax-input") as HTMLInputElement
    ).value;

    if (salesTaxStatus && salesTax) {
      const newFinalTotal = (invoice?.subtotal ?? 0) - parseFloat(salesTax);

      update(invoiceRef, {
        invoiceFinalTotal: newFinalTotal,
        invoiceSalesTax: salesTax,
      });
      return;
    }

    update(invoiceRef, {
      invoiceFinalTotal: invoice?.subtotal,
      invoiceSalesTax: 0,
    });
  };

  const applySalesTaxMobile = () => {
    const salesTaxStatus = (
      document.getElementById("apply-sales-tax-mobile") as HTMLInputElement
    ).checked;

    update(invoiceRef, {
      applySales: salesTaxStatus,
    });

    const salesTax = (
      document.getElementById("sales-tax-input-mobile") as HTMLInputElement
    ).value;

    if (salesTaxStatus && salesTax) {
      const newFinalTotal = (invoice?.subtotal ?? 0) - parseFloat(salesTax);

      update(invoiceRef, {
        invoiceFinalTotal: newFinalTotal,
        invoiceSalesTax: salesTax,
      });
      return;
    }

    update(invoiceRef, {
      invoiceFinalTotal: invoice?.subtotal,
      invoiceSalesTax: 0,
    });
  };

  useEffect(() => {
    onValue(invoiceRef, (snapshot) => {
      const data = snapshot.val();
      setInvoice({
        key: snapshot.key,
        number: data.invoiceNumber,
        month: data.invoiceMonth,
        year: data.invoiceYear,
        status: data.invoiceStatus,
        finalTotal: data.invoiceFinalTotal,
        salesTax: data.invoiceSalesTax,
        applySales: data.applySales,
        subtotal: data.invoiceSubtotal,
      });
    });
  }, [currentUser]);

  useEffect(() => {
    onValue(entriesRef, (snapshot) => {
      const entriesData: Entry[] = [];

      snapshot.forEach((childsnapshot) => {
        entriesData.push({
          date: childsnapshot.val().date,
          desc: childsnapshot.val().description,
          unitPrice: childsnapshot.val().unitPrice,
          total: childsnapshot.val().total,
          id: childsnapshot.key,
        });
      });
      setEntries(entriesData);
    });
  }, [currentUser]);

  function getSpan(status: string) {
    if (status === "Incomplete") {
      return "p-1.5 text-base font-medium uppercase tracking-wider text-red-800 bg-red-200 rounded-lg bg-opacity-50";
    }

    return "p-1.5 text-base font-medium uppercase tracking-wider text-green-800 bg-green-200 rounded-lg bg-opacity-50";
  }

  const initialTotal = entries.reduce(
    (prev, entry) => prev + parseFloat(String(entry.total) || "0"),
    0
  );

  useEffect(() => {
    const newFinalTotal = invoice?.applySales
      ? initialTotal - invoice.salesTax
      : initialTotal;

    update(invoiceRef, {
      invoiceSubtotal: initialTotal,
      invoiceFinalTotal: newFinalTotal,
    });
  });

  return (
    <>
      <div className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto">
        {invoice && (
          <>
            <div className="invoice-entries-header gap-4 h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
              <h1 className="text-center text-5xl font-extrabold ">
                Invoice #{invoice.number}
              </h1>
              <h1 className="text-center text-xl font-extrabold">
                {invoice.month}, {invoice.year} {"- "}
                <span className={getSpan(invoice.status)}>
                  {invoice.status}
                </span>
              </h1>
            </div>

            <div className="invoice-entries-body hidden md:flex md:flex-col md:justify-start md:items-start md:gap-8">
              <div className="flex gap-4">
                <Button
                  text="New Line"
                  color="bg-kelly-green"
                  id="new-invoice-btn"
                  clickFunction={showEntryForm}
                />
              </div>
              <table className="w-full table-auto">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th></th>
                    <th className="p-3 text-base font-semibold tracking-wide text-center">
                      Date
                    </th>
                    <th className="p-3 text-base font-semibold tracking-wide text-left">
                      Description
                    </th>
                    <th className="p-3 text-base font-semibold tracking-wide text-center">
                      Unit Price
                    </th>
                    <th className="p-3 text-base font-semibold tracking-wide text-right">
                      Line Total
                    </th>
                  </tr>
                </thead>

                <tbody className="[&>*:nth-child(odd)]:bg-white [&>*:nth-child(even)]:bg-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="align-middle w-10 text-center ">
                        <button
                          onClick={() => {
                            deleteEntry(entry.id);
                          }}
                        >
                          <img src="/trash.svg" className="w-6 h-6" alt="" />
                        </button>
                      </td>
                      <td className="p-3 text-base font-bold text-center">
                        {entry.date}
                      </td>
                      <td className="p-3 text-base text-left">{entry.desc}</td>
                      <td className="p-3 text-base text-center">
                        ${entry.unitPrice}
                      </td>
                      <td className="p-3 text-base text-right">
                        ${entry.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer flex flex-col gap-4 self-end">
                <div className="price-groups flex flex-col font-extrabold border border-l-0 border-r-0 border-t-0 border-b-black">
                  <div className="flex w-full gap-16 justify-between">
                    SUBTOTAL: <span>${invoice.subtotal}</span>
                  </div>
                  <div className="flex w-full justify-between">
                    SALES TAX: <span>${invoice.salesTax}</span>
                  </div>
                  <div className="flex w-full justify-between">
                    TOTAL:{" "}
                    <span className="self-end">${invoice.finalTotal}</span>
                  </div>
                </div>
                <div className="sales-tax-container w-full flex justify-between items-center self-end font-medium">
                  <div className="flex gap-4">
                    <label htmlFor="apply-sales-tax">Discount</label>
                    <input
                      type="checkbox"
                      name="apply-sales-tax"
                      id="sales-tax-checkbox"
                      checked={invoice.applySales}
                      onChange={applySalesTax}
                    />
                  </div>
                  <div className="self-end">
                    $
                    <input
                      type="number"
                      onChange={applySalesTax}
                      defaultValue={invoice.salesTax}
                      id="sales-tax-input"
                      className="border rounded-md outline-none text-base transition-colors focus:border-kelly-green w-14 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Div */}
            <div className="md:hidden flex flex-col gap-8">
              <div className="button-group flex justify-center">
                <Button
                  text="New Line"
                  color="bg-kelly-green"
                  id="new-invoice-btn"
                  clickFunction={showEntryForm}
                />
              </div>

              <div className="entry-container flex flex-col gap-8 ">
                <div className="invoice-total-line flex justify-center font-bold text-2xl">
                  TOTAL: ${invoice.finalTotal}
                </div>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="entry-card flex gap-8 p-4 mx-4 bg-white border rounded-lg shadow-lg"
                  >
                    <div className="entry-card-left w-full">
                      <h1 className="font-bold">{entry.date}</h1>
                      <p className="">{entry.desc}</p>
                    </div>
                    <div className="entry-card-right w-full flex flex-col justify-between">
                      <div className="entry-card-line-1 flex justify-between">
                        <span className=" font-bold">UNIT PRICE:</span>
                        <span>${entry.unitPrice}</span>
                      </div>

                      <div className="entry-card-line-2 flex justify-between">
                        <span className=" font-bold">TOTAL:</span>
                        <span>${entry.total}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="subtotal-and-sales-tax-fields flex justify-between">
                  <div className="w-full flex justify-center ">
                    <h1 className=" font-medium">
                      SUBTOTAL:{" "}
                      <span className="font-bold">${invoice.subtotal}</span>
                    </h1>
                  </div>
                  <div className="w-full flex justify-center">
                    <h1 className=" font-medium">
                      SALES TAX:{" "}
                      <span className="font-bold">${invoice.salesTax}</span>
                    </h1>
                  </div>
                </div>
              </div>
              <div className="sales-tax-container w-full flex justify-center items-center self-end font-medium gap-8">
                <div className="flex gap-4">
                  <label htmlFor="apply-sales-tax-mobile">Discount</label>
                  <input
                    type="checkbox"
                    name="apply-sales-tax-mobile"
                    id="apply-sales-tax-mobile"
                    checked={invoice.applySales}
                    onChange={applySalesTaxMobile}
                  />
                </div>
                <div className="self-end">
                  $
                  <input
                    type="number"
                    onChange={applySalesTaxMobile}
                    defaultValue={invoice.salesTax}
                    id="sales-tax-input-mobile"
                    className="border rounded-md outline-none text-base transition-colors focus:border-kelly-green w-14 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showEntry ? (
        <EntryInfo show={showEntry} setShow={setShowEntry}></EntryInfo>
      ) : null}
    </>
  );
};

export default InvoiceView;
