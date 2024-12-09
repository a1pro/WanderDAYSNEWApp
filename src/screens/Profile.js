import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // Import useIsFocused
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../reduxtoolkit/slice/loginuser';
import { getuserdetail } from '../reduxtoolkit/slice/getuserdetail';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import Headerscreen from '../component/Headerscreen';
import { LoginManager } from 'react-native-fbsdk-next';
import { SvgUri } from 'react-native-svg';
const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to detect if screen is focused
 
  const userDetails = useSelector((state) => state.getuserdetail.userdetailsDetails);
  console.log("userDeails",userDetails);
  const loading = useSelector((state) => state.getuserdetail.loading);
  const error = useSelector((state) => state.getuserdetail.error);

  const [profileImage, setProfileImage] = useState(require('../assets/Ellipse.png'));

  useEffect(() => {
    if (isFocused) {
      dispatch(getuserdetail());
    }
  }, [dispatch, isFocused]);

  
 

  useEffect(() => {
    if (userDetails?.data?.profile_pic) {
      setProfileImage({ uri: userDetails.data.profile_pic });
    } else {
      setProfileImage(require('../assets/Ellipse.png')); // Set default image
    }
  }, [userDetails]);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Retrieve the login method from AsyncStorage
              const loginMethod = await AsyncStorage.getItem('loginMethod');
              if (loginMethod === 'google') {
                console.log('Logging out from Google...');
                await GoogleSignin.signOut(); // Sign out from Google
              }
              if (loginMethod === 'facebook') {
                console.log('Logging out from Facebook...');
                LoginManager.logOut(); // Log out from Facebook
              }
              console.log('Clearing AsyncStorage...');
              await AsyncStorage.clear(); // Clear AsyncStorage
              
              // Reset the navigation stack and navigate to the Login screen
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              console.log('Logged out successfully!');
            } catch (error) {
              console.error('Error during logout:', error);
              // Alert.alert('Logout Error', 'Something went wrong while logging out. ' + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  

  const handleEditProfileImage = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => launchCamera({}, (response) => {
            if (response.assets?.length > 0) {
              uploadProfileImage(response.assets[0]);
            }
          }),
        },
        {
          text: 'Gallery',
          onPress: () => launchImageLibrary({}, (response) => {
            if (response.assets?.length > 0) {
              uploadProfileImage(response.assets[0]);
            }
          }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const uploadProfileImage = async (image) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User is not authenticated.');
        return;
      }

      const formData = new FormData();
      formData.append('photo', {
        uri: image.uri,
        type: image.type,
        name: image.fileName,
      });

      const response = await fetch(
        'https://visatravel.a1professionals.net/api/v1/users/upload/profilepic',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setProfileImage({ uri: data.data });
        Alert.alert('Success', 'Your photo has been saved successfully.');
      } else {
        Alert.alert('Error', 'Failed to upload your photo.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading the photo.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A387E" />
      </View>
    );
  }

  // if (error) {
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>Error: {error}</Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Headerscreen imageTintColor="#FFFFFF" textColor="#FFFFFF" tintColor={'#ffff'} showBackButton={true}/>
      </View>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image source={profileImage} style={styles.profileImage} />
          <TouchableOpacity style={styles.editIcon} onPress={handleEditProfileImage}>
            <Icon name="camera-alt" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.countryView}>
          <SvgUri uri={userDetails?.data?.countryFlag} width={30} height={20} />
          <Text>{userDetails?.data?.country}</Text>
        </View>
        <Text style={styles.username}>{userDetails?.data?.username || userDetails?.data?.full_name}</Text>
        <Text style={styles.email}>{userDetails?.data?.email || ''}</Text>
      </View>
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 14, color: '#000', fontWeight: "bold" }}>
          Bio: <Text style={{ fontSize: 14, color: '#555' }}> {userDetails?.data?.bio || 'No bio available'}</Text>
        </Text>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Icon name="settings" size={24} color="#0A387E" />
          <Text style={styles.optionText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="edit-square" size={24} color="#0A387E" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={()=>navigation.navigate('LeaderBoard')}>
          <Image source={require('../assets/leaderboard.png')} style={{height:30,width:30,resizeMode:"contain",tintColor:"#0A387E"}}/>
          <Text style={styles.optionText}>LeaderBoard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Icon name="support-agent" size={24} color="#0A387E" />
          <Text style={styles.optionText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#0A387E" />
          <Text style={styles.optionText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#0A387E', padding: 20,height:"25%" },
  headerTitle: { fontSize: 20, color: '#fff', textAlign: 'center' },
  profileSection: { alignItems: 'center', marginTop: -40 },
  profileImageContainer: { position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0A387E',
    borderRadius: 15,
    padding: 5,
  },
  username: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  email: { fontSize: 14, color: '#555' },
  optionsContainer: { marginTop: "10%", paddingHorizontal: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: { marginLeft: 10, fontSize: 16, color: '#0A387E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red' },
  countryView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:10,
    marginBottom:10
  },
});

export default Profile;
