import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";

import { socket } from "../socket";
import {
  addMyOrder,
  updateRealtimeOrderStatus,
} from "../redux/userSlice";

function MyOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, myOrders } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData?._id) return;

    // 📦 NEW ORDER (user + owner)
    const handleNewOrder = (order) => {
      console.log("📦 New order received:", order);
      dispatch(addMyOrder(order));
    };

    // 🔄 STATUS UPDATE (user side)
    const handleStatusUpdate = ({ orderId, shopId, status }) => {
      console.log("🔄 Status update:", orderId, shopId, status);

      dispatch(
        updateRealtimeOrderStatus({
          orderId,
          shopId,
          status,
        })
      );
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("update-status", handleStatusUpdate);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status", handleStatusUpdate);
    };
  }, [userData?._id, dispatch]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <div onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* ORDERS */}
        <div className="space-y-6">
          {myOrders.length === 0 && (
            <p className="text-center text-gray-500">
              No orders yet
            </p>
          )}

          {myOrders.map((order) =>
            userData.role === "user" ? (
              <UserOrderCard key={order._id} data={order} />
            ) : (
              <OwnerOrderCard key={order._id} data={order} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;