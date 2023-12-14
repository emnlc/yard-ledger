import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import Join from "./Join";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" Component={Login}></Route>
          <Route path="/dashboard" Component={Dashboard}></Route>
          <Route path="/join" Component={Join}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
