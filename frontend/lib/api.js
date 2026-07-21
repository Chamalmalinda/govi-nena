const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const authAPI = {
  register: async ({ name, phone, district, password }) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, district, password })
    });
    return res.json();
  },

  login: async ({ phone, password }) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    return res.json();
  },

  getMe: async (token) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};