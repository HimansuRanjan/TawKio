import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/validations/zodSchemas";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { signUp, clearAllUserErrors } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ username, email, password });

    if (!result.success) {
      const fieldErrors: {
        username?: string;
        email?: string;
        password?: string;
      } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "username" | "email" | "password";
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    dispatch(signUp(username, email, password));
  };

  // ✅ handle success / error
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Signup successful 🎉");
      navigate("/feed");
    }

    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
  }, [isAuthenticated, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-700 via-blue-600 to-violet-900">
      <Card className="w-full max-w-md bg-white/10 text-white backdrop-blur-xl shadow-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300 pr-10"
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-gray-400 text-violet-900 font-semibold rounded-full"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-300 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
