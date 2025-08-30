import { useEffect, useState } from "react";
import Navbar from "./sub-components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { changePasswordSchema } from "@/validations/zodSchemas";
import { ZodError } from "zod";
import { chnagePassword, clearAllUserErrors, resetProfile } from "@/store/slices/userSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons
import { Input } from "@/components/ui/input";


export default function UpdatePassword() {
  const [activeTab, setActiveTab] = useState("profile");
  const dispatch = useDispatch<AppDispatch>();
  const { loading, isUpdated, message, error} = useSelector((state: RootState) => state.user);

  // form state
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // ✅ validate with zod
      const parsed = changePasswordSchema.parse(formData);

      // dispatch thunk
      dispatch(chnagePassword(parsed.currentPassword, parsed.newPassword, parsed.confirmNewPassword));
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: typeof errors = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as keyof typeof errors;
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  useEffect(()=>{
    if(error){
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
    if(isUpdated){
      toast.success(message);
      dispatch(resetProfile());
    }
  },[loading, isUpdated, error])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Form Section */}
      <div className="flex justify-center mt-8 px-4">
        <div className="bg-white shadow-md rounded-xl w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">
            Update Password
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Current Password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-300"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-300"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-300"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-700 text-white rounded-lg py-2 font-medium hover:bg-violet-800 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
