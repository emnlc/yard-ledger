import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithGoogle, auth, database } from "./ts/firebase/auth.js"; // get function and auth variable
import { ref, update } from "firebase/database";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

import { validate_email, validate_password } from "./ts/validateForms.js"; // form validations

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

//components
// import Button from "./components/Button.js";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  });

  const login = () => {
    let isValid = true; // flag to track validity
    const email = (
      document.getElementById("email-input-login") as HTMLInputElement
    ).value;
    const password = (
      document.getElementById("password-input-login") as HTMLInputElement
    ).value;

    // validate input fields
    if (!validate_email(email)) {
      const emailInput = document.getElementById(
        "email-input-login"
      ) as HTMLInputElement;

      emailInput.classList.add("border-red-500");

      const emailErr = document.getElementById(
        "login-email-message"
      ) as HTMLParagraphElement;

      emailErr.innerHTML = "Please enter an email";
      emailErr.classList.remove("invisible");

      isValid = false;
    }

    if (!validate_password(password)) {
      const passwordInput = document.getElementById(
        "password-input-login"
      ) as HTMLInputElement;
      const passwordErr = document.getElementById(
        "login-password-message"
      ) as HTMLParagraphElement;
      passwordErr.classList.remove("invisible");
      passwordErr.innerHTML = "Please enter a password";
      passwordInput.classList.add("border-red-500");
      isValid = false;
    }

    if (!isValid) {
      return; // return if fields are invalid
    }

    // validation passed
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        update(ref(database, "users/" + userCredential.user.uid), {
          last_login: Date.now(),
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/invalid-credential") {
          const errDisplay = document.getElementById(
            "login-password-message"
          ) as HTMLParagraphElement;

          errDisplay.innerHTML = "Email or Password is incorrect";
          errDisplay.classList.remove("invisible");
        } else {
          console.error("full error" + error);
          console.error("error message: " + errorMessage);
          console.error("error code: " + errorCode);
        }
      });
  };

  const googleSignIn = () => {
    signInWithGoogle()
      .then((result) => {
        console.log("result: " + result.user);

        update(ref(database, "users/" + result.user.uid), {
          // name: result.user.displayName,
          // email: result.user.email,
          last_login: Date.now(),
        });
      })
      .catch((error) => {
        console.error("Authentication error: ", error);
      });
  };

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
      <div className="md:h-screen flex flex-col gap-4 justify-center items-center">
        <div className="login-container flex flex-col justify-center items-center md:mx-auto w-full md:w-fit px-12 py-8 gap-8 md:shadow-lg">
          <h1 className="font-bold text-2xl self-start">Login</h1>

          <div className="input-field w-full flex flex-col">
            <Label htmlFor="email-input-login" className="text-base">
              Email
            </Label>
            <Input
              type="email"
              id="email-input-login"
              className="text-base transition-colors focus:border-kelly-green"
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
                const errMsg = document.getElementById(
                  "login-email-message"
                ) as HTMLParagraphElement;
                errMsg.classList.add("invisible");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            ></Input>

            {/* <label htmlFor="email-input-login" className="text-base">
              Email
            </label>
            <input
              className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
              type="text"
              id="email-input-login"
              onFocus={(e) => {
                e.currentTarget.classList.remove("invalid-field");
                const errMsg = document.getElementById(
                  "login-error-message"
                ) as HTMLParagraphElement;
                errMsg.classList.add("invisible");
                const emailErr = document.getElementById(
                  "login-email-message"
                ) as HTMLParagraphElement;
                emailErr.classList.add("invisible");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            /> */}

            <p
              id="login-email-message"
              className="invisible text-xs transition-all text-red-500"
            >
              error message
            </p>
          </div>

          <div className="input-field w-full flex flex-col">
            <Label htmlFor="password-input-login" className="text-base">
              Password
            </Label>
            <Input
              type="password"
              id="password-input-login"
              className="text-base transition-colors focus:border-kelly-green"
              onFocus={(e) => {
                e.currentTarget.classList.remove("border-red-500");
                const errMsg = document.getElementById(
                  "login-password-message"
                ) as HTMLParagraphElement;
                errMsg.classList.add("invisible");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            ></Input>

            {/* <label htmlFor="password-input-login" className="text-base">
              Password
            </label>
            <input
              className="px-4 py-2 border rounded-md outline-none text-base transition-colors focus:border-kelly-green"
              type="password"
              id="password-input-login"
              onFocus={(e) => {
                e.currentTarget.classList.remove("invalid-field");
                const errMsg = document.getElementById(
                  "login-error-message"
                ) as HTMLParagraphElement;
                errMsg.classList.add("invisible");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            /> */}
            <p
              id="login-password-message"
              className=" invisible text-xs transition-all text-red-500"
            >
              error message
            </p>
          </div>

          <Button
            id="login-btn"
            className="bg-kelly-green font-bold transition-all hover:brightness-95"
            onClick={login}
          >
            Sign In
          </Button>

          <span>or</span>

          <Button
            id="google-btn"
            className="bg-neutral-100 font-bold text-black transition-all hover:brightness-95"
            onClick={googleSignIn}
          >
            <img
              className="h-8 w-8 align-middle inline mr-2"
              src="/google.svg"
              alt=""
            />{" "}
            Continue with Google
          </Button>
        </div>
        <p className="text-sm">
          New to{" "}
          <Link to={"/"} className="hover:text-kelly-green transition-all">
            Yard Ledger
          </Link>
          ?{" "}
          <Link className="text-blue-500 hover:underline" to={"/join"}>
            Join now
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
