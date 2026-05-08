import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { post, get } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithQQ: (qqOpenId: string, nickname: string, avatar?: string) => Promise<void>;
  register: (username: string | undefined, password: string) => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
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

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/login', { username, password });
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

  register: async (username: string | undefined, password: string) => {
    set({ isLoading: true });
    try {
      const body: any = { password };
      if (username) body.username = username;
      const res = await post<{ success: boolean; data: { token: string; user: any } }>('/auth/register', body);
      const { user, token } = handleAuthResponse(res.data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  checkUsername: async (username: string): Promise<boolean> => {
    try {
      const res = await get<{ success: boolean; data: { available: boolean } }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
      return res.data.available;
    } catch {
      return false;
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
