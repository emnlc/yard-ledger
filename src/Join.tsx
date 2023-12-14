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

const Join = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
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
      emailInput.classList.add("invalid-field");
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
      passwordElement.classList.add("invalid-field");
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
      nameInput.classList.add("invalid-field");
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

          emailInput.classList.add("invalid-field");
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
          <h1 className="font-extrabold text-2xl self-start">Join</h1>

          <div className="input-container flex flex-col justify-center items-center w-full gap-4">
            <div className="input-field w-full flex flex-col">
              <label htmlFor="name-input" className=" self-start text-sm">
                Name <span className=" text-red-500">*</span>
              </label>
              <input
                className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
                type="text"
                id="name-input"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("invalid-field");
                  const errDisplay = document.getElementById(
                    "name-error-message"
                  ) as HTMLParagraphElement;
                  errDisplay.classList.add("invisible");
                }}
              />
              <p
                id="name-error-message"
                className="invisible text-xs transition-all text-red-500"
              >
                error message
              </p>
            </div>

            <div className="input-field w-full flex flex-col">
              <label htmlFor="email-input" className=" self-start text-sm">
                Email <span className=" text-red-500">*</span>
              </label>
              <input
                className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
                type="email"
                id="email-input"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("invalid-field");
                  const errDisplay = document.getElementById(
                    "email-error-message"
                  ) as HTMLParagraphElement;
                  errDisplay.classList.add("invisible");
                }}
              />
              <p
                id="email-error-message"
                className="invisible text-xs transition-all text-red-500"
              >
                error message
              </p>
            </div>

            <div className="input-field w-full flex flex-col">
              <label htmlFor="password-input" className=" self-start text-sm">
                Password <span className=" text-red-500">*</span>
              </label>
              <input
                className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
                type="password"
                id="password-input"
                onFocus={(e) => {
                  e.currentTarget.classList.remove("invalid-field");
                  const errDisplay = document.getElementById(
                    "password-error-message"
                  ) as HTMLParagraphElement;
                  errDisplay.classList.add("invisible");
                }}
              />
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

            <button
              className="font-semibold bg-kelly-green rounded-lg px-4 py-2 text-lg text-white shadow-md transition-all hover:brightness-95"
              id="join-btn"
              onClick={register}
            >
              Create Account
            </button>
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
