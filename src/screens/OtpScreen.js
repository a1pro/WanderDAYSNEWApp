import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp } from '../reduxtoolkit/slice/verifyOtpSlice';
import Headerscreen from '../component/Headerscreen';

const OtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']); 
  const route = useRoute();
  const email = route?.params?.email; 
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const inputRefs = useRef([]);

  // Destructure state from the Redux store
  const { loading, error, success, message } = useSelector((state) => state.verifyOtp);

  // Handle OTP input change
  const handleOtpChange = (value, index) => {
    const otpArray = [...otp];
    otpArray[index] = value;
    setOtp(otpArray);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Validate OTP before sending
  const validateOtp = () => {
    if (otp.includes('')) {
      Alert.alert('Error', 'Please enter the complete OTP.');
      return false;
    }
    return true;
  };


  const handleContinue = () => {
    const isValid = validateOtp();
    if (isValid) {
      const otpCode = otp.join('');
     
      dispatch(verifyOtp({ email, otp: otpCode }))
        .unwrap() 
        .then((response) => {
          if (response.success) {
           
            navigation.navigate('NewPassword', { email });
          } else {
            
            Alert.alert('Error', response.message || 'Failed to verify OTP');
          }
        })
        .catch((err) => {
         
          Alert.alert('Error', err || 'Failed to verify OTP');
        });
    }
  };

  return (
    <SafeAreaView style={styles.container} >
     <Headerscreen imageTintColor="#FFFFFF" textColor="#FFFFFF" />
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      
      <Text style={styles.title}>Password reset</Text>
      <Text style={styles.subtitle}>We sent a code to {email}</Text>

      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            value={value}
            onChangeText={(text) => handleOtpChange(text, index)}
            style={styles.otpBox}
            maxLength={1}
            keyboardType="number-pad"
            ref={(el) => (inputRefs.current[index] = el)} // Assign ref to each input
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3b6b', // Blue background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width:"100%",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpBox: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#d6d6d6',
  },
  button: {
    backgroundColor: '#0095f6', // Blue button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 14,
  },
});

export default OtpScreen;
