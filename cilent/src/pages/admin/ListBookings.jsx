// src/components/admin/ListBookings.jsx
import React, { useEffect, useState } from "react";
import Title from "./Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const ListBookings = () => {
  const { axios } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/bookings");
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message || "Failed to load bookings");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden whitespace-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">User Name</th>
              <th className="p-2 font-medium">Movie</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Seats</th>
              <th className="p-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {bookings.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">
                  No bookings found
                </td>
              </tr>
            )}

            {bookings.map((item) => (
              <tr
                key={item._id}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 pl-5">{item.user?.name || "—"}</td>
                <td className="p-2">{item.show?.movie?.title || "—"}</td>
                <td className="p-2">
                  {item.show?.showDateTime
                    ? dateFormat(item.show.showDateTime)
                    : "—"}
                </td>
                <td className="p-2">
                  {item.bookedSeats
                    ? Object.values(item.bookedSeats).join(", ")
                    : "—"}
                </td>
                <td className="p-2">
                  {currency} {item.amount || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListBookings;