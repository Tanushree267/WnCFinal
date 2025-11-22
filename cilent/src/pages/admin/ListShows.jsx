// src/components/admin/ListShows.jsx
import React, { useEffect, useState } from "react";
import Title from "./Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const ListShows = () => {
  const { axios } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => { 
    try {
      const { data } = await axios.get("/api/admin/shows");
      if (data.success) {
        setShows(data.shows || []);
      } else {
        toast.error(data.message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Title text1="Admin" text2="List Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">
                  No shows available
                </td>
              </tr>
            )}

            {shows.map((show) => {
              const totalBookings = show.occupiedSeats
                ? Object.keys(show.occupiedSeats).length
                : 0;

              const earnings =
                totalBookings * (show.showPrice || show.price || 0);

              return (
                <tr
                  key={show._id}
                  className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 min-w-[120px] pl-5">
                    {show.movie?.title || "—"}
                  </td>
                  <td className="p-2">{dateFormat(show.showDateTime)}</td>
                  <td className="p-2">{totalBookings}</td>
                  <td className="p-2">
                    {currency} {earnings}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListShows;