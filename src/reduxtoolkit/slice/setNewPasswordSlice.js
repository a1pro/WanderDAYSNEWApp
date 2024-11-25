import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Base_URL } from '../../component/BaseUrl';

// AsyncThunk for setting new password
export const setNewPassword = createAsyncThunk(
  'auth/setNewPassword', 
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${Base_URL}/auth/SetNewPassword`, 
        { email, password }, // Sending email and password in the body
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data; // Return the response data on success
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred while setting the new password');
    }
  }
);

// Initial state
const initialState = {
  loading: false,
  success: false,
  error: null,
  message: '',
};

// Slice definition
const setNewPasswordSlice = createSlice({
  name: 'setNewPassword',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setNewPassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(setNewPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Password changed successfully!';
        state.error = null;
      })
      .addCase(setNewPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Failed to set new password';
        state.success = false;
      });
  },
});

// Export actions and reducer
export const { resetState } = setNewPasswordSlice.actions;
export default setNewPasswordSlice.reducer;
