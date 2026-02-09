import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

function useGetMyShop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData || userData.role !== "owner") return;

    const fetchShop = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/shop/get-my`,   // ✅ FIXED ROUTE
          { withCredentials: true }
        );
        dispatch(setMyShopData(res.data));
      } catch (error) {
        console.log("getMyShop error:", error);
      }
    };

    fetchShop();
  }, [userData]);

  return null;
}

export default useGetMyShop;
