import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/mockApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  const value = useMemo(
    () => ({
      ...session,
      async login(username) {
        const result = await api.login(username);
        setSession(result);
        return result;
      },
      async logout() {
        if (session?.token) await api.logout(session.token);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth ต้องใช้ภายใน AuthProvider');
  return context;
}
