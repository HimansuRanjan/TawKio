import Navbar from "./sub-components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function ViewPostComment() {
  const { id } = useParams<{ id: string }>();
  const [comments, setComments] = useState([
    { id: 1, user: "Alice", text: "Nice post!" },
    { id: 2, user: "Bob", text: "Looks great 🔥" },
    { id: 3, user: "Charlie", text: "Waiting for more content 🚀" },
  ]);

  // Dummy post data (replace with backend later)
  const post = {
    id,
    user: { name: "Himansu Ranjan Patra", avatar: "banner.png" },
    timestamp: "2 hours ago",
    content: "This is my post content — building TawKio 🚀",
    image: "banner.png",
    likes: 42,
    comments: 12,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="home" setActiveTab={() => {}} />

      <div className="max-w-2xl mx-auto mt-6 bg-white shadow rounded-xl p-4">
        {/* Post Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.user.name}</p>
              <span className="text-xs text-gray-500">{post.timestamp}</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Post options"
            className="p-1 rounded hover:bg-gray-100"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <p className="mt-3 text-gray-800 text-sm">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post"
            className="mt-3 rounded-lg max-h-96 w-full object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex gap-8 mt-4 text-gray-600">
          <button
            type="button"
            aria-label="Like this post"
            className="flex items-center gap-2 hover:text-red-500"
          >
            <Heart className="w-5 h-5" /> {post.likes}
          </button>
          <button
            type="button"
            aria-label="View comments"
            className="flex items-center gap-2 hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5" /> {post.comments}
          </button>
          <button
            type="button"
            aria-label="Share this post"
            className="flex items-center gap-2 hover:text-green-500"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-2xl mx-auto mt-4 bg-white shadow rounded-xl p-4">
        <h3 className="text-md font-semibold mb-3 text-gray-700">Comments</h3>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 items-start">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{c.user[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{c.user}</p>
                <p className="text-sm text-gray-600">{c.text}</p>
              </div>
            </div>
          ))}

          {/* Placeholder for infinite scroll later */}
          <button
            type="button"
            aria-label="Load more comments"
            className="text-sm text-violet-700 hover:underline"
          >
            Load more comments
          </button>
        </div>
      </div>
    </div>
  );
}
