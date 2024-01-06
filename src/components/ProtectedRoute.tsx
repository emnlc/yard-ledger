import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../ts/firebase/auth";
import Navbar from "./Navbar";

import Loading from "./Loading";

interface AuthRouteProps {
  children: ReactNode;
}

const AuthRoute = (props: AuthRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Loading></Loading>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
};

export default AuthRoute;
