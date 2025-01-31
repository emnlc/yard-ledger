import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { database } from "./ts/firebase/auth";
import { User } from "./hooks/User";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfFile from "./components/PdfFile";
import EntryInfo from "./components/EntryInfo";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "./components/ui/input";
import EditEntryInfoModal from "./components/EditEntryInfoModal";

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
  unitType: string;
  rawDate: string;
}

interface Client {
  name: string;
  address: string;
  lot: string;
}

interface User {
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: number;
  a: string;
  r: string;
}

const InvoiceView = () => {
  const currentUser = User();
  const [showEntry, setShowEntry] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const { userUID, invoiceUID } = useParams();
  const [invoice, setInvoice] = useState<Invoice>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [client, setClient] = useState<Client>();

  // Open the edit modal and set the selected entry
  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  // Close the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

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

  const clientRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}`
  );

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
    document.title = `${
      client && invoice ? `${client.name} ${invoice.month}` : "Yard Ledger"
    }`;
  }, [client]);

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
    const unsubscribe = onValue(clientRef, (snapshot) => {
      const data = snapshot.val();
      setClient({
        name: data.clientName,
        address: data.clientAddress,
        lot: data.clientLot,
      });
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onValue(entriesRef, (snapshot) => {
      const entriesData: Entry[] = [];

      snapshot.forEach((childsnapshot) => {
        entriesData.push({
          date: childsnapshot.val().date,
          desc: childsnapshot.val().description,
          unitPrice: childsnapshot.val().unitPrice,
          unitType: childsnapshot.val().unitType,
          total: childsnapshot.val().total,
          id: childsnapshot.key,
          rawDate: childsnapshot.val().rawDate,
        });
      });

      // Sort entries by rawDate in descending order (most recent first)
      // Entries without rawDate will be placed at the end
      entriesData.sort((a, b) => {
        const dateA = a.rawDate ? new Date(a.rawDate).getTime() : Infinity;
        const dateB = b.rawDate ? new Date(b.rawDate).getTime() : Infinity;

        // If both have rawDate, sort by date
        if (dateA !== Infinity && dateB !== Infinity) {
          return dateA - dateB; // Sort in ascending order
        }

        // If one has rawDate and the other doesn't, the one with rawDate comes first
        if (dateA !== Infinity) return -1;
        if (dateB !== Infinity) return 1;

        // If neither has rawDate, maintain their original order
        return 0;
      });

      setEntries(entriesData);
    });
  }, [currentUser]);

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

  const [user, setUser] = useState<User>();

  useEffect(() => {
    const unsubscribe = onValue(
      ref(database, `users/${currentUser?.uid}`),
      (snapshot) => {
        const data = snapshot.val();
        setUser({
          email: data.email,
          company: data.company,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          phone: data.phone,
          a: data.a,
          r: data.r,
        });
      }
    );

    return unsubscribe;
  }, [user]);

  return (
    <>
      <div className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto">
        {invoice && client && (
          <>
            <div className="invoice-entries-header gap-4 h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
              <h1 className="text-center text-5xl font-bold ">
                Invoice #{invoice.number}
              </h1>
              <div className="flex flex-col gap-">
                <h1 className="text-2xl font-medium">{client.name}</h1>
                <h1 className="text-2xl font-medium">
                  {invoice.month}, {invoice.year}
                </h1>
              </div>
            </div>

            <div className="flex gap-4 self-center md:self-start">
              <Button
                id="new-invoice-btn"
                className="bg-kelly-green hover:opacity-80 transition-all"
                onClick={showEntryForm}
              >
                New Entry
              </Button>

              {user && (
                <PDFDownloadLink
                  document={
                    <PdfFile
                      invoice={invoice}
                      entries={entries}
                      client={client}
                      user={user}
                    />
                  }
                  fileName={`${client.name} ${invoice.month} ${invoice.year} Invoice`}
                >
                  {({ loading }) =>
                    loading ? (
                      <Button id="generate-pdf-btn" className="bg-blue-400 ">
                        Loading ...
                      </Button>
                    ) : (
                      <Button id="generate-pdf-btn" className="bg-blue-400">
                        Generate
                      </Button>
                    )
                  }
                </PDFDownloadLink>
              )}
            </div>

            <Table className="hidden md:table">
              <TableCaption>Entries for {invoice.month}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"></TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-left">Description</TableHead>
                  <TableHead className="text-center">Unit Price</TableHead>
                  <TableHead className="text-center">Line Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="flex gap-4 justify-center items-center">
                      <button
                        className="text-lg"
                        onClick={() => handleEditClick(entry)}
                      >
                        <i className="fa-regular fa-pen-to-square text-green-500"></i>
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {entry.date}
                    </TableCell>
                    <TableCell className="font-medium text-left">
                      {entry.desc}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      $
                      {entry.unitType
                        ? `${entry.unitPrice} / ${entry.unitType}`
                        : entry.unitPrice}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {entry.total ? `$${entry.total}` : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="hidden md:flex table-footer flex-col gap-4 self-end">
              <div className="text-sm price-groups flex flex-col font-medium border border-l-0 border-r-0 border-t-0 border-b-black">
                <div className="flex w-full gap-16 justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${invoice.subtotal}</span>
                </div>

                <div className="flex w-full gap-16 justify-between">
                  <span>SALES TAX:</span>
                  <span>${invoice.salesTax}</span>
                </div>

                <div className="flex w-full gap-16 justify-between">
                  <span>TOTAL:</span>
                  <span>${invoice.finalTotal}</span>
                </div>
              </div>

              <div className="sales-tax-container w-full flex justify-between items-center font-medium">
                <div className="flex justify-center items-center gap-2">
                  <Label htmlFor="sales-tax-checkbox">Apply Sales</Label>
                  <input
                    type="checkbox"
                    name="apply-sales-tax"
                    id="sales-tax-checkbox"
                    checked={invoice.applySales}
                    onChange={applySalesTax}
                  />
                </div>

                <Input
                  type="number"
                  onChange={applySalesTax}
                  defaultValue={invoice.salesTax}
                  id="sales-tax-input"
                  className="border rounded-md outline-none text-right text-sm transition-colors focus:border-kelly-green w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                ></Input>
              </div>
            </div>

            {/* Mobile Div */}
            <div className="md:hidden flex flex-col gap-8">
              <div className="button-group flex justify-center"></div>

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
                        <span className=" font-bold line-clamp-1">
                          UNIT PRICE:
                        </span>
                        <span>
                          $
                          {entry.unitType
                            ? `${entry.unitPrice} / ${entry.unitType}`
                            : entry.unitPrice}
                        </span>
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

      {isEditModalOpen && selectedEntry && (
        <EditEntryInfoModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          entry={selectedEntry}
          userUID={userUID!}
          invoiceUID={invoiceUID!}
        />
      )}
    </>
  );
};

export default InvoiceView;
