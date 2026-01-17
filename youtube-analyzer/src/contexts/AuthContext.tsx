// ========== SECAO: CONTEXT DE AUTENTICACAO ==========

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ========== CREDENCIAIS ==========

const VALID_CREDENTIALS = {
  email: 'ilankriger@gmail.com',
  password: 'Aa11231123__1',
};

const STORAGE_KEY = 'yt_analyzer_auth';

// ========== TIPOS ==========

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

// ========== CONTEXT ==========

const AuthContext = createContext<AuthContextType | null>(null);

// ========== PROVIDER ==========

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar auth salvo no localStorage ao carregar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { email } = JSON.parse(saved);
        if (email) {
          setIsAuthenticated(true);
          setUserEmail(email);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Tenta fazer login com email e senha
   * Retorna true se sucesso, false se falha
   */
  const login = useCallback((email: string, password: string): boolean => {
    const emailMatch = email.toLowerCase() === VALID_CREDENTIALS.email.toLowerCase();
    const passwordMatch = password === VALID_CREDENTIALS.password;

    if (emailMatch && passwordMatch) {
      setIsAuthenticated(true);
      setUserEmail(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        email,
        timestamp: Date.now(),
      }));
      return true;
    }

    return false;
  }, []);

  /**
   * Faz logout e limpa localStorage
   */
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserEmail(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Mostrar nada enquanto verifica auth inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const value: AuthContextType = {
    isAuthenticated,
    userEmail,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ========== HOOK ==========

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
