// src/components/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  StarIcon,
} from 'lucide-react';
import Title from './Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { axios, image_base_url } = useAppContext();

  // currency from env, fallback to ₹
  const currencyFromEnv = import.meta.env.VITE_CURRENCY || '₹';

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/dashboard');
      if (data && data.success && data.dashboardData) {
        setDashboardData({
          totalBookings: data.dashboardData.totalBookings || 0,
          totalRevenue: data.dashboardData.totalRevenue || 0,
          activeShows: Array.isArray(data.dashboardData.activeShows) ? data.dashboardData.activeShows : [],
          totalUser: data.dashboardData.totalUser || 0,
        });
      } else {
        toast.error(data?.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('fetchDashboardData error', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const dashboardcards = [
    { title: 'Total Bookings', value: dashboardData.totalBookings || 0, icon: ChartLineIcon },
    { title: 'Total Revenue', value: dashboardData.totalRevenue || 0, icon: CircleDollarSignIcon },
    { title: 'Active Shows', value: dashboardData.activeShows.length || 0, icon: PlayCircleIcon },
    { title: 'Total Users', value: dashboardData.totalUser || 0, icon: UsersIcon },
  ];

  if (loading) {
    return (
      <>
        <Title text1="Admin" text2="Dashboard" />
        <div className="mt-8">Loading dashboard…</div>
      </>
    );
  }

  const renderPoster = (posterPath) => {
    if (!posterPath) return '/images/placeholder-movie.png';
    if (posterPath.startsWith('http')) return posterPath;
    if (image_base_url) return `${image_base_url}${posterPath}`;
    return posterPath;
  };

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* Top cards and refresh */}
      <div className="relative flex flex-wrap gap-4 mt-6 items-center justify-between">
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          {dashboardcards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md w-full sm:w-[220px]"
            >
              <div>
                <h1 className="text-sm text-gray-600">{card.title}</h1>
                <p className="text-xl font-medium mt-1">
                  {card.title === 'Total Revenue'
                    ? `${currencyFromEnv} ${Number(card.value).toLocaleString()}`
                    : card.value}
                </p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>

      </div>

      {/* Active shows */}
      <p className="mt-10 text-lg font-medium">Active Shows</p>

      <div className="relative flex flex-wrap gap-6 mt-4 max-w-6xl">
        {dashboardData.activeShows.length === 0 && (
          <p className="text-sm text-gray-500">No active shows available.</p>
        )}

        {dashboardData.activeShows.map((show) => {
          const movie = show.movie || {};
          // safe values
          const poster = renderPoster(movie.poster_path || movie.poster);
          const title = movie.title || movie.name || 'Untitled';
          const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '—';
          const price = show.showPrice ?? show.price ?? '—';
          const showDate = show.showDateTime ? dateFormat(show.showDateTime) : '—';

          return (
            <div
              key={String(show._id || show.id)}
              className="w-full sm:w-[220px] rounded-lg overflow-hidden pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
            >
              <img src={poster} alt={title} className="h-60 w-full object-cover" />
              <p className="font-medium p-2 truncate">{title}</p>
              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium">
                  {currencyFromEnv} {price}
                </p>
                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                  <StarIcon className="w-4 h-4 text-primary fill-primary" /> {rating}
                </p>
              </div>
              <p className="px-2 pt-2 text-sm text-gray-500">{showDate}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Dashboard;