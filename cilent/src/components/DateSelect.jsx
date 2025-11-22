// src/components/DateSelect.jsx
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ id, shows }) => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    // Derive unique dates from admin-created shows only (no times)
    // Expect each show to have a `showDateTime` field (ISO string or Date)
    if (!Array.isArray(shows) || shows.length === 0) {
      setDates([]);
      setSelectedDate(null);
      return;
    }

    const dateSet = new Set();
    for (const s of shows) {
      if (!s || !s.showDateTime) continue;
      const dt = new Date(s.showDateTime);
      if (isNaN(dt.getTime())) continue;
      const isoDate = dt.toISOString().split("T")[0]; // YYYY-MM-DD
      dateSet.add(isoDate);
    }

    const sorted = Array.from(dateSet).sort();
    setDates(sorted);
    // default to first date if none selected or if previous selection not in new list
    setSelectedDate((prev) => (sorted.includes(prev) ? prev : sorted[0] ?? null));
  }, [shows]);

  const onBookHandler = () => {
    if (!selectedDate) return toast.error("Please select a date");

    navigate(`/movies/${id}/${selectedDate}`);
    scrollTo(0, 0);
  };

  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <div>
          <p className="text-lg font-semibold">Choose Date</p>

          <div className="flex items-center gap-6 text-sm mt-5">
            <ChevronLeftIcon width={28} />

            <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {dates.map((date) => (
                <button
                  onClick={() => setSelectedDate(date)}
                  key={date}
                  className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "border border-primary/70"
                  }`}
                >
                  <span>{new Date(date).getDate()}</span>
                  <span>
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                </button>
              ))}
            </span>

            <ChevronRightIcon width={28} />
          </div>
        </div>

        {/* Book button */}
        <button
          onClick={onBookHandler}
          className="bg-primary text-white px-8 py-2 mt-10 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;