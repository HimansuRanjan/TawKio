import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Facebook,
  Twitter,
  Mail,
} from "lucide-react";
import { FaWhatsapp, FaDiscord } from "react-icons/fa";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { clearAllPostErrors, likePost } from "@/store/slices/postSlice";
import { toast } from "react-toastify";
import { addNewComment, clearAllCommentErrors } from "@/store/slices/commentSlice";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  postId: string;
  user: { id:string, name: string; avatar: string };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export default function PostCard({
  postId,
  user,
  content,
  image,
  timestamp,
  likes,
  comments,
}: PostCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");

  const shareMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { postError, message } = useSelector((state: RootState) => state.post);
  const {commentError, commentMessage, commentLoading} = useSelector((state: RootState) => state.comment)

  const navigateTo = useNavigate();

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = () => {
    dispatch(likePost(postId));
  };

  useEffect(() => {
    if (postError) {
      toast.error(postError);
      dispatch(clearAllPostErrors());
    }

    if (message) {
      toast.success(message);
    }
  }, [message, postError, dispatch]);

  useEffect(() => {
    if (commentError) {
      toast.error(commentError);
      dispatch(clearAllCommentErrors());
    }

    if (commentMessage) {
      toast.success(commentMessage);
    }
  }, [commentMessage, commentError,commentLoading, dispatch]);

  const handleCommentClick = () => {
    setShowCommentBox((prev) => !prev);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    dispatch(addNewComment(postId, newComment));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareMenu(true);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleProfileClick = () =>{
    navigateTo(`/profile/${user.id}`);
  }

  return (
    <div className="bg-white shadow rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center hover:cursor-pointer"
        onClick={handleProfileClick}>
          <Avatar>
            <AvatarImage src={user.avatar || "user.jpg"} alt={user.name} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.name}</p>
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
        </div>
        <div className="relative" ref={optionsMenuRef}>
          <button
            aria-label="Post options"
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setShowOptionsMenu((prev) => !prev)}
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl z-50 p-2">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                Don’t recommend this post
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                Recommend posts from user
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                Hide it
              </button>
            </div>
          )}
        </div>
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
      <div className="flex justify-between mt-4 text-gray-600 relative">
        {/* Like */}
        <button
          type="button"
          aria-label="Like post"
          className="flex items-center gap-2 hover:text-red-500"
          onClick={handleLike}
        >
          <Heart className="w-5 h-5" /> {likes}
        </button>

        {/* Comment */}
        <button
          type="button"
          aria-label="Comment on post"
          className="flex items-center gap-2 hover:text-blue-500"
          onClick={handleCommentClick}
        >
          <MessageCircle className="w-5 h-5" /> {comments}
        </button>

        {/* Share */}
        <div className="relative" ref={shareMenuRef}>
          <button
            type="button"
            aria-label="Share post"
            className="flex items-center gap-2 hover:text-green-500"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </button>

          {showShareMenu && (
            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-xl p-3 flex gap-4 z-50">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600"
              >
                <FaWhatsapp />
              </a>
              <a
                href={`mailto:?subject=Check this out&body=${encodeURIComponent(
                  window.location.href
                )}`}
                className="hover:text-blue-600"
              >
                <Mail className="w-6 h-6" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-500"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <Button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="hover:text-indigo-600"
              >
                <FaDiscord />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comment box */}
      {showCommentBox && (
        <div className="mt-3 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <Button size="sm" onClick={handleAddComment}>
            {commentLoading ? "Commenting" : "Add Comment"}
          </Button>
        </div>
      )}
    </div>
  );
}
