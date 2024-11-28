import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert, FlatList, Image, TextInput, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg'; // For SVG flags (if the API provides URL for SVG flags)
import axios from 'axios';
import Headerscreen from '../component/Headerscreen';
import { useDispatch } from 'react-redux';
import { updated } from '../reduxtoolkit/slice/updateProfile';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Base_URL } from '../component/BaseUrl';

const EditProfile = () => {
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState(null); // The selected country
  const [countries, setCountries] = useState([]); // Store countries fetched from API
  const [modalVisible, setModalVisible] = useState(false); // Controls the modal visibility
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for ActivityIndicator

  const dispatch = useDispatch();
  const navigation = useNavigation();

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

  const handleUpdate = async () => {
    if (!name) {
      return Alert.alert('Please enter name');
    }
    if (!description) {
      return Alert.alert('Please enter something in Bio');
    }
    if (!country) {
      return Alert.alert('Please select a country');
    }
 
    setIsLoading(true);
 
    const payload = {
      full_name: name,
      bio: description,
      country: country.country_name,
      country_short_code: country.iso2
    };
 
    try {
      console.log('Data sent to API:', payload); // Check the data format
 
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return Alert.alert('Error', 'Token is missing');
      }
 
      const response = await axios.post(
        `${Base_URL}/users/profile/update`,
        payload,
        {
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
            Authorization: `Bearer ${token}`,
          }
        }
      );
 
      // Log the response for debugging
      console.log('API Response:', response.data);
 
      // Check for success message
      if (response.data.message) {
        Alert.alert('Success', response.data.message || 'Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
 
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'An error occurred');
      } else {
        Alert.alert('Error', 'Network error or server unavailable');
      }
    } finally {
      setIsLoading(false); // Hide the loading indicator after the API call
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredCountries = countries.filter(country =>
    country.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setIsLoading(true); // Show loading indicator while selecting country
        setCountry(item);
        setModalVisible(false);
        setIsLoading(false); // Hide indicator after selection
      }}
    >
      <View style={styles.countryView}>
        {item.flag_url ? (
          <SvgUri uri={item.flag_url} width={30} height={20} /> // If SVG URL is available
        ) : (
          <Image source={{ uri: item.flag_url }} style={styles.flagImage} /> // Fallback to Image for other flag formats
        )}
        <Text style={styles.countryText}>{item.country_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ paddingTop: 30 }}>
          <Headerscreen showBackButton={true} onBackPress={() => navigation.goBack()} />
        </View>
        <View style={styles.view2}>
          <Text style={styles.text}>Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.inptstyle}
          />
          <Text style={styles.text}>Description</Text>
          <TextInput
            placeholder="Bio"
            value={description}
            onChangeText={(text) => setDescription(text)}
            style={[styles.inptstyle, { borderWidth: 1, height: '30%', textAlignVertical: 'top' }]}
            multiline={true}
            returnKeyType="default"
            placeholderTextColor="#999"
          />
          <Text style={styles.text}>Select Country</Text>

          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectCountryBtn}>
            <Text style={styles.selectCountryText}>
              {country ? country.country_name : 'Select Country'}
            </Text>
            {country && (
              <SvgUri uri={country.flag_url} width={30} height={20} style={styles.flagImage} />
            )}
          </TouchableOpacity>

          {/* Modal for country selection */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <TextInput
                  style={styles.searchBar}
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
                  style={styles.countryList}
                />
              </View>
            </View>
          </Modal>

          {/* Show loading indicator while updating */}
          {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

          <TouchableOpacity
            style={styles.btnview}
            onPress={handleUpdate}
          >
            <Text style={[styles.txt, { textAlign: 'center' }]}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  view2: {
    margin: 30,
    paddingTop: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 8,
  },
  inptstyle: {
    width: '100%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  btnview: {
    width: '50%',
    borderRadius: 15,
    alignSelf: 'center',
    backgroundColor: '#0288D1',
    padding: 12,
    marginTop: "25%",
  },
  txt: {
    color: '#ffff',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 5,
  },
  selectCountryBtn: {
    padding: 10,
    backgroundColor: '#E5E1E1',
    borderRadius: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  loader: {
    marginTop: 20,
  }
});
