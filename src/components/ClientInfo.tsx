// import Button from "./Button";
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

const ClientInfo = (props: Props) => {
  const currentUser = User();

  const changeShow = () => {
    props.setShow(!props.show);
  };

  const handleNewClient = () => {
    const clientName = document.getElementById(
      "create-client-name"
    ) as HTMLInputElement;

    const clientAddress = document.getElementById(
      "create-client-address"
    ) as HTMLInputElement;

    const clientLot = document.getElementById(
      "create-client-lot-number"
    ) as HTMLInputElement;

    //validate
    let validationCheck = true;
    if (!clientName.value) {
      clientName.classList.add("border-red-500");
      validationCheck = false;
    }
    if (!clientAddress.value) {
      clientAddress.classList.add("border-red-500");
      validationCheck = false;
    }

    if (!validationCheck) {
      return;
    }

    const userClientList = ref(database, `users/${currentUser?.uid}/clients/`);
    push(userClientList, {
      clientName: clientName.value,
      clientAddress: clientAddress.value,
      clientLot: clientLot.value,
    });

    changeShow();
  };

  return (
    <>
      <div
        id="create-client-form-container"
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center"
      >
        <div className=" bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">New Client Info</h2>
          </div>

          <div>
            <Label htmlFor="create-client-name">
              Client Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="create-client-name"
              required
              className="mt-2 mb-4 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
              }}
            />
          </div>

          <div>
            <Label htmlFor="create-client-address">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="create-client-address"
              required
              className="mt-2 mb-4 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
              }}
            />
          </div>

          <div>
            <Label htmlFor="create-client-lot-number">Lot #</Label>
            <Input
              type="number"
              id="create-client-lot-number"
              required
              className="mt-2 mb-4 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
              }}
            />
          </div>

          <div className="flex justify-between mt-6">
            <Button
              id="cancel-create-client-btn"
              className="bg-gray-800"
              onClick={changeShow}
            >
              Cancel
            </Button>
            <Button
              id="create-client-btn"
              className="bg-kelly-green"
              onClick={handleNewClient}
            >
              Create Client
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientInfo;
