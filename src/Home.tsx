import { useState, useEffect } from "react";
import { User } from "./hooks/User";
import { database } from "./ts/firebase/auth";
import { ref, onValue } from "firebase/database";
import Button from "./components/Button";
import Card from "./components/Card";
import ClientInfo from "./components/ClientInfo";

interface Clients {
  id: string;
  name: string;
  address: string;
  zip: number;
  lot?: number;
}

const Home = () => {
  const currentUser = User();
  const [clients, setClients] = useState<Clients[]>([]);
  const [show, setShow] = useState(false);

  const showForm = () => {
    setShow(!show);
  };

  useEffect(() => {
    const clientsRef = ref(database, `users/${currentUser?.uid}/clients/`);
    onValue(clientsRef, (snapshot) => {
      const clientsData: Clients[] = [];
      snapshot.forEach((childSnapshot) => {
        clientsData.push({
          id: childSnapshot.key,
          name: childSnapshot.val().clientName,
          address: childSnapshot.val().clientAddress,
          zip: childSnapshot.val().clientZip,
          lot: childSnapshot.val().clientLot,
        });
      });
      setClients(clientsData);
    });
  }, [currentUser]);

  return (
    <>
      <div
        id="clients-container"
        className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto"
      >
        <div className="clients-header gap-8  h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
          <h1 id="title" className=" text-5xl font-extrabold row-start-3">
            Clients
          </h1>

          <div className="row-start-4">
            <Button
              id="newClientBtn"
              color="bg-kelly-green"
              text="Add Client"
              clickFunction={showForm}
            />
          </div>
        </div>

        <div
          id="clients-body-container"
          className="clients-body flex flex-col w-full justify-start px-8 md:px-0  items-center gap-8 md:grid md:grid-cols-3 md:gap-x-4 md:gap-y-8 xl:grid-cols-4 2xl:grid-cols-5"
        >
          <input
            type="text"
            id="pet-name"
            className="rounded-lg border p-4 w-full font-semibold md:place-self-start md:w-80 md:h-10 md:col-span-3 xl:col-span-4 2xl:col-span-5"
            placeholder="Search by name"
          />

          {clients.map((clients) => (
            <Card
              key={clients.id}
              id={clients.id}
              clientName={clients.name}
              street={clients.address}
              cityZip={clients.zip + ", AZ"}
              lot={clients.lot}
            />
          ))}
        </div>
      </div>
      {show ? <ClientInfo show={show} setShow={setShow}></ClientInfo> : null}
    </>
  );
};

export default Home;
