import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, StyleSheet, TouchableOpacity, BackHandler, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { getTourDetail } from '../reduxtoolkit/slice/getTourDetail';
import Headerscreen from '../component/Headerscreen';
import { SvgUri } from 'react-native-svg';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Home = () => {
  const [visibleItems, setVisibleItems] = useState(5); 
  const [expandedTrips, setExpandedTrips] = useState({}); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchResult, setSearchResult] = useState([]);
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const { tourDetails, loading, error } = useSelector((state) => state.getTourDetail);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      console.log('Token:', storedToken);
    };

    fetchToken();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (!granted) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show your current country or location-based features.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      } else {
        console.log('Location permission already granted');
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log('Current Location:', latitude, longitude);
      },
      (error) => {
        Alert.alert('Error', 'Unable to get current location. Please try again.');
        console.error('Location error:', error);
        setLocation({ latitude: 0, longitude: 0 });
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    requestLocationPermission().then(() => {
      getCurrentLocation();
    });
  }, []);

  const updateCoordinates = async () => {
    if (!token) {
      console.error('Token not found');
      return;
    }

    if (location) {
      const { latitude, longitude } = location;
      try {
        const response = await axios.post(
          'https://visatravel.a1professionals.net/api/v1/update/coordinates',
          { latitude, longitude },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('API response:', response.data);
      } catch (error) {
        console.error('API error:', error);
        Alert.alert('Error', 'Failed to update coordinates.');
      }
    } else {
      console.log('Location not available');
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit App',
        "Do you want to exit the app",
        [
          { text: "Cancel", onPress: () => null, style: 'cancel' },
          { text: "Ok", onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );
      return true;
    };

    if (isFocused) {
      dispatch(getTourDetail());
      
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }
  }, [isFocused, dispatch]);

  useEffect(() => {
    if (location) {
      updateCoordinates();
    }
  }, [location]);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setSearchResult([]);
    } else {
      const regex = new RegExp(searchQuery.trim().split(/\s+/).join('.*'), 'i'); 
      const filteredResults = transformData().filter(item => regex.test(item.country));
      setSearchResult(filteredResults); 
    }
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedTrips[item.id];
    
    // Calculate total days for all trips in the country
    const totalDays = item.trips.reduce((sum, trip) => {
      // Assuming the 'days' is a string like '8 Days' and you need to extract the numeric part
      const days = parseInt(trip.days);
      return sum + (isNaN(days) ? 0 : days); 
    }, 0);
  
    return (
      <TouchableOpacity onPress={() => navigation.navigate('Detail', { countryData: item, videoThumbnails: item.trips[0]?.videoThumbnails })}>
        <View style={style.listItem}>
          {item.flag ? (
            <SvgUri width="50" height="50" uri={item.flag} />
          ) : (
            <Text>No Flag</Text>
          )}
  
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={style.rowBetween}>
              <Text style={style.country}>{item.country}</Text>
              <Text style={style.days}>{item.trips.length} Tours</Text>
            </View>
  
            <View style={[style.rowBetween,{justifyContent:'flex-end'}]}>
              {/* Show total days spent for all trips */}
              <Text style={[style.dates, { marginTop: 10,fontWeight:'600'}]}>
                Total Spent: {totalDays} Days
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  const transformData = () => {
    const countriesData = Object.keys(tourDetails?.tours || {}).map(countryKey => {
      const country = tourDetails.tours[countryKey];
      const countryData = {
        id: country.country_name,
        country: country.country_name,
        flag: country.tours[0]?.country_flag,
        trips: country.tours.map(tour => ({
          startDate: tour.date_in,
          endDate: tour.date_out,
          days: `${tour.day_spend} Days`,
          images: tour.images,
          videos: tour.videos,
          videoThumbnails: tour.videothumnail
        })),
      };
      return countryData;
    });
    return countriesData;
  };

  const noTours = Object.keys(tourDetails?.tours || {}).length === 0;
  const noResults = searchResult.length === 0 && searchQuery.trim() !== '';

  return (
    <SafeAreaView style={style.container}>
      <View style={{ paddingTop: 20 }}>
        <Headerscreen />
      </View>

      {/* Search bar */}
      <View style={style.searchContainer}>
        <TextInput
          placeholder="Search List"
          style={style.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={25} color="#333" />
        </TouchableOpacity>
      </View>

      {loading && <Text>Loading...</Text>}

      {/* Show "no records" message if there are no tours in the list */}
      {noTours && (
        <View style={style.noRecordsContainer}>
          <Text style={style.noRecordsText}>You have not submitted any records yet</Text>
        </View>
      )}

      {/* Show no search results message */}
      {noResults && (
        <View style={style.noRecordsContainer}>
          <Text style={style.noRecordsText}>No records found for '{searchQuery}'</Text>
        </View>
      )}

      {/* Show filtered search results or full list if no search is performed */}
      <FlatList
        data={searchQuery.trim() === "" ? transformData().slice(0, visibleItems) : searchResult.slice(0, visibleItems)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListFooterComponent={
          visibleItems < (searchQuery.trim() === "" ? transformData().length : searchResult.length) && (
            <TouchableOpacity onPress={() => setVisibleItems(visibleItems + 5)}>
              <Text style={style.moreText}>More...</Text>
            </TouchableOpacity>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add trip button */}
      <View style={style.plusButton}>
        <TouchableOpacity onPress={() => navigation.navigate('Addtrip')}>
          <Ionicons name="add-circle" size={60} color="#002F87" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;


const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    // marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#002F87',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  flag: {
    fontSize: 30,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  country: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dates: {
    fontSize: 14,
    color: '#555',
    marginLeft: 30,
  },
  days: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  moreTrips: {
    fontSize: 14,
    color: '#002F87',
    marginTop: 5,
  },
  moreText: {
    fontSize: 16,
    color: '#002F87',
    textAlign: 'left',
    marginTop: 10,
  },
  plusButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  // New styles for no records message
  noRecordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  noRecordsText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
});
