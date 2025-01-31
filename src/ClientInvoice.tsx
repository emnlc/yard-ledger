import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "./hooks/User";
import { database } from "./ts/firebase/auth";
import { onValue, ref } from "firebase/database";
import { Link } from "react-router-dom";
import InvoiceInfo from "./components/InvoiceInfo";
import EditInvoiceInfoModal from "./components/EditInvoiceInfoModal";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    document.title = `${clientInfo ? clientInfo.name : "Invoices"}`;
  });

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

  return (
    <>
      <div
        id="invoice-container"
        className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto"
      >
        <div className="invoice-header gap-2 h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
          <h1 id="title" className="text-center text-5xl font-bold row-start-3">
            {clientInfo?.name}{" "}
          </h1>
          <div className="text-center flex flex-col md:text-start text-2xl font-semibold">
            <h2>{clientInfo?.address}</h2>
            {clientInfo?.lot ? (
              <>
                <h2>Lot #{clientInfo.lot}</h2>
              </>
            ) : null}
          </div>
        </div>

        <Button
          className="bg-kelly-green self-center md:self-start"
          id="new-invoice-btn"
          onClick={showForm}
        >
          New Invoice
        </Button>

        <Table>
          <TableCaption>All invoices for {clientInfo?.name}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32"></TableHead>
              <TableHead className="text-center">Number</TableHead>
              <TableHead className="text-center">Month</TableHead>
              <TableHead className="text-center">Year</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices
              .sort((a, b) => b.number - a.number)
              .map((entry) => {
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="flex gap-4 justify-center items-center">
                      <button
                        className="text-lg"
                        onClick={() => {
                          setSelectedInvoice(entry); // Set the selected invoice
                          setIsEditModalOpen(true); // Open the modal
                        }}
                      >
                        <i className="fa-regular fa-pen-to-square text-green-500"></i>
                      </button>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {entry.number}
                    </TableCell>
                    <TableCell className="text-center">{entry.month}</TableCell>
                    <TableCell className="text-center">{entry.year}</TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/home/client-invoice/${userUID}/${entry.id}`}
                        className="font-bold text-blue-500 hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* modal */}
      {show ? <InvoiceInfo show={show} setShow={setShow}></InvoiceInfo> : null}

      {isEditModalOpen && selectedInvoice && userUID && (
        <EditInvoiceInfoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          invoice={selectedInvoice}
          userUID={userUID}
        />
      )}
    </>
  );
};

export default ClientInvoice;
