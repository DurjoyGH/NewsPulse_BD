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
      const userData = await userService.getProfile();
      
      // Check if we have user data in the expected structure
      if (userData.user) {
        setName(userData.user.name || "");
        setEmail(userData.user.email || "");
        
        // Handle profile image if available
        if (userData.user.profileImage) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const imageUrl = baseUrl.replace('/api', '') + '/' + userData.user.profileImage;
          setProfileImageUrl(imageUrl);
        } else {
          setProfileImageUrl(null);
        }
      } else {
        // Alternative structure
        setName(userData.name || "");
        setEmail(userData.email || "");
        
        // Handle profile image if available
        if (userData.profileImage) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const imageUrl = baseUrl.replace('/api', '') + '/' + userData.profileImage;
          setProfileImageUrl(imageUrl);
        } else {
          setProfileImageUrl(null);
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
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
      
      // Successfully uploaded, handle the image URL based on response structure
      if (response.imageUrl) {
        // Direct image URL in response
        setProfileImageUrl(response.imageUrl);
        setUpdateSuccess(true);
      } 
      else if (response.user && response.user.profileImage) {
        // User object with profileImage path
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const imageUrl = baseUrl.replace('/api', '') + '/' + response.user.profileImage;
        setProfileImageUrl(imageUrl);
        setUpdateSuccess(true);
      }
      else if (response.profileImage) {
        // Profile image path directly in response
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const imageUrl = baseUrl.replace('/api', '') + '/' + response.profileImage;
        setProfileImageUrl(imageUrl);
        setUpdateSuccess(true);
      }
      else {
        throw new Error("Could not get image URL from server response");
      }
      
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setError("");
    try {
      const response = await userService.deleteImage();
      
      // Check if delete was successful based on different response patterns
      if (response && 
          (response.success === true || 
           response.message?.toLowerCase().includes("deleted") || 
           response.message?.toLowerCase().includes("success"))
      ) {
        setProfileImageUrl(null);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        // If we have a response but can't determine success
        console.warn("Unexpected delete response format:", response);
        setProfileImageUrl(null); // Assume it worked anyway
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Delete image error:", err);
      setError(typeof err === 'object' && err.message ? 
        err.message : "Failed to delete image. Please try again.");
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
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm animate-fade-in">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchUserProfile} 
              className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success Message */}
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 mb-6 text-sm animate-fade-in">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Profile updated successfully!
            </div>
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
                    <div className="relative">
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border"
                        onError={(e) => {
                          console.error("Failed to load profile image:", profileImageUrl);
                          setProfileImageUrl(null);
                          setError("Failed to load profile image. Please try again or upload a new image.");
                        }}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <DefaultAvatar name={name} />
                  )}
                  
                  <div className="flex gap-2 justify-center mt-3">
                    <label className={`px-3 py-1 text-xs bg-gray-100 border rounded-md hover:bg-gray-200 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? (
                        <span className="flex items-center">
                          <span className="mr-1 w-3 h-3 rounded-full animate-pulse bg-gray-600"></span>
                          Uploading...
                        </span>
                      ) : 'Change Photo'}
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
                        className={`px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
