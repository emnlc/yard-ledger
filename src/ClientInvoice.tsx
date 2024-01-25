import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "./hooks/User";
import { database } from "./ts/firebase/auth";
import { onValue, ref } from "firebase/database";
import { Link } from "react-router-dom";

import Button from "./components/Button";
import InvoiceInfo from "./components/InvoiceInfo";

interface Client {
  name: string;
  address: string;
  lot?: number;
}

interface Invoice {
  id: string;
  number: number;
  month: string;
  year: number;
  status: string;
}

const ClientInvoice = () => {
  const currentUser = User();
  const { userUID } = useParams();
  const [show, setShow] = useState(false);
  const [clientInfo, setClientInfo] = useState<Client>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const showForm = () => {
    setShow(!show);
  };

  const clientRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}`
  );

  const invoicesRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}/invoices`
  );

  useEffect(() => {
    onValue(clientRef, (snapshot) => {
      const data = snapshot.val();
      setClientInfo({
        name: data.clientName,
        address: data.clientAddress,
        lot: data.clientLot,
      });
    });
  }, [currentUser]);

  useEffect(() => {
    onValue(invoicesRef, (snapshot) => {
      const invoiceData: Invoice[] = [];
      snapshot.forEach((childSnapshot) => {
        invoiceData.push({
          id: childSnapshot.key,
          number: childSnapshot.val().invoiceNumber,
          month: childSnapshot.val().invoiceMonth,
          year: childSnapshot.val().invoiceYear,
          status: childSnapshot.val().invoiceStatus,
        });
      });
      setInvoices(invoiceData);
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
      <div
        id="invoice-container"
        className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto"
      >
        <div className="invoice-header gap-2 h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
          <h1
            id="title"
            className="text-center text-5xl font-extrabold row-start-3"
          >
            {clientInfo?.name}{" "}
          </h1>
          <h2 className="text-center md:text-start text-2xl font-semibold">
            {clientInfo?.lot ? (
              <>
                Lot #{clientInfo.lot} <br />
              </>
            ) : null}

            {clientInfo?.address}
          </h2>
        </div>

        <div
          id="clients-body-container-desktop"
          className="clients-body hidden md:flex md:flex-col md:justify-start md:items-start md:gap-8"
        >
          <Button
            text="New Invoice"
            color="bg-kelly-green"
            id="new-invoice-btn"
            clickFunction={showForm}
          />
          <table className="w-full table-fixed">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="p-3 text-base font-semibold tracking-wide text-center">
                  Number
                </th>
                <th className="p-3 text-base font-semibold tracking-wide text-center">
                  Month
                </th>
                <th className="p-3 text-base font-semibold tracking-wide text-center">
                  Year
                </th>
                <th className="p-3 text-base font-semibold tracking-wide text-center">
                  Status
                </th>
                <th className="p-3 text-base font-semibold tracking-wide text-center"></th>
              </tr>
            </thead>

            <tbody className="[&>*:nth-child(odd)]:bg-white [&>*:nth-child(even)]:bg-gray-100">
              {invoices
                .sort((a, b) => b.number - a.number)
                .map((entry) => {
                  return (
                    <tr key={entry.id}>
                      <td className="p-3 text-base font-bold text-center">
                        {entry.number}
                      </td>
                      <td className="p-3 text-base text-center">
                        {entry.month}
                      </td>
                      <td className="p-3 text-base text-center">
                        {entry.year}
                      </td>
                      <td className="p-3 text-base text-center">
                        <span className={getSpan(entry.status)}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-3 text-base text-center">
                        <Link
                          to={`/home/client-invoice/${userUID}/${entry.id}`}
                          className="font-bold text-blue-500 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* mobile / small device */}

        <div id="mobile-invoice-view" className="flex flex-col gap-8 md:hidden">
          <Button
            text="New Invoice"
            color="bg-kelly-green self-center"
            id="new-invoice-btn"
            clickFunction={showForm}
          />

          <div className="clients-body gap-x-8 gap-y-8 grid mx-2 content-center sm:grid-cols-2">
            {invoices.map((entry) => {
              return (
                <div
                  key={entry.id}
                  className="invoice-card bg-white border text-base flex flex-col gap-4 overflow-hidden w-full rounded-lg shadow-lg p-4"
                >
                  <div id="invoice-line-1" className=" flex  w-full">
                    <p className="flex font-bold">Invoice #{entry.number}</p>
                  </div>
                  <div
                    id="invoice-line-2"
                    className="flex w-full justify-between"
                  >
                    <p>
                      {entry.month}, {entry.year}
                    </p>
                    <Link
                      to={`/home/client-invoice/${userUID}/${entry.id}`}
                      className="font-bold text-blue-500 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                  <div id="invoice-line-3" className="flex w-full">
                    <span className={getSpan(entry.status)}>
                      {entry.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {show ? <InvoiceInfo show={show} setShow={setShow}></InvoiceInfo> : null}
    </>
  );
};

export default ClientInvoice;
