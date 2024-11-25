import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import Headerscreen from '../component/Headerscreen'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const EditProfile = () => {
    const [name,setName]=useState('')
    const [description,setDescription]=useState('')
    const navigation=useNavigation()

  return (
 <SafeAreaView style={styles.container}>
<View style={{paddingTop:30}}>
 <Headerscreen showBackButton={true} onBackPress={()=>navigation.goBack()}/>
 </View>

 <View style={styles.view2}>
    <Text style={styles.text}>Full Name</Text>
    <TextInput
    placeholder='Enter your full name'
    value={name}
    onChangeText={()=>setName()}
    style={styles.inptstyle}/>

<Text style={styles.text}>Bio</Text>

<TextInput
  placeholder="Bio"
  value={description}
  onChangeText={(text) => setDescription(text)} // Pass the entered text to setDescription
  style={[styles.inptstyle, { borderWidth: 1, height: "30%", textAlignVertical: 'top' }]} // Ensure text starts from the top
  multiline={true} 
  returnKeyType="default" 
  placeholderTextColor="#999" 
/>
<TouchableOpacity 
  style={styles.btnview} 
  onPress={async () => {
    try {
      await AsyncStorage.setItem('bio', description); // Save bio to AsyncStorage
      Alert.alert('Success', 'Bio updated successfully!');
      navigation.goBack(); // Navigate back after saving
    } catch (error) {
      Alert.alert('Error', 'Failed to save bio.');
    }
  }}
>
  <Text style={[styles.txt, { textAlign: 'center' }]}>Update</Text>
</TouchableOpacity>
 </View>
 </SafeAreaView>
  )
}

export default EditProfile
const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#fff'
         },
         text:{
            fontSize:16,
            fontWeight:'700',
            color:"#000",
            paddingHorizontal:8
         },
         view2:{
            margin:30,
            paddingTop:20
         },
         inptstyle:{
            width:"100%",
            alignSelf:"center",
            borderBottomWidth:1,
            borderRadius:10,
            marginTop:10,
            paddingHorizontal:8,
            marginBottom:20

         },
         btnview:{
            width:"50%",
            borderRadius:15,
            alignSelf:"center",
            backgroundColor:"#0288D1",
            padding:12,
            marginTop:15
        },
        txt:{
            color:"#ffff",
            fontSize:18,
            fontWeight:'400',
            marginBottom:5
        },
})