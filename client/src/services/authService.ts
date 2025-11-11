import { User } from '@/types/onboarding';
import api from './api';

export const login = async (email: string, password: string, isAdmin = false): Promise<{ user: User; token: string }> => {
  try {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const response = await api.post(endpoint, { email, senha: password });
    let { user, token } = response.data.data;
    
    // Mapear 'role' para 'tipo' se necessário
    if (user.role && !user.tipo) {
      user.tipo = user.role === 'admin' ? 'admin' : 'usuario';
    }
    
    return { user, token };
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao fazer login';
    throw new Error(message);
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const register = async (nome: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/register', { nome, email, senha: password });
    let { user, token } = response.data.data;
    
    // Mapear 'role' para 'tipo' se necessário
    if (user.role && !user.tipo) {
      user.tipo = user.role === 'admin' ? 'admin' : 'usuario';
    }
    
    return { user, token };
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao registrar';
    throw new Error(message);
  }
};
