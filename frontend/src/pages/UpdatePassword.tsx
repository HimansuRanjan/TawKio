import { useState } from "react";
import Navbar from "./sub-components/Navbar";

export default function UpdatePassword() {
  const [activeTab, setActiveTab] = useState("profile");

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add API call here
    console.log("Password update submitted");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Form Section */}
      <div className="flex justify-center mt-8 px-4">
        <div className="bg-white shadow-md rounded-xl w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">
            Update Password
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleUpdatePassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="Re-enter new password"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-violet-700 text-white rounded-lg py-2 font-medium hover:bg-violet-800 transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
