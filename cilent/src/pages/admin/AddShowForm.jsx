// src/pages/admin/AddShowForm.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const AddShowForm = () => {
  const { axios, getToken } = useAppContext();
  const navigate = useNavigate();
  const { state } = useLocation();

  const movieToEdit = state?.movie || null;
  const isEdit = Boolean(movieToEdit);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    poster_path: "",
    backdrop_path: "",
    release_date: "",
    original_language: "",
    tagline: "",
    genres: "",
    vote_average: "",
    runtime: "",
    overview: "",
    trailer_url: "", // <-- added
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        title: movieToEdit.title || "",
        poster_path: movieToEdit.poster_path || "",
        backdrop_path: movieToEdit.backdrop_path || "",
        release_date: movieToEdit.release_date || "",
        original_language: movieToEdit.original_language || "",
        tagline: movieToEdit.tagline || "",
        genres: Array.isArray(movieToEdit.genres)
          ? movieToEdit.genres.join(", ")
          : movieToEdit.genres || "",
        vote_average: movieToEdit.vote_average?.toString() || "",
        runtime: movieToEdit.runtime?.toString() || "",
        overview: movieToEdit.overview || "",
        trailer_url: movieToEdit.trailer_url || "", // <-- populate when editing
      });
    }
  }, [isEdit, movieToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const payload = {
        ...form,
        genres: form.genres,
        runtime: Number(form.runtime) || 0,
        vote_average: Number(form.vote_average) || 0,
        trailer_url: form.trailer_url || "", // ensure trailer is included
      };

      let res;
      if (isEdit) {
        res = await axios.put(`/api/movie/admin/${movieToEdit._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post("/api/movie/admin", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to save movie");
        setSaving(false);
        return;
      }

      toast.success(isEdit ? "Movie updated" : "Movie added");
      navigate("/admin/add-shows", { replace: true });
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    }

    setSaving(false);
  };

  return (
    <div className="w-full flex justify-center py-10 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 shadow-xl rounded-2xl p-10 text-white"
      >
        {/* Title */}
        <h1 className="text-3xl font-semibold text-center">
          {isEdit ? "Edit Movie" : "Add New Movie"}
        </h1>
        <p className="text-zinc-400 text-center mt-2 mb-8">
          {isEdit ? "Modify fields and update the movie" : "Fill details to create a movie"}
        </p>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm">Title*</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="text-sm">Poster URL</label>
              <input
                name="poster_path"
                value={form.poster_path}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="text-sm">Backdrop URL</label>
              <input
                name="backdrop_path"
                value={form.backdrop_path}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="text-sm">Release Date</label>
              <input
                type="date"
                name="release_date"
                value={form.release_date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm">Language</label>
              <input
                name="original_language"
                value={form.original_language}
                onChange={handleChange}
                placeholder="en, hi"
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="text-sm">Tagline</label>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="text-sm">Genres (comma separated)</label>
              <input
                name="genres"
                value={form.genres}
                onChange={handleChange}
                placeholder="Action, Drama"
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Rating</label>
                <input
                  name="vote_average"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={form.vote_average}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="text-sm">Runtime (min)</label>
                <input
                  name="runtime"
                  type="number"
                  min="0"
                  value={form.runtime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overview full width */}
        <div className="mt-6">
          <label className="text-sm">Overview</label>
          <textarea
            name="overview"
            value={form.overview}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
          />
        </div>

        {/* Trailer URL (full width, after overview) */}
        <div className="mt-4">
          <label className="text-sm">Trailer URL</label>
          <input
            name="trailer_url"
            value={form.trailer_url}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Add full video URL (YouTube) so "Watch Trailer" opens the trailer.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white"
          >
            {saving ? "Saving..." : isEdit ? "Update Movie" : "Add Movie"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/add-shows")}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShowForm;


