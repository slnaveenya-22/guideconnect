import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, verify it with /auth/me
  useEffect(() => {
    const token = localStorage.getItem('gc_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('gc_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('gc_token');
        localStorage.removeItem('gc_user');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('gc_token', token);
    localStorage.setItem('gc_user', JSON.stringify(user));
    setUser(user);
    return user;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    return res.data.data;
  }

  async function loginWithGoogle(idToken, role = 'TOURIST') {
  const res = await api.post('/auth/google', { idToken, role });
  const { token, user } = res.data.data;
  localStorage.setItem('gc_token', token);
  localStorage.setItem('gc_user', JSON.stringify(user));
  setUser(user);
  return user;
}

  function logout() {
    localStorage.removeItem('gc_token');
    localStorage.removeItem('gc_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}