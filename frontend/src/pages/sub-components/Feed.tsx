import PostCard from "./PostCard";

export default function Feed() {
  const posts = [
    {
      id: 1,
      user: { name: "Alex Johnson", avatar: "/avatars/alex.png" },
      content: "Just launched my first MERN project 🚀",
      image: "/posts/project.png",
      timestamp: "2h ago",
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      user: { name: "Sarah Lee", avatar: "/avatars/sarah.png" },
      content: "Beautiful sunset today 🌅",
      image: "/posts/sunset.png",
      timestamp: "4h ago",
      likes: 25,
      comments: 5,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 bg-gray-100 min-h-screen">
      {posts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </div>
  );
}
