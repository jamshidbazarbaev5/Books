import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
  containerStyle?: ViewStyle;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  containerStyle,
  autoPlay = true,
  autoPlayInterval = 3000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Handle auto play
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoPlay && images.length > 1) {
      intervalId = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollToImage(nextIndex);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeIndex, autoPlay, images.length, autoPlayInterval]);

  const scrollToImage = (index: number) => {
    // Fade out current image
    Animated.timing(fadeAnim, {
      toValue: 0.7,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Scroll to new image
      scrollViewRef.current?.scrollTo({
        x: index * screenWidth,
        animated: true,
      });

      // Fade in new image
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    setActiveIndex(index);
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // Handle single image case
  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Image
          source={{ uri: images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((imageUrl, index) => (
          <Animated.View
            key={`${imageUrl}-${index}`}
            style={[styles.imageContainer, { opacity: fadeAnim }]}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToImage(index)}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: '100%',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  imageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: screenWidth,
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ImageSlider;
