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
        className="bg-black bg-opacity-60 client-info-container fixed flex flex-col justify-center items-center px-8 inset-x-0 inset-y-0 m-auto"
      >
        <div className=" client-info-form flex flex-col gap-6 bg-white shadow-2xl rounded-lg p-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="create-client-fields w-full flex flex-col">
              <Label htmlFor="create-client-name">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="create-client-name"
                required
                className="mt-2 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("border-red-500");
                }}
              ></Input>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 ">
            <div className="create-client-fields w-full flex flex-col">
              <Label htmlFor="create-client-address">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="create-client-address"
                required
                className="mt-2 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("border-red-500");
                }}
              ></Input>
            </div>
            <div className="flex w-full flex-row justify-between">
              <div className="create-client-fields flex flex-col"></div>
              <div className="create-client-fields flex flex-col">
                <Label htmlFor="create-client-lot-number">Lot #</Label>

                <Input
                  type="number"
                  id="create-client-lot-number"
                  required
                  className="mt-2 focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onFocus={(e) => {
                    e.currentTarget.classList.remove("border-red-500");
                  }}
                ></Input>
              </div>
            </div>
          </div>
          <div className="create-client-fields self-center flex flex-col gap-4">
            <div className="justify-center items-center md:self-end flex flex-col-reverse md:flex-row gap-4">
              <Button
                id="cancel-create-client-btn"
                className="bg-gray-800 font-bold"
                onClick={changeShow}
              >
                Cancel
              </Button>
              <Button
                id="create-client-btn"
                className="bg-kelly-green font-bold"
                onClick={handleNewClient}
              >
                Create Client
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientInfo;
