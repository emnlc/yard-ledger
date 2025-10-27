import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../ts/firebase/auth";
import { ModeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Menu, Home, User, LogOut, Settings, UserCircle2 } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
    setIsOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            className="font-medium hover:text-primary transition-all"
            to={"/"}
          >
            Yard Ledger
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/home"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Clients
            </Link>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary font-medium"
                >
                  <UserCircle2 />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ModeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Link
                    to="/home"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-md hover:bg-muted"
                  >
                    <Home className="h-5 w-5" />
                    Clients
                  </Link>

                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-md hover:bg-muted"
                  >
                    <User className="h-5 w-5" />
                    Account Details
                  </Link>

                  <div className="border-t border-border my-2" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-destructive hover:text-destructive/80 transition-colors font-medium py-2 px-3 rounded-md hover:bg-muted text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
