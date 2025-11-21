// src/pages/MovieDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import { useAppContext } from "../context/AppContext";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { axios, image_base_url } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`/api/movie/${id}`)
      if (data.success) {
        setMovie(data.movie);
        setShows(data.shows || []);
      }
    } catch (err) {
      console.error("Fetch movie error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (!movie) return <div className="p-10 text-center">Loading...</div>;

  const getPoster = () => {
    const path = movie.poster_path;
    if (!path) return "/images/placeholder-movie.png";
    if (path.startsWith("http")) return path;
    return `${image_base_url}${path}`;
  };

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

        {/* Poster (portrait) */}
        <img
          src={getPoster()}
          alt={movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        {/* Text Section */}
        <div className="relative flex flex-col gap-3">
          <p className="text-primary">{movie.original_language || "Language"}</p>

          <h1 className="text-4xl font-semibold max-w-96">{movie.title}</h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {movie.vote_average?.toFixed(1) || "0.0"} User Ratings
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {movie.overview}
          </p>

          <p className="text-sm text-gray-300">
            {timeFormat(movie.runtime)} •{" "}
            {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres} •{" "}
            {movie.release_date?.split("-")[0]}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">

            {/* Trailer button */}
            {movie.trailer_url ? (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer"
              >
                <PlayCircleIcon className="w-5 h-5" /> Watch Trailer
              </a>
            ) : (
              <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-700/60 rounded-md text-gray-400 cursor-not-allowed">
                <PlayCircleIcon className="w-5 h-5" /> Trailer Not Available
              </button>
            )}

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
            >
              Buy Tickets
            </a>

            <button className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      <DateSelect id={id} shows={shows} />
    </div>
  );
};

export default MovieDetails;

