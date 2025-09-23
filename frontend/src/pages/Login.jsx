import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="bg-white w-full h-full grid grid-cols-1 md:grid-cols-[40%_60%]">
        
        {/* Left Side - Login Form */}
        <div className="p-10 flex flex-col justify-center h-full">
          {/* Logo - Center */}
            <h1
            className="text-center mb-10"
            style={{
                fontFamily: "'Bagel Fat One', cursive",
                fontWeight: 400,
                fontSize: "45px",
                lineHeight: "100%",
                letterSpacing: "1%",
            }}
            > NewsPulse BD 
            </h1>
            


            <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                Welcome Back <span>👋</span>
            </h2>

            <p className="text-gray-600 mb-6">
                Stay Informed – <span className="font-semibold">Login</span> Now!
            </p>


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
            <div className="mb-2">
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

          {/* Forgot Password */}
            <div className="text-right mb-4">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot Password?
                </a>
            </div>

          {/* Login Button */}
            <div className="flex justify-center mb-4">
                <button className="w-4/5 bg-[#14202E] text-white py-2 rounded-md hover:bg-[#1b2c3f] hover:scale-105 hover:shadow-lg transform transition-all duration-300 ease-in-out active:scale-95">
                    Login
                </button>
            </div>

          {/* Divider */}
            <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-2 text-gray-500">Or</span>
                <div className="flex-grow h-px bg-gray-300"></div>
            </div>

          {/* Google Sign-in */}
            <div className="flex justify-center">
                <button className="w-4/5 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition">
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google Logo"
                    className="w-5 h-5"
                />
                <span>Sign in with Google</span>
                </button>
            </div>

          {/* Sign Up */}
            <p className="mt-6 text-sm text-gray-600 text-center">
                Don't you have an account?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                    Sign up
                </a>
            </p>
        </div>

        {/* Right Side - Image Placeholder */}
        <div className="hidden md:flex items-center justify-center bg-[#E4F4FA] h-full">
        <img
            src="/log.jpg"   
            alt="Login"
            className="w-full h-full object-cover"
        />
        </div>

      </div>
    </div>
  );
}

export default Login;
