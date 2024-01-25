import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../ts/firebase/auth";

const Navbar = () => {
  return (
    <>
      <nav className="bg-white hidden md:flex items-center justify-end py-4 px-12 fixed shadow-lg w-full ">
        <div className="flex gap-10 navbar-links font-semibold">
          <Link
            to={"/home"}
            className="hover:text-kelly-green transition-colors"
          >
            Clients
          </Link>
          <Link
            to={"/account"}
            className="hover:text-kelly-green transition-colors"
          >
            Account
          </Link>
          <Link
            onClick={() => {
              signOut(auth);
            }}
            to={"/"}
            className="hover:text-kelly-green transition-colors"
          >
            Logout
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
