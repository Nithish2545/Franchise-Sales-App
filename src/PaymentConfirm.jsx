import { useState, useEffect } from "react";
import Nav from "./Nav";
import PaymentConfirmCard from "./PaymentConfirmCard";
import { collection, onSnapshot } from "firebase/firestore";
import {db} from  "./firebase"
import collection_baseAwb  from "./functions/collectionName"
function PaymentConfirm() {
  
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("PAYMENT PENDING");
console.log( collection_baseAwb.getCollection())
  useEffect(() => {
    // Set up a real-time listener for Firestore data using onSnapshot
    const unsubscribe = onSnapshot(collection(db,  collection_baseAwb.getCollection()), (snapshot) => {
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(documents); // Update the state with the latest data from Firestore
    }, (error) => {
      console.error("Error fetching Firestore data: ", error);
    });

    // Cleanup listener on component unmount to prevent memory leaks
    return () => unsubscribe();
  }, []);

  const filteredData = data.filter((item) => item.status === activeTab);
  console.log(data);

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <div className="max-w-screen-xl mx-auto p-5">
        <div className="flex justify-center space-x-4 mt-5">
          <button
            className={`py-2 px-4 rounded-lg font-semibold ${
              activeTab === "PAYMENT PENDING"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => setActiveTab("PAYMENT PENDING")}
          >
            Payment Pending
          </button>
          <button
            className={`py-2 px-4 rounded-lg font-semibold ${
              activeTab === "PAYMENT DONE"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => setActiveTab("PAYMENT DONE")}
          >
            Payment Done
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-10">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-64  bg-white rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-600">
                No records found
              </p>
              <p className="text-sm text-gray-400">
                There are no payments to display for the selected status.
              </p>
            </div>
          ) : (
            filteredData.map((item, index) => (
              <PaymentConfirmCard key={index} item={item} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirm;