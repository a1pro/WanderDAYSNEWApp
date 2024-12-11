import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {loginuser} from '../reduxtoolkit/slice/loginuser';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Headerscreen from '../component/Headerscreen';
import {styles} from './Style';
import axios from 'axios';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if a token exists in AsyncStorage when the screen loads
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // If token exists, navigate to home screen (BottomTab)
          navigation.reset({index: 0, routes: [{name: 'BottomTab'}]});
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken(); // Check for token on component mount
  }, [navigation]); // Only run this effect on mount

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '676183804323-omsrv37bqtctsjbl091n8isi2jojepd9.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }, []);
  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const handleLogin = () => {
    if (validateForm()) {
      setLoading(true);
      dispatch(loginuser({email, password}))
        .unwrap()
        .then(response => {
          console.log('Login successful:', response);
          const token = response?.data?.token;

          if (token) {
            AsyncStorage.setItem('token', token)
              .then(() => {
                setLoading(false); // Hide loading indicator
                Alert.alert('Success', 'Login successful!');
                navigation.reset({index: 0, routes: [{name: 'BottomTab'}]}); // Navigate to BottomTab (Home)
              })
              .catch(error => {
                console.error('Error saving token:', error);
                setLoading(false); // Hide loading indicator
                Alert.alert('Error', 'Failed to save login session.');
              });
          } else {
            setLoading(false); // Hide loading indicator
            Alert.alert('Login failed', 'Invalid credentials');
          }
        })
        .catch(error => {
          setLoading(false); // Hide loading indicator
          console.error('Login failed:', error);
          Alert.alert(
            'Login failed',
            error.message || 'Please check your credentials.',
          );
        });
    }
  };
  const signInWithFacebook = async () => {
    console.log('Initiating Facebook Sign-In');
    try {
      // Step 1: Start Facebook login process
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      // Step 2: Check if the login was cancelled
      if (result.isCancelled) {
        Alert.alert(
          'Sign-In Cancelled',
          'You have cancelled the sign-in process',
        );
        return;
      }

      // Step 3: Get the Facebook access token
      const data = await AccessToken.getCurrentAccessToken();

      // Step 4: Log the data coming from Facebook
      console.log('Data coming from Facebook:', data);

      if (!data) {
        Alert.alert('Error', 'Failed to get Facebook access token');
        return;
      }

      const {accessToken, userID} = data;

      // Step 5: Fetch the user's profile including the email from Facebook Graph API
      const userProfile = await getFacebookUserProfile(accessToken);

      console.log('Facebook user profile:', userProfile);
      const email = userProfile?.email;
      const provider_id = userProfile?.id;
      const provider_name = 'facebook';

      console.log('User Email:', email);
      console.log('User ID (provider_id):', provider_id);

      // Step 6: Now pass email and provider_id to your social login API
      await socialloginWithFacebook(
        provider_name,
        email,
        provider_id,
        accessToken,
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Something went wrong during Facebook sign-in',
      );
    }
  };

  // Function to fetch user profile using the Facebook Graph API
  const getFacebookUserProfile = async accessToken => {
    try {
      // Requesting email, name, and userID from the Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?fields=email,name,id&access_token=${accessToken}`,
      );
      const userProfile = await response.json();

      if (userProfile && userProfile.email) {
        return userProfile; // Return the user profile including email and id
      } else {
        throw new Error('No email found');
      }
    } catch (error) {
      console.error('Error fetching Facebook user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  };

  // Your existing social login function where you send the data to your API
  const socialloginWithFacebook = async (
    provider_name,
    email,
    provider_id,
    accessToken,
  ) => {
    try {
      const res = await axios({
        method: 'POST',
        url: 'https://visatravel.a1professionals.net/api/v1/auth/sociallogin',
        data: {
          provider_name: provider_name,
          email: email, // Pass the email retrieved from Facebook
          provider_id: provider_id, // Pass the Facebook user ID as provider_id
        },
      });

      if (res.data.success) {
        const token = res.data.data.token;
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
        Alert.alert('Login Successful');
        navigation.reset({index: 0, routes: [{name: 'BottomTab'}]});
      } else {
        Alert.alert('Error', 'Something went wrong with Facebook login.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'An error occurred during Facebook login',
      );
    }
  };
  const signIn = async () => {
    console.log('Initiating Google Sign-In');
    await AsyncStorage.setItem('loginMethod', 'google');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('id', userInfo.data.user.id);

      if (userInfo) {
        const email = userInfo.data.user.email;
        const provider_name = 'google';
        const provider_id = userInfo.data.user.id;
        console.log('User ID:', provider_id);
        sociallogin(email, provider_name, provider_id);
        navigation.reset({index: 0, routes: [{name: 'BottomTab'}]});
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert(
          'Sign-In Cancelled',
          'You have cancelled the sign-in process',
        );
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-In In Progress', 'Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Play Services Error',
          'Google Play services are not available or outdated',
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Something went wrong during sign-in',
        );
      }
    }
  };

  const sociallogin = async (email, provider_name, provider_id) => {
    try {
      const res = await axios({
        method: 'POST',
        url: 'https://visatravel.a1professionals.net/api/v1/auth/sociallogin',
        data: {
          provider_name: provider_name,
          email: email,
          provider_id: provider_id,
        },
      });

      if (res.data.success === true) {
        const token = res.data.data.token;
        console.log('token', token);
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
        Alert.alert('Login Successfully');
        console.log('Social Login Response:', res.data);
      } else {
        Alert.alert('Error', 'Something went wrong with social login.');
      }
    } catch (error) {
      console.error('Social login error:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred during social login',
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#1D2B64'}]}>
      <ScrollView>
        <Headerscreen imageTintColor="#FFFFFF" textColor="#FFFFFF" />

        {/* Login Form */}
        <View style={styles.view1}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#ffff',
              textAlign: 'center',
              marginBottom: 50,
            }}>
            Login
          </Text>

          <Text style={[styles.txt, {paddingLeft: 20}]}>Your Email</Text>
          <TextInput
            style={styles.inpt}
            placeholder="Enter your email"
            placeholderTextColor="#000"
            keyboardType="email-address"
            value={email}
            onChangeText={text => setEmail(text)}
          />
          {emailError && (
            <Text style={{color: 'red', paddingLeft: 30, marginBottom: 5}}>
              {emailError}
            </Text>
          )}

          <View style={{marginTop: 10}}>
            <Text style={[styles.txt, {paddingLeft: 20}]}>Your Password</Text>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#ffff',
                  color: '#000',
                  borderRadius: 10,
                  paddingLeft: 15,
                  paddingRight: 15,
                  paddingTop: 5,
                  paddingBottom: 5,
                  width: '90%',
                  alignSelf: 'center',
                  marginBottom: 10,
                }}>
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#000"
                  style={{
                    flex: 1,
                    borderWidth: 0,
                    paddingLeft: 0,
                    marginTop: 0,
                  }}
                  onChangeText={text => setPassword(text)}
                  value={password}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{marginRight: 10}}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={{color: 'red', paddingLeft: 30, marginBottom: 5}}>
                  {passwordError}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgetPassword')}>
            <Text style={[styles.txt, {textAlign: 'right', marginRight: 20}]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          {/* Login Button */}
          <TouchableOpacity style={styles.btnview} onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.txt, {textAlign: 'center'}]}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign-In Button */}
          <TouchableOpacity style={styles.imgview} onPress={signIn}>
            <Image
              source={require('../assets/Google.png')}
              style={styles.img}
            />
            <Text style={[styles.txt, {color: '#000'}]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.imgview, {backgroundColor: '#1673EA'}]}
            onPress={signInWithFacebook}>
            <Image
              source={require('../assets/Facebook.png')}
              style={styles.img}
            />
            <Text style={[styles.txt, {color: '#ffff'}]}>
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 20,
          }}>
          <Text style={[styles.txt, {color: '#ffff', fontWeight: '200'}]}>
            Don't have an account ?
          </Text>
          <Text
            style={[styles.txt, {color: '#0288D1', paddingLeft: 10}]}
            onPress={() => navigation.navigate('Signup')}>
            Sign up
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
