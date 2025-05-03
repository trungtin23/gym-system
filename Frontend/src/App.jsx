import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import AuthLayout from "./layout/AuthLayout";
import TestLayout from "./layout/TestLayout";
import Register from "./page/Register";
import Membership from "./page/Membership";
import Header from "./layout/Header";
import Profile from "./page/Profile";
import ListPT from "./page/ListPT";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Header />}>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/listPT" element={<ListPT />} />
        </Route>
      </Routes>
    </div>
  );
}
