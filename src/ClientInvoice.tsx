import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User } from "./hooks/User";
import { database } from "./ts/firebase/auth";
import { onValue, ref } from "firebase/database";
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
import { Edit2, Eye } from "lucide-react";

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
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [clientInfo, setClientInfo] = useState<Client>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Firebase refs
  const clientRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}`
  );
  const invoicesRef = ref(
    database,
    `users/${currentUser?.uid}/clients/${userUID}/invoices`
  );

  // Set document title
  useEffect(() => {
    document.title = clientInfo ? clientInfo.name : "Invoices";
  }, [clientInfo]);

  // Load client data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(clientRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClientInfo({
          name: data.clientName,
          address: data.clientAddress,
          lot: data.clientLot,
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Load invoices data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(invoicesRef, (snapshot) => {
      const invoiceData: Invoice[] = [];
      snapshot.forEach((childSnapshot) => {
        invoiceData.push({
          id: childSnapshot.key!,
          number: childSnapshot.val().invoiceNumber,
          month: childSnapshot.val().invoiceMonth,
          year: childSnapshot.val().invoiceYear,
          status: childSnapshot.val().invoiceStatus,
        });
      });
      // Sort by invoice number descending
      invoiceData.sort((a, b) => b.number - a.number);
      setInvoices(invoiceData);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Edit invoice handler
  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  if (!clientInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl ">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8 mt-16">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground">
              {clientInfo.name}
            </h1>
            <div className="flex flex-col gap-1 text-lg lg:text-xl text-muted-foreground">
              <p>{clientInfo.address}</p>
              {clientInfo.lot && <p>Lot #{clientInfo.lot}</p>}
            </div>
          </div>

          <Button
            onClick={() => setShowInvoiceForm(true)}
            className="w-fit bg-primary hover:opacity-90 transition-opacity"
          >
            New Invoice
          </Button>
        </div>

        {/* Invoices Table/List */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableCaption className="py-2 text-xs border-t border-border">
                All invoices for {clientInfo.name}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Actions</TableHead>
                  <TableHead className="text-center">Invoice #</TableHead>
                  <TableHead className="text-center">Month</TableHead>
                  <TableHead className="text-center">Year</TableHead>
                  <TableHead className="text-center">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No invoices yet. Click "New Invoice" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(invoice)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {invoice.number}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.month}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.year}
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          to={`/home/client-invoice/${userUID}/${invoice.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No invoices yet. Click "New Invoice" to create one.
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-foreground">
                        Invoice #{invoice.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.month} {invoice.year}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(invoice)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                  </div>

                  <Link
                    to={`/home/client-invoice/${userUID}/${invoice.id}`}
                    className="block"
                  >
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Invoice
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInvoiceForm && (
        <InvoiceInfo show={showInvoiceForm} setShow={setShowInvoiceForm} />
      )}

      {isEditModalOpen && selectedInvoice && userUID && (
        <EditInvoiceInfoModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          userUID={userUID}
        />
      )}
    </>
  );
};

export default ClientInvoice;
