import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./sub-components/Navbar";
import { AppDispatch, RootState } from "@/store/store";
import {
  clearAllUserErrors,
  resetProfile,
  updateProfile,
} from "@/store/slices/userSlice";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UpdateProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, message, isUpdated, user } = useSelector(
    (state: RootState) => state.user
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", name);
    formData.append("email", email);
    formData.append("bio", bio);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    console.log(formData);

    dispatch(updateProfile(formData)); // avatar handled by backend if required
  };

  useEffect(()=>{
    console.log(user)
     if(user){
      setName(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
    }
  },[user,isUpdated])

  // ✅ Handle success & errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
    if (isUpdated) {
      toast.success(message);
      dispatch(resetProfile());
    }
    return () => {
      if (avatar) {
        URL.revokeObjectURL(URL.createObjectURL(avatar));
      }
    };
  }, [error, message, isUpdated, loading, avatar]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="profile" setActiveTab={() => {}} />

      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Update Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              required
              autoComplete="email"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              placeholder="Write a short bio..."
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Avatar Image
            </label>

            {/* Preview container */}
            <div className="mt-3 flex flex-col gap-3">
              <div className="w-full max-h-80 overflow-hidden rounded-lg border">
                <img
                  src={
                    avatar
                      ? URL.createObjectURL(avatar) // show uploaded preview
                      : user?.avatarUrl || "/default-avatar.png" // fallback to current user avatar
                  }
                  alt="Avatar Preview"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* File upload input */}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setAvatar(e.target.files ? e.target.files[0] : null)
                }
                className="text-sm text-gray-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-700 text-white py-2 px-4 rounded-lg hover:bg-violet-800 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
