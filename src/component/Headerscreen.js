import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing the vector icon

const Headerscreen = ({ imageTintColor, textColor, onBackPress, tintColor, showBackButton }) => {
  return (
    <View style={styles.container}>
      {showBackButton && ( // Conditionally render the back button
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={tintColor || '#002F87'} />
        </TouchableOpacity>
      )}
      <Image 
        source={require('../assets/header.png')} 
        style={[styles.image, { tintColor: imageTintColor || '#002F87' }]} 
      />
      <Text style={[styles.headerText, { color: textColor || '#002F87' }]}>
        WANDERDAYS
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 10, // Positioning the back arrow on the left
  },
  image: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Headerscreen;
