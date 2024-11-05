import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase"; // Import storage from your Firebase config
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import { useForm } from "react-hook-form";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import collection_baseAwb from "./functions/collectionName";

function PaymentConfirmationForm() {
  const { awbnumber } = useParams();
  const [details, setDetails] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [KycImage, setKycImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const barcodeRef = useRef(null); // Ref for barcode generation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const generatePDF = () => {
    const doc = new jsPDF();

    // Format date as day/month/year
    const todayDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Generate barcode
    JsBarcode(barcodeRef.current, awbnumber, {
      format: "CODE128",
      displayValue: true,
      width: 2, // Adjust width as needed
      height: 40, // Adjust height as needed
      fontOptions: "bold", // Make the text bold
      fontSize: 16, // Increase font size for the barcode text
      textMargin: 5, // Space between the barcode and text
      margin: 10, // Margin around the barcode
      background: "#ffffff", // Background color of the barcode
      lineColor: "#000000", // Color of the bars
      scale: 4, // Higher scale for better quality
    });
    const barcodeImage = barcodeRef.current.toDataURL();

    // Add logo with adjusted size (height will auto-adjust)
    const logoUrl = "/shiphtlogo.png";
    doc.addImage(logoUrl, "PNG", 140, 10, 50, 0); // Increased width to 50, height auto-adjusts

    // Add title and date
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${details.service} Service`, 20, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${todayDate}`, 20, 40);

    // Set line width for borders
    doc.setLineWidth(0.5);

    // From section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${details.consignorname}`, 20, 70);
    doc.text(`Phone Number: ${details.consignorphonenumber}`, 20, 80);
    const fromLocation = doc.splitTextToSize(
      `Location: ${details.consignorlocation}`,
      85
    );
    doc.text(fromLocation, 20, 90);

    // Horizontal line between "From" and "To" sections
    doc.line(10, 107, 200, 107);

    // To section
    doc.setFont("helvetica", "bold");
    doc.text("To:", 110, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${details.consigneename}`, 110, 70);
    doc.text(`Phone Number: ${details.consigneephonenumber}`, 110, 80);
    const toLocation = doc.splitTextToSize(
      `Location: ${details.consigneelocation}`,
      85
    );
    doc.text(toLocation, 110, 90);

    // Shipment Details section
    doc.setFont("helvetica", "bold");
    doc.text("Shipment Details:", 20, 115); // Adjusted Y position to place below the line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Weight (kg): ${details.actualWeight} kg`, 20, 125);
    doc.text(
      `Number Of Boxes: ${details.actualNoOfPackages} / ${details.actualNoOfPackages}`,
      20,
      135
    );
    doc.text(`Content: ${details.content}`, 20, 145);

    // Horizontal line above "AWB Number" section
    doc.line(10, 154, 200, 154); // Border above "AWB Number"

    // Add barcode section with improved quality
    doc.setFont("helvetica", "bold");
    doc.text(`AWB Number: ${awbnumber}`, 20, 165);
    doc.addImage(barcodeImage, "PNG", 20, 175, 100, 30);

    // Save PDF
    doc.save(`${details.consignorname}-client-form.pdf`);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Create a query to fetch documents with status "PAYMENT PENDING" and the given awbNumber
        const q = query(
          collection(db, collection_baseAwb.getCollection()),
          where("awbNumber", "==", parseInt(awbnumber))
        );

        // Fetch the query results
        const querySnapshot = await getDocs(q);
        const userDetails = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("userDetails", userDetails);

        // Assuming you want only one result (in case there are multiple matches)
        if (userDetails.length > 0) {
          setDetails(userDetails[0]);
        } else {
          setDetails(null); // No data matched
        }
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setLoading(false); // Stop the loading state
      }
    };

    fetchDetails();
  }, [awbnumber]); // Dependency array to refetch when awbnumber changes

  const uploadFileToFirebase = async (file, folder) => {
    const storageRef = ref(storage, `${awbnumber}/${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPaymentProof(file);
    }
  };
  const handleKYCFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setKycImage(file);
    }
  };

  const validateForm = () => {
    console.log("paymentProof", paymentProof);
    console.log("KycImage", KycImage);
    if (!paymentProof && !KycImage) {
      setFormError("Payment proof and KYC Image is required.");
      return false;
    }
    setFormError("");
    return true;
  };

  async function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`; // Returns date in "YYYY-MM-DD" format
  }

  const onSubmit = async (data) => {
    console.log(await getTodayDate());
    if (!validateForm()) return;
    setSubmitLoading(true);

    try {
      if (!details) {
        throw new Error("User details not found");
      }
      const q = query(
        collection(db, collection_baseAwb.getCollection()),
        where("awbNumber", "==", parseInt(awbnumber))
      );

      const querySnapshot = await getDocs(q);
      let final_result = [];

      querySnapshot.forEach((doc) => {
        final_result.push({ id: doc.id, ...doc.data() });
      });

      const docRef = doc(db, collection_baseAwb.getCollection(), final_result[0].id); // db is your Firestore instance
      console.log(data.consigneename1);
      const updatedFields = {
        status: "PAYMENT DONE",
        logisticCost: data.logisticsCost,
        discountCost: data.discountCost,
        paymentProof: await uploadFileToFirebase(paymentProof, "PAYMENT PROOF"),
        KycImage: await uploadFileToFirebase(KycImage, "KYC"),
        PaymentComfirmedDate: await getTodayDate(),
        consigneename: !data.consigneename1
          ? details.consigneename
          : data.consigneename1,
        consigneephonenumber: !data.consigneenumber1
          ? details.consigneephonenumber
          : data.consigneenumber1,
        consigneelocation: !data.consigneelocation1
          ? details.consigneelocation
          : data.consigneelocation1,
          costKg:data.costKg
      };

      updateDoc(docRef, updatedFields);

      setShowPopup(true);
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitLoading(false);
      resetForm(); // Reset form after submission
    }
  };

  const handleError = (error) => {
    if (error.response) {
      setError(
        `Error ${error.response.status}: ${
          error.response.data.message || error.message
        }`
      );
    } else if (error.request) {
      setError("Network error. Please check your connection.");
    } else {
      setError(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setPaymentProof(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-purple-600"
          role="status"
        >
          <span className="visually-hidden">...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      {details ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 p-4 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Payment Confirmation
          </h2>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none"
          >
            Back
          </button>
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Consignor Name:
            </label>
            <input
              type="text"
              value={details.consignorname}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Consignor Phone Number:
            </label>
            <input
              type="text"
              value={details.consignorphonenumber}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          {/* TO */}
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              From Address:
            </label>
            <input
              type="text"
              value={details.consignorlocation}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          {/* consignee data */}
          {details.consigneename ? (
            <div className="flex flex-col mb-4">
              <label className="text-gray-700 font-medium mb-1">
                Consignee Name:
              </label>
              <input
                type="text"
                value={details.consigneename}
                readOnly
                className="p-2 border rounded bg-gray-100"
              />
            </div>
          ) : (
            ""
          )}
          {details.consigneephonenumber ? (
            <div className="flex flex-col mb-4">
              <label className="text-gray-700 font-medium mb-1">
                Consignee Phone Number:
              </label>
              <input
                type="text"
                value={details.consigneephonenumber}
                readOnly
                className="p-2 border rounded bg-gray-100"
              />
            </div>
          ) : (
            ""
          )}
          {details.consigneelocation ? (
            <div className="flex flex-col mb-4">
              <label className="text-gray-700 font-medium mb-1">
              Consignor Address:
              </label>
              <input
                type="text"
                value={details.consigneelocation}
                readOnly
                className="p-2 border rounded bg-gray-100"
              />
            </div>
          ) : (
            ""
          )}
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Destination:
            </label>
            <input
              type="text"
              value={details.destination}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Actual Weight:
            </label>
            <input
              type="text"
              value={details.actualWeight + " " + "KG"}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              PickUp Person Name:
            </label>
            <input
              type="text"
              value={details.pickUpPersonName}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Shiphit AWB Number:
            </label>
            <input
              type="text"
              value={awbnumber}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Pickup Completed Datatime
            </label>
            <input
              type="text"
              value={details.pickupCompletedDatatime}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
            Vendor
            </label>
            <input
              type="text"
              value={details.vendorName}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
          </div>
          {/* consignee data */}
          {!details.consigneename1 == "" ? (
            <>
              <div className="flex flex-col mb-2">
                <label className="text-gray-700 font-medium mb-1">
                  Consignee Name:
                </label>
                <input
                  type="text"
                  placeholder="Enter Consignee Name"
                  className="p-2 border rounded bg-gray-100"
                  {...register("consigneename1", {
                    required: "Consignee name is required",
                  })}
                />
              </div>
              {errors.consigneename1 && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.consigneename1.message}
                </p>
              )}
            </>
          ) : (
            ""
          )}
          {!details.consigneephonenumber1 == "" ? (
            <>
              <div className="flex flex-col mb-2">
                <label className="text-gray-700 font-medium mb-1">
                  Consignee Phone Number:
                </label>
                <input
                  type="text"
                  placeholder="Enter Consignee Phone Number"
                  className="p-2 border rounded bg-gray-100"
                  {...register("consigneenumber1", {
                    required: "Consignee phone number is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                />
              </div>
              {errors.consigneenumber1 && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.consigneenumber1.message}
                </p>
              )}
            </>
          ) : (
            ""
          )}
          {!details.consigneelocation1 =="" ? (
            <>
              <div className="flex flex-col mb-2">
                <label className="text-gray-700 font-medium mb-1">
                  Consignee Address:
                </label>
                <input
                  {...register("consigneelocation1", {
                    required: "Consignee location required",
                  })}
                  type="text"
                  placeholder="Enter Consignee Address"
                  className="p-2 border rounded bg-gray-100"
                />
              </div>
              {errors.consigneelocation1 && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.consigneelocation1.message}
                </p>
              )}
            </>
          ) : (
            ""
          )}
          <div className="flex flex-col mb-1">
            <label className="text-gray-700 font-medium mb-1">
              Enter Logistics Cost
            </label>
            <input
              type="text"
              className="p-2 border rounded bg-gray-100"
              value={details.logisticsCost}
              placeholder="Enter Logistic Cost"
              {...register("logisticsCost", {
                required: "Logistics cost is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message:
                    "Please enter a valid phone number consisting of digits only",
                },
                valueAsNumber: true, // Converts input value to an integer
                validate: (value) =>
                  Number.isInteger(value) ||
                  "Please enter a valid integer number",
              })}
            />
          </div>
          {errors.logisticsCost && (
            <p className="text-red-500 text-sm mb-4">
              {errors.logisticsCost.message}
            </p>
          )}
          <div className="flex flex-col mt-3 mb-3">
            <label className="text-gray-700 font-medium mb-1">Cost/KG</label>
            <input
              type="text"
              className="p-2 border rounded bg-gray-100"
              placeholder="Enter Cost/KG"
              {...register("costKg", {
                required: "Cost/KG is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Please enter a Cost/KG consisting of digits only",
                },
                valueAsNumber: true, // Converts input value to an integer
                validate: (value) =>
                  Number.isInteger(value) ||
                  "Please enter a valid integer number",
              })}
            />
          </div>
          {errors.costKg && (
            <p className="text-red-500 text-sm mb-4">{errors.costKg.message}</p>
          )}
          <div className="flex flex-col mb-1">
            <label className="text-gray-700 font-medium mb-1">
              Enter Discount Amount
            </label>
            <input
              type="text"
              className="p-2 border rounded bg-gray-100"
              value={details.logisticsCost}
              placeholder="Enter Discount Amount"
              {...register("discountCost", {
                required: "Please enter the discount amount.",
                pattern: {
                  value: /^[0-9]+$/,
                  message:
                    "Please enter a valid discount number consisting of digits only.",
                },
                valueAsNumber: true, // Converts input value to an integer
                validate: (value) =>
                  Number.isInteger(value) ||
                  "Please enter a valid integer number",
              })}
            />
          </div>
          {errors.discountCost && (
            <p className="text-red-500 text-sm mb-4">
              {errors.discountCost.message}
            </p>
          )}
          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              Payment Proof:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="p-2 border rounded"
            />
          </div>
          {errors.Paymentproof && (
            <p className="text-red-500 text-sm mt-1">
              {errors.Paymentproof.message}
            </p>
          )}
          {details.KycImage == null ? (
            <>
              <div className="flex flex-col mb-4">
                <label className="text-gray-700 font-medium mb-1">
                  Upload KYC & Product Images:{" "}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleKYCFileChange}
                  className="p-2 border rounded"
                />
              </div>
              {errors.KYCimage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.KYCimage.message}
                </p>
              )}
            </>
          ) : (
            <></>
          )}
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <button
            type="submit"
            className="w-full mt-4 p-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={submitLoading}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-500">
          No details found for the given AWB number.
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70">
          <div className="bg-white p-8 rounded-lg shadow-lg transition-transform transform scale-95 hover:scale-100 duration-300">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
              Payment Submitted
            </h3>
            <p className="text-center text-gray-600 mb-4">
              Thank you for your payment!
            </p>
            <button
              className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-200"
              onClick={() => {
                setShowPopup(false);
                navigate("/Payment-confirm");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Hidden canvas for generating barcode */}
      <canvas ref={barcodeRef} style={{ display: "none" }} />
    </div>
  );
}
export default PaymentConfirmationForm;