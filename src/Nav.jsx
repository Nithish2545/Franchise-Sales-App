import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "./firebase";
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger menu icon
import CloseIcon from "@mui/icons-material/Close"; // Close icon for sidebar

function Nav() {
  const location = useLocation();
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("FrachiseLogin")));
  }, []);

  return (
    <nav className="sticky flex items-center justify-around top-0 bg-purple-400 p-4 shadow-md z-10">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <img src="/logo.png" className="h-10" alt="Logo" />

        {/* Hamburger icon for mobile */}
        <button
          className="lg:hidden block text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon fontSize="large" />
        </button>

        {/* Navigation Links for larger screens */}
        <ul className="hidden lg:flex space-x-8 gap-10 items-center">
          <li>
            <Link
              to="/"
              className={`text-white rounded transition-colors ${
                location.pathname === "/PickupBooking" ||
                location.pathname === "/"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              style={{ minHeight: "40px" }}
            >
              PickupBooking
            </Link>
          </li>
          <li>
            <Link
              to="/Sale-rates"
              className={`text-white rounded transition-colors ${
                location.pathname === "/Sale-rates"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              style={{ minHeight: "40px" }}
            >
              SalesRate
            </Link>
          </li>
          <li>
            <Link
              to="/Payment-confirm"
              className={`text-white rounded transition-colors ${
                location.pathname === "/Payment-confirm"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              style={{ minHeight: "40px" }}
            >
              Payment Confirm
            </Link>
          </li>
          <li>
            <Link
              to="/Cancel-reschedule"
              className={`text-white rounded transition-colors ${
                location.pathname === "/Cancel-reschedule"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              style={{ minHeight: "40px" }}
            >
              Cancel - Reschedule
            </Link>
          </li>
          <li>
            <Link
              to="/Pickups"
              className={`text-white rounded transition-colors ${
                location.pathname === "/Pickups"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              style={{ minHeight: "40px" }}
            >
              Pickups
            </Link>
          </li>
          {user.email == "dinesh@gmail.com" && (
            <li>
              <Link
                to="/logisticsDashboard"
                className={`text-white rounded transition-colors ${
                  location.pathname === "/logisticsDashboard"
                    ? "text-purple-900 font-semibold"
                    : "bg-transparent"
                }`}
                style={{ minHeight: "40px" }}
              >
                Logistics Dashboard
              </Link>
            </li>
          )}
        </ul>
      </div>
      {/* Right Section */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Avatar>{user?.name?.slice(0, 1)}</Avatar>
          <div className="text-black hidden sm:block">
            <p className="font-medium">{user?.email}</p>
            <p>{user?.name}</p>
          </div>
        </div>
        <div
          onClick={() => {
            localStorage.removeItem("enquiryAuthToken");
            auth.signOut();
          }}
          className="bg-white text-purple-700 font-semibold p-1 pl-4 pr-5 cursor-pointer rounded-sm"
        >
          Logout
        </div>
      </div>

      {/* Sidebar for mobile screens */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-20 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-lg`}
      >
        <div className="flex justify-between items-center p-4 bg-purple-400">
          <h2 className="text-white font-bold">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-white">
            <CloseIcon />
          </button>
        </div>
        <ul className="flex flex-col p-4">
          <li>
            <Link
              to="/"
              className={`py-2 px-4 text-gray-700 rounded transition-colors block ${
                location.pathname === "/PickupBooking" ||
                location.pathname === "/"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => setSidebarOpen(false)} // Close sidebar on link click
            >
              PickupBooking
            </Link>
          </li>
          <li>
            <Link
              to="/Sale-rates"
              className={`py-2 px-4 text-gray-700 rounded transition-colors block ${
                location.pathname === "/Sale-rates"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              SalesRate
            </Link>
          </li>
          <li>
            <Link
              to="/Payment-confirm"
              className={`py-2 px-4 text-gray-700 rounded transition-colors block ${
                location.pathname === "/Payment-confirm"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              Payment Confirm
            </Link>
          </li>
          <li>
            <Link
              to="/Cancel-reschedule"
              className={`py-2 px-4 text-gray-700 rounded transition-colors block ${
                location.pathname === "/Cancel-reschedule"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              Cancel - Reschedule
            </Link>
          </li>
          <li>
            <Link
              to="/Pickups"
              className={`py-2 px-4 text-gray-700 rounded transition-colors block ${
                location.pathname === "/Pickups"
                  ? "text-purple-900 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              Pickups
            </Link>
          </li>
        </ul>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </nav>
  );
}

export default Nav;