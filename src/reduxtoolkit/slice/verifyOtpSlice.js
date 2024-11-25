import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Base_URL } from '../../component/BaseUrl';  // Your base URL

// AsyncThunk for verifying OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, { rejectWithValue }) => {
    try {
      // API call to verify OTP
      const response = await axios.post(`${Base_URL}/auth/verifyemailotp`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data; // Return the response data if successful
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || 'Failed to verify OTP');
    }
  }
);

// Initial state for the verify OTP slice
const initialState = {
  loading: false,
  success: false,
  error: null,
  message: '',  // Success message (e.g. 'OTP Verified Successfully')
};

// Slice definition
const verifyOtpSlice = createSlice({
  name: 'verifyOtp', // Slice name
  initialState,      // Initial state
  reducers: {
    resetVerifyOtpState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // When the verifyOtp request is pending (loading)
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      // When the verifyOtp request is fulfilled (success)
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'OTP verified successfully!';
        state.error = null;
      })
      // When the verifyOtp request fails (error)
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to verify OTP';
        state.success = false;
        state.message = '';
      });
  },
});

// Export actions and reducer
export const { resetVerifyOtpState } = verifyOtpSlice.actions;
export default verifyOtpSlice.reducer;
