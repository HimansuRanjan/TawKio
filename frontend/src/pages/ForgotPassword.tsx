import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { forgotPassword, clearAllForgotPasswordErrors } from "../store/slices/forgotPasswordSlice";
import { toast } from "react-toastify";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, message } = useSelector(
    (state: RootState) => state.forgotPassword
  );

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      setErrors({ email: result.error.issues[0].message });
      return;
    }

    dispatch(forgotPassword(email));

  };

  useEffect(() => {
    if (message) {
      setSuccessMessage(`✅ Check your email. ${message}`);
    }
    if (error) {
      toast.error(error);
      dispatch(clearAllForgotPasswordErrors());
    }
  }, [message, error, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-700 via-blue-600 to-violet-900">
      <Card className="w-full max-w-md bg-white/10 text-white backdrop-blur-xl shadow-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <p className="text-green-400 text-center text-sm font-medium">
              {successMessage}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-50 hover:bg-gray-400 text-violet-900 font-semibold rounded-full"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-300 mt-4">
            Remember password?{" "}
            <Link to="/login" className="text-yellow-300 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
