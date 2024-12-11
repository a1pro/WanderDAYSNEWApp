import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './Style';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {signup} from '../reduxtoolkit/slice/signup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Headerscreen from '../component/Headerscreen';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10}$/;
const usernameRegex = /^[a-zA-Z0-9\s]+$/;

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [number, setNumber] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [numberError, setNumberError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const validateForm = () => {
    let isValid = true;

    if (!name) {
      setNameError('Name is required.');
      isValid = false;
    } else if (!usernameRegex.test(name)) {
      setNameError('Username can only contain letters, numbers, and spaces.');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!number) {
      setNumberError('Phone number is required.');
      isValid = false;
    } else if (!phoneRegex.test(number)) {
      setNumberError('Phone number must be 10 digits.');
      isValid = false;
    } else {
      setNumberError('');
    }

    return isValid;
  };

  const handleSignup = () => {
    if (validateForm()) {
      setLoading(true);

      dispatch(
        signup({
          username: name,
          email: email,
          phone_number: number,
          password: password,
        }),
      )
        .unwrap()
        .then(response => {
          setLoading(false);
          if (response.data.message === 'Register Successfully') {
            console.log('Signup successful:', response);
            navigation.navigate('Login');
          } else {
            console.log('Signup did not return success message:', response);
          }
        })
        .catch(error => {
          setLoading(false); // Stop loading
          console.log('Signup failed:', error);
          if (error.message.includes('email')) {
            Alert.alert('Error', 'This email is already in use.');
          } else if (error.message.includes('phone_number')) {
            Alert.alert('Error', 'This phone number is already in use.');
          } else {
            Alert.alert('Error', 'An unknown error occurred.');
          }
        });
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#1D2B64'}]}>
      <Headerscreen
        imageTintColor="#FFFFFF"
        textColor="#FFFFFF"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        tintColor="#FFFF"
      />
      <View style={styles.view1}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffff',
            textAlign: 'center',
            marginBottom: 50,
          }}>
          Sign Up
        </Text>

        <Text style={[styles.txt, {paddingLeft: 20}]}>Username</Text>
        <TextInput
          style={styles.inpt}
          placeholder="Enter your Username"
          placeholderTextColor={'#000'}
          value={name}
          onChangeText={nam => setName(nam)}
        />
        {nameError ? (
          <Text style={{color: 'red', paddingLeft: 20}}>{nameError}</Text>
        ) : null}

        <Text style={[styles.txt, {paddingLeft: 20}]}>E-mail</Text>
        <TextInput
          style={styles.inpt}
          placeholderTextColor={'#000'}
          placeholder="Enter your email"
          value={email}
          onChangeText={ema => setEmail(ema)}
        />
        {emailError ? (
          <Text style={{color: 'red', paddingLeft: 20}}>{emailError}</Text>
        ) : null}

        <Text style={[styles.txt, {paddingLeft: 20}]}>Password</Text>
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
            placeholder="Enter your Password"
            secureTextEntry={!showPassword}
            placeholderTextColor="#000"
            style={{flex: 1, borderWidth: 0, paddingLeft: 0, marginTop: 0}}
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

        <Text style={[styles.txt, {paddingLeft: 20}]}>Phone No.</Text>
        <TextInput
          style={styles.inpt}
          placeholder="Enter your phone number"
          value={number}
          placeholderTextColor={'#000'}
          onChangeText={numb => setNumber(numb)}
          keyboardType="numeric"
        />
        {numberError ? (
          <Text style={{color: 'red', paddingLeft: 20}}>{numberError}</Text>
        ) : null}

        {loading ? (
          <Text style={{color: '#ffff', textAlign: 'center', marginTop: 20}}>
            Loading...
          </Text>
        ) : (
          <TouchableOpacity
            style={[styles.btnview, {marginTop: 50}]}
            onPress={handleSignup}>
            <Text style={[styles.txt, {textAlign: 'center'}]}>Signup</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Signup;
