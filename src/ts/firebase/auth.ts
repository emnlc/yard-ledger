import { app as firebase } from "./firebase-config";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth(firebase);
const googleAuthProvider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, googleAuthProvider);
};

export { signInWithGoogle, auth }; // export function and auth variable
