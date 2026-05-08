import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { post, get } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, code: string) => Promise<void>;
  loginWithQQ: (qqOpenId: string, nickname: string, avatar?: string) => Promise<void>;
  sendSmsCode: (phone: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

function mapApiUser(u: any): UserProfile {
  return {
    id: u.id,
    username: u.username,
    email: u.email || '',
    avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
    bio: u.bio || '',
    coverImage: `https://picsum.photos/seed/cover${u.id}/800/300`,
    followersCount: u.followerCount || u.followersCount || 0,
    followingCount: u.followingCount || 0,
    postsCount: u.postCount || u.postsCount || 0,
    isVerified: !!u.is_verified,
  };
}

function handleAuthResponse(data: { token: string; user: any }) {
  localStorage.setItem('token', data.token);
  return { user: mapApiUser(data.user), token: data.token };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/login', { email, password });
      const { user, token } = handleAuthResponse(res.data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithPhone: async (phone: string, code: string) => {
    set({ isLoading: true });
    try {
      const res = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/sms/login', { phone, code });
      const { user, token } = handleAuthResponse(res.data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithQQ: async (qqOpenId: string, nickname: string, avatar?: string) => {
    set({ isLoading: true });
    try {
      const res = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/oauth/qq', { qqOpenId, nickname, avatar });
      const { user, token } = handleAuthResponse(res.data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  sendSmsCode: async (phone: string) => {
    await post<{ success: boolean; data: { message: string } }>('/auth/sms/send', { phone });
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/register', { username, email, password });
      const { user, token } = handleAuthResponse(res.data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
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
      if (!token) {
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
