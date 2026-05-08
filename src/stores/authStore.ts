import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { post, get } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const MOCK_USER: UserProfile = {
  id: '1',
  username: '小明',
  email: 'xiaoming@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  bio: '热爱生活，分享美好 ✨',
  coverImage: 'https://picsum.photos/seed/cover1/800/300',
  followersCount: 128,
  followingCount: 256,
  postsCount: 42,
};

function mapApiUser(u: any): UserProfile {
  return {
    id: u.id,
    username: u.username,
    email: u.email || '',
    avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
    bio: u.bio || '',
    coverImage: `https://picsum.photos/seed/cover${u.id}/800/300`,
    followersCount: u.followerCount || u.followersCount || 0,
    followingCount: u.followingCount || 0,
    postsCount: u.postCount || u.postsCount || 0,
    isVerified: !!u.is_verified,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/login', { email, password });
      localStorage.setItem('token', data.data.token);
      set({ user: mapApiUser(data.data.user), token: data.data.token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.setItem('token', 'mock-token');
      set({ user: MOCK_USER, token: 'mock-token', isAuthenticated: true, isLoading: false });
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/register', { username, email, password });
      localStorage.setItem('token', data.data.token);
      set({ user: mapApiUser(data.data.user), token: data.data.token, isAuthenticated: true, isLoading: false });
    } catch {
      const newUser: UserProfile = { ...MOCK_USER, username, email };
      localStorage.setItem('token', 'mock-token');
      set({ user: newUser, token: 'mock-token', isAuthenticated: true, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const data = await get<{ success: boolean; data: any }>('/auth/me');
      set({ user: mapApiUser(data.data), isAuthenticated: true });
    } catch {
      const token = localStorage.getItem('token');
      if (token) {
        set({ user: MOCK_USER, isAuthenticated: true });
      }
    }
  },
}));
