import { useState, useEffect } from "react";
import { User } from "./hooks/User";
import { database } from "./ts/firebase/auth";
import { ref, onValue } from "firebase/database";
import ClientInfo from "./components/ClientInfo";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

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
  const [searchText, setSearchText] = useState<string>("");

  const showForm = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (!searchText) {
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

        const sortedClients = clientsData.sort((a, b) => {
          if (a.lot === undefined && b.lot === undefined) return 0;
          if (a.lot === undefined) return 1;
          if (b.lot === undefined) return -1;
          return b.lot - a.lot;
        });

        setClients(sortedClients);
      });
    } else {
      const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setClients(filteredClients);
    }
  }, [searchText]);

  return (
    <>
      <div
        id="clients-container"
        className="md:container flex h-auto flex-col gap-8 w-full mb-16 justify-center sm:mx-auto"
      >
        <div className="clients-header gap-8 h-60 md:h-96 flex flex-col justify-end items-center md:justify-end md:items-start">
          <h1 id="title" className="text-5xl font-extrabold row-start-3">
            Clients
          </h1>

          <div className="row-start-4">
            <Button
              id="newClientBtn"
              className="bg-kelly-green font-bold"
              onClick={showForm}
            >
              Add Client
            </Button>
          </div>
        </div>

        <div
          id="clients-body-container"
          className="clients-body flex flex-col w-full justify-start px-8 md:px-0 items-center gap-8 md:grid md:grid-cols-3 md:gap-x-4 md:gap-y-8 xl:grid-cols-4 2xl:grid-cols-5"
        >
          <Input
            type="text"
            id="client-name"
            className="focus:border-kelly-green md:place-self-start md:w-80 md:h-10 md:col-span-3 xl:col-span-4 2xl:col-span-5"
            placeholder="Search by name"
            defaultValue={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          ></Input>

          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{client.name}</CardTitle>
                <CardDescription>
                  <span>{client.address}</span>
                  <br />
                  <span>{client.lot ? "Lot #" + client.lot : <br />}</span>
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                {/* TODO: edit modal for client info */}
                <button
                  className="text-lg"
                  onClick={() => {
                    console.log("edit");
                  }}
                >
                  <i className="fa-regular fa-pen-to-square text-green-500"></i>
                </button>
                <Link
                  className="transition-all text-blue-500 hover:underline text-sm font-bold"
                  to={`/home/client-invoice/${client.id}`}
                >
                  View
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      {show ? <ClientInfo show={show} setShow={setShow}></ClientInfo> : null}
    </>
  );
};

export default Home;
