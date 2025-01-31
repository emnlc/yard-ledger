import { useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, database } from "./ts/firebase/auth.js"; // get function and auth variable
import { ref, set } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";

import {
  validate_email,
  validate_password,
  validate_field,
} from "./ts/validateForms.js"; // form validations

//components
import { Button } from "@/components/ui/button";
import { Label } from "./components/ui/label.js";
import { Input } from "./components/ui/input.js";

const Join = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Join";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const register = () => {
    let isValid = true; // flag to track validity
    const name = (document.getElementById("name-input") as HTMLInputElement)
      .value;
    const email = (document.getElementById("email-input") as HTMLInputElement)
      .value;

    const password = (
      document.getElementById("password-input") as HTMLInputElement
    ).value;

    // validate
    if (!validate_email(email)) {
      const emailInput = document.getElementById(
        "email-input"
      ) as HTMLInputElement;
      const emailErr = document.getElementById(
        "email-error-message"
      ) as HTMLParagraphElement;
      emailInput.classList.add("border-red-500");
      emailErr.innerHTML = "Please enter a valid email";
      emailErr.classList.remove("invisible");

      isValid = false;
    }
    if (!validate_password(password)) {
      const passwordElement = document.getElementById(
        "password-input"
      ) as HTMLInputElement;
      const passwordErr = document.getElementById(
        "password-error-message"
      ) as HTMLParagraphElement;
      passwordElement.classList.add("border-red-500");
      passwordErr.innerText = "Please enter a valid password";
      passwordErr.classList.remove("invisible");

      isValid = false;
    }
    if (!validate_field(name)) {
      const nameInput = document.getElementById(
        "name-input"
      ) as HTMLInputElement;
      const nameErr = document.getElementById(
        "name-error-message"
      ) as HTMLParagraphElement;
      nameInput.classList.add("border-red-500");
      nameErr.innerHTML = "Please specify your name";
      nameErr.classList.remove("invisible");

      isValid = false;
    }

    if (!isValid) {
      // return if fields are invalid
      return;
    }

    // passed validation
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        set(ref(database, "users/" + userCredential.user.uid), {
          name: name,
          email: email,
          last_login: Date.now(),
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/email-already-in-use") {
          const errDisplay = document.getElementById(
            "email-error-message"
          ) as HTMLParagraphElement;
          const emailInput = document.getElementById(
            "email-input"
          ) as HTMLInputElement;

          emailInput.classList.add("border-red-500");
          errDisplay.innerHTML = "Email is already in use";
          errDisplay.classList.remove("invisible");
        } else {
          console.error("full error" + error);
          console.error("error message: " + errorMessage);
          console.error("error code: " + errorCode);
        }
      });
  };

  return (
    <>
      <div className="md:h-screen flex flex-col gap-4 justify-center items-center">
        <div className="join-container flex flex-col justify-center items-center md:mx-auto w-full md:w-fit px-12 py-8 gap-8 md:shadow-lg">
          <h1 className="font-bold text-2xl self-start">Join</h1>

          <div className="input-container flex flex-col justify-center items-center w-full gap-4">
            <div className="input-field w-full flex flex-col">
              <Label htmlFor="name-input">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="name-input"
                className="mt-2 transition-all focus:border-kelly-green"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("border-red-500");
                  const errDisplay = document.getElementById(
                    "name-error-message"
                  ) as HTMLParagraphElement;
                  errDisplay.classList.add("invisible");
                }}
              ></Input>

              <p
                id="name-error-message"
                className="invisible text-xs transition-all text-red-500"
              >
                error message
              </p>
            </div>

            <div className="input-field w-full flex flex-col">
              <Label htmlFor="email-input">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                id="email-input"
                className="mt-2 transition-all focus:border-kelly-green"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("border-red-500");
                  const errDisplay = document.getElementById(
                    "email-error-message"
                  ) as HTMLParagraphElement;
                  errDisplay.classList.add("invisible");
                }}
              ></Input>

              <p
                id="email-error-message"
                className="invisible text-xs transition-all text-red-500"
              >
                error message
              </p>
            </div>

            <div className="input-field w-full flex flex-col">
              <Label htmlFor="password-input">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                id="password-input"
                className="mt-2 transition-all focus:border-kelly-green"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("border-red-500");
                  const errDisplay = document.getElementById(
                    "password-error-message"
                  ) as HTMLParagraphElement;
                  errDisplay.classList.add("invisible");
                }}
              ></Input>
              <p
                id="password-error-message"
                className="invisible text-xs transition-all text-red-500"
              >
                error message
              </p>
              <div
                id="password-requirements"
                className="flex text-xs text-gray-400 w-full px-4"
              >
                <ul className=" list-disc">
                  <li>6 characters minimum</li>
                  <li>One number</li>
                  <li>One uppercase letter</li>
                  <li>One special character !@#$%^&*-</li>
                </ul>
              </div>
            </div>

            <Button
              id="join-btn"
              className="bg-kelly-green text-bold text-white transition-all hover:brightness-95"
              onClick={register}
            >
              Create Account
            </Button>
          </div>
        </div>
        <p className=" text-sm">
          Already on Yard Ledger?{" "}
          <Link className="text-blue-500 hover:underline" to={"/"}>
            Login
          </Link>
        </p>
      </div>
    </>
  );
};

export default Join;
