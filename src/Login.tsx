import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithGoogle, auth, database } from "./ts/firebase/auth.js"; // get function and auth variable
import { ref, update } from "firebase/database";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

import { validate_email, validate_password } from "./ts/validateForms.js";

const Login = () => {
  const navigate = useNavigate();

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
      emailInput.classList.add("invalid-field");
      isValid = false;
    }
    if (!validate_password(password)) {
      const passwordInput = document.getElementById(
        "password-input-login"
      ) as HTMLInputElement;
      passwordInput.classList.add("invalid-field");
      isValid = false;
    }

    if (!isValid) {
      // return if fields are invalid
      console.log("failed validaton :(");
      return;
    }

    // validation passed
    console.log("passed validation :D");
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        update(ref(database, "users/" + userCredential.user.uid), {
          name: name,
          email: email,
          last_login: Date.now(),
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const googleSignIn = () => {
    signInWithGoogle()
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error("Authentication error: ", error);
      });
  };

  return (
    <>
      <div className="h-screen flex flex-col gap-4 justify-center items-center">
        <div className="login-container flex flex-col justify-center items-center md:mx-auto w-fit px-12 py-8 gap-8 shadow-lg">
          <h1 className="font-extrabold text-2xl self-start">Sign In</h1>

          <div className="input-field w-full flex flex-col">
            <label htmlFor="email-input-login" className="text-sm">
              Email
            </label>
            <input
              className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
              type="text"
              id="email-input-login"
              onFocus={(e) => e.currentTarget.classList.remove("invalid-field")}
            />
          </div>

          <div className="input-field w-full flex flex-col">
            <label htmlFor="password-input-login" className="text-sm">
              Password
            </label>
            <input
              className="px-4 py-2 border rounded-md outline-none text-sm transition-colors focus:border-kelly-green"
              type="password"
              id="password-input-login"
              onFocus={(e) => e.currentTarget.classList.remove("invalid-field")}
            />
          </div>

          <button
            id="login-btn"
            className="font-semibold bg-kelly-green rounded-lg px-4 py-2 text-lg text-white shadow-md transition-all hover:brightness-95"
            onClick={login}
          >
            Sign in
          </button>

          <span>or</span>

          <button
            id="google-btn"
            className="font-semibold w-full bg-neutral-100 px-4 py-2  rounded-lg shadow-md transition-all hover:brightness-95"
            onClick={googleSignIn}
          >
            <img
              className="h-8 w-8 align-middle inline"
              src="/google.svg"
              alt=""
            />{" "}
            Continue with Google
          </button>
        </div>
        <p className=" text-sm">
          New to Yard Ledger?{" "}
          <Link className="text-blue-500 hover:underline" to={"/join"}>
            Join now
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
