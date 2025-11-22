// src/context/AppContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = "http://localhost:3000";

// 🔥 ATTACH TOKEN TO ALL REQUESTS AUTOMATICALLY
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // load saved data
  const savedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const savedToken = localStorage.getItem("token") || "";

  const [user, setUserState] = useState(savedUser);
  const [token, setToken] = useState(savedToken);

  const [shows, setShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL ?? "";

  // 👉 FINAL ADMIN CHECK
  const isAdmin = user?.role === "admin";

  // fetch movies for user homepage
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing");
      if (data.success) {
        setShows(data.movies ?? []);
      } else {
        toast.error(data.message || "Failed to fetch shows");
        setShows([]);
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
      setShows([]);
    } finally {
      setShowsLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // helper to get token
  const getToken = async () => {
    return token || localStorage.getItem("token") || "";
  };

  // save auth after login/register
  const saveAuth = ({ token: newToken, user: newUser }) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("token");
      setToken("");
    }

    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserState(newUser);
    } else {
      localStorage.removeItem("user");
      setUserState(null);
    }
  };

  // logout
  const logout = () => {
    saveAuth({ token: "", user: null });
    navigate("/");
  };

  // compatibility setter
  const setUser = (u) => saveAuth({ token, user: u });

  const value = {
    navigate,
    user,
    setUser,
    saveAuth,
    logout,
    axios,
    shows,
    image_base_url,
    getToken,
    showsLoading,
    isAdmin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

