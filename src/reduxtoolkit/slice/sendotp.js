import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Base_URL } from '../../component/BaseUrl';


export const sendOtp = createAsyncThunk(
  'auth/sendotp', 
  async (data, { rejectWithValue }) => {
    try {

      const response = await axios.post(`${Base_URL}/auth/sendemailotp`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data; 
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || 'An error occurred'); 
    }
  }
);


const initialState = {
  otp: null, 
  loading: false, 
  error: null,
  success: false, 
};

const authSlice = createSlice({
  name: 'auth', 
  initialState, 
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.otp = null;
    },
  },
  extraReducers: (builder) => {
    builder
 
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.otp = action.payload.otp; 
        state.error = null;
      })
     
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send OTP';
        state.success = false;
      });
  },
});

export const { resetState } = authSlice.actions;
export default authSlice.reducer;
