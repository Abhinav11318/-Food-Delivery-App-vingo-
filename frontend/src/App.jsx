import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Socket
import { socket } from "./socket";

// Redux
import { addMyOrder } from "./redux/userSlice";

// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/Forgotpassword";
import Home from "./pages/Home";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";

// Dashboards
import OwnerDashboard from "./components/OwnerDashboard";
import UserDashboard from "./components/UserDashboard";
import DeliveryBoy from "./components/DeliveryBoy";

// Hooks
import UseGetCurrentUser from "./hooks/UseGetCurrentUser";
import UseGetcity from "./hooks/UseGetcity";
import useGetmyShop from "./hooks/UseGetmyShop";
import useGetShopByCity from "./hooks/UseGetShopByCity";
import UseGetItemsByCity from "./hooks/UseGetItemsByCity";
import useGetMyOrders from "./hooks/UseGetMyOrders";
import useUpdateLocation from "./hooks/UseUpdateLocation";

export const serverUrl = "http://localhost:8000";

function App() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  // ---------------- GLOBAL DATA FETCH ----------------
  UseGetCurrentUser();
  UseGetcity();
  useUpdateLocation();
  useGetmyShop();
  useGetShopByCity();
  UseGetItemsByCity();
  useGetMyOrders();

  


  // 🔐 IDENTIFY USER ONCE
  useEffect(() => {
    if (!userData?._id) return;

    const identify = () => {
      console.log("🔌 Connected:", socket.id);
      socket.emit("identity", { userId: userData._id });
    };

    socket.on("connect", identify);
    if (socket.connected) identify();

    return () => socket.off("connect", identify);
  }, [userData?._id]);

  // 🌍 GLOBAL REALTIME ORDER LISTENER (CRITICAL)
  useEffect(() => {
    if (!userData?._id) return;

    const handleNewOrder = (order) => {
      console.log("🌍 Realtime order received:", order);
      dispatch(addMyOrder(order));
    };

    socket.on("newOrder", handleNewOrder);

    return () => socket.off("newOrder", handleNewOrder);
  }, [userData?._id, dispatch]);



  // ---------------- ROUTES ----------------
  return (
    <Routes>
      {/* ---------- AUTH ---------- */}
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />

      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />

      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
      />

      {/* ---------- ROOT ---------- */}
      <Route
        path="/"
        element={
          userData ? (
            userData.role === "user" ? (
              <UserDashboard />
            ) : userData.role === "owner" ? (
              <OwnerDashboard />
            ) : userData.role === "deliveryBoy" ? (
              <DeliveryBoy />
            ) : (
              <Navigate to="/signin" />
            )
          ) : (
            <Navigate to="/signin" />
          )
        }
      />

      {/* ---------- OWNER ---------- */}
      <Route
        path="/create-edit-shop"
        element={
          userData?.role === "owner" ? (
            <CreateEditShop />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/add-item"
        element={
          userData?.role === "owner" ? (
            <AddItem />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/edit-item/:itemId"
        element={
          userData?.role === "owner" ? (
            <EditItem />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* ---------- USER ---------- */}
      <Route
        path="/home"
        element={
          userData?.role === "user" ? <Home /> : <Navigate to="/" />
        }
      />

      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to="/signin" />}
      />

      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to="/signin" />}
      />

      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced /> : <Navigate to="/signin" />}
      />

      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to="/signin" />}
      />

      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />}
      />

      <Route
        path="/shop/:shopId"
        element={userData ? <Shop /> : <Navigate to="/signin" />}
      />

      {/* ---------- DELIVERY BOY ---------- */}
      <Route
        path="/delivery"
        element={
          userData?.role === "deliveryBoy" ? (
            <DeliveryBoy />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default App;