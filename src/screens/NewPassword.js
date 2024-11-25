import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNewPassword } from '../reduxtoolkit/slice/setNewPasswordSlice'; // Import the setNewPassword action
import { styles } from './Style'; // Assuming you have styles defined in your 'Style.js'
import { useNavigation, useRoute } from '@react-navigation/native'; // Use useRoute to access passed params
import Icon from 'react-native-vector-icons/MaterialIcons';

const NewPassword = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Get the email passed from the OTP screen
  const email = route?.params?.email;
  console.log('Email passed to NewPassword screen:', email);

  const { loading, success, error, message } = useSelector((state) => state.setNewPassword);

  // Validate the form before making the API call
  const validateForm = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    // Trim spaces and check if the password is empty or less than 8 characters
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (trimmedPassword && trimmedPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    if (!trimmedConfirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      isValid = false;
    }

    if (trimmedPassword && trimmedConfirmPassword && trimmedPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Ensure you're sending the correct payload (email and password)
      const payload = {
        email: email,
        password: password // This is the new password entered by the user
      };
  
      // Call the dispatch function with the payload
      dispatch(setNewPassword(payload))
        .unwrap()
        .then((response) => {
          if (response.success) {
            Alert.alert('Success', response.message || 'Password updated successfully');
            navigation.navigate('Login');
          } else {
            Alert.alert('Error', response.message || 'Failed to update password');
          }
        })
        .catch((err) => {
          const errorMessage = err?.message || err?.response?.data?.message || 'Failed to update password';
          Alert.alert('Error', errorMessage);
        });
    }
  };
  

  // Handle the Cancel button click
  const handleCancel = () => {
    navigation.navigate('Login'); // Go back to login screen
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1D2B64', borderRadius: 20 }]}>
      <View>
        <Text style={[styles.txt, { textAlign: 'center', marginTop: '30%', fontSize: 30 }]}>Set New Password</Text>

        <View style={{ marginTop: '20%' }}>
          <Text style={[styles.txt, { paddingLeft: 20 }]}>New Password</Text>
          <View style={styles.paswrdview}>
            <TextInput
              style={{ paddingLeft: 20 }}
              maxLength={8}
              placeholder="Enter your new password"
              placeholderTextColor={'#000'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => setPassword(text)} // Don't trim here
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: 10, paddingRight: 20 }}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={30} color={'#000'} />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={{ color: 'red', paddingLeft: 30, marginBottom: 5 }}>{passwordError}</Text>
          ) : null}

          <Text style={[styles.txt, { paddingLeft: 20 }]}>Confirm Password</Text>
          <View style={styles.paswrdview}>
            <TextInput
              style={{ paddingLeft: 20 }}
              maxLength={8}
              placeholder="Enter your password again"
              placeholderTextColor={'#000'}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)} // Don't trim here
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ marginLeft: 10, paddingRight: 20 }}>
              <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={30} color={'#000'} />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={{ color: 'red', paddingLeft: 30, marginBottom: 5 }}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        <View style={styles.btnview2}>
          <TouchableOpacity style={[styles.btnview, { width: '40%' }]} onPress={handleSave} disabled={loading}>
            {loading ? (
              <Text style={[styles.txt, { textAlign: 'center' }]}>Saving...</Text>
            ) : (
              <Text style={[styles.txt, { textAlign: 'center' }]}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnview, { backgroundColor: '#ffff', width: '40%' }]} onPress={handleCancel}>
            <Text style={[styles.txt, { textAlign: 'center', color: '#000' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewPassword;
