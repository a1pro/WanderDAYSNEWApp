import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Base_URL } from '../../component/BaseUrl';

export const loginuser = createAsyncThunk(
  'loginuser/login',
  async (logindata, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${Base_URL}/auth/login`, logindata, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

   

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);


const loginUserSlice = createSlice({
  name: 'loginuser',
  initialState: {
      user: null,
      loading: false,
      error: null,
  },
  reducers: {
      setUser: (state, action) => {
          state.user = action.payload;
      },
      logout: (state) => {
          state.user = null;
          AsyncStorage.removeItem('token'); // Clear token on logout
      },
  },
  extraReducers: (builder) => {
      builder
          .addCase(loginuser.pending, (state) => {
              state.loading = true;
              state.error = null;
          })
          .addCase(loginuser.fulfilled, (state, action) => {
              state.loading = false;
              state.user = action.payload;
          })
          .addCase(loginuser.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
          });
  },
});

export const { setUser, logout } = loginUserSlice.actions;
export default loginUserSlice.reducer;

