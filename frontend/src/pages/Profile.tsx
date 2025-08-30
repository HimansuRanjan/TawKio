import Navbar from "./sub-components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const navigate = useNavigate();

  // Dummy user (replace with real data from API later)
  const user = {
    name: "Himansu Ranjan Patra",
    bio: "Building TawKio 🚀 | MERN & Postgres Dev",
    avatar: "banner.png",
  };

  // Dummy posts (replace with backend data)
  const posts = [
    { id: 1, image: "banner.png" },
    { id: 2, image: "banner.png" },
    { id: 3, image: "banner.png" },
    { id: 4, image: "banner.png" },
    { id: 5, image: "banner.png" },
    { id: 6, image: "banner.png" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="profile" setActiveTab={() => {}} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-28 h-28 rounded-full object-cover cursor-pointer"
            onClick={() => setShowAvatarModal(true)}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600 mt-2">{user.bio}</p>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => (
            <img
              key={post.id}
              src={post.image}
              alt="Post"
              className="w-full h-40 object-cover cursor-pointer hover:opacity-90"
              onClick={() => navigate(`/view/post/${post.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAvatarModal(false)} // Close on background click
        >
          <div
            className="relative bg-white rounded-xl shadow-lg p-2"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>

            {/* Enlarged Avatar */}
            <img
              src={user.avatar}
              alt={user.name}
              className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
