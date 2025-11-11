// pages/Login.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // ✅ validate credentials here
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input type="email" placeholder="Email" className="w-full p-2 border mb-2 rounded" />
        <input type="password" placeholder="Password" className="w-full p-2 border mb-4 rounded" />
        <Button className="w-full" onClick={handleLogin}>Login</Button>

        <p className="text-sm mt-4 text-center">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")} className="text-blue-500 cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
