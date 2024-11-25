import { View, Text, StyleSheet, Platform, Dimensions, Image } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Profile from '../screens/Profile'
import Chat from '../screens/Chat'
import Search from '../screens/Search'
import Home from '../screens/Home'

const Tab =createBottomTabNavigator()
const BottomTab = () => {
    return (
        <SafeAreaProvider>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarActiveTintColor: '#000',
              tabBarStyle: {
                backgroundColor: '#ffff', 
                marginBottom: 2,
                height: '8%'
              },
              tabBarIcon: ({ color, size }) => {
                let iconName;
    
                if (route.name === 'Home') {
                  iconName = require('../assets/Home.png');
                } else if (route.name === 'Search') {
                  iconName = require('../assets/Search.png');
                } else if (route.name === 'Chat') {
                  iconName = require('../assets/Chat.png');
                } else if (route.name === 'Profile') {
                  iconName = require('../assets/User.png');
                } 
    
                return (
                  <Image
                    source={iconName}
                    style={[styles.icon]}
                  />
                );
              },
              tabBarLabel: ({ focused, color }) => { // Dynamically set tab label based on selected language
                let label;
    
                if (route.name === 'Home') {
                  label = 'Home';
                } else if (route.name === 'Search') {
                  label = 'Search';
                } else if (route.name === 'Chat') {
                  label = "Chat";
                } else if (route.name === 'Profile') {
                  label = 'Profile'
                } 
    
                return <Text style={{ color,  }}>{label}</Text>;
              },
              tabBarLabelStyle: {
                fontSize: 14, 
              },
            })}
          >
            <Tab.Screen name='Home' component={Home} options={{ headerShown: false }} />
            <Tab.Screen name='Search' component={Search} options={{ headerShown: false }} />
            <Tab.Screen name='Chat' component={Chat} options={{ headerShown: false }} />
            <Tab.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
          </Tab.Navigator>
        </SafeAreaProvider>
      );
    };
    
    const styles = StyleSheet.create({
      icon: {
        resizeMode: 'contain',
        margin: 5,
        ...Platform.select({
          ios: {
            height: 30,
            width: 30,
          },
          android: {
            height: Dimensions.get('window').width * 0.1/2, // Adjust according to your requirement
            width: Dimensions.get('window').width * 0.1/1,
          },
        }),
      },
    });

export default BottomTab