
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalStorageService } from '@/lib/localStorage';

interface User {
  id: string;
  email: string;
  name: string;
  isLeader: boolean;
  groupId?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLeader: boolean;
  updateUser: (updates: Partial<User>) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize users from localStorage on mount
  useEffect(() => {
    const savedUsers = LocalStorageService.loadUsers();
    setUsers(savedUsers);
    setIsInitialized(true);
  }, []);

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (isInitialized) {
      LocalStorageService.saveUsers(users);
    }
  }, [users, isInitialized]);

  useEffect(() => {
    // Check for existing session on app load
    const token = LocalStorageService.loadAuthToken();
    const userData = LocalStorageService.loadUserData();
    
    if (token && userData) {
      setUser(userData);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if user exists in localStorage
      const existingUser = Object.values(users).find(u => u.email === email);
      
      if (existingUser) {
        // In a real app, you'd verify the password here
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        LocalStorageService.saveAuthToken(mockToken);
        LocalStorageService.saveUserData(existingUser);
        setUser(existingUser);
        
        return true;
      } else {
        // Create new user if not found (for demo purposes)
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0], // Use email prefix as name for demo
          isLeader: false,
          groupId: undefined,
          createdAt: new Date()
        };

        const mockToken = 'mock-jwt-token-' + Date.now();
        
        setUsers(prev => ({ ...prev, [newUser.id]: newUser }));
        LocalStorageService.saveAuthToken(mockToken);
        LocalStorageService.saveUserData(newUser);
        setUser(newUser);
        
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = Object.values(users).find(u => u.email === email);
      if (existingUser) {
        return false; // User already exists
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        isLeader: false,
        groupId: undefined,
        createdAt: new Date()
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      
      setUsers(prev => ({ ...prev, [newUser.id]: newUser }));
      LocalStorageService.saveAuthToken(mockToken);
      LocalStorageService.saveUserData(newUser);
      setUser(newUser);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    LocalStorageService.clearAll();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setUsers(prev => ({ ...prev, [user.id]: updatedUser }));
    
    // Update localStorage
    LocalStorageService.saveUserData(updatedUser);
  };

  const getAllUsers = (): User[] => {
    return Object.values(users);
  };

  const isAuthenticated = !!user;
  const isLeader = user?.isLeader || false;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      isLeader,
      updateUser,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
