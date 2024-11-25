import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { styles } from './Style';
import Icon from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addTour } from '../reduxtoolkit/slice/addTourSlice'; // Import your action
import Headerscreen from '../component/Headerscreen';
import axios from 'axios';  // For making API requests
import { SvgUri } from 'react-native-svg';  // Import SvgUri for displaying country flags
import { createThumbnail } from 'react-native-create-thumbnail';

const Addtrip = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, success, error, message } = useSelector(state => state.addTour);

  const [imageFiles, setImageFiles] = useState([]);  // For multiple image files
  const [videoFile, setVideoFile] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);  // For a single video file
  const [dateIn, setDateIn] = useState(null);
  const [dateOut, setDateOut] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // To manage loading state
  const [totalDays, setTotalDays] = useState(0);
  const [isDateInPickerVisible, setDateInPickerVisibility] = useState(false);
  const [isDateOutPickerVisible, setDateOutPickerVisibility] = useState(false);
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);  // For storing country data from API
  const [open, setOpen] = useState(false); // Controls the dropdown visibility
  const [value, setValue] = useState(null); // Stores the selected country value
  const [items, setItems] = useState([]);


  const showDateInPicker = () => setDateInPickerVisibility(true);
  const showDateOutPicker = () => setDateOutPickerVisibility(true);
  const hideDateInPicker = () => setDateInPickerVisibility(false);
  const hideDateOutPicker = () => setDateOutPickerVisibility(false);

  const handleDateInConfirm = (event, selectedDate) => {
    const currentDate = selectedDate || dateIn;
    setDateIn(currentDate);
    hideDateInPicker();
    if (dateOut && moment(currentDate).isAfter(dateOut)) {
      setDateOut(null);
      setTotalDays(0);
    }
    calculateTotalDays(currentDate, dateOut);
  };

  const handleDateOutConfirm = (event, selectedDate) => {
    const currentDate = selectedDate || dateOut;
    if (dateIn && moment(currentDate).isSame(dateIn, 'day')) {
      alert("Date Out cannot be the same as Date In.");
      return;
    }
    if (dateIn && moment(currentDate).isBefore(dateIn)) {
      alert("Date Out cannot be before Date In.");
      return;
    }
    setDateOut(currentDate);
    hideDateOutPicker();
    calculateTotalDays(dateIn, currentDate);
  };

  const calculateTotalDays = (startDate, endDate) => {
    if (startDate && endDate) {
      const days = moment(endDate).diff(moment(startDate), 'days') + 1;
      setTotalDays(days);
    } else {
      setTotalDays(0);
    }
  };

  // Function to handle image and video selection
  const handleMediaSelection = (mediaType) => {
    Alert.alert(
      "Select Option",
      "Choose from the following options:",
      [
        {
          text: "Camera",
          onPress: () => launchCamera({ mediaType }, (response) => handleMediaResponse(response)),
        },
        {
          text: "Gallery",
          onPress: () => launchImageLibrary(
            { mediaType, selectionLimit: 0 }, // Allow multiple selection
            (response) => handleMediaResponse(response)
          ),
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };



  
  // Handle the media response (image/video selected)
  const handleMediaResponse = async (response) => {
    if (response.didCancel) {
      console.log('User cancelled media picker');
    } else if (response.error) {
      console.log('MediaPicker Error: ', response.error);
    } else {
      if (response.assets && response.assets.length > 0) {
        const selectedAssets = response.assets;
  
        // Handle images
        const newImages = selectedAssets.filter(asset => asset.type.includes('image')).map(asset => ({
          uri: asset.uri,
          name: asset.fileName || 'file.jpg',
          type: asset.type || 'image/jpeg',
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          originalPath: asset.originalPath || asset.uri,
        }));
  
        setImageFiles((prevFiles) => {
          const updatedFiles = [...prevFiles, ...newImages];
          if (updatedFiles.length > 5) {
            Alert.alert('Limit Reached', 'You can select a maximum of 5 images.');
            return updatedFiles.slice(0, 5); // Trim the array to 5 images
          }
          return updatedFiles;
        });
  
        // Handle video
        const videoAsset = selectedAssets.find(asset => asset.type.includes('video'));
        if (videoAsset) {
          setVideoFile({
            uri: videoAsset.uri,
            name: videoAsset.fileName || 'file.mp4',
            type: videoAsset.type || 'video/mp4',
          });
  
          // Generate video thumbnail
          try {
            const thumbnail = await createThumbnail({ url: videoAsset.uri });
            setVideoThumbnail(thumbnail.path);
            console.log('Video thumbnail generated:', thumbnail.path);
          } catch (err) {
            console.log('Error generating video thumbnail:', err);
          }
        }
  
        console.log('Selected media details:', selectedAssets);
      }
    }
  };
  
  


  // Remove selected image by index
  const handleImageRemove = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Remove selected video
  const handleVideoRemove = () => {
    setVideoFile(null);
  };

  // Fetch country data from the API
  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://visatravel.a1professionals.net/api/v1/auth/countries-with-flags');
      if (response.data.success) {
        const formattedCountries = response.data.data.map((country) => ({
          label: `${country.country_name} `, // Display name
          value: country, // Store the entire country object
          icon: () => <SvgUri width={30} height={20} uri={country.flag_url} />, // Display flag
        }));
        setItems(formattedCountries);
      } else {
        Alert.alert('Error', 'Failed to fetch countries');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      Alert.alert('Error', 'Failed to fetch countries');
    }
  };


  useEffect(() => {
    fetchCountries();  // Fetch countries when the screen is loaded
  }, []);

  // API call function to submit the form data via Redux action
  const handleSave = async () => {
    if (!country) {
      Alert.alert("Error", "Please select a country");
      return;
    }
    if (!dateIn || !dateOut) {
      Alert.alert("Error", "Please select both Date In and Date Out");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('date_in', moment(dateIn).format('DD/MM/YYYY'));
    formData.append('date_out', moment(dateOut).format('DD/MM/YYYY'));
    formData.append('day_spend', totalDays.toString());
    formData.append('country_name', country.country_name);  // Pass country name
    formData.append('country_short_code', country.iso2);   // Pass country short code

    // Append multiple images
    imageFiles.forEach((imageFile) => {
      formData.append('photos', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      });
    });

    // Append single video
    if (videoFile) {
      formData.append('videos', {
        uri: videoFile.uri,
        name: videoFile.name,
        type: videoFile.type,
      });

      if (videoThumbnail) {
        formData.append('videothubmnail', {
          uri: videoThumbnail.startsWith('file://') ? videoThumbnail : `file://${videoThumbnail}`,
          name: 'thumbnail.jpg',
          type: 'image/jpeg',
        });
      }
    }

    try {
      console.log('Sending form data:', formData);
      const action = await dispatch(addTour(formData));
      console.log('Dispatch action result:', action);

      if (action.payload && action.payload.data && action.payload.data.message) {
        Alert.alert("Success", action.payload.data.message || 'Tour added successfully!');
        navigation.goBack();
      } else {
        Alert.alert("Error", 'Failed to add tour!');
      }
    } catch (error) {
      console.error("Error adding tour:", error);
      Alert.alert("Error", "An error occurred while adding the tour");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  return (
    <ImageBackground
    source={require('../assets/oldback.png')} // Replace with your uploaded image path
    style={STYLES.backgroundImage}>
    <SafeAreaView style={styles.container}>
    
      <ScrollView contentContainerStyle={{paddingBottom:100}}>
        
        <Headerscreen showBackButton={true} onBackPress={() => navigation.goBack()}/>

       
        <View style={STYLES.container}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Select Country"
              style={{
                backgroundColor: "#E5E1E1",
                borderRadius: 10,
              }}
              dropDownContainerStyle={{
                backgroundColor: "#ffffff",
              }}
              listItemContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              listItemLabelStyle={{
                marginLeft: 10,
              }}
              onChangeValue={(selectedValue) => {
                setCountry(selectedValue);  // Store the selected country object
              }}
            />
          </View>

        {/* Date In and Date Out Picker */}
        <TouchableOpacity onPress={showDateInPicker}>
          <TextInput
            style={{ backgroundColor: "#E5E1E1", borderRadius: 10, padding: 20, width: "80%", alignSelf: "center", marginTop: 30 }}
            placeholder='Date In'
            value={dateIn ? moment(dateIn).format('DD/MM/YYYY') : ''}
            editable={false}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={showDateOutPicker}>
          <TextInput
            style={{ backgroundColor: "#E5E1E1", borderRadius: 10, padding: 20, width: "80%", alignSelf: "center", marginTop: 30 }}
            placeholder='Date Out'
            value={dateOut ? moment(dateOut).format('DD/MM/YYYY') : ''}
            editable={false}
          />
        </TouchableOpacity>

        <View style={{ backgroundColor: "#E5E1E1", borderRadius: 10, padding: 20, width: "80%", alignSelf: "center", marginTop: 30 }}>
          <Text>Total Days: {totalDays}</Text>
        </View>

        {/* Date Picker Modals */}
        {isDateInPickerVisible && (
          <DateTimePicker
            value={dateIn || new Date()}
            mode="date"
            display="default"
            onChange={handleDateInConfirm}
          />
        )}

        {isDateOutPickerVisible && (
          <DateTimePicker
            value={dateOut || new Date()}
            mode="date"
            display="default"
            onChange={handleDateOutConfirm}
          />
        )}


        <View style={styles.view2}>
          <TouchableOpacity style={{ width: "30%", marginLeft: 30 }} onPress={() => handleMediaSelection('photo')}>
            <Image source={require('../assets/addimage.png')} style={{ height: 100, width: 100, resizeMode: "contain" }} />
            <Text style={[styles.txt, { color: "black" }]}>Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: "30%", marginLeft: 30 }} onPress={() => handleMediaSelection('video')}>
            <Image source={require('../assets/addimage.png')} style={{ height: 100, width: 100, resizeMode: "contain" }} />
            <Text style={[styles.txt, { color: "black" }]}>Add Video</Text>
          </TouchableOpacity>
        </View>
       
       {imageFiles.length > 0 && (
          <Text style={{paddingBottom:5,fontSize:20,paddingLeft:20,fontWeight:"bold"}}>Selected Images</Text>
       )}
        {imageFiles.length > 0 && (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
    {imageFiles.map((file, index) => (
      <View key={index} style={STYLES.mediaPreviewContainer}>
        <Image source={{ uri: file.uri }} style={STYLES.mediaImage} />
        <TouchableOpacity
          style={STYLES.deleteButton}
          onPress={() => handleImageRemove(index)}
        >
          <Icon name="closecircle" size={20} color="#FF0000" />
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
)}

     {videoFile && (
          <View >
            <Text style={[styles.txt, { color: "black",paddingBottom:5,fontSize:20,paddingLeft:20,fontWeight:"bold" }]}>Selected Videos</Text>
            <View style={STYLES.mediaPreviewContainer}>
            <Image source={{ uri: videoFile.uri }} style={[STYLES.mediaImage,{marginLeft:20}]} />
            <TouchableOpacity
              style={[STYLES.deleteButton,{left:100,}]}
              onPress={handleVideoRemove}
            >
              <Icon name="closecircle" size={20} color="#FF0000" />
            </TouchableOpacity>
            </View>
          </View>
        )}

       
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.btnview, { backgroundColor: "#1D2B64" }]}
          disabled={isLoading} 
        >
          <Text style={[styles.txt, { textAlign: "center" }]}>
            {isLoading ? 'Loading...' : 'Save'} 
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
};

export default Addtrip;
const STYLES=StyleSheet.create({
  mediaPreviewContainer: {
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
    marginLeft:10
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    opacity:1
  },
  mediaImage: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    borderRadius: 25,
   marginRight:30
  },
  deleteButton: {
    position: 'absolute',
    top:-10,
    right: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
  }, 
  container: {
    alignSelf: 'center',
    width: '80%',
    marginTop: 30,
  },
 
})