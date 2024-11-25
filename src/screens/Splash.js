import { View, Text, SafeAreaView, Image, PermissionsAndroid } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

const Splash = () => {
const navigation=useNavigation()

    useEffect(()=>{
        setTimeout(()=>{
            navigation.navigate('Login')
        },2000)
   
    },[])
    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Cool Photo App Camera Permission',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
        } else {
          console.log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };
    useEffect(()=>{
      requestCameraPermission()
    },[])
  return (
<SafeAreaView>
<View>
    <Image source={require('../assets/logo.png')} resizeMode='contain' style={{height:'100%',width:'100%'}}/>
    </View>
</SafeAreaView>
  )
}

export default Splash