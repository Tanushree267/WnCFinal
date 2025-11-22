// src/pages/Favourite.jsx
import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Favourite = () => {
  const { axios, user } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/favorite/user", {
        userId: user.email
      });
      if (data.success) {
        setMovies(data.movies || []);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setMovies([]);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (movies.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-center">NO movies available</h1>
      </div>
    );

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh] ">
      <h1 className="text-lg font-medium my-4">Your Favourite Movies</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  );
};

export default Favourite;