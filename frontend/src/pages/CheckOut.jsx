import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { addMyOrder, setTotalAmount} from "../redux/userSlice";
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import { FaMobileScreenButton } from "react-icons/fa6";

/* -------------------- Map Recenter -------------------- */
function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location.lat && location.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location]);

  return null;
}

/* -------------------- Checkout Page -------------------- */
function CheckOut() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector((state) => state.user);

  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const finalAmount = totalAmount + deliveryFee;

  /* -------------------- Reverse Geocode -------------------- */
  const getAddressByLatLng = async (lat, lon) => {
  try {
    const res = await axios.get(
      `https://api.geoapify.com/v1/geocode/reverse`,
      {
        params: {
          lat,
          lon,
          format: "json",
          apiKey,
        },
      }
    );

    const place = res.data?.results?.[0];
    if (!place) return;

    // 🔹 Build detailed address safely
    const parts = [
      place.housenumber,
      place.street,
      place.suburb || place.neighbourhood,
      place.city || place.county,
      place.state,          // FULL NAME (Odisha)
      place.postcode,
      place.country,
    ].filter(Boolean);

    const fullAddress = parts.join(", ");

    dispatch(setAddress(fullAddress));
  } catch (error) {
    console.log("Reverse geocoding failed:", error);
  }
};


  /* -------------------- Marker Drag -------------------- */
  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  /* -------------------- Current Location -------------------- */
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      dispatch(setLocation({ lat, lon }));
      getAddressByLatLng(lat, lon);
    },
    (err) => {
      console.log("Location error:", err);
      alert("Please allow location access");
    }
  );
};



  /* -------------------- Search Address -------------------- */
  const getLatLngByAddress = async () => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apiKey}`
      );

      const { lat, lon } = res.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

  /* -------------------- Place Order -------------------- */
  const handlePlaceOrder = async () => {
     try { 
      const result = await axios.post( `${serverUrl}/api/order/place-order`, { paymentMethod, deliveryAddress: { text: address, latitude: location.lat, longitude: location.lon, }, totalAmount: finalAmount, cartItems, }, { withCredentials: true } ); 

      if(paymentMethod=="cod"){
      dispatch(addMyOrder(result.data))
      navigate("/order-placed")
      }else{
        const orderId=result.data.orderId
        const razorOrder=result.data.razorOrder
          openRazorpayWindow(orderId,razorOrder)
       }
    
    } catch (error) {
      console.log(error)
    }
  }

const openRazorpayWindow = (orderId, razorOrder) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: razorOrder.amount,
    currency: "INR",
    name: "Vingo",
    description: "Food Delivery Website",
    order_id: razorOrder.id,

    handler: async function (response) {
      try {
        await axios.post(
          `${serverUrl}/api/order/verify-payment`,
          {
            orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          },
          { withCredentials: true }
        );

        navigate("/order-placed");
      } catch (error) {
        console.error("Payment verification failed", error);
        alert("Payment verification failed");
      }
    },

    theme: { color: "#ff4d2d" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


  useEffect(() => {
    setAddressInput(address || "");
  }, [address]);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div
        className="absolute top-5 left-5 z-10"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={34} className="text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>

        {/* ---------- Location ---------- */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <IoLocationSharp className="text-[#ff4d2d]" /> Delivery Location
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="flex-1 border rounded-lg p-2"
              placeholder="Enter delivery address"
            />

            <button
              onClick={getLatLngByAddress}
              className="bg-[#ff4d2d] text-white px-3 rounded-lg"
            >
              <IoSearchOutline />
            </button>

            <button
              onClick={getCurrentLocation}
              className="bg-blue-500 text-white px-3 rounded-lg"
            >
              <TbCurrentLocation />
            </button>
          </div>

          <div className="h-64 rounded-xl overflow-hidden border">
            <MapContainer
              center={
                location.lat && location.lon
                  ? [location.lat, location.lon]
                  : [20.5937, 78.9629]
              }
              zoom={16}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap location={location} />
              {location.lat && location.lon && (
                <Marker
                  position={[location.lat, location.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              )}
            </MapContainer>
          </div>
        </section>

        {/* ---------- Payment ---------- */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Payment Method</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`p-4 border rounded-xl cursor-pointer ${
                paymentMethod === "cod" && "border-[#ff4d2d] bg-orange-50"
              }`}
            >
              <MdDeliveryDining className="text-green-600 text-xl" />
              <p>Cash on Delivery</p>
            </div>

            <div
              onClick={() => setPaymentMethod("online")}
              className={`p-4 border rounded-xl cursor-pointer ${
                paymentMethod === "online" && "border-[#ff4d2d] bg-orange-50"
              }`}
            >
              <FaMobileScreenButton />
              <FaCreditCard />
              <p>UPI / Card</p>
            </div>
          </div>
        </section>

        {/* ---------- Order Summary ---------- */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>

          <div className="border rounded-xl p-4 bg-gray-50 space-y-2">
            {cartItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <hr />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-[#ff4d2d]">
              <span>Total</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>
        </section>

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-[#ff4d2d] text-white py-3 rounded-xl"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

export default CheckOut;
