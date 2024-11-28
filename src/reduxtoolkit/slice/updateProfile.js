import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Base_URL } from "../../component/BaseUrl";
import axios from "axios";

export const updated=createAsyncThunk(
   'tour/updateProfile',
   async (details,{rejectWithValue} )=>{
    try{
        const token=await AsyncStorage.getItem('token')
        if(!token){
            return rejectWithValue('Token is missing')
        }
        const response=await axios.post(`${Base_URL}/users/profile/update`,details, {
         headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${token}`,
         }
        })
        return response.data
    } catch (error){
     if (error.response){
      if(error.response.status === 401)  {
        return rejectWithValue('Invalid or expired token')
      }
      return rejectWithValue (error.response.data.message || "An error occurred while updating profile")
     }else{
        return rejectWithValue('Network error or server unavailable')
     }
    }
   }
)

const initialState ={
    loading:false,
    success: false,
    error: null,
    message: '',
    details:null

}
const updateProfile =createSlice({
   name: "updated",
   initialState,
   reducers:{
    resetUpdatedState: (state) => {
        state.loading=false,
        state.success= false,
        state.error= null,
        state.message= '',
        state.details=null
    
    }
   },
   extraReducers: (builder) => {
    builder
      .addCase(updated.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = '';
      })
      .addCase(updated.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
       
        state.message = action.payload?.message || 'Profile updated successfully!';
        
        state.details = action.payload?.user || null;
      })
      .addCase(updated.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload?.message || action.error.message || 'Failed to update profile!';
        state.error = errorMessage;
        state.message = errorMessage;
      });
  }
  
})
export const { resetUpdatedState } = updateProfile.actions;
export default updateProfile.reducer;