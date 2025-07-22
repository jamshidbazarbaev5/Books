import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Book, Heart, Users, Globe } from 'react-native-feather';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const IntroductionScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { fontSize } = useSettings();
  const { translations } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Animation values for each slide
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const slides = [
    {
      id: 'welcome',
      type: 'welcome',
      title: translations.welcome,
      subtitle: translations.welcomeSubtitle,
    },
    {
      id: 'writers',
      type: 'feature',
      icon: <Users width={48} height={48} color={theme.accentColor} />,
      title: translations.writersCollection,
      description: translations.writersDescription,
    },
    {
      id: 'books',
      type: 'feature',
      icon: <Book width={48} height={48} color={theme.accentColor} />,
      title: translations.digitalLibrary,
      description: translations.digitalLibraryDesc,
    },
    {
      id: 'national',
      type: 'feature',
      icon: <Globe width={48} height={48} color={theme.accentColor} />,
      title: translations.nationalWritingsTitle,
      description: translations.nationalWritingsDesc,
    },
    {
      id: 'favorites',
      type: 'feature',
      icon: <Heart width={48} height={48} color={theme.accentColor} />,
      title: translations.favoritesTitle,
      description: translations.favoritesDesc,
    },
  ];

  const renderSlide = ({ item, index }) => {
    if (item.type === 'welcome') {
      return (
        <View style={[styles.slide, { backgroundColor: theme.backgroundColor }]}>
          <Animated.View
            style={[
              styles.welcomeContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={[styles.welcomeTitle, { color: theme.textColor, fontSize: fontSize * 2.5 }]}>
              {item.title}
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.secondaryTextColor, fontSize: fontSize * 1.2 }]}>
              {item.subtitle}
            </Text>
          </Animated.View>
        </View>
      );
    }

    return (
      <View style={[styles.slide, { backgroundColor: theme.backgroundColor }]}>
        <Animated.View
          style={[
            styles.featureContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>{item.icon}</View>
          <Text style={[styles.featureTitle, { color: theme.textColor, fontSize: fontSize * 1.8 }]}>
            {item.title}
          </Text>
          <Text style={[styles.featureDescription, { color: theme.secondaryTextColor, fontSize: fontSize * 1.1 }]}>
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeIndex ? theme.accentColor : theme.secondaryTextColor,
                opacity: index === activeIndex ? 1 : 0.5,
              },
            ]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {renderPaginationDots()}
      {activeIndex === slides.length - 1 && (
        <Animated.View
          style={[
            styles.startButton,
            {
              backgroundColor: theme.accentColor,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.buttonContent}
            onPress={() => navigation.navigate('Writers')}
          >
            <Text style={[styles.buttonText, { fontSize: fontSize * 1.2 }]}>
              {translations.startExploring}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  featureContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureDescription: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 120,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  startButton: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default IntroductionScreen;