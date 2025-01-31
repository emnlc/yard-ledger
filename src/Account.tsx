import { useState, useEffect } from "react";
import { User } from "./hooks/User";
import { onValue, ref, update } from "firebase/database";
import { database } from "./ts/firebase/auth";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";

interface User {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: number;
  a: string;
  r: string;
}

const Account = () => {
  const currentUser = User();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    document.title = "Account";
  });

  useEffect(() => {
    const unsubscribe = onValue(
      ref(database, `users/${currentUser?.uid}`),
      (snapshot) => {
        const data = snapshot.val();
        setUser({
          name: data.name,
          email: data.email,
          company: data.company,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          phone: data.phone,
          a: data.a,
          r: data.r,
        });
      }
    );

    return unsubscribe;
  }, [user]);

  const updateDetails = async () => {
    const company = (
      document.getElementById("account-company") as HTMLInputElement
    ).value;
    const address = (
      document.getElementById("account-address") as HTMLInputElement
    ).value;
    const city = (document.getElementById("account-city") as HTMLInputElement)
      .value;
    const state = (document.getElementById("account-state") as HTMLInputElement)
      .value;
    const zip = (document.getElementById("account-zip") as HTMLInputElement)
      .value;
    const phone = (document.getElementById("account-phone") as HTMLInputElement)
      .value;

    const a = (document.getElementById("account-a") as HTMLInputElement).value;
    const r = (document.getElementById("account-r") as HTMLInputElement).value;

    update(ref(database, `users/${currentUser?.uid}`), {
      company: company,
      address: address,
      city: city,
      state: state,
      zip: zip,
      phone: phone,
      a: a,
      r: r,
    });
  };

  return (
    <div className="md:container mx-auto h-screen mb-24 flex flex-col justify-center items-center">
      {user && (
        <>
          <Card className="flex  mt-24 flex-col w-fit border-none md:border md:border-solid">
            <CardHeader className="flex items-center md:items-start mb-4">
              <CardTitle className=" text-3xl font-bold">
                {" "}
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 w-fit items-center md:items-start">
              <div className="detail-row flex flex-col md:flex-row gap-4 md:gap-16">
                <div className="detail-field">
                  <Label htmlFor="account-name">Name</Label>
                  <Input
                    disabled
                    id="account-name"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.name}
                  ></Input>
                </div>
                <div className="detail-field">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    disabled
                    id="account-email"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.email}
                  ></Input>
                </div>
              </div>

              <div className="detail-row flex flex-col md:flex-row gap-4 md:gap-16">
                <div className="detail-field">
                  <Label htmlFor="account-address">Address</Label>
                  <Input
                    id="account-address"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.address}
                  ></Input>
                </div>

                <div className="detail-field">
                  <Label htmlFor="account-zip">Zip Code</Label>
                  <Input
                    id="account-zip"
                    type="number"
                    className="mt-2 w-32"
                    defaultValue={user.zip}
                  ></Input>
                </div>
              </div>

              <div className="detail-row flex flex-col md:flex-row gap-4 md:gap-16">
                <div className="detail-field">
                  <Label htmlFor="account-city">City</Label>
                  <Input
                    id="account-city"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.city}
                  ></Input>
                </div>

                <div className="detail-field">
                  <Label htmlFor="account-state">State</Label>
                  <Input
                    id="account-state"
                    type="text"
                    className="mt-2 w-32"
                    defaultValue={user.state}
                    maxLength={2}
                  ></Input>
                </div>
              </div>

              <div className="detail-row flex flex-col md:flex-row gap-4 md:gap-16">
                <div className="detail-field">
                  <Label htmlFor="account-company">Company</Label>
                  <Input
                    id="account-company"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.company}
                  ></Input>
                </div>
                <div className="detail-field">
                  <Label htmlFor="account-phone">Phone Number</Label>
                  <Input
                    id="account-phone"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.phone}
                  ></Input>
                </div>
              </div>

              <div className="detail-row flex flex-col md:flex-row gap-4 md:gap-16">
                <div className="detail-field">
                  <Label htmlFor="account-a">Account #</Label>
                  <Input
                    id="account-a"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.a}
                  ></Input>
                </div>
                <div className="detail-field">
                  <Label htmlFor="account-r">Routing #</Label>
                  <Input
                    id="account-r"
                    type="text"
                    className="mt-2 w-64"
                    defaultValue={user.r}
                  ></Input>
                </div>
              </div>
            </CardContent>

            <CardFooter className="mt-4 justify-center items-center">
              <Button
                id="save-account-details-btn"
                size={"lg"}
                className="bg-kelly-green transition-all hover:opacity-90"
                onClick={updateDetails}
              >
                Save
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default Account;
