import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw { message: "Please fill in all required fields" };
      }
      
      if (password !== confirmPassword) {
        throw { message: "Passwords do not match" };
      }
      
      if (password.length < 6) {
        throw { message: "Password must be at least 6 characters long" };
      }
      
      // Make API call to register
      const response = await authService.register({ name, email, password });
      
      // Store token and user data in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Redirect to home page
      navigate("/home");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="bg-white w-full h-full grid grid-cols-1 md:grid-cols-[40%_60%]">
        
        {/* Left Side - Register Form */}
        <div className="p-10 flex flex-col justify-center h-full">
          
          {/* Logo */}
            <h1
                className="text-center mb-10"
                style={{
                fontFamily: "'Bagel Fat One', cursive",
                fontWeight: 400,
                fontSize: "45px",
                lineHeight: "100%",
                letterSpacing: "1%",
                }}
            >
                NewsPulse BD
            </h1>

          {/* Header */}
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                Get Started <span>👋</span>
            </h2>

            <p className="text-gray-600 mb-6">
                Your Daily News Digest Starts <span className="font-bold">Here!</span>
            </p>
            
          <form onSubmit={handleRegister}>
          {/* Name */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
                </label>

                <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

          {/* Email */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
                </label>
                <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

          {/* Password */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
                </label>
                <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                minLength="6"
                required
                />
            </div>

          {/* Confirm Password */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
                </label>
                <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Register Button */}
            <div className="flex justify-center mb-1 mt-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-4/5 bg-[#14202E] text-white py-2 rounded-md hover:bg-[#1b2c3f] hover:scale-105 hover:shadow-lg transform transition-all duration-300 ease-in-out active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Registering..." : "Register"}
                </button>
            </div>
          </form>

          {/* Sign In Link */}
            <p className="mt-6 text-sm text-gray-600 text-center">
                Already have an account?{" "}
                <Link to="/" className="text-blue-600 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:flex items-center justify-center bg-[#E4F4FA] h-full">
          <img
            src="/log.jpg"
            alt="Register"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}

export default Register;
