// App.jsx
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatLayout from './pages/SeatLayout';
import MyBookings from './pages/MyBookings';
import Favorite from './pages/Favorite';
import Login from './pages/login';
import About from './pages/About';
import Theaters from './pages/Theaters';


// admin pages
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddShows from './pages/admin/AddShows';
import ListShows from './pages/admin/ListShows';
import ListBookings from './pages/admin/ListBookings';
import AddShowForm from './pages/admin/AddShowForm';
import AdminRoute from "./components/admin/AdminRoute";


const App = () => {
  const location = useLocation();
  const path = location.pathname;

  // Hide Navbar and Footer for login and all admin routes
  const hideNavFooter = path === '/login' || path.startsWith('/admin');

  return (
    <>
      <Toaster />
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/about" element={<About />} />
        <Route path="/theaters" element={<Theaters/>} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes — nested under /admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <Layout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="add-shows/form" element={<AddShowForm />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>


      </Routes>
      {!hideNavFooter && <Footer />}
    </>
  );
};

export default App;


