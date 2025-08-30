import Navbar from "./sub-components/Navbar";
import { useState } from "react";

export default function UpdateProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create form data (in case avatar file needs upload)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("bio", bio);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    // TODO: Send to backend (API call)
    console.log("Update Profile Data:", { name, email, bio, avatar });
  };

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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setAvatar(e.target.files ? e.target.files[0] : null)
              }
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-violet-700 text-white py-2 px-4 rounded-lg hover:bg-violet-800 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

