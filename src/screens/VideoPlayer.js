import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video'; 
import Headerscreen from '../component/Headerscreen';

const VideoPlayer = ({ route }) => {
  const { videoUrl } = route.params; 
  const navigation = useNavigation();

  const [controlsVisible, setControlsVisible] = useState(false);

  return (
    <View style={[styles.container, controlsVisible ? styles.controlsVisible : null]}>
      <Headerscreen showBackButton={true} onBackPress={() => navigation.goBack()} />
      <Video
        source={{ uri: videoUrl }} // Pass the video URL
        style={styles.videoPlayer}
        controls={true}
        resizeMode="contain"
        onShowControls={() => setControlsVisible(true)}   // Event when controls are shown
        onHideControls={() => setControlsVisible(false)}  // Event when controls are hidden
        onError={(error) => console.error("Video Error: ", error)} // Handle any video errors
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000', // Default background color
  },
  videoPlayer: {
    width: '100%',
    height: '90%',
    marginTop: 20,
  },
  // Style when controls are visible (removes #000 shadow effect)
  controlsVisible: {
    backgroundColor: 'transparent', // Remove or adjust shadow color here
  },
});

export default VideoPlayer;
