import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/zodSchemas";
import { z } from "zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login, clearAllUserErrors } from "../store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, user} = useSelector(
    (state: RootState) => state.user
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    dispatch(login(data.email, data.password));
  };

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    
    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
    if (isAuthenticated) {
      navigate("/feed"); // redirect after login
      toast.success("Login successful!");
    }
  }, [error, isAuthenticated, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-700 via-blue-600 to-violet-900">
      <Card className="w-full max-w-md bg-white/10 text-white backdrop-blur-xl shadow-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Login to TawKio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <Input
                type="email"
                placeholder="Email"
                className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="password"
                  className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300 pr-10"
                  {...register("password")}
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
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
              {/* ✅ Forgot Password link */}
              <p className="text-right text-sm mt-2">
                <Link
                  to="/password/forgot"
                  className="text-yellow-300 hover:underline"
                >
                  Don’t remember your password?
                </Link>
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-gray-500 text-violet-900 font-semibold rounded-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-yellow-300 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
