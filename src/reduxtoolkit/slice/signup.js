import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Base_URL } from "../../component/BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const signup = createAsyncThunk("signup", async (userData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${Base_URL}/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Save token to AsyncStorage
    if (res.data.token) {
      await AsyncStorage.setItem('token', res.data.token);
    }

    return res.data; // Return the API response
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || "An error occurred");
  }
});

const signupSlice = createSlice({
  name: "signup",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default signupSlice.reducer;
