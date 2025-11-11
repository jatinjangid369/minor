// pages/Signup.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    // ✅ save user here
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <input type="text" placeholder="Username" className="w-full p-2 border mb-2 rounded" />
        <input type="email" placeholder="Email" className="w-full p-2 border mb-2 rounded" />
        <input type="password" placeholder="Password" className="w-full p-2 border mb-4 rounded" />
        <Button className="w-full" onClick={handleSignup}>Sign Up</Button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-blue-500 cursor-pointer">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
