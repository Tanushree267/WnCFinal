// src/pages/admin/AddShows.jsx
import React, { useEffect, useState } from "react";
import { CheckIcon, Edit3, Trash2, X } from "lucide-react";
import Title from "./Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/*
  Merged AddShows:
  - movie list (horizontal, selectable)
  - edit/delete icons
  - top-right "Add Show" navigates to /admin/add-shows/form
  - old-style DateTime UI (single datetime-local + Add Time)
  - selected times displayed grouped by date, removable via X
  - Add Show button submits shows to /api/show/add
*/

const AddShows = () => {
  const { axios, getToken, image_base_url, isAdmin } = useAppContext();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // dateTimeSelection: { '2025-06-30': ['10:00', '14:30'] }
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [submittingShows, setSubmittingShows] = useState(false);

  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const getPosterUrl = (movie) => {
    if (!movie?.poster_path) return "";
    if (movie.poster_path.startsWith("http")) return movie.poster_path;
    return `${image_base_url}${movie.poster_path}`;
  };

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const token = await getToken();
      const { data } = await axios.get("/api/movie/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });


      if (data && data.success) {
        setMovies(data.movies || []);
      } else {
        toast.error(data?.message || "Failed to fetch movies");
      }
    } catch (err) {
      console.error("Fetch movies error:", err);
      toast.error("Something went wrong while fetching movies");
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const toggleSelectMovie = (movieId) => {
    setSelectedMovieId((prev) => (prev === movieId ? null : movieId));
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/movie/admin/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!data.success) {
        toast.error(data.message || "Failed to delete movie");
        return;
      }
      toast.success("Movie deleted");
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
      if (selectedMovieId === movieId) setSelectedMovieId(null);
    } catch (err) {
      console.error("Delete movie error:", err);
      toast.error("Something went wrong while deleting movie");
    }
  };

  const handleAddShowClick = () => {
    navigate("/admin/add-shows/form");
  };

  const handleEditMovie = (movie) => {
    navigate("/admin/add-shows/form", { state: { movie } });
  };

  // Old style: single datetime-local input -> add to dateTimeSelection
  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (times.includes(time)) return prev;
      return {
        ...prev,
        [date]: [...times, time],
      };
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      const filteredTimes = times.filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  };

  // submit shows (converts dateTimeSelection to showsInput array)
  const handleSubmitShows = async (e) => {
    e?.preventDefault?.(); // allow both form submit and direct call
    if (!selectedMovieId) {
      toast.error("Please select a movie first");
      return;
    }
    if (!showPrice) {
      toast.error("Please enter show price");
      return;
    }
    if (Object.keys(dateTimeSelection).length === 0) {
      toast.error("Please add at least one date/time");
      return;
    }

    // build showsInput: [{date, times: ['10:00','14:00']}] or as your backend expects {date, time}? earlier you used array of objects with date/time pairs
    // We'll convert to [{ date, times }] and backend can handle; if it expects individual date/time entries, convert accordingly:
    const showsInput = Object.entries(dateTimeSelection).flatMap(([date, times]) =>
      times.map((time) => ({ date, time }))
    );

    try {
      setSubmittingShows(true);
      const token = await getToken();
      const payload = {
        movieId: selectedMovieId,
        showsInput,
        showPrice: Number(showPrice),
      };

      const { data } = await axios.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success) {
        toast.error(data.message || "Failed to add shows");
        return;
      }

      toast.success("Shows added successfully");
      // reset
      setDateTimeSelection({});
      setShowPrice("");
      setSelectedMovieId(null);
    } catch (err) {
      console.error("Add shows error:", err);
      toast.error("Something went wrong while adding shows");
    } finally {
      setSubmittingShows(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4">
        <p>You are not authorized to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Title text1="Add" text2="Shows" />
        <button
          onClick={handleAddShowClick}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Add Show
        </button>
      </div>

      {/* Movie list (horizontal) */}
      <div className="mt-6 overflow-x-auto">
        {loadingMovies ? (
          <p>Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="text-sm text-gray-400">
            No movies found. Add a movie using the Add Show button.
          </p>
        ) : (
          <div className="flex gap-4 w-max pb-4">
            {movies.map((movie, idx) => (
              <div
                key={movie._id || idx}
                className={`relative w-40 cursor-pointer transition-transform duration-200 rounded-lg overflow-hidden ${selectedMovieId === movie._id ? "border-2 border-primary bg-primary/10" : ""
                  }`}
              >
                <div onClick={() => toggleSelectMovie(movie._id)}>
                  {getPosterUrl(movie) ? (
                    <img
                      src={getPosterUrl(movie)}
                      alt={movie.title}
                      className="w-full h-64 object-cover brightness-90"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/placeholder-movie.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-sm">
                      No Poster
                    </div>
                  )}

                  <div className="p-2 bg-black/60 text-white">
                    <p className="font-medium truncate">{movie.title}</p>
                    <p className="text-xs text-gray-300">{movie.release_date}</p>
                  </div>
                </div>

                {selectedMovieId === movie._id && (
                  <div className="absolute top-2 right-2 bg-primary rounded w-6 h-6 flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                )}

                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    title="Edit movie"
                    onClick={() => handleEditMovie(movie)}
                    className="p-1 bg-black/60 rounded hover:bg-black/80"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                  </button>

                  <button
                    title="Delete movie"
                    onClick={() => handleDeleteMovie(movie._id)}
                    className="p-1 bg-black/60 rounded hover:bg-black/80"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected movie -> old-style DateTime UI */}
      {selectedMovieId && (
        <section className="mt-8 border rounded-lg p-4">
          <h2 className="font-semibold text-lg">Add Shows for Selected Movie</h2>

          {/* Price + datetime row (old UI feel) */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
                <p className="text-gray-400 text-sm">{currency}</p>
                <input
                  min={0}
                  type="number"
                  value={showPrice}
                  onChange={(e) => setShowPrice(e.target.value)}
                  placeholder="Enter show price"
                  className="outline-none bg-transparent text-sm w-36"
                />
              </div>

              <div className="inline-flex gap-3 border border-gray-600 p-1 pl-3 rounded-lg items-center">
                <input
                  type="datetime-local"
                  value={dateTimeInput}
                  onChange={(e) => setDateTimeInput(e.target.value)}
                  className="outline-none rounded-md bg-transparent text-sm"
                />
                <button
                  onClick={handleDateTimeAdd}
                  className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
                >
                  Add Time
                </button>
              </div>
            </div>

            {/* Selected times (grouped by date) */}
            {Object.keys(dateTimeSelection).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Selected Date & Time</h3>
                <ul className="space-y-3">
                  {Object.entries(dateTimeSelection).map(([date, times]) => (
                    <li key={date}>
                      <div className="font-medium">{date}</div>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm">
                        {times.map((time) => (
                          <div
                            key={time}
                            className="border border-primary px-2 py-1 flex items-center rounded"
                          >
                            <span>{time}</span>
                            <button
                              onClick={() => handleRemoveTime(date, time)}
                              className="ml-2"
                              title="Remove"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <button
                onClick={handleSubmitShows}
                disabled={submittingShows}
                className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
              >
                {submittingShows ? "Saving..." : "Add Show"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AddShows;












