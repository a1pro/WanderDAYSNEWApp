import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Image, FlatList, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import Headerscreen from '../component/Headerscreen';
import { SvgUri } from 'react-native-svg';

const Detail = () => {
  const route = useRoute();
  const { countryData } = route.params;
  const navigation = useNavigation();

  const [loadingImages, setLoadingImages] = useState(true); 
  const [loadingVideos, setLoadingVideos] = useState(true); 

 
  const getTourImages = (startDate, endDate) => {
    return countryData?.trips
      .find((trip) => trip.startDate === startDate && trip.endDate === endDate)
      ?.images || [];
  };

  // Function to get video thumbnails for the trip
  const getVideosWithThumbnails = (trip) => {
    const videos = trip.videos || [];
    const thumbnails = trip.videoThumbnails || [];
    return videos.map((video, index) => ({
      videoUrl: video,
      thumbnailUrl: thumbnails[index] || '', 
    }));
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Imageview', { image: item })}>
      <Image source={{ uri: item  }} style={styles.image} />
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('VideoPlayer', { videoUrl: item.videoUrl });
      }}
    >
      <View style={styles.videoContainer}>
        {/* Video Thumbnail */}
        <Image
          source={{ uri: item.thumbnailUrl  }}
          style={styles.thumbnail}
        />
        {/* Play Icon */}
        <Icon
          name="playcircleo"
          size={40}
          color="#ffff"
          style={styles.playIcon}
        />
        <Text style={styles.videoText}>Watch Video</Text>
      </View>
    </TouchableOpacity>
  );

  // Simulate image/video loading (for demo purposes)
  useEffect(() => {
    // Simulate a delay to show the loading indicator
    setLoadingImages(true);
    setLoadingVideos(true);

    setTimeout(() => {
      setLoadingImages(false);
      setLoadingVideos(false);
    }, 2000); // Assume the data will be ready after 2 seconds (you can remove this in production)
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingTop: 20, paddingBottom: 20 }}>
          <Headerscreen showBackButton={true} onBackPress={() => navigation.goBack()} />
        </View>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <SvgUri width="50" height="50" uri={countryData.flag} />
          <Text style={styles.country}>{countryData?.country}</Text>
        </View>

        {/* Trips Section */}
        <ImageBackground
    source={require('../assets/oldback.png')} // Replace with your uploaded image path
    style={styles.backgroundImage}>
        {countryData?.trips.map((trip, index) => (
          <View key={index} style={styles.tripCard}>
            {/* Trip Dates */}
            <Text style={styles.trip}>
              {`Date_IN: ${trip.startDate} ${'\n'}Date_out: ${trip.endDate} (${trip.days})`}
            </Text>

            {/* Photos Section */}
            <Text style={styles.sectionTitle}>Tour Images</Text>
            {loadingImages ? (
              <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : getTourImages(trip.startDate, trip.endDate).length > 0 ? (
              <FlatList
                data={getTourImages(trip.startDate, trip.endDate)}
                renderItem={renderImageItem}
                keyExtractor={(item, idx) => `${trip.startDate}-image-${idx}`}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatList}
              />
            ) : (
              <Text style={styles.noContentText}>No Images</Text>
            )}

            {/* Videos Section */}
            <Text style={styles.sectionTitle}>Tour Videos</Text>
            {loadingVideos ? (
              <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : getVideosWithThumbnails(trip).length > 0 ? (
              <FlatList
                data={getVideosWithThumbnails(trip)} // Get videos with thumbnails
                renderItem={renderVideoItem}
                keyExtractor={(item, idx) => `${trip.startDate}-video-${idx}`}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatList}
              />
            ) : (
              <Text style={styles.noContentText}>No Videos</Text>
            )}
          </View>
        ))}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  country: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  tripCard: {
    // margin: 20,
    // padding: 15,
    // backgroundColor: '#89D0F6',
    // borderRadius: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  backgroundImage: {
    // flex: 1,
    margin:20,
    padding:20,
    resizeMode: 'cover',
    opacity:1,
    borderRadius: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height:1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 1,
  },
  trip: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    fontWeight: "bold",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  flatList: {
    marginBottom: 20,
  },
  image: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    margin: 10,
    borderRadius: 10,
  },
  videoContainer: {
    position: 'relative',
    margin: 10,
  },
  thumbnail: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  videoText: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    color: '#ffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  noContentText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  loader: {
    marginVertical: 20,
    alignSelf: 'center',
  },
});

export default Detail;
