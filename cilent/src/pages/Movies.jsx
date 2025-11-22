// src/pages/Movies.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import MovieCard from "../components/MovieCard";
import MovieSearch from "../components/MovieSearch";

const Movies = () => {
  const { axios } = useAppContext();
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);

  // Fetch all upcoming shows (populated with movie) and derive unique movies
  const fetchAllMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        const shows = data.shows || [];

        // Build unique movies list from shows (only movies that have at least one upcoming show)
        const seen = new Set();
        const uniqueMovies = [];
        for (const show of shows) {
          const m = show.movie;
          if (!m || !m._id) continue;
          if (!seen.has(m._id)) {
            seen.add(m._id);
            uniqueMovies.push(m);
          }
        }

        setMovies(uniqueMovies);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResults = (results) => {
    if (results === null) {
      // clear search -> reload default list
      fetchAllMovies();
      setSearching(false);
      return;
    }
    setMovies(results);
    setSearching(true);
  };

  useEffect(() => {
    fetchAllMovies();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-6 md:px-16 lg:px-40 pt-40 gap-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl animate-pulse h-80 w-full"
          ></div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-center">No movies available</h1>
      </div>
    );
  }

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh] ">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium">Now Showing</h1>
        <MovieSearch axios={axios} onResults={handleSearchResults} />
      </div>

      <div className="flex flex-wrap max-sm:justify-center gap-6">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>

      {searching && movies.length === 0 && (
        <p className="text-center w-full mt-8">No movies found matching your search.</p>
      )}
    </div>
  );
};

export default Movies;

