import { AppDispatch, RootState } from "@/store/store";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAllPostErrors, getPostsByUser } from "@/store/slices/postSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import axios from "axios";
import { createConversation } from "@/store/slices/messageSlice";

const app_url = import.meta.env.VITE_SERVER_URL || "";

interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
}

export default function OtherProfile() {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const { userId } = useParams<{ userId: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { posts, postError } = useSelector((state: RootState) => state.post);
  const { messageStatus } = useSelector((state: RootState) => state.message);

  useEffect(() => {
    // Redirect if user clicks on their own profile
    if (user?.id === userId) {
      navigate("/profile");
      return;
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${app_url}/v.1/api/user/${userId}`, {
          withCredentials: true, // send cookies/credentials
        });
        setProfileUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    if (userId) {
      fetchUser();
      dispatch(getPostsByUser(userId));
    }
  }, [user?.id, userId, dispatch, navigate]);

  useEffect(() => {
    if (postError) {
      if (postError !== "Post not found") {
        toast.error(postError);
      }
      dispatch(clearAllPostErrors());
    }
  }, [postError, dispatch]);

  const handleMessageClick = async (userId:string) => {
    try {
      // create a new conversation with the other user
      await dispatch(createConversation([userId]));
      
      // redirect to chat window for this conversation
      navigate(`/messages/${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="profile" setActiveTab={() => {}} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <img
              src={profileUser?.avatarUrl ? profileUser.avatarUrl : "user.jpg"}
              alt={profileUser?.username}
              className="w-28 h-28 rounded-full object-cover cursor-pointer"
              onClick={() => setShowAvatarModal(true)}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profileUser?.username}
              </h2>
              <p className="text-gray-600 mt-2">{profileUser?.bio}</p>
            </div>
          </div>

          {/* Add Post Button */}
          <Button
            onClick={() => handleMessageClick(profileUser?.id || "")}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            Message
          </Button>
        </div>

        {/* Posts Section */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Posts</h3>
        <hr className="border-gray-300 mb-4" />

        {posts?.length === 0 ? (
          <p className="text-gray-500 text-center">No posts yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts?.map((post) => (
              <img
                key={post.id}
                src={post.imageUrl || "banner.png"}
                alt="Post"
                className="w-full h-40 object-cover cursor-pointer hover:opacity-90"
                onClick={() => navigate(`/view/post/${post.id}`)}
              />
            ))}
          </div>
        )}
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
              src={user.avatarUrl}
              alt={user.username}
              className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
