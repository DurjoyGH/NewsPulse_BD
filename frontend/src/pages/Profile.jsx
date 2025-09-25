import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("Abdullah Al Noman");
  const [email] = useState("noman@example.com");
  const [photo, setPhoto] = useState("https://via.placeholder.com/150");

  const handleUpdate = () => {
    alert("Profile updated!");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <Navbar showCategories={false} />

      {/* Main content*/}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-4 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              Saved News
            </button>
            <button className="px-5 py-2 rounded-md text-sm font-medium bg-black text-white">
              View Profile
            </button>
          </div>
        </div>

        {/* Info bar (left) */}
        <div className="bg-white border rounded-lg px-4 py-3 mb-6 text-sm font-medium text-gray-700 shadow">
          Access your profile info!
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold mb-6 text-center">View Profile</h1>

            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
            <img
                src={photo}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border"
            />
            <div className="flex gap-2 justify-center mt-3">
                <button className="px-3 py-1 text-xs bg-gray-100 border rounded-md hover:bg-gray-200">
                Change Photo
                </button>
                <button
                onClick={() => setPhoto("https://via.placeholder.com/150")}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                Delete Photo
                </button>
            </div>

        </div>


          {/* Profile Info */}
          <div className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="mt-6 px-5 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
          >
            Update
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
          <div className="text-center space-y-4">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 NewsPulse BD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Profile;
