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
// Removed EpubReader in favour of PopReader with curling effect
import PopReader from '../components/PopReader';
import JSZip from 'jszip';

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

// Utility to strip HTML tags (basic)
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

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

  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // PopReader state
  const [bookText, setBookText] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedProgress();
    loadBookmarkStatus();
  }, [id]);

  // Extract text whenever the epub URL changes
  useEffect(() => {
    if (currentScriptFile) {
      extractEpubText(currentScriptFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScriptFile]);

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
      const enhancedBookmarks = await AsyncStorage.getItem('enhanced_bookmarks');
      if (enhancedBookmarks) {
        const bookmarkList = JSON.parse(enhancedBookmarks);
        setIsBookmarked(bookmarkList.some((bookmark: any) => bookmark.id === id));
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
      const enhancedBookmarks = await AsyncStorage.getItem('enhanced_bookmarks');
      let bookmarkList = enhancedBookmarks ? JSON.parse(enhancedBookmarks) : [];
      
      if (isBookmarked) {
        bookmarkList = bookmarkList.filter((bookmark: any) => bookmark.id !== id);
      } else {
        const newBookmark = {
          id,
          title,
          currentScript,
          currentScriptFile,
          progress: currentProgress,
          dateAdded: new Date().toISOString(),
          position: currentProgress
        };
        bookmarkList.push(newBookmark);
      }
      
      await AsyncStorage.setItem('enhanced_bookmarks', JSON.stringify(bookmarkList));
      
      // Keep the simple bookmarks list for backward compatibility
      const simpleBookmarkIds = bookmarkList.map((bookmark: any) => bookmark.id);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(simpleBookmarkIds));
      
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

  // ---- EPUB → plain text extraction ---------------------------------
  const extractEpubText = async (url: string) => {
    setLoadingText(true);
    setExtractError(null);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      let combinedText = '';
      const tasks: Promise<void>[] = [];

      zip.forEach((relativePath, file) => {
        if (/\.(xhtml|html)$/i.test(relativePath)) {
          tasks.push(
            file.async('text').then((content) => {
              combinedText += ' ' + stripHtml(content);
            })
          );
        }
      });

      await Promise.all(tasks);
      setBookText(combinedText);
    } catch (e) {
      console.error('EPUB extract error', e);
      setExtractError('Failed to load book');
    } finally {
      setLoadingText(false);
    }
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              // Navigate to the root tab navigator's Bookmarks screen
              navigation.getParent()?.navigate('Bookmarks');
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.textColor, fontSize }]}>
              View All Bookmarks
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

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft width={24} height={24} color={theme.textColor} />
        </TouchableOpacity>

        <Text 
          style={[styles.headerTitle, { color: theme.textColor }]} 
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={toggleBookmark}
          >
            <Bookmark 
              width={22} 
              height={22} 
              color={isBookmarked ? theme.accentColor : theme.textColor}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={shareBook}
          >
            <ShareIcon width={22} height={22} color={theme.textColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => setShowMenu(true)}
          >
            <MoreVertical width={22} height={22} color={theme.textColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.readerContainer}>
        {loadingText && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading book...</Text>
          </View>
        )}
        {extractError && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{extractError}</Text>
          </View>
        )}
        {bookText && (
          <PopReader
            title={title}
            content={bookText}
          />
        )}
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default BookScreen;