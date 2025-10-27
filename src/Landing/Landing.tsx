import { Link, useNavigate } from "react-router-dom";
import Hero from "./Hero";

import { Button } from "@/components/ui/button";
import Features from "./Features";
import Footer from "./Footer";
import { useEffect } from "react";
import { ModeToggle } from "@/components/ThemeToggle";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/ts/firebase/auth";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Yard Ledger | Invoice Management";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      }
    });

    return unsubscribe;
  }, [navigate]);

  return (
    <>
      <div className="flex flex-col items-center min-h-[100svh] max-h-[100svh] relative spacer layer1">
        <nav className="text-sm md:text-base w-full px-2 md:container flex flex-row items-center justify-between my-8">
          <Link
            className="font-medium hover:text-primary transition-all"
            to={"/"}
          >
            Yard Ledger
          </Link>

          <div className="flex items-center flex-row gap-4 md:gap-8 font-medium">
            <Link className="hover:text-primary transition-all" to={"/login"}>
              Login
            </Link>
            <Button
              asChild
              size={"sm"}
              className="hover:bg-primary transition-all"
            >
              <Link to={"/join"}>Create Account</Link>
            </Button>

            <ModeToggle />
          </div>
        </nav>
        <Hero />
      </div>
      <div className="flex flex-col spacer layer2 min-h-[10svh]">
        <Features />
        <Footer />
      </div>
    </>
  );
};

export default Landing;
