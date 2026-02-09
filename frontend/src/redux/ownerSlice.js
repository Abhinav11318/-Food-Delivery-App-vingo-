import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
  name: "owner",
  initialState: {
    myShopData: {
      items: []   // ✅ always defined
    }
  },
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = {
        ...action.payload,
        items: action.payload?.items || [] // ✅ safety fallback
      };
    }
  }
});

export const { setMyShopData } = ownerSlice.actions;
export default ownerSlice.reducer;
