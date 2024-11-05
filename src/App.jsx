import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PickupBooking from "./PickupBooking";
import RateCardForm from "./RateCard";
import PaymentConfirm from "./PaymentConfirm";
import PaymentConfirmationForm from "./PaymentConfirmationForm";
import SignIn from "./SignIn";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import CancelOrReshedule from "./CancelOrReshedule";
import Pickups from "./Pickups";
import LogisticsDashboard from "./LogisticsDashboard";
import { collection, getDocs, query } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(collection(db, "FranchiseLoginCredentials"));
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
          const result = doc.data();
          // Check if the document has an array named after the email
          if (result[user.email]) {
            console.log(result["haman@gmail.com"]);
            const dataset = {
              name: result[user.email][0],
              email: result[user.email][1],
              role: result[user.email][2],
              FranchiseLocation: result[user.email][3],
            };
            // Store user data in localStorage and wait until it's stored
            localStorage.setItem("FranchiseLogin", JSON.stringify(dataset));
          }
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false); // Stop loading once auth state is determined
    });
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or component
  }

  return (
    <Router>
      <div>
        <Routes>
          {/* If user is not present, redirect to SignIn */}
          <Route
            path="/"
            element={user ? <PickupBooking /> : <Navigate to="/signin" />}
          />
          {/* Only allow access to other routes if user is logged in */}
          <Route
            path="/PickupBooking"
            element={user ? <PickupBooking /> : <Navigate to="/signin" />}
          />
          <Route
            path="/Cancel-reschedule"
            element={user ? <CancelOrReshedule /> : <Navigate to="/signin" />}
          />
          <Route
            path="/Pickups"
            element={user ? <Pickups /> : <Navigate to="/signin" />}
          />
          <Route
            path="/Sale-rates"
            element={user ? <RateCardForm /> : <Navigate to="/signin" />}
          />
          <Route
            path="/Payment-confirm"
            element={user ? <PaymentConfirm /> : <Navigate to="/signin" />}
          />
          <Route
            path="/logisticsDashboard"
            element={user ? <LogisticsDashboard /> : <Navigate to="/signin" />}
          />
          <Route
            path="/Payment-confirmation-form/:awbnumber"
            element={
              user ? <PaymentConfirmationForm /> : <Navigate to="/signin" />
            }
          />
          {/* Sign In route, only accessible if no user is logged in */}
          <Route
            path="/signin"
            element={!user ? <SignIn /> : <Navigate to="/PickupBooking" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
