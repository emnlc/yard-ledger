import { useState } from "react";
import { database } from "../ts/firebase/auth";
import { ref, update, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { User } from "@/hooks/User";

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
  const [name, setName] = useState(client.name);
  const [address, setAddress] = useState(client.address);
  const [lot, setLot] = useState(client.lot?.toString() || "");
  const currentUser = User();

  const handleUpdate = async () => {
    const updates = {
      [`users/${currentUser?.uid}/clients/${client.id}/clientName`]: name,
      [`users/${currentUser?.uid}/clients/${client.id}/clientAddress`]: address,
      [`users/${currentUser?.uid}/clients/${client.id}/clientLot`]: lot,
    };

    try {
      await update(ref(database), updates);
      onUpdate();
      setShow(false);
    } catch (error) {
      console.error("Error updating client: ", error);
    }
  };

  const deleteClient = async () => {
    const clientRef = ref(
      database,
      `users/${currentUser?.uid}/clients/${client.id}`
    );

    try {
      await remove(clientRef);
      onUpdate();
      setShow(false);
    } catch (error) {
      console.error("Error deleting client: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Client Info</h2>
          <Button variant={"destructive"} onClick={deleteClient}>
            Delete
          </Button>
        </div>

        <div>
          <Label htmlFor="name-edit-input">Client Name</Label>
          <Input
            id="name-edit-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client Name"
            className="mt-2 mb-4 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div>
          <Label htmlFor="address-edit-input">Address</Label>
          <Input
            id="address-edit-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Client Address"
            className="mt-2 mb-4 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div>
          <Label htmlFor="lot-num-edit-input">Lot #</Label>
          <Input
            id="lot-num-edit-input"
            type="text"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            placeholder="Lot Number (Optional)"
            className="mt-2 mb-4 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button className="bg-gray-800" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button className="bg-kelly-green" onClick={handleUpdate}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditClientInfoModal;
