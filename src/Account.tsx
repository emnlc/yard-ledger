import { useState, useEffect, FormEvent } from "react";
import { User } from "./hooks/User";
import { onValue, ref, update } from "firebase/database";
import { database } from "./ts/firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";

interface UserData {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  a: string;
  r: string;
}

const Account = () => {
  const currentUser = User();
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Account";
  }, []);

  // Load user data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onValue(
      ref(database, `users/${currentUser.uid}`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userData: UserData = {
            name: data.name || "",
            email: data.email || "",
            company: data.company || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            phone: data.phone || "",
            a: data.a || "",
            r: data.r || "",
          };
          setUser(userData);
          setFormData(userData);
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Handle input change
  const handleChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentUser?.uid) {
      console.error("Current user is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      await update(ref(database, `users/${currentUser.uid}`), {
        company: formData.company?.trim() || "",
        address: formData.address?.trim() || "",
        city: formData.city?.trim() || "",
        state: formData.state?.trim().toUpperCase() || "",
        zip: formData.zip?.trim() || "",
        phone: formData.phone?.trim() || "",
        a: formData.a?.trim() || "",
        r: formData.r?.trim() || "",
      });

      setHasChanges(false);
      // You could add a success toast notification here
    } catch (error) {
      console.error("Error updating account details:", error);
      // You could add an error toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <form onSubmit={handleSubmit}>
        <Card className="my-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Account Details</CardTitle>
            <CardDescription>
              Manage your account information and business details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name and Email (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="account-name">Name</Label>
                <Input
                  id="account-name"
                  type="text"
                  value={user.name}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <Input
                  id="account-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Company and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="account-company">Company Name</Label>
                <Input
                  id="account-company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="Your Company LLC"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-phone">Phone Number</Label>
                <Input
                  id="account-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="account-address">Street Address</Label>
              <Input
                id="account-address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main St"
                disabled={isSubmitting}
              />
            </div>

            {/* City, State, and Zip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="account-city">City</Label>
                <Input
                  id="account-city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Phoenix"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-state">State</Label>
                <Input
                  id="account-state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="AZ"
                  maxLength={2}
                  disabled={isSubmitting}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-zip">Zip Code</Label>
                <Input
                  id="account-zip"
                  type="text"
                  value={formData.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                  placeholder="85001"
                  maxLength={5}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Banking Information */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">
                Banking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="account-a">Account Number</Label>
                  <Input
                    id="account-a"
                    type="text"
                    value={formData.a}
                    onChange={(e) => handleChange("a", e.target.value)}
                    placeholder="XXXXXXXXXX"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-r">Routing Number</Label>
                  <Input
                    id="account-r"
                    type="text"
                    value={formData.r}
                    onChange={(e) => handleChange("r", e.target.value)}
                    placeholder="XXXXXXXXX"
                    maxLength={9}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !hasChanges}
              className="bg-primary hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Account;
