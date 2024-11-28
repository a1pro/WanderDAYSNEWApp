import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/Stacknavigation';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import store from './src/reduxtoolkit/Store/Store';
import { PermissionsAndroid, Platform } from 'react-native';

const App = () => {

 
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
       
        const locationPermissionGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show your current country or location-based features.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
  
        if (locationPermissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
  
        // Request notification permissions
        const notificationPermissionGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
  
        if (notificationPermissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      }
  
      // Request notification permissions for iOS
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
      if (enabled) {
        console.log('Notification permission granted:', authStatus);
      } else {
        console.log('Notification permission not granted');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };
  

  // Get Firebase Cloud Messaging (FCM) token and save it in AsyncStorage
  const getDeviceToken = async () => {
    try {
      let token = await messaging().getToken();
      console.log('FCM Token:', token);
      await AsyncStorage.setItem('fcmToken', token);
      console.log('FCM Token saved to AsyncStorage');
    } catch (error) {
      console.error('Error fetching FCM token:', error);
    }
  };

  useEffect(() => {
    // Request permissions and get device token on mount
    requestPermissions();
    getDeviceToken();

    // Foreground message listener: Will be triggered when the app is in the foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM message received in foreground:', remoteMessage);

      // Show local notification when app is in the foreground
      
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <StackNavigation />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
