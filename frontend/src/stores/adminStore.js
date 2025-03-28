import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (username, password) => {
        // In a real application, this would make an API call
        if (username === 'admin' && password === 'admin') {
          set({ 
            isAuthenticated: true,
            user: { username: 'admin', role: 'admin' }
          });
          return true;
        }
        throw new Error('Invalid credentials');
      },

      logout: () => {
        set({ 
          isAuthenticated: false,
          user: null
        });
      }
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);