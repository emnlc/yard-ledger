import { app as firebase } from "./firebase-config";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase } from "firebase/database";

const auth = getAuth(firebase);
const googleAuthProvider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, googleAuthProvider);
};

const database = getDatabase(firebase);

export { signInWithGoogle, auth, database }; // export function and auth variable
