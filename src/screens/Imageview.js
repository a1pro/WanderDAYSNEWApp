import React, { useState } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Headerscreen from '../component/Headerscreen';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Imageview = ({ route }) => {
  const navigation = useNavigation();
  const { images, initialIndex = 0 } = route.params;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(0);

  const showNextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const showPreviousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const threshold = width / 4; // Swipe threshold
      if (event.translationX < -threshold) {
        runOnJS(showNextImage)();
      } else if (event.translationX > threshold) {
        runOnJS(showPreviousImage)();
      }
      translateX.value = withSpring(0); // Reset position after swipe
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginTop: 10, marginBottom: 30 }}>
        <Headerscreen showBackButton={true} onBackPress={() => navigation.goBack()} />
      </View>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image source={{ uri: images[currentIndex] }} style={styles.image} />
        </Animated.View>
      </PanGestureHandler>

      {/* <View style={styles.indexContainer}>
        <Text style={styles.indexText}>
          {`${currentIndex + 1} / ${images.length}`}
        </Text>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  indexContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  indexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default Imageview;
