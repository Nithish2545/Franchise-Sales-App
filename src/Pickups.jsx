import { useEffect, useState } from "react";
import Nav from "./Nav";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "./firebase";

function Pickups() {
  
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState("");
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [awbSearchTerm, setAwbSearchTerm] = useState("");
  const [dateSearchTerm, setDateSearchTerm] = useState("");
  const [consignorPhoneSearchTerm, setConsignorPhoneSearchTerm] = useState("");
  const [PickupPersonName, setPickUpPersonName] = useState("");

  // Fetch user info from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("FrachiseLogin"));
    console.log(JSON.parse(localStorage.getItem("FrachiseLogin")));
    setUsername(storedUser?.name);
    setRole(storedUser.role);
  }, []);

  const parsePickupDateTime = (dateTimeString) => {
    const [datePart, timePart] = dateTimeString.split("&"); // Split date and time
    const [year, month, day] = datePart.split("-"); // Get year, month, day
    const [hour, minute] = timePart.split(" ")[0].split(":"); // Get hour and minute

    // Convert hour to 24-hour format if it's PM
    const isPM = timePart.includes("PM") && hour !== "12";
    const adjustedHour = isPM ? parseInt(hour, 10) + 12 : hour;
    const date = new Date(year, month - 1, day, adjustedHour, minute || 0); // Create Date object
    return date;
  };

  // Fetch pickup data from Firestore and filter based on the username
  useEffect(() => {
    if (username) {
      const fetchData = () => {
        try {
          const q =
            role === "sales admin" ||  role==="Manager"
              ? query(collection(db, "pickup")) // Fetch all pickups for sales admin
              : query(
                  collection(db, "pickup"),
                  where("pickupBookedBy", "==", username)
                ); // Fetch only user's pickups

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const filteredData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            // Sort data by date and time
            const sortedData = filteredData.sort((a, b) => {
              const dateTimeA = parsePickupDateTime(a.pickupDatetime);
              const dateTimeB = parsePickupDateTime(b.pickupDatetime);
              return dateTimeA - dateTimeB;
            });

            setPickups(sortedData);
            setLoading(false);
          });

          // Cleanup subscription on unmount
          return () => unsubscribe();
        } catch (error) {
          setError("Failed to fetch data: " + error.message);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [username, role]);

  // Filter pickups based on search terms
  const filteredPickups = pickups.filter((pickup) => {
    const awbMatch = String(pickup.awbNumber)
      .toLowerCase()
      .includes(awbSearchTerm.toLowerCase());
    const dateMatch = pickup.pickupDatetime
      .split("&")[0]
      .startsWith(dateSearchTerm); // Check if the date starts with the input
    const consignorPhoneMatch = pickup.consignorphonenumber
      .toLowerCase()
      .includes(consignorPhoneSearchTerm.toLowerCase());
    const PhonesearchItem = pickup.pickUpPersonName
      .toLowerCase()
      .includes(PickupPersonName.toLowerCase());

    return awbMatch && dateMatch && consignorPhoneMatch && PhonesearchItem; // Use AND logic to filter
  });

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <>
      <Nav />
      <div className="container mx-auto p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-purple-700">
          {role !== "sales admin" ? (
            <>Pickups Booked by {username}</>
          ) : (
            "All Booked Pickups"
          )}
        </h1>
        {/* Search Inputs */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by AWB Number"
            value={awbSearchTerm}
            onChange={(e) => setAwbSearchTerm(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="date"
            placeholder="Search by Date (YYYY-MM-DD)"
            onChange={(e) => {
              const dateValue = e.target.value; // e.g., "2024-10-07"
              const [year, month, day] = dateValue.split("-");
              const result = `${parseInt(day)}-${parseInt(month)}`;
              setDateSearchTerm(result);
            }}
            className="border border-gray-300 rounded py-2 px-4 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            placeholder="Search by Consignor Phone Number"
            value={consignorPhoneSearchTerm}
            onChange={(e) => setConsignorPhoneSearchTerm(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            placeholder="Search by Pickup Person"
            value={PickupPersonName}
            onChange={(e) => setPickUpPersonName(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="overflow-auto border scrollbar-hide">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="py-3 px-4 border">AWB Number</th>
                <th className="py-3 px-4 border">Consignor Name</th>
                <th className="py-3 px-4 border">Consignor Phone</th>
                <th className="py-3 px-4 border">Destination</th>
                <th className="py-3 px-4 border">Weight (Apx)</th>
                <th className="py-3 px-4 border">Vendor</th>
                <th className="py-3 px-4 border">Pickup Area</th>
                <th className="py-3 px-4  border">Pickup Date & Time</th>
                <th className="py-3 px-4 border">Status</th>
                <th className="py-3 px-4 border"> Pickup Booked by</th>
                <th className="py-3 px-4 border">PickUp Person</th>
              </tr>
            </thead>
            <tbody>
              {filteredPickups.length > 0 ? (
                filteredPickups.map((pickup) => (
                  <tr key={pickup.id}>
                    <td className="py-10 px-4 border">{pickup.awbNumber}</td>
                    <td className="py-10 px-4 border">
                      {pickup.consignorname}
                    </td>
                    <td className="py-10 px-4 border">
                      {pickup.consignorphonenumber}
                    </td>
                    <td className="py-10 px-4 border">{pickup.destination}</td>
                    <td className="py-10 px-4 border">{pickup.weightapx}</td>
                    <td className="py-10 px-4 border">{pickup.vendorName}</td>
                    <td className="py-10 px-4 border">{pickup.pickuparea}</td>
                    <td className="py-10 px-4 border">
                      {pickup.pickupDatetime}
                    </td>
                    <td className="py-10 px-4 border">{pickup.status}</td>
                    <td className="py-10 px-4 border">
                      {pickup.pickupBookedBy}
                    </td>
                    <td className="py-10 px-4 border">
                      {pickup.pickUpPersonName}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-4 font-semibold text-gray-600"
                  >
                    No pickups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Pickups;