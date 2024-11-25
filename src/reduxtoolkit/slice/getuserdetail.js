import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Base_URL } from "../../component/BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const getuserdetail=createAsyncThunk(
    'tour/gettourdetail',
    async(_,{rejectWithValue})=>{
        try{
            const token =await AsyncStorage.getItem('token')
            if (!token) {
              return  rejectWithValue('No token found');
            }
            const response = await axios.get(`${Base_URL}/users/profile/detail`,{
                headers:{
                    Authorization : `Bearer  ${token}`,
                }
            })
            return response.data
        }catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message)
        }
    }
)

const userdetailSlice=createSlice({
    name:"userdetail",
    initialState:{
        userdetailsDetails:null,
        loading:false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(getuserdetail.pending,(state)=>{
            state.loading=true;
            state.error=null
        })
        .addCase(getuserdetail.fulfilled,(state,action)=>{
            state.loading=false;
            state.userdetailsDetails=action.payload
        })
        .addCase(getuserdetail.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload
        })
    }
})
export default userdetailSlice.reducer