import Navbar from "./sub-components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { clearAllPostErrors, getPostsById } from "@/store/slices/postSlice";
import { toast } from "react-toastify";
import { Post } from "@/types/posts";

export default function ViewPostComment() {
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const {posts, postError, loading, message} = useSelector((state: RootState) => state.post);

  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if(id){
      dispatch(getPostsById(id));
      setPost(posts[0]);
    }

    if(postError){
      toast.error(postError);
      dispatch(clearAllPostErrors());
    }

    if(message){
      toast.success(message)
    }
  }, [posts, id, postError, message, loading]);


  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="home" setActiveTab={() => {}} />

      <div className="max-w-2xl mx-auto mt-6 bg-white shadow rounded-xl p-4">
        {/* Post Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={post?.imageUrl || "banner.png"} alt={post?.author.username} />
              <AvatarFallback>{post?.author.username}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post?.author.username}</p>
              <span className="text-xs text-gray-500">{post?.createdAt}</span>
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
        <p className="mt-3 text-gray-800 text-sm">{post?.content}</p>
        {post?.imageUrl && (
          <img
            src={post.imageUrl}
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
            <Heart className="w-5 h-5" /> {post?.likes.length}
          </button>
          <button
            type="button"
            aria-label="View comments"
            className="flex items-center gap-2 hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5" /> {post?.comments.length}
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
          {post?.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <Avatar className="w-8 h-8">
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
