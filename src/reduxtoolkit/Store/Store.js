import { configureStore } from '@reduxjs/toolkit';
import signupReducer from '../slice/signup'; 
import  loginuserReducer  from '../slice/loginuser';
import  sendOtpReducer  from '../slice/sendotp';
import  verifyOtpReducer  from '../slice/verifyOtpSlice';
import  setNewPasswordReducer  from '../slice/setNewPasswordSlice';
import  addTourReducer  from '../slice/addTourSlice';
import  getTourDetailReducer  from '../slice/getTourDetail';
import  getuserdetailReducer from '../slice/getuserdetail';
import  updateProfileReducer  from '../slice/updateProfile';



const store = configureStore({
  reducer: {
    signup: signupReducer, 
    loginuser:loginuserReducer,
    sendOtp:sendOtpReducer,
    verifyOtp:verifyOtpReducer,
    setNewPassword: setNewPasswordReducer,
    addTour:addTourReducer,
    getTourDetail:getTourDetailReducer,
    getuserdetail:getuserdetailReducer,
    updateProfile:updateProfileReducer

    

  },
});

export default store;