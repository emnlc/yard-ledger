import { useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, database } from "./ts/firebase/auth.js"; // get function and auth variable
import { ref, set } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";

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
      emailInput.classList.add("invalid-field");
      isValid = false;
    }
    if (!validate_password(password)) {
      const passwordElement = document.getElementById(
        "password-input"
      ) as HTMLInputElement;
      passwordElement.classList.add("invalid-field");
      isValid = false;
    }
    if (!validate_field(name)) {
      const nameElement = document.getElementById(
        "name-input"
      ) as HTMLInputElement;
      nameElement.classList.add("invalid-field");
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
        console.error(error);
      });
  };

  function validate_email(email: string) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    if (!expression.test(email) == true) {
      return false; // invvalid email
    }
    return true; // valid email
  }

  function validate_password(password: string) {
    if (password.length < 6) {
      return false; // invalid password format
    }
    return true; // valid password
  }

  function validate_field(field: string) {
    if (field == null || field.length <= 0) {
      return false;
    }

    return true;
  }

  return (
    <>
      <div className="h-screen flex flex-col gap-4 justify-center items-center">
        <div className="join-container flex flex-col justify-center items-center md:mx-auto w-fit px-12 py-8 gap-8 shadow-xl">
          <h1 className="font-extrabold text-2xl self-start">Join</h1>

          <div className="input-container flex flex-col justify-center items-center gap-4">
            <div className="input-field w-full flex flex-col">
              <label htmlFor="name-input" className=" self-start text-sm">
                Name <span className=" text-red-500">*</span>
              </label>
              <input
                className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
                type="text"
                id="name-input"
                onFocus={(e) =>
                  e.currentTarget.classList.remove("invalid-field")
                }
              />
            </div>

            <div className="input-field w-full flex flex-col">
              <label htmlFor="email-input" className=" self-start text-sm">
                Email <span className=" text-red-500">*</span>
              </label>
              <input
                className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
                type="email"
                id="email-input"
                onFocus={(e) =>
                  e.currentTarget.classList.remove("invalid-field")
                }
              />
            </div>

            <div className="input-field w-full flex flex-col">
              <label htmlFor="password-input" className=" self-start text-sm">
                Password <span className=" text-red-500">*</span>
              </label>
              <input
                className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
                type="password"
                id="password-input"
                onFocus={(e) =>
                  e.currentTarget.classList.remove("invalid-field")
                }
              />
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
