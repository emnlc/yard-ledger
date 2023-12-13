import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, auth } from "./ts/firebase/auth.js"; // get function and auth variable
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();

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
      <div className="h-screen flex justify-center items-center">
        <div className="login-container flex flex-col justify-center items-center md:mx-auto w-fit p-12 gap-8 shadow-lg my-auto">
          <h1 className="font-extrabold text-2xl self-start">Sign In</h1>
          <input className="px-4 py-2 border" type="text" />
          <input className="px-4 py-2 border" type="password" />

          <button
            id="login-btn"
            className="font-semibold bg-kelly-green rounded-lg px-4 py-2 text-lg text-white shadow-md hover:brightness-95"
          >
            Sign in
          </button>

          <span>or</span>

          <button
            id="google-btn"
            className="font-semibold bg-neutral-100 px-4 py-2 text-lg rounded-lg shadow-md hover:brightness-95"
            onClick={googleSignIn}
          >
            <img
              className="h-8 w-8 align-middle inline"
              src="/google.svg"
              alt=""
            />{" "}
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
