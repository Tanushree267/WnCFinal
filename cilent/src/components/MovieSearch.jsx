// src/components/MovieSearch.jsx
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

const MovieSearch = ({ axios, onResults }) => {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    const query = q.trim()
    if (!query) {
      toast.error('Type a movie title or genre to search')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/movie/search?q=${encodeURIComponent(query)}`)
      if (data.success) {
        onResults(data.movies || [])
        if ((data.movies || []).length === 0) {
          toast('No movies found for your search')
        }
      } else {
        toast.error(data.message || 'Search failed')
      }
    } catch (err) {
      console.error('Search error', err)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQ('')
    onResults(null) // signal parent to reload default list
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by title or genre (e.g. Action)"
        className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm w-64 focus:outline-none"
      />
      <button
        type="submit"
        className="px-3 py-2 rounded-md bg-primary hover:bg-primary-dull text-white text-sm flex items-center gap-2"
        disabled={loading}
      >
        <Search className="w-4 h-4" />
        {loading ? 'Searching' : 'Search'}
      </button>

      <button
        type="button"
        onClick={handleClear}
        className="px-2 py-2 rounded-md bg-gray-700 text-gray-300 text-sm hover:bg-gray-600"
      >
        Clear
      </button>
    </form>
  )
}

export default MovieSearch
