import type { User } from '../types';
import { partnerUser as defaultPartnerUser } from '../mock/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  async login(email: string, password: string):Promise<{user: User, partner: User}> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }
    return { 
      user: mapBackendUserToFrontend(data.data.user),
      partner: data.data.partner ? mapBackendUserToFrontend(data.data.partner) : defaultPartnerUser
    };
  },

  async logout():Promise<void> {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Logout failed');
    }
  },

  async getCurrentUser():Promise<{user: User, partner: User}> {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Not authenticated');
    }
    return { 
      user: mapBackendUserToFrontend(data.data.user),
      partner: data.data.partner ? mapBackendUserToFrontend(data.data.partner) : defaultPartnerUser
    };
  }
};

function mapBackendUserToFrontend(backendUser: any): User {
  return {
    id: backendUser._id,
    name: backendUser.displayName,
    handle: `@${backendUser.username}`,
    avatar: backendUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.displayName)}&background=101010&color=f2f2f2`,
    status: backendUser.status || 'online',
    bio: backendUser.bio || 'Encrypted connection established.',
    encryptionFingerprint: 'A3F9-9B21-C84E-5D77', // Static for now, generated in later phases
  };
}
