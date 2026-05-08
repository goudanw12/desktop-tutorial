export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  coverImage: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  user: UserProfile;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  user: UserProfile;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: UserProfile;
  content: string;
  type: 'text' | 'image' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  members: UserProfile[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  user?: UserProfile;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  user: UserProfile;
  image: string;
  createdAt: string;
  isViewed: boolean;
}
