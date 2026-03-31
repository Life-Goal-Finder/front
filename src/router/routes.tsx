import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";

import { Account } from "@/pages/Account";
import { ProtectedRoute } from "@/router/protectedRoute";
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { Leaderboard } from "@/pages/Leaderboard";
import { FriendSearch } from "@/pages/FriendSearch";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";
import { RegisterGoogleForm } from "@/pages/Authentication/registerGoogleForm";

export const Router = () => {
  return (
    <Routes>
      <Route element={<LayoutWrapper withLayout={false} />}>
        <Route
          path="/login"
          element={
            <ProtectedRoute authRequired={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute authRequired={false}>
              <Register />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register/google"
          element={
            <ProtectedRoute authRequired={false}>
              <RegisterGoogleForm />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route element={<LayoutWrapper />}>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute authRequired={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute authRequired={true}>
              <FriendSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute authRequired={true}>
              <Account />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
