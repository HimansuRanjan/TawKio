import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { resetPassword, clearAllForgotPasswordErrors } from "../store/slices/forgotPasswordSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useParams(); // reset token from URL

  const { loading, error, message } = useSelector(
    (state: RootState) => state.forgotPassword
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState(""); // ✅ to show after success

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if(newPassword !== confirmPassword){
      toast.error("New Password and Confirm Password Must Match");
      return;
    }

    dispatch(resetPassword(token, newPassword, confirmPassword));
  };

  useEffect(() => {
    if (message) {
      setSuccessMsg("✅ Password reset successful! Redirecting to login...");
      toast.success(message);

      // wait 2 sec before redirect
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }

    if (error) {
      toast.error(error);
      dispatch(clearAllForgotPasswordErrors());
    }
  }, [message, error, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-700 via-blue-600 to-violet-900">
      <Card className="w-full max-w-md bg-white/10 text-white backdrop-blur-xl shadow-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {successMsg ? (
            <p className="text-center text-green-400 font-medium">{successMsg}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* New Password */}
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-50 hover:bg-gray-400 text-violet-900 font-semibold rounded-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* ✅ Extra "Remember Password" link */}
          {!successMsg && (
            <p className="text-center text-sm text-gray-300 mt-4">
              Remember password?{" "}
              <Link to="/login" className="text-yellow-300 hover:underline">
                Login
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
