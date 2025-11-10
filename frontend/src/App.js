import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import StorePage from "@/pages/StorePage";
import EventsPage from "@/pages/EventsPage";
import PartsPage from "@/pages/PartsPage";
import AdminPage from "@/pages/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/parts" element={<PartsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
