interface Comment{
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface Like{
  id: string,
  userId: string,
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  comments: Comment[];
  likes: Like[];
}