import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" Component={Login}></Route>
          <Route path="/dashboard" Component={Dashboard}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
