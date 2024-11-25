import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Base_URL } from '../../component/BaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncThunk for adding a tour
export const addTour = createAsyncThunk(
  'tour/addTour',
  async (tourDetails, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token is missing');
      }

      const response = await axios.post(`${Base_URL}/auth/add/tour`, tourDetails, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data; // Assuming response includes a message or success status
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue('Invalid or expired token');
        }
        return rejectWithValue(error.response.data.message || 'An error occurred while adding the tour');
      } else {
        return rejectWithValue('Network error or server unavailable');
      }
    }
  }
);

// Initial state for the addTour slice
const initialState = {
  loading: false,
  success: false,
  error: null,
  message: '', 
  tourDetails: null,
};

const addTourSlice = createSlice({
  name: 'addTour',
  initialState,
  reducers: {
    resetAddTourState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = '';
      state.tourDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTour.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = '';
      })
      .addCase(addTour.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.data.message || 'Tour added successfully!';
        state.tourDetails = action.payload.tour || null;
      })
      .addCase(addTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
        state.message = action.payload || 'Failed to add tour!';
      });
  },
});

export const { resetAddTourState } = addTourSlice.actions;
export default addTourSlice.reducer;
