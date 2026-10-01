import { Usuario, RolUsuario } from '../types';
import { MOCK_USUARIOS } from './mock-data';

const STORAGE_KEY = 'sfs_service_desk_auth_user';
const USERS_STORAGE_KEY = 'sfs_service_desk_users';

export function getStoredUsers(): Usuario[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error al leer usuarios de localStorage', e);
  }
  return MOCK_USUARIOS;
}

export function saveStoredUsers(users: Usuario[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error al guardar usuarios en localStorage', e);
  }
}

export function getCurrentUser(): Usuario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw) as Usuario;
      return user;
    }
  } catch (e) {
    console.error('Error al leer usuario actual', e);
  }
  // Default demo user: Mariana Salazar (Supervisor / Admin) for instant preview, or Santiago Ochoa for client
  const users = getStoredUsers();
  return users[0] || null;
}

export function setCurrentUser(user: Usuario | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error al persistir usuario actual', e);
  }
}

export interface LoginResult {
  success: boolean;
  user?: Usuario;
  error?: string;
  redirectTo?: string;
}

export function login(email: string, password: string): Promise<LoginResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const users = getStoredUsers();
      
      // Look for user by email
      const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!foundUser) {
        resolve({
          success: false,
          error: 'Credenciales inválidas. Correo electrónico no registrado en SFS Service Desk.',
        });
        return;
      }

      if (!foundUser.activo) {
        resolve({
          success: false,
          error: 'Su cuenta se encuentra inactiva. Comuníquese con el administrador de SFS.',
        });
        return;
      }

      // Password check simulation: accepts password "sfs2026" or any password > 3 chars for easy demo
      if (password.length < 3) {
        resolve({
          success: false,
          error: 'La contraseña debe tener al menos 3 caracteres.',
        });
        return;
      }

      setCurrentUser(foundUser);

      // Determine redirect path by role
      let redirectTo = '/consola/bandeja';
      if (foundUser.rol === 'cliente') {
        redirectTo = '/portal';
      }

      resolve({
        success: true,
        user: foundUser,
        redirectTo,
      });
    }, 350);
  });
}

export function logout(): void {
  setCurrentUser(null);
}

export function hasRole(user: Usuario | null, allowedRoles: RolUsuario[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.rol);
}

export function changePassword(userId: string, _currentPass: string, _newPass: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        users[idx].requiereCambioPassword = false;
        saveStoredUsers(users);
      }
      resolve(true);
    }, 400);
  });
}
