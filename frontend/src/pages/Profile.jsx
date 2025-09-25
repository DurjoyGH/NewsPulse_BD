import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { userService } from "../services/api";

function Profile() {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await userService.getProfile();
      setName(response.user.name || "");
      setEmail(response.user.email || "");
      // Set profile photo if available
      if (response.imageUrl) {
        setProfileImageUrl(response.imageUrl);
      }
    } catch (err) {
      setError(err.message || "Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setError("");
    setUpdateSuccess(false);
    
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    
    try {
      await userService.updateName(name);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await userService.uploadImage(file);
      setProfileImageUrl(response.imageUrl);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setError("");
    try {
      await userService.deleteImage();
      setProfileImageUrl(null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete image. Please try again.");
    }
  };

  // Generate initials for default avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const DefaultAvatar = ({ name, size = 112 }) => (
    <div 
      className="rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold"
      style={{ width: size, height: size, fontSize: size / 4 }}
    >
      {getInitials(name || "User")}
    </div>
  );

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
      
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            <div>{error}</div>
            <button 
              onClick={fetchUserProfile} 
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success Message */}
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 mb-6 text-sm">
            Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold mb-6 text-center">View Profile</h1>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border"
                      onError={(e) => {
                        console.error("Failed to load profile image");
                        setProfileImageUrl(null);
                      }}
                    />
                  ) : (
                    <DefaultAvatar name={name} />
                  )}
                  
                  <div className="flex gap-2 justify-center mt-3">
                    <label className={`px-3 py-1 text-xs bg-gray-100 border rounded-md hover:bg-gray-200 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? 'Uploading...' : 'Change Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                        disabled={isUploading}
                      />
                    </label>
                    {profileImageUrl && (
                      <button
                        onClick={handleDeletePhoto}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                        disabled={isUploading}
                      >
                        Delete Photo
                      </button>
                    )}
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
                  className="mt-6 px-5 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading || isUploading}
                >
                  {isLoading ? "Updating..." : "Update Name"}
                </button>
              </>
            )}
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
