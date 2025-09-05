export interface Comment{
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