import { create } from "zustand";

const userInfo = create((set, get) => {
  let username = ""

  if (typeof window !== "undefined") {
    username = localStorage.getItem("username") || 1;
  }
  return {
    username: username,
    setusername: (username) => set(() => ({ username: username })),
    auth: false,
    setAuth: () => set((state) => ({ auth: !state.auth })),
    authToken: "",
    setAuthToken: (token) => set(() => ({ authToken: token }))    
  };
});

export default userInfo;
