import { useState, FormEvent } from "react";
import { database } from "../ts/firebase/auth";
import { ref, update, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/hooks/User";
import { Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  address: string;
  lot?: number;
}

interface EditClientInfoModalProps {
  client: Client;
  setShow: (show: boolean) => void;
  onUpdate: () => void;
}

const EditClientInfoModal = ({
  client,
  setShow,
  onUpdate,
}: EditClientInfoModalProps) => {
  const currentUser = User();
  const [formData, setFormData] = useState({
    name: client.name,
    address: client.address,
    lot: client.lot?.toString() || "",
  });
  const [errors, setErrors] = useState({
    name: false,
    address: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      address: !formData.address.trim(),
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.address;
  };

  // Handle update
  const handleUpdate = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const clientRef = ref(
        database,
        `users/${currentUser?.uid}/clients/${client.id}`
      );

      await update(clientRef, {
        clientName: formData.name.trim(),
        clientAddress: formData.address.trim(),
        clientLot: formData.lot.trim() || null,
      });

      onUpdate();
      setShow(false);
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const clientRef = ref(
        database,
        `users/${currentUser?.uid}/clients/${client.id}`
      );
      await remove(clientRef);
      onUpdate();
      setShowDeleteAlert(false);
      setShow(false);
    } catch (error) {
      console.error("Error deleting client:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      setShow(false);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
        <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Client</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteAlert(true)}
              disabled={isSubmitting || isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete client</span>
            </Button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="name-edit-input">
                Client Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name-edit-input"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  Client name is required
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="address-edit-input">
                Street Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address-edit-input"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={errors.address ? "border-destructive" : ""}
                placeholder="123 Main St"
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  Street address is required
                </p>
              )}
            </div>

            {/* Lot Number */}
            <div className="space-y-2">
              <Label htmlFor="lot-num-edit-input">Lot Number (Optional)</Label>
              <Input
                id="lot-num-edit-input"
                type="number"
                value={formData.lot}
                onChange={(e) => handleChange("lot", e.target.value)}
                placeholder="42"
                disabled={isSubmitting}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background w-full max-w-sm rounded-2xl shadow-lg p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete <strong>{client.name}</strong> and
              all associated invoices. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAlert(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditClientInfoModal;
