import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Home";
import Join from "./Join";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientInvoice from "./ClientInvoice";
import InvoiceView from "./InvoiceView";
import Account from "./Account";

import Landing from "./Landing/Landing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path={"/home/client-invoice/:userUID"}
          element={
            <ProtectedRoute>
              <ClientInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path={"/home/client-invoice/:userUID/:invoiceUID"}
          element={
            <ProtectedRoute>
              <InvoiceView></InvoiceView>
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
