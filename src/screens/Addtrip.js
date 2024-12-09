import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Modal,TouchableOpacity, TextInput, Image, Alert, ScrollView, StyleSheet, ImageBackground, FlatList } from 'react-native';
import { styles } from './Style';
import Icon from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addTour } from '../reduxtoolkit/slice/addTourSlice'; // Import your action
import Headerscreen from '../component/Headerscreen';
import axios from 'axios';  // For making API requests
import { SvgUri } from 'react-native-svg'; 
import { createThumbnail } from 'react-native-create-thumbnail';

const Addtrip = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, success, error, message } = useSelector(state => state.addTour);

  const [imageFiles, setImageFiles] = useState([]); 
  const [videoFile, setVideoFile] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null); 
  const [dateIn, setDateIn] = useState(null);
  const [dateOut, setDateOut] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [totalDays, setTotalDays] = useState(0);
  const [isDateInPickerVisible, setDateInPickerVisibility] = useState(false);
  const [isDateOutPickerVisible, setDateOutPickerVisibility] = useState(false);
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);  
  const [modalVisible, setModalVisible] = useState(false); // Controls the modal visibility
  const [searchQuery, setSearchQuery] = useState('');
 
 


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
  
    setDateOut(currentDate); // Set the valid date_out
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
            { mediaType, selectionLimit: 0 }, 
            (response) => handleMediaResponse(response)
          ),
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredCountries = countries.filter(country =>
    country.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={STYLES.countryItem}
      onPress={() => {
        setIsLoading(true); // Show loading indicator while selecting country
        setCountry(item);
        setModalVisible(false);
        setIsLoading(false); // Hide indicator after selection
      }}
    >
      <View style={STYLES.countryView}>
        {item.flag_url ? (
          <SvgUri uri={item.flag_url} width={30} height={20} /> // If SVG URL is available
        ) : (
          <Image source={{ uri: item.flag_url }} style={STYLES.flagImage} /> // Fallback to Image for other flag formats
        )}
        <Text style={STYLES.countryText}>{item.country_name}</Text>
      </View>
    </TouchableOpacity>
  );

  
 
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

  
  


  
  const handleImageRemove = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

 
  const handleVideoRemove = () => {
    setVideoFile(null);
  };

  
  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://visatravel.a1professionals.net/api/v1/auth/countries-with-flags');
      if (response.data.success) {
        setCountries(response.data.data); // Set the country data to the state
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
    formData.append('country_name', country.country_name);
    formData.append('country_short_code', country.iso2);   
  
    // Append multiple images
    imageFiles.forEach((image, index) => {
      formData.append('photos[]', {
        uri: image.uri.startsWith('file://') ? image.uri : `file://${image.uri}`,
        name: image.name || `photo_${index}.jpg`,
        type: image.type || 'image/jpeg',
      });
    });
  
    // Append single video (if any)
    if (videoFile) {
      formData.append('videos', {
        uri: videoFile.uri.startsWith('file://') ? videoFile.uri : `file://${videoFile.uri}`,
        name: videoFile.name || 'video.mp4',
        type: videoFile.type || 'video/mp4',
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
      const action = await dispatch(addTour(formData)); // Use your Redux action for API submission
      console.log('Dispatch action result:', action);
  
      if (action.payload && action.payload.data && action.payload.data.message) {
        Alert.alert("Success", action.payload.data.message || 'Tour added successfully!');
        navigation.goBack();
      } else {
        Alert.alert("Error", action.payload || 'Failed to add tour!');
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

       
        <TouchableOpacity onPress={() => setModalVisible(true)} style={STYLES.selectCountryBtn}>
            <Text style={STYLES.selectCountryText}>
              {country ? country.country_name : 'Select Country'}
            </Text>
            {country && (
              <SvgUri uri={country.flag_url} width={30} height={20} style={STYLES.flagImage} />
            )}
          </TouchableOpacity>

          {/* Modal for country selection */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={STYLES.modalOverlay}>
              <View style={STYLES.modalContainer}>
                <TextInput
                  style={STYLES.searchBar}
                  placeholder="Search for a country"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholderTextColor="#999"
                />
                {/* FlatList for filtered countries */}
                <FlatList
                  data={filteredCountries}
                  keyExtractor={(item, index) => item.country_name + index} // Ensure unique keys
                  renderItem={renderCountryItem}
                  style={STYLES.countryList}
                />
              </View>
            </View>
          </Modal>


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
  selectCountryBtn: {
    padding: 15,
    backgroundColor: '#E5E1E1',
    borderRadius: 10,
    marginTop: 30,
    width: "80%",
    alignSelf:"center",
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  selectCountryText: {
    fontSize: 16,
    color: '#000',
  },
  flagImage: {
    width: 30,
    height: 20,
    marginLeft: 10,
  },
  container: {
    alignSelf: 'center',
    width: '80%',
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '60%',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  countryList: {
    marginTop: 20,
  },
  countryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  countryView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryText: {
    fontSize: 16,
  },
 
})