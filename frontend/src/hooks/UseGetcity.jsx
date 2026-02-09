import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
} from "../redux/userSlice";

import { setLocation, setAddress } from "../redux/mapSlice";

function UseGetcity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // ✅ store lat & lon in redux
        dispatch(setLocation({ lat, lon }));

        try {
          const res = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`
          );

          const data = res.data?.results?.[0];
          if (!data) return;

          // ✅ FIX: Proper city resolution order
          const resolvedCity =
            data.city ||
            data.district ||
            data.suburb ||
            data.county;

          dispatch(setCurrentCity(resolvedCity));
          dispatch(setCurrentState(data.state));

          const resolvedAddress =
            data.address_line2 || data.address_line1;

          dispatch(setCurrentAddress(resolvedAddress));
          dispatch(setAddress(resolvedAddress));

          // 🔍 Debug (remove later)
          console.log("Resolved City:", resolvedCity);
        } catch (err) {
          console.log("Geo API Error", err);
        }
      },
      (err) => {
        console.log("Geolocation error:", err);
      }
    );
  }, []);

  return null;
}

export default UseGetcity;
