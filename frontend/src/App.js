// FILE: C:\Users\moham\Downloads\PriceOrbit\frontend\src\App.js

import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home           from "./pages/Home";
import Results        from "./pages/Results";
import Saved          from "./pages/Saved";
import Deals          from "./pages/Deals";
import Alerts         from "./pages/Alerts";
import SignIn         from "./pages/SignIn";
import ProductDetail  from "./pages/ProductDetail";
import Trending       from "./pages/Trending";
import Profile        from "./pages/Profile";           // NEW — Day 8
import ProtectedRoute from "./components/ProtectedRoute";
import BackToTop      from "./components/BackToTop";    // NEW — Day 8

function App() {
  return (
    <BrowserRouter>

      {/*
        BackToTop is rendered OUTSIDE <Routes> so it appears on
        every single page automatically — no need to add it to
        each page component individually.
        It handles its own visibility via the scroll listener inside it.
      */}
      <BackToTop />

      <Routes>
        {/* ── Public pages — anyone can visit ──────────────────────────── */}
        <Route path="/"            element={<Home />} />
        <Route path="/results"     element={<Results />} />
        <Route path="/deals"       element={<Deals />} />
        <Route path="/signin"      element={<SignIn />} />
        <Route path="/register"    element={<SignIn />} />  {/* SignIn handles both modes */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/trending"    element={<Trending />} />

        {/* ── Protected pages — must be logged in ──────────────────────── */}
        {/* ProtectedRoute checks for a JWT token in localStorage.         */}
        {/* If missing, it redirects the user to /signin automatically.    */}
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;

