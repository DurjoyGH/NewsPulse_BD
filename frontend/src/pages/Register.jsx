import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
            />
            </div>

          {/* Register Button */}
            <div className="flex justify-center mb-1 mt-6">
                <button className="w-4/5 bg-[#14202E] text-white py-2 rounded-md hover:bg-[#1b2c3f] hover:scale-105 hover:shadow-lg transform transition-all duration-300 ease-in-out active:scale-95">
                    Register
                </button>
            </div>

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
