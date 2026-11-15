import { createContext, useContext, useState, useCallback } from 'react';

const AuthCtx = createContext(null);

const read = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(read);

  const login = useCallback((token, u) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
