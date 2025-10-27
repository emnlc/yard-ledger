import { useState, useEffect } from "react";
import { User } from "./hooks/User";
import { database } from "./ts/firebase/auth";
import { ref, onValue } from "firebase/database";
import ClientInfo from "./components/ClientInfo";
import EditClientInfoModal from "./components/EditClientInfoModal";
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
import { Edit2, Eye, Search } from "lucide-react";

interface Client {
  id: string;
  name: string;
  address: string;
  lot?: number;
}

const Home = () => {
  const currentUser = User();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Set document title
  useEffect(() => {
    document.title = "Clients";
  }, []);

  // Load clients data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const clientsRef = ref(database, `users/${currentUser.uid}/clients/`);

    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const clientsData: Client[] = [];
      snapshot.forEach((childSnapshot) => {
        clientsData.push({
          id: childSnapshot.key!,
          name: childSnapshot.val().clientName,
          address: childSnapshot.val().clientAddress,
          lot: childSnapshot.val().clientLot,
        });
      });

      // Sort by lot number (descending), undefined lots go to the end
      const sortedClients = clientsData.sort((a, b) => {
        if (a.lot === undefined && b.lot === undefined) return 0;
        if (a.lot === undefined) return 1;
        if (b.lot === undefined) return -1;
        return b.lot - a.lot;
      });

      setClients(sortedClients);
      setFilteredClients(sortedClients);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchText(query);
    const lowerCaseQuery = query.toLowerCase();

    if (!query.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowerCaseQuery) ||
        client.address.toLowerCase().includes(lowerCaseQuery) ||
        (client.lot !== undefined &&
          client.lot.toString().includes(lowerCaseQuery))
    );

    setFilteredClients(filtered);
  };

  // Handle edit click
  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setShowEditClient(true);
  };

  // Handle modal close
  const handleCloseAddClient = () => {
    setShowAddClient(false);
  };

  const handleCloseEditClient = () => {
    setShowEditClient(false);
    setSelectedClient(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8 mt-16">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground">
              Clients
            </h1>
            <Button
              onClick={() => setShowAddClient(true)}
              className="w-fit bg-primary hover:opacity-90 transition-opacity"
            >
              New Client
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, address, or lot..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-lg mb-2">
              {searchText
                ? "No clients found matching your search."
                : "No clients yet."}
            </p>
            {!searchText && (
              <p className="text-muted-foreground text-sm">
                Click "New Client" to add your first client.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">
                    {client.name}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <p className="text-sm line-clamp-2">{client.address}</p>
                    {client.lot && (
                      <p className="text-sm font-medium text-muted-foreground">
                        Lot #{client.lot}
                      </p>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center pt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(client)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4 text-primary" />
                    <span className="sr-only">Edit client</span>
                  </Button>
                  <Link to={`/home/client-invoice/${client.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddClient && (
        <ClientInfo show={showAddClient} setShow={handleCloseAddClient} />
      )}

      {showEditClient && selectedClient && (
        <EditClientInfoModal
          client={selectedClient}
          setShow={handleCloseEditClient}
          onUpdate={() => {}} // Data updates automatically via Firebase listener
        />
      )}
    </>
  );
};

export default Home;
