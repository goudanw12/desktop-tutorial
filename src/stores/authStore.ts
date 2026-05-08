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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await post<{ token: string; user: UserProfile }>('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.setItem('token', 'mock-token');
      set({ user: MOCK_USER, token: 'mock-token', isAuthenticated: true, isLoading: false });
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await post<{ token: string; user: UserProfile }>('/auth/register', { username, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
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
      const data = await get<UserProfile>('/auth/me');
      set({ user: data, isAuthenticated: true });
    } catch {
      const token = localStorage.getItem('token');
      if (token) {
        set({ user: MOCK_USER, isAuthenticated: true });
      }
    }
  },
}));
