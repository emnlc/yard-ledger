import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error: ", error);
      });
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Dashboard;
