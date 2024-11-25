import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../reduxtoolkit/slice/sendotp';  
import { styles } from './Style';
import { useNavigation } from '@react-navigation/native';
import Headerscreen from '../component/Headerscreen';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ForgetPassword = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { loading, error, success } = useSelector((state) => state.sendOtp);  

  // Form validation
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
    return isValid;
  };

  const sendEmail = () => {
    const isValid = validateForm();
    if (isValid) {
      dispatch(sendOtp({ email }))
        .unwrap()
        .then((response) => {
          if (response.success) {
            navigation.navigate('OtpScreen', { email });
          } else {
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
          }
        })
        .catch((err) => {
          Alert.alert('Error', err || 'An error occurred while sending OTP');
        });
    }
  };

  useEffect(() => {
    if (success) {
      navigation.navigate('OtpScreen', { email });
    }
  }, [success, email, navigation]); 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#1D2B64" }]}>
           <Headerscreen imageTintColor="#FFFFFF" textColor="#FFFFFF" showBackButton={true} onBackPress={() => navigation.goBack()} tintColor="#FFFF"/>

      <View>
        <Text style={[styles.txt, { textAlign: "center", marginTop: "30%", fontSize: 20 }]}>Forgot Password</Text>
        <Text style={[styles.txt, { fontSize: 14, textAlign: 'center', marginTop: 10 }]}>
          No worries, we’ll send you reset instructions
        </Text>

        <View style={{ marginTop: "15%", marginBottom: 40 }}>
          <Text style={[styles.txt, { paddingLeft: 20 }]}>Email</Text>
          <TextInput
            style={styles.inpt}
            placeholder='Enter your email'
            value={email}
            onChangeText={(ema) => setEmail(ema)}
          />
          {emailError ? <Text style={{ color: 'red', paddingLeft: 30, marginBottom: 5 }}>{emailError}</Text> : null}
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.btnview} onPress={sendEmail} disabled={loading}>
          <Text style={[styles.txt, { textAlign: "center" }]}>
            {loading ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={style.backText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgetPassword;

const style = StyleSheet.create({
  backText: {
    color: '#fff',
    marginTop: 50,
    fontSize: 14,
    textAlign: "center",
  },
});
