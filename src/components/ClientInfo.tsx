import Button from "./Button";
import { User } from "../hooks/User";
import { database } from "../ts/firebase/auth";
import { ref, push } from "firebase/database";

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
    const clientEmail = document.getElementById(
      "create-client-email"
    ) as HTMLInputElement;
    const clientAddress = document.getElementById(
      "create-client-address"
    ) as HTMLInputElement;
    const clientZip = document.getElementById(
      "create-client-zip"
    ) as HTMLInputElement;

    const clientLot = document.getElementById(
      "create-client-lot-number"
    ) as HTMLInputElement;

    //validate
    let validationCheck = true;
    if (!clientName.value) {
      clientName.classList.add("invalid-field");
      validationCheck = false;
    }
    if (!clientAddress.value) {
      clientAddress.classList.add("invalid-field");
      validationCheck = false;
    }
    if (!clientZip.value) {
      clientZip.classList.add("invalid-field");
      validationCheck = false;
    }

    if (!validationCheck) {
      return;
    }

    const userClientList = ref(database, `users/${currentUser?.uid}/clients/`);
    push(userClientList, {
      clientName: clientName.value,
      clientEmail: clientEmail.value,
      clientAddress: clientAddress.value,
      clientZip: clientZip.value,
      clientLot: clientLot.value,
    });

    clientName.value = "";
    clientEmail.value = "";
    clientAddress.value = "";
    clientZip.value = "";
    clientLot.value = "";

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
            <div className="create-client-fields w-fit flex flex-col">
              <label htmlFor="create-client-name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="create-client-name"
                className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("invalid-field");
                }}
                required
              />
            </div>

            <div className="create-client-fields w-fit flex flex-col">
              <label htmlFor="create-client-email">Email</label>
              <input
                type="email"
                id="create-client-email"
                className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 ">
            <div className="create-client-fields w-fit flex flex-col">
              <label htmlFor="create-client-address">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="create-client-address"
                className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("invalid-field");
                }}
                required
              />
            </div>
            <div className="flex w-full flex-row justify-between">
              <div className="create-client-fields flex flex-col">
                <label htmlFor="create-client-zip">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="create-client-zip"
                  className="px-4 py-2 w-20 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onFocus={(e) => {
                    e.currentTarget.classList.remove("invalid-field");
                  }}
                  required
                />
              </div>
              <div className="create-client-fields flex flex-col">
                <label htmlFor="create-client-lot-number">Lot #</label>
                <input
                  type="number"
                  id="create-client-lot-number"
                  className="px-4 py-2 w-24 border rounded-md outline-none text-base transition-colors focus:border-kelly-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
          <div className="create-client-fields flex flex-col gap-4">
            <div className="justify-center items-center md:self-end flex flex-col md:flex-row gap-4">
              <Button
                text="Cancel"
                color="bg-gray-500"
                id="create-client-btn"
                clickFunction={changeShow}
              ></Button>
              <Button
                text="Create Client"
                color="bg-kelly-green"
                id="create-client-btn"
                clickFunction={handleNewClient}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientInfo;
