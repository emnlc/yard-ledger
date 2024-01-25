import { onValue, ref } from "firebase/database";
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
}

interface Entry {
  date: string;
  desc: string;
  unitPrice?: number;
  total: number;
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

  useEffect(() => {
    onValue(invoiceRef, (snapshot) => {
      const data = snapshot.val();
      setInvoice({
        key: snapshot.key,
        number: data.invoiceNumber,
        month: data.invoiceMonth,
        year: data.invoiceYear,
        status: data.invoiceStatus,
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

  return (
    <>
      <div className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto">
        {invoice && (
          <>
            <div className="invoice-entries-header gap-4 h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
              <h1 className="text-center text-5xl font-extrabold ">
                Inv #{invoice.number}
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
                  text="New Entry"
                  color="bg-kelly-green"
                  id="new-invoice-btn"
                  clickFunction={showEntryForm}
                />
                <Button
                  text="Mark Complete"
                  color="bg-blue-400"
                  id="new-invoice-btn"
                  clickFunction={() => {
                    console.log("your mom");
                  }}
                />
              </div>
              <table className="w-full table-fixed">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 text-base font-semibold tracking-wide text-center">
                      Date
                    </th>
                    <th className="p-3 text-base font-semibold tracking-wide text-center">
                      Description
                    </th>
                    <th className="p-3 text-base font-semibold tracking-wide text-center">
                      Unit Price
                    </th>
                    <th className="p-3 text-base font-semibold tracking-wide text-center">
                      Line Total
                    </th>
                  </tr>
                </thead>

                <tbody className="[&>*:nth-child(odd)]:bg-white [&>*:nth-child(even)]:bg-gray-100">
                  {entries
                    // .sort((a, b) => b.number - a.number)
                    .map((entry) => {
                      return (
                        <tr>
                          <td className="p-3 text-base font-bold text-center">
                            {entry.date}
                          </td>
                          <td className="p-3 text-base text-center">
                            {entry.desc}
                          </td>
                          <td className="p-3 text-base text-center">
                            {entry.unitPrice}
                          </td>
                          <td className="p-3 text-base text-center">
                            {entry.total && "$" + entry.total}
                          </td>
                        </tr>
                      );
                    })}
                  <tr>
                    <td
                      colSpan={4}
                      className="p-3 text-base font-bold text-right"
                    >
                      <span className=" font-extrabold">SUBTOTAL</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Div */}
            <div className="md:hidden flex">
              <Button
                text="New Entry"
                color="bg-kelly-green"
                id="new-invoice-btn"
                clickFunction={showEntryForm}
                // () => {
                //   push(entriesRef, {
                //     date: "January 2",
                //     description: "Installed your dad infront of your dad",
                //     total: 69,
                //   });
                // }
              />
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
