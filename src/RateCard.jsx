import { useState, useEffect } from "react";
import axios from "axios";
import Nav from "./Nav";

const RateCardForm = () => {
  const [country, setCountry] = useState("USA"); // Use the sheet name directly
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [rateData, setRateData] = useState({});

  const sheets = [
    { name: "USA" },
    { name: "UK" },
    { name: "UAE" },
    { name: "CANADA" },
    { name: "CHINA" },
    { name: "EUROPE" },
    { name: "FRANCE" },
    { name: "HONG KONG" },
    { name: "MALAYSIA" },
    { name: "NEW ZEALAND" },
    { name: "SOUTH AMERICA" },
    { name: "SINGAPORE" },
    { name: "AUSTRALIA" },
    { name: "SAUDI" },
    { name: "MAURITIUS" },
    { name: "PHILIPPINES" },
  ];

  const API_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzV38Uyx2o1hHDG8EQKhIDiG3ciRZWNqxGkZrU01rr8ssfL5QxhC5lzLBTbmf_MExrOWA/exec"; // Replace with your actual Web App URL

  // Fetch data from Google Sheets
  const fetchData = async () => {
    try {
      // Fetch data from all sheets

      const promises = sheets.map((sheet) =>
        axios.get(`${API_ENDPOINT}?sheet=${sheet.name}`)
      );

      const responses = await Promise.all(promises);
      const newRateData = {};

      // Map responses to rateData format
      responses.forEach((response, index) => {
        const sheetName = sheets[index].name;
        const data = response.data.data;
        console.log(data)
        newRateData[sheetName] = data.map((item) => ({
          Weight_slab: item["Weight_slab(" + sheetName + ")"],
          Economy: item.Economy,
          Express: item.Express,
          EcoDutyFree :item.EcoDutyFree
        }));
      });

      setRateData(newRateData);
      console.log("Fetched data from Google Sheets:", newRateData);
    } catch (error) {
      console.error("Error fetching data from Google Sheets", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  useEffect(() => {
    if (rateData[country]) {
      setWeights(rateData[country].map((item) => item.Weight_slab));
    }
  }, [country, rateData]);

  useEffect(() => {
    if (rateData[country]) {
      const rate = rateData[country].find(
        (item) => item.Weight_slab === weight
      );
      setSelectedRate(rate);
    }
  }, [country, weight, rateData]);

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-purple-200 flex flex-col items-center justify-center py-8">
        {/* Form Section */}
        <div className="w-full max-w-lg p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">
                Rate Card Form
              </h2>
              <form className="space-y-4">
                {/* Country Selector */}
                <div>
                  <label className="block text-gray-800 text-sm font-medium mb-1">
                    Select Country:
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-150 ease-in-out"
                  >
                    {sheets.map((sheet) => (
                      <option key={sheet.name} value={sheet.name}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight Selector */}
                <div>
                  <label className="block text-gray-800 text-sm font-medium mb-1">
                    Select Weight Slab:
                  </label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-150 ease-in-out"
                  >
                    <option value="">Select Weight</option>
                    {weights.map((weightOption, index) => (
                      <option key={index} value={weightOption}>
                        {weightOption}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Data Display Section */}
        <div className="w-full max-w-lg p-4 mt-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[200px]">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">
                Rate Details
              </h2>
              {selectedRate ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-gray-50 text-gray-800 rounded-lg shadow-md">
                    <thead className="bg-purple-100 text-gray-700">
                      <tr>
                        <th className="py-3 px-4 border-b text-left">Weight</th>
                        <th className="py-3 px-4 border-b text-left">
                          Economy
                        </th>
                        <th className="py-3 px-4 border-b text-left">
                          Express
                        </th>
                        <th className="py-3 px-4 border-b text-left">
                        EcoDutyFree
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-4 border-b">
                          {selectedRate.Weight_slab}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {selectedRate.Economy}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {selectedRate.Express}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {selectedRate.EcoDutyFree}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">
                  Please select a weight slab to view rates.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateCardForm;