import { useState, FormEvent } from "react";
import { User } from "../hooks/User";
import { database } from "../ts/firebase/auth";
import { ref, push } from "firebase/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

const ClientInfo = ({ show, setShow }: Props) => {
  const currentUser = User();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lot: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    address: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle form submission
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userClientList = ref(
        database,
        `users/${currentUser?.uid}/clients/`
      );
      await push(userClientList, {
        clientName: formData.name.trim(),
        clientAddress: formData.address.trim(),
        clientLot: formData.lot.trim() || null,
      });

      // Reset form and close modal
      setFormData({ name: "", address: "", lot: "" });
      setErrors({ name: false, address: false });
      setShow(false);
    } catch (error) {
      console.error("Error creating client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({ name: "", address: "", lot: "" });
    setErrors({ name: false, address: false });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold mb-4">New Client</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="client-name">
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-name"
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
            <Label htmlFor="client-address">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-address"
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
            <Label htmlFor="client-lot">Lot Number (Optional)</Label>
            <Input
              id="client-lot"
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientInfo;
