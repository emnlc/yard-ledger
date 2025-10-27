import { onValue, ref, remove, update } from "firebase/database";
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
import { Edit2, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

interface UserData {
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
  const [user, setUser] = useState<UserData>();

  // Firebase refs
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
  const userRef = ref(database, `users/${currentUser?.uid}`);

  // Delete entry handler
  const deleteEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const entryToDelete = ref(
        database,
        `users/${currentUser?.uid}/clients/${userUID}/invoices/${invoiceUID}/entries/${id}`
      );
      remove(entryToDelete);
    }
  };

  // Edit entry handlers
  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  // Sales tax handler
  const handleSalesTaxChange = (checked?: boolean, value?: string) => {
    const isChecked = checked ?? invoice?.applySales ?? false;
    const taxValue = value ? parseFloat(value) : invoice?.salesTax ?? 0;

    update(invoiceRef, {
      applySales: isChecked,
      invoiceSalesTax: taxValue,
      invoiceFinalTotal: isChecked
        ? (invoice?.subtotal ?? 0) - taxValue
        : invoice?.subtotal ?? 0,
    });
  };

  // Set document title
  useEffect(() => {
    document.title =
      client && invoice ? `${client.name} ${invoice.month}` : "Yard Ledger";
  }, [client, invoice]);

  // Load invoice data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(invoiceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
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
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Load client data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(clientRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClient({
          name: data.clientName,
          address: data.clientAddress,
          lot: data.clientLot,
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Load entries data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(entriesRef, (snapshot) => {
      const entriesData: Entry[] = [];
      snapshot.forEach((childSnapshot) => {
        entriesData.push({
          date: childSnapshot.val().date,
          desc: childSnapshot.val().description,
          unitPrice: childSnapshot.val().unitPrice,
          unitType: childSnapshot.val().unitType,
          total: childSnapshot.val().total,
          id: childSnapshot.key!,
          rawDate: childSnapshot.val().rawDate,
        });
      });

      // Sort entries by date
      entriesData.sort((a, b) => {
        const dateA = a.rawDate ? new Date(a.rawDate).getTime() : Infinity;
        const dateB = b.rawDate ? new Date(b.rawDate).getTime() : Infinity;
        return dateA - dateB;
      });

      setEntries(entriesData);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Load user data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
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
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Update invoice totals when entries change
  useEffect(() => {
    if (!invoice) return;

    const subtotal = entries.reduce(
      (sum, entry) => sum + (parseFloat(String(entry.total)) || 0),
      0
    );

    const finalTotal = invoice.applySales
      ? subtotal - invoice.salesTax
      : subtotal;

    update(invoiceRef, {
      invoiceSubtotal: subtotal,
      invoiceFinalTotal: finalTotal,
    });
  }, [entries, invoice?.applySales, invoice?.salesTax]);

  if (!invoice || !client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col mt-16 lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
          {/* Invoice Info */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground">
              Invoice #{invoice.number}
            </h1>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl lg:text-2xl font-medium text-foreground">
                {client.name}
              </h2>
              <p className="text-lg lg:text-xl font-medium text-muted-foreground">
                {invoice.month}, {invoice.year}
              </p>
            </div>
          </div>

          {/* Totals Card */}
          <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[320px]">
            {/* Totals */}
            <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-border shadow-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  ${invoice.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-foreground">
                  ${invoice.salesTax}
                </span>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ${invoice.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sales Tax Control */}
            <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sales-tax-checkbox"
                  checked={invoice.applySales}
                  onCheckedChange={(checked) =>
                    handleSalesTaxChange(checked === true)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="sales-tax-checkbox"
                  className="text-sm font-medium cursor-pointer"
                >
                  Apply Discount
                </Label>
              </div>

              <Input
                type="number"
                onChange={(e) =>
                  handleSalesTaxChange(undefined, e.target.value)
                }
                value={invoice.salesTax}
                id="sales-tax-input"
                className="w-24 h-9 text-right focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => setShowEntry(true)}
            className="bg-primary hover:opacity-90 transition-opacity"
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
              fileName={`${client.name} ${invoice.month} ${invoice.year} Invoice.pdf`}
            >
              {({ loading }) => (
                <Button
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? "Loading..." : "Generate PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>

        {/* Entries Table/List */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableCaption className="py-2 text-xs border-t border-border">
                Entries for {invoice.month}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Actions</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(entry)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>{entry.desc}</TableCell>
                    <TableCell className="text-right">
                      {entry.unitPrice && (
                        <>
                          ${entry.unitPrice}
                          {entry.unitType && ` / ${entry.unitType}`}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${entry.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No entries yet. Click "New Entry" to add one.
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-foreground">
                        {entry.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.desc}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(entry)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEntry(entry.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span className="font-medium">
                      {entry.unitPrice && (
                        <>
                          ${entry.unitPrice}
                          {entry.unitType && ` / ${entry.unitType}`}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="font-semibold text-foreground">
                      Total:
                    </span>
                    <span className="font-bold text-primary">
                      ${entry.total}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEntry && <EntryInfo show={showEntry} setShow={setShowEntry} />}

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
