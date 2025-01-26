import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { database } from "../ts/firebase/auth";
import { ref, update } from "firebase/database";
import { User } from "../hooks/User";

interface EditInvoiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    number: number;
    month: string;
    year: number;
    status?: string;
    invoiceStatus?: string;
  };
  userUID: string;
}

const EditInvoiceInfoModal = ({
  isOpen,
  onClose,
  invoice,
  userUID,
}: EditInvoiceInfoModalProps) => {
  const currentUser = User();

  // State to track the updated invoice values
  const [updatedInvoice, setUpdatedInvoice] = useState({
    number: invoice.number,
    month: invoice.month,
    year: invoice.year,
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUpdatedInvoice((prev) => ({
      ...prev,
      [id]: id === "number" || id === "year" ? Number(value) : value,
    }));
  };

  // Handle saving changes to Firebase
  const handleSaveChanges = () => {
    if (!currentUser || !userUID) {
      console.error("Current user or userUID is missing.");
      return;
    }

    const invoiceRef = ref(
      database,
      `users/${currentUser.uid}/clients/${userUID}/invoices/${invoice.id}`
    );

    update(invoiceRef, {
      invoiceNumber: updatedInvoice.number,
      invoiceMonth: updatedInvoice.month,
      invoiceYear: updatedInvoice.year,
    })
      .then(() => {
        alert("Invoice updated successfully!");
        onClose();
      })
      .catch((error) => {
        console.error("Error updating invoice:", error);
        alert("Failed to update invoice. Please try again.");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Invoice</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="number"
              type="number"
              value={updatedInvoice.number}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="invoice-month">Month</Label>
            <Input
              id="month"
              type="text"
              value={updatedInvoice.month}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="invoice-year">Year</Label>
            <Input
              id="year"
              type="number"
              value={updatedInvoice.year}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-kelly-green" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceInfoModal;
