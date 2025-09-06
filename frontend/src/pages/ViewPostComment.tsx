import Navbar from "./sub-components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  clearAllPostErrors,
  deletePost,
  getPostsById,
  likePost,
} from "@/store/slices/postSlice";
import { toast } from "react-toastify";
import { Post } from "@/types/posts";
import { Button } from "@/components/ui/button";
import {
  addNewComment,
  clearAllCommentErrors,
} from "@/store/slices/commentSlice";

export default function ViewPostComment() {
  const { id } = useParams<{ id: string }>();

  const navigateTo = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { posts, postError, message } = useSelector(
    (state: RootState) => state.post
  );
  const { commentError, commentLoading, commentMessage } = useSelector(
    (state: RootState) => state.comment
  );

  // Replace with actual logged-in user
  const loggedInUser = useSelector((state: RootState) => state.user.user);

  const [post, setPost] = useState<Post | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [newComment, setNewComment] = useState("");
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const optionMenuRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    dispatch(likePost(id || ""));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareMenu(true);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    dispatch(addNewComment(post?.id || "", newComment));
  };

  const handeDeletePost = () => {
    dispatch(deletePost(post?.id || ""));
    navigateTo("/profile");
  };

  // Close share menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
      if (
        optionMenuRef.current &&
        !optionMenuRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(getPostsById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (posts.length > 0) {
      setPost(posts[0]); // assuming getPostsById returns an array
    }
  }, [posts, dispatch]);

  useEffect(() => {
    if (postError) {
      toast.error(postError);
      dispatch(clearAllPostErrors());
    }

    if (message) {
      toast.success(message);
    }
  }, [postError, message, dispatch]);

  useEffect(() => {
    if (commentError) {
      toast.error(commentError);
      dispatch(clearAllCommentErrors());
    }

    if (commentMessage) {
      toast.success(commentMessage);
    }
  }, [commentError, commentMessage, dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="home" setActiveTab={() => {}} />

      <div className="max-w-2xl mx-auto mt-6 bg-white shadow rounded-xl p-4 relative">
        {/* Post Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage
                src={post?.imageUrl || "banner.png"}
                alt={post?.author.username}
              />
              <AvatarFallback>{post?.author.username}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post?.author.username}</p>
              <span className="text-xs text-gray-500">{post?.createdAt}</span>
            </div>
          </div>

          {/* Options menu only for post owner */}
          {loggedInUser?.id === post?.author.id && (
            <div className="relative" ref={optionMenuRef}>
              <button
                type="button"
                aria-label="Post options"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setShowOptions((prev) => !prev)}
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md z-50">
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={()=>navigateTo(`/post/update/${post?.id}`)}
                  >
                    Update Post
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-600"
                    onClick={handeDeletePost}
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="mt-3 text-gray-800 text-sm">{post?.content}</p>
        {post?.linkUrl && (
          <p className="mt-3 text-gray-800 text-sm">
            Link:{" "}
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline"
            >
              {post.linkUrl}
            </a>
          </p>
        )}

        {post?.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="mt-3 rounded-lg max-h-96 w-full object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex justify-between mt-4 text-gray-600 relative">
          {/* Left: Like */}
          <button
            type="button"
            aria-label="Like this post"
            className="flex items-center gap-2 hover:text-red-500"
            onClick={handleLike}
          >
            <Heart className="w-5 h-5" /> {post?.likes.length}
          </button>

          {/* Center: Comment */}
          <button
            type="button"
            aria-label="View comments"
            className="flex items-center gap-2 hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5" /> {post?.comments.length}
          </button>

          {/* Right: Share */}
          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              aria-label="Share this post"
              className="flex items-center gap-2 hover:text-green-500"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Floating Share Menu */}
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
      </div>

      {/* Comments Section */}
      <div className="max-w-2xl mx-auto mt-4 bg-white shadow rounded-xl p-4">
        <h3 className="text-md font-semibold mb-3 text-gray-700">Comments</h3>

        {/* Input for new comment */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-violet-300"
          />
          <Button onClick={handleAddComment}>
            {commentLoading ? "Adding Comment" : "Comment"}
          </Button>
        </div>

        {/* List of comments */}
        <div className="space-y-3">
          {post?.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={comment.author.avatarUrl || "banner.png"}
                  alt={comment.author.username}
                />
                <AvatarFallback>{comment.authorId}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{comment.author.username}</p>
                <p className="text-sm text-gray-600">{comment.content}</p>
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
