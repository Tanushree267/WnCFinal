// src/components/MovieCard.jsx
import React from "react";
import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import timeFormat from "../lib/timeFormat";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  const getBackdrop = () => {
    const path = movie.backdrop_path;
    if (!path) return "/images/placeholder-movie.png";
    if (path.startsWith("http")) return path;
    return `${image_base_url}${path}`;
  };

  const openDetails = () => {
    navigate(`/movies/${movie._id}`);
    scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-67">

      <img
        onClick={openDetails}
        src={getBackdrop()}
        alt={movie.title}
        className="rounded-lg h-65 w-full object-cover cursor-pointer"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/images/placeholder-movie.png";
        }}
      />

      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      <p className="text-gray-400 text-sm mt-2">
        {movie.release_date?.split("-")[0] || ""} |
        {" "}
        {Array.isArray(movie.genres) ? movie.genres.slice(0, 2).join(" | ") : ""} |
        {" "}
        {timeFormat(movie.runtime)}
      </p>

      <div className="flex items-center justify-between mt-4 pb-3">
        <button
          onClick={openDetails}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {movie.vote_average?.toFixed(1) || "0.0"}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;

