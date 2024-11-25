import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Base_URL } from "../../component/BaseUrl";


export const getTourDetail = createAsyncThunk(
  "tour/getTourDetail",
  async (_, { rejectWithValue }) => {
    try {
     
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await axios.get(`${Base_URL}/auth/getTourDetail`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

   
      return response.data;
    } catch (error) {
      
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Create slice
const tourSlice = createSlice({
  name: "tour",
  initialState: {
    tourDetails: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTourDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTourDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.tourDetails = action.payload; // Save tour details in state
      })
      .addCase(getTourDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set error if the request fails
      });
  },
});

export default tourSlice.reducer;
