import { create } from 'zustand';

const useUserStore = create((set) => ({
  userId: localStorage.getItem('userId') || null,
  userName: localStorage.getItem('userName') || '',
  totalRewards: 0,
  
  setUser: (id, name) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    set({ userId: id, userName: name });
  },
  
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    set({ userId: null, userName: '' });
  },

  updateRewards: (count) => set({ totalRewards: count }),
}));

export default useUserStore;
