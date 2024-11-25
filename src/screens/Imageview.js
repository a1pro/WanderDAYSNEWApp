// ImageViewScreen.js
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, SafeAreaView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './Style';
import Headerscreen from '../component/Headerscreen';

const Imageview = ({ route }) => {
  const navigation = useNavigation();
  const { image } = route.params;

  return (
    <SafeAreaView style={styles.container}>
    <View style={{ marginTop: 10 ,marginBottom:30}}>
    <Headerscreen  showBackButton={true} onBackPress={() => navigation.goBack()} />
    </View>
   
 
        <Image source={{uri:image}} style={style.image} />
     
   
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
 
  image: {
    width: "100%",
    height: 600,
    resizeMode: 'contain',
    // top:-100
  },
});

export default Imageview;
