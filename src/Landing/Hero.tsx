import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { auth, database, signInWithGoogle } from "@/ts/firebase/auth";
import { ref, update } from "firebase/database";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

const Hero = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const googleSignIn = () => {
    signInWithGoogle()
      .then((result) => {
        console.log("result: " + result.user);

        update(ref(database, "users/" + result.user.uid), {
          last_login: Date.now(),
        });
      })
      .catch((error) => {
        console.error("Authentication error: ", error);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center text-center gap-8 md:gap-16 mt-8 md:mt-32">
      <h1 className="text-4xl md:text-6xl font-bold md:max-w-2xl">
        Hassle-Free Invoicing Starts Here
      </h1>
      <p className="md:text-xl text-neutral-700 font-medium md:max-w-xl">
        Create and send clean, professional invoices in seconds. No stress, just
        efficiency.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <Button asChild className="hover:bg-kelly-green transition-all">
          <Link to={"/login"}>Get started for free →</Link>
        </Button>

        <span className="text-sm">OR</span>

        <Button
          id="google-btn"
          className="bg-neutral-100 text-black transition-all hover:brightness-95 border border-black/50"
          onClick={googleSignIn}
        >
          <img
            className="h-6 w-6 align-middle inline mr-2"
            src="/google.svg"
            alt=""
          />{" "}
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default Hero;
