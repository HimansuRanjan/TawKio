import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostCard from "./PostCard";
import { AppDispatch, RootState } from "@/store/store";
import { getAllPosts } from "@/store/slices/postSlice";

export default function Feed() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, nextCursor, loading, postError } = useSelector(
    (state: RootState) => state.post
  );

  useEffect(() => {
    if (posts?.length === 0) {
      dispatch(getAllPosts(undefined, 5)); // fetch initial posts
    }
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Loading */}
      {loading && <p className="text-center text-gray-500">Loading posts...</p>}

      {/* Error */}
      {postError && (
        <p className="text-center text-red-500">
          Failed to load posts: {postError}
        </p>
      )}

      {/* Posts */}
      {posts && posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          user={{name:post.author.username || "", avatar: post.author.avatarUrl || ""}}
          content={post.content}
          image={post.imageUrl || ""}
          timestamp={post.createdAt}
          likes={post.likes.length}
          comments={post.comments.length}
          
        />
      ))}

      {/* Load More */}
      {nextCursor && (
        <div className="flex justify-center">
          <button
            onClick={() => dispatch(getAllPosts(nextCursor, 5))}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
