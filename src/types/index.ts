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
}

export interface Post {
  id: string;
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
  user: UserProfile;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image';
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  user: UserProfile;
  lastMessage: string;
  unreadCount: number;
  lastMessageTime: string;
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
