// Local: src/features/auth/context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, LoginCredentials, SignUpCredentials, UserProfile } from '../types';
import { baserow } from '../../../shared/services/baserowClient';
import bcrypt from 'bcryptjs';

const USERS_TABLE_ID = '711';
const SALT_ROUNDS = 10;

interface AuthContextType extends AuthState {
  error: string | null;
  signUp: (credentials: SignUpCredentials) => Promise<UserProfile | null>;
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (newProfileData: Partial<UserProfile>) => void;
  refetchProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        setAuthState({
          profile: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Falha ao carregar perfil do localStorage", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateProfile = (newProfileData: Partial<UserProfile>) => {
    setAuthState(prev => {
        if (!prev.profile) return prev;
        const updatedProfile = { ...prev.profile, ...newProfileData };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        return { ...prev, profile: updatedProfile };
    });
  };

  const refetchProfile = useCallback(async () => {
    if (!authState.profile?.id) {
      console.warn("Tentativa de re-sincronizar perfil sem usuário logado.");
      return;
    }
    try {
      const freshProfileData = await baserow.getRow(USERS_TABLE_ID, authState.profile.id);
      
      const userProfile: UserProfile = {
        id: freshProfileData.id,
        nome: freshProfileData.nome,
        email: freshProfileData.Email,
        empresa: freshProfileData.empresa,
        telefone: freshProfileData.telefone,
        avatar_url: freshProfileData.avatar_url || null,
        google_refresh_token: freshProfileData.google_refresh_token || null,
      };

      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setAuthState(prev => ({ ...prev, profile: userProfile }));
    } catch (error) {
      console.error("Erro ao re-sincronizar o perfil do usuário:", error);
    }
  }, [authState.profile?.id]);

  const signUp = async (credentials: SignUpCredentials): Promise<UserProfile | null> => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const emailLowerCase = credentials.email.toLowerCase();
      const { results: allUsers } = await baserow.get(USERS_TABLE_ID, `?filter__Email__equal=${emailLowerCase}`);
      
      if (allUsers && allUsers.length > 0) {
        throw new Error('Este e-mail já está cadastrado.');
      }

      const hashedPassword = await bcrypt.hash(credentials.password, SALT_ROUNDS);
      
      const dataToPost = {
        nome: credentials.nome,
        empresa: credentials.empresa,
        telefone: credentials.telefone,
        Email: emailLowerCase,
        senha_hash: hashedPassword,
      };

      const createdUser = await baserow.post(USERS_TABLE_ID, dataToPost);
      const userProfile: UserProfile = {
        id: createdUser.id,
        nome: createdUser.nome,
        email: createdUser.Email,
        empresa: createdUser.empresa,
        telefone: createdUser.telefone,
        avatar_url: createdUser.avatar_url || null,
      };
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return userProfile;
    } catch (error: any) {
      setAuthError(error.message || 'Ocorreu um erro. Tente novamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }; // <- A CHAVE FALTANTE ESTAVA AQUI

  const signIn = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const emailLowerCase = credentials.email.toLowerCase();
      
      const { results: allUsers } = await baserow.get(USERS_TABLE_ID, `?filter__Email__equal=${emailLowerCase}`);
      const user = allUsers && allUsers[0];

      if (!user) {
        throw new Error('E-mail ou senha inválidos.');
      }

      const storedHash = user.senha_hash;
      if (!storedHash) {
          throw new Error('Conta inválida. Por favor, contate o suporte ou crie uma nova conta.');
      }
      
      const passwordMatches = await bcrypt.compare(credentials.password, storedHash);

      if (passwordMatches) {
        const userProfile: UserProfile = {
          id: user.id,
          nome: user.nome,
          email: user.Email,
          empresa: user.empresa,
          telefone: user.telefone,
          avatar_url: user.avatar_url || null,
          google_refresh_token: user.google_refresh_token || null,
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        setAuthState({ profile: userProfile, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        throw new Error('E-mail ou senha inválidos.');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Ocorreu um erro. Tente novamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const signOut = () => {
    localStorage.clear();
    setAuthState({ profile: null, isAuthenticated: false, isLoading: false });
  };

  const value = {
    ...authState,
    error: authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};