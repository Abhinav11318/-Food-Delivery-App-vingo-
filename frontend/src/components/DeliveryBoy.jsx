import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import Nav from "./Nav";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user);

  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (userData?.role !== "deliveryBoy") return;

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setDeliveryBoyLocation({ lat, lon });

        socket?.emit("updateLocation", {
          latitude: lat,
          longitude: lon,
          userId: userData._id
        });
      },
      console.log,
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [userData, socket]);

  /* ================= API ================= */
  const getAssignments = async () => {
    const res = await axios.get(
      `${serverUrl}/api/order/get-assignments`,
      { withCredentials: true }
    );
    setAvailableAssignments(res.data || []);
  };

  const getCurrentOrder = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentOrder(null);
      } else {
        console.error(err);
      }
    }
  };

  const acceptOrder = async (assignmentId) => {
    setLoading(true);
    await axios.get(
      `${serverUrl}/api/order/accept-order/${assignmentId}`,
      { withCredentials: true }
    );
    await getCurrentOrder();
    await getAssignments();
    setLoading(false);
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket) return;
    const handler = () => getAssignments();
    socket.on("new-delivery-assignment", handler);
    return () => socket.off("new-delivery-assignment", handler);
  }, [socket]);

  /* ================= INIT ================= */
  useEffect(() => {
    getAssignments();
    getCurrentOrder();
  }, []);

  return (
    <div className="w-screen min-h-screen bg-[#fff9f6]">
      <Nav />

      <div className="max-w-[800px] mx-auto mt-[90px] space-y-5">

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData?.fullName}
          </h1>
          <p>
            Lat: {deliveryBoyLocation?.lat || "—"} | Lon:{" "}
            {deliveryBoyLocation?.lon || "—"}
          </p>
        </div>

        {!currentOrder && (
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold mb-3">Available Orders</h2>

            {availableAssignments.length === 0 && (
              <p className="text-gray-400">No Available Orders</p>
            )}

            {availableAssignments.map(a => (
              <div key={a.assignmentId} className="border p-4 mb-3 flex justify-between">
                <div>
                  <p className="font-semibold">{a.shopName}</p>
                  <p className="text-sm text-gray-500">{a.deliveryAddress.text}</p>
                </div>
                <button
                  disabled={loading}
                  onClick={() => acceptOrder(a.assignmentId)}
                  className="bg-orange-500 text-white px-4 py-1 rounded"
                >
                  {loading ? <ClipLoader size={18} /> : "Accept"}
                </button>
              </div>
            ))}
          </div>
        )}

        {currentOrder && (
          <div className="bg-white p-5 rounded-xl shadow">
            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation,
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;