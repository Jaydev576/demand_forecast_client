import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, companyName?: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    if(!localStorage.getItem('auth_token')) {
      setLoading(false);
      return;
    }
    
     const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      }
    })

    if (!res.ok) {
      setLoading(false);
      return;
    }

    const data = await res.json();
    setUser(data);
    setLoading(false);
  }

  const signUp = async (email: string, password: string, companyName?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username: companyName }),
      });

      const data = await response.json();
      if (response.ok) {
        await getUser()
        return { error: null };
      }
      return { error: data };
    } catch (error) {
      return { error: new Error('Failed to connect to the server.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('auth_token', data.access_token);
        await getUser()
        return { error: null };
      }
      return { error: data };
    } catch (error) {
      return { error: new Error('Failed to connect to the server.') };
    }
  };

  const signOut = async () => { 
    localStorage.removeItem('auth_token');
    localStorage.removeItem('lastForecastResult');
    localStorage.removeItem('recentForecasts');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
