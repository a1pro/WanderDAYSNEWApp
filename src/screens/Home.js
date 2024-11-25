import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, StyleSheet, TouchableOpacity, BackHandler, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { getTourDetail } from '../reduxtoolkit/slice/getTourDetail'; // Import the action
import Headerscreen from '../component/Headerscreen';
import { SvgUri } from 'react-native-svg';

const Home = () => {
  const [visibleItems, setVisibleItems] = useState(5); 
  const [expandedTrips, setExpandedTrips] = useState({}); 
  const [searchQuery, setSearchQuery] = useState(''); // State to store the search input
  const [searchResult, setSearchResult] = useState([]); // State to store search result
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  
  const { tourDetails, loading, error } = useSelector((state) => state.getTourDetail);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit App',
        "Do you want to exit the app",
        [
          {
            text: "Cancel",
            onPress: () => null,
            style: 'cancel',
          },
          { text: "Ok", onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );
      return true;
    };

    if (isFocused) {
      dispatch(getTourDetail()); // Fetch tour details when screen is focused
      
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }
  }, [isFocused, dispatch]);

  // Filter tours based on search query
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setSearchResult([]);
    } else {
      
      const regex = new RegExp(searchQuery.trim().split(/\s+/).join('.*'), 'i'); 
     
      const filteredResults = transformData().filter(item => 
        regex.test(item.country) 
      );
  
      setSearchResult(filteredResults); 
    }
  };

  // Render each item in the list
  const renderItem = ({ item }) => {
    const isExpanded = expandedTrips[item.id];
    const currentTrip = item.trips[0];
  
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
              {/* Replaced days with total trips */}
              <Text style={style.days}>{item.trips.length} Tours</Text>
            </View>
  
            <View style={style.rowBetween}>
              <Text style={style.dates}>{currentTrip.startDate} - {currentTrip.endDate}</Text>
              {item.trips.length > 1 && (
                <TouchableOpacity onPress={() => setExpandedTrips({ ...expandedTrips, [item.id]: !isExpanded })}>
                  <Text style={style.moreTrips}>{isExpanded ? 'Show Less' : 'more...'}</Text>
                </TouchableOpacity>
              )}
            </View>
  
            {isExpanded && item.trips.slice(1).map((trip, index) => (
              <Text key={index} style={style.dates}>- {trip.startDate} to {trip.endDate} ({trip.days})</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Transform data from tourDetails to a format that includes country info and trips
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
          videoThumbnails: tour.videothumnail // Add the video thumbnail field
        })),
      };
      return countryData;
    });
    return countriesData;
  };

  const noTours = Object.keys(tourDetails?.tours || {}).length === 0;
  const noResults = searchResult.length === 0 && searchQuery.trim() !== ''; // Check if there are no results and search is not empty

  return (
    <SafeAreaView style={style.container}>
      <Headerscreen />

      {/* Search bar */}
      <View style={style.searchContainer}>
        <TextInput
          placeholder="Search List"
          style={style.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery} // Update search query as the user types
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
      <TouchableOpacity style={style.plusButton} onPress={() => navigation.navigate('Addtrip')}>
        <Ionicons name="add-circle" size={60} color="#002F87" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginTop: 20,
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
    textAlign: 'right',
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