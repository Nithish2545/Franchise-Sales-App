import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { auth, db } from "./firebase"; // Ensure you have configured Firebase correctly
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs } from "firebase/firestore";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(""); // New state for error message
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError(""); // Clear previous error before submission
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // console.log("You are signed in successfully!", result);
      const q = query(collection(db, "FranchiseLoginCredentials"));
      // Fetch the query results
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data);
        // Check if the document has an array named "haman"
        if (Array.isArray(data[data.email])) {
          console.log(`Document ID: ${doc.id}`);
          console.log("Haman Array:", data[data.email]);

          const user = {
            name: data[data.email][0],
            email: data[data.email][1],
            role: data[data.email][2],
            FrachiseLocation: data[data.email][3],
          };

          localStorage.setItem("FrachiseLogin", JSON.stringify(user));
        } else {
          setAuthError();
          console.log(`Invalid email or password. Please try again.'`);
        }
      });

      // if (auth.currentUser.email === "dhanush@gmail.com") {
      //   localStorage.setItem(
      //     "enquiryAuthToken",
      //     JSON.stringify({
      //       email: "dhanush@gmail.com",
      //       role: "sales admin",
      //       name: "dhanush",
      //     })
      //   );
      //   navigate("/PickupBooking");
      //   return;
      // }

      // if (auth.currentUser.email === "smitha@gmail.com") {
      //   localStorage.setItem(
      //     "enquiryAuthToken",
      //     JSON.stringify({
      //       email: "smitha@gmail.com",
      //       role: "sales associate ",
      //       name: "smitha",
      //     })
      //   );
      //   navigate("/PickupBooking");
      //   return;
      // }
      // if (auth.currentUser.email === "dinesh@gmail.com") {
      //   localStorage.setItem(
      //     "enquiryAuthToken",
      //     JSON.stringify({
      //       email: "dinesh@gmail.com",
      //       role: "Manager",
      //       name: "dinesh",
      //     })
      //   );
      //   navigate("/PickupBooking");
      //   return;
      // }
      // if (auth.currentUser.email === "sana@gmail.com") {
      //   localStorage.setItem(
      //     "enquiryAuthToken",
      //     JSON.stringify({
      //       email: "sana@gmail.com",
      //       role: "coordinator",
      //       name: "sana",
      //     })
      //   );
      //   navigate("/PickupBooking");
      //   return;
      // }
    } catch (error) {
      console.log(error.code);
      console.log(error);
      // Set the error message for inline display
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found"
      ) {
        setAuthError("Invalid email or password. Please try again.");
      } else {
        setAuthError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press manually
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default form behavior
      handleSubmit(onSubmit)(); // Trigger form submission manually
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <img src="/logo.png" alt="Logo" className="w-auto h-12 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sign In</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md"
        onKeyPress={handleKeyPress}
      >
        <div className="w-full max-w-md">
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                message: "Invalid email address",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <input
                type="email"
                className={`w-full p-3 mb-4 border rounded ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-4">{errors.email.message}</p>
          )}

          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full p-3 mb-4 border rounded ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <img
                      src="view-svgrepo-com.svg"
                      className="w-8"
                      alt="show"
                    />
                  ) : (
                    <img
                      src="view-hide-svgrepo-com.svg"
                      className="w-8"
                      alt="hide"
                    />
                  )}
                </button>
              </div>
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-4">
              {errors.password.message}
            </p>
          )}

          {/* Inline authentication error message */}
          {authError && (
            <p className="text-red-500 text-sm text-center my-4">{authError}</p>
          )}

          <button
            type="submit"
            className={`w-full text-white p-3 rounded font-bold ${
              loading ? "bg-purple-300" : "bg-purple-700 hover:bg-purple-800"
            }`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center mt-4">
            <button
              className="text-purple-700 underline mt-2"
              onClick={() => alert("Forgot Password clicked")}
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
