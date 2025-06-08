import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EpubReader from '../components/EpubReader';
import {
  ArrowLeft,
  Settings,
  Share as ShareIcon,
  Bookmark,
  MoreVertical,
} from 'react-native-feather';

type BookScreenRouteProp = RouteProp<{
  Book: {
    id: number;
    title: string;
    currentScript: 'lat' | 'cyr';
    currentScriptFile: string;
    epub_file_cyr?: string;
    epub_file_lat?: string;
    otherScriptFile?: string;
    rawEpubFile?: string;
  };
}, 'Book'>;

const { width, height } = Dimensions.get('window');

const BookScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<BookScreenRouteProp>();
  const { theme } = useTheme();
  const { fontSize, readingProgress, updateReadingProgress } = useSettings();
  
  const {
    id,
    title,
    currentScript,
    currentScriptFile,  
    epub_file_cyr,
    epub_file_lat,
    otherScriptFile,
  } = route.params;

  const [isReaderReady, setIsReaderReady] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const [showControls, setShowControls] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Load saved progress
    loadSavedProgress();
    loadBookmarkStatus();
  }, [id]);

  const loadSavedProgress = async () => {
    try {
      const saved = readingProgress[id];
      if (saved) {
        setCurrentProgress(saved);
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  };

  const loadBookmarkStatus = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks');
      if (bookmarks) {
        const bookmarkList = JSON.parse(bookmarks);
        setIsBookmarked(bookmarkList.includes(id));
      }
    } catch (error) {
      console.error('Error loading bookmark status:', error);
    }
  };

  const saveProgress = async (progress: any) => {
    try {
      await updateReadingProgress(id, progress);
      setCurrentProgress(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks');
      let bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
      
      if (isBookmarked) {
        bookmarkList = bookmarkList.filter((bookId: number) => bookId !== id);
      } else {
        bookmarkList.push(id);
      }
      
      await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarkList));
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const shareBook = async () => {
    try {
      await Share.share({
        message: `Check out this book: ${title}`,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing book:', error);
    }
  };

  const switchScript = () => {
    if (!otherScriptFile) {
      Alert.alert(
        'Not Available',
        `This book is not available in ${currentScript === 'lat' ? 'Cyrillic' : 'Latin'} script.`
      );
      return;
    }

    Alert.alert(
      'Switch Script',
      `Switch to ${currentScript === 'lat' ? 'Cyrillic' : 'Latin'} script?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            // Navigate back and forward with new script
            navigation.replace('Book', {
              id,
              title,
              currentScript: currentScript === 'lat' ? 'cyr' : 'lat',
              currentScriptFile: otherScriptFile,
              epub_file_cyr,
              epub_file_lat,
              otherScriptFile: currentScriptFile,
            });
          },
        },
      ]
    );
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  const handleReaderReady = () => {
    setIsReaderReady(true);
    console.log('EPUB reader is ready');
  };

  const handleProgress = (progress: any) => {
    console.log('Reading progress:', progress);
    // Calculate reading position as percentage between 0 and 1
    const percentage = progress.start ? progress.start.percentage || 0 : 0;
    saveProgress(percentage);
  };

  const handleReaderError = (error: string) => {
    console.error('EPUB reader error:', error);
    Alert.alert('Reader Error', error);
  };

  const MenuOverlay = () => (
    showMenu && (
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <View style={[styles.menu, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              switchScript();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.textColor, fontSize }]}>
              Switch to {currentScript === 'lat' ? 'Cyrillic' : 'Latin'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              toggleBookmark();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.textColor, fontSize }]}>
              {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              shareBook();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.textColor, fontSize }]}>
              Share Book
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('Settings');
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.textColor, fontSize }]}>
              Reading Settings
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['top']}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.backgroundColor}
        translucent={false}
      />
      
      {/* EPUB Reader */}
      <View style={styles.readerContainer}>
        <EpubReader
          epubUrl={currentScriptFile}
          bookId={`${id}-${currentScript}`}
          bookTitle={title}
          onReady={handleReaderReady}
          onProgress={handleProgress}
          onError={handleReaderError}
        />
      </View>

      {/* Script Switcher Button */}
      <TouchableOpacity
        style={[styles.scriptButton, { backgroundColor: theme.accentColor }]}
        onPress={switchScript}
      >
        <View style={styles.scriptButtonInner}>
          <Text style={[styles.scriptText, { fontSize: fontSize * 0.9 }]}>
            {currentScript.toUpperCase()}
          </Text>
          {otherScriptFile && (
            <View style={styles.switchIndicator}>
              <Text style={styles.switchArrow}>⟳</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Menu Overlay */}
      <MenuOverlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readerContainer: {
    flex: 1,
  },
  scriptButton: {
    position: 'absolute',
    top: 20,
    right: 16,
    minWidth: 50,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  scriptButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  scriptText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchIndicator: {
    marginLeft: 4,
  },
  switchArrow: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menu: {
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontWeight: '500',
  },
});

export default BookScreen;