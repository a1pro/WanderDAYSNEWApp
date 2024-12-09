import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setUser} from '../reduxtoolkit/slice/loginuser';
import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import BottomTab from './BottomTab';
import Addtrip from '../screens/Addtrip';
import Detail from '../screens/Detail';
import Imageview from '../screens/Imageview';
import ForgetPassword from '../screens/ForgetPassword';
import OtpScreen from '../screens/OtpScreen';
import NewPassword from '../screens/NewPassword';
import VideoPlayer from '../screens/VideoPlayer';
import EditProfile from '../screens/EditProfile';
import ChatScreen from '../screens/ChatScreen';
import LeaderBoard from '../screens/LeaderBoard';

const Stack = createStackNavigator();

const StackNavigation = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.loginuser.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        dispatch(setUser({token})); // Set the user data in Redux
      }
      setIsLoading(false);
    };

    checkLoginStatus();
  }, [dispatch]);

  if (isLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaProvider>
      <Stack.Navigator
        initialRouteName={Splash}
        screenOptions={{headerShown: false}}>
        {/* If no user, show login/signup-related screens */}

        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="NewPassword" component={NewPassword} />
        <Stack.Screen name="BottomTab" component={BottomTab} />
        <Stack.Screen name="Addtrip" component={Addtrip} />
        <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen name="Imageview" component={Imageview} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="LeaderBoard" component={LeaderBoard} />

      </Stack.Navigator>
    </SafeAreaProvider>
  );
};

export default StackNavigation;
