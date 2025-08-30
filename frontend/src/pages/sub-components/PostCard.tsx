import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";

interface PostCardProps {
  user: { name: string; avatar: string };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export default function PostCard({
  user,
  content,
  image,
  timestamp,
  likes,
  comments,
}: PostCardProps) {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{user.name}</p>
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
        </div>
        <button aria-label="Post options">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <p className="mt-3 text-gray-800 text-sm">{content}</p>
      {image && (
        <img
          src={image}
          alt="Post"
          className="mt-3 rounded-lg max-h-96 w-full object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex gap-8 mt-4 text-gray-600">
        <button
          aria-label="Like post"
          className="flex items-center gap-2 hover:text-red-500"
        >
          <Heart className="w-5 h-5" /> {likes}
        </button>
        <button
          aria-label="Comment on post"
          className="flex items-center gap-2 hover:text-blue-500"
        >
          <MessageCircle className="w-5 h-5" /> {comments}
        </button>
        <button
          aria-label="Share post"
          className="flex items-center gap-2 hover:text-green-500"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
