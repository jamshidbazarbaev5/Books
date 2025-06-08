"use client";

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform, ActivityIndicator } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { ArrowLeft, Moon, Sun, Play, Pause, ChevronLeft, ChevronRight } from "react-native-feather";
import EpubReader from "../components/EpubReader";
import { useState, useEffect, useRef } from "react";
import { WritersStackParamList } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import Sound from "react-native-sound";
import RNFetchBlob from "react-native-blob-util";

const { width, height } = Dimensions.get("window");

const BookScreen = () => {
  const route = useRoute<RouteProp<WritersStackParamList, "Book">>();
  const navigation = useNavigation();
  const { id = 0, title = "Welcome", epubUrl } = route.params || {};
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { updateReadingProgress, readingProgress } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const sound = useRef<Sound | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // State for tracking pages

  useEffect(() => {
    if (epubUrl) {
      downloadEpub();
    }
    return () => {
      if (sound.current) {
        sound.current.release();
      }
      // Clean up downloaded file if needed
      if (localFilePath) {
        RNFetchBlob.fs.unlink(localFilePath).catch(console.error);
      }
    };
  }, [epubUrl]);

  const downloadEpub = async () => {
    if (!epubUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract a unique filename using book ID and timestamp
      const timestamp = new Date().getTime();
      const fileName = `book_${id}_${timestamp}.epub`;
      
      console.log('Downloading ePub from:', epubUrl);
      
      const response = await RNFetchBlob.config({
        fileCache: true,
        path: `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`,
        timeout: 30000, // 30 second timeout
      }).fetch('GET', epubUrl, {
        'Accept': 'application/epub+zip',
      });

      const filePath = response.path();
      
      // Verify the downloaded file exists
      const exists = await RNFetchBlob.fs.exists(filePath);
      if (!exists) {
        throw new Error('Downloaded file not found');
      }

      // Verify file size is not zero
      const stats = await RNFetchBlob.fs.stat(filePath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log('Successfully downloaded ePub to:', filePath);
      setLocalFilePath(filePath);
      
      // Save reading progress
      updateReadingProgress(id, 0);
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to download the book';
      setError(`${errorMessage}. Please try again.`);
      console.error('Download error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAudio = async () => {
    if (isAudioPlaying) {
      if (sound.current) {
        sound.current.stop();
        sound.current.release();
        sound.current = null;
      }
      setIsAudioPlaying(false);
    } else {
      if (sound.current) {
        sound.current.stop();
        sound.current.release();
      }

      const audio = route.params?.audio;
      const fileName = typeof audio === 'string' 
        ? audio 
        : Platform.OS === 'ios'
          ? audio?.ios
          : audio?.android;

      if (!fileName) {
        Alert.alert('Error', 'No audio file specified for this book');
        return;
      }

      try {
        Sound.setCategory('Playback');
        
        const basePath = Platform.OS === 'ios' ? '' : Sound.MAIN_BUNDLE;

        sound.current = new Sound(fileName, basePath, (error) => {
          if (error) {
            Alert.alert('Error', `Could not load audio file: ${error.message}`);
            setIsAudioPlaying(false);
            return;
          }
          
          if (sound.current) {
            sound.current.play((success) => {
              if (!success) {
                Alert.alert('Error', 'Audio playback failed');
              }
              setIsAudioPlaying(false);
              if (sound.current) {
                sound.current.release();
              }
            });
          }
        });
        setIsAudioPlaying(true);
      } catch (e: any) {
        Alert.alert('Error', `Failed to initialize audio playback: ${e?.message || 'Unknown error'}`);
        setIsAudioPlaying(false);
      }
    }
  };

  // Navigation is now handled by the EpubReader component

  const handlePageChange = (page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
    if (total > 0) {
      updateReadingProgress(id, page / total);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.textColor} />
          <Text style={[styles.loadingText, { color: theme.textColor }]}>
            Loading book...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.textColor }]}
            onPress={downloadEpub}
          >
            <Text style={[styles.retryButtonText, { color: theme.backgroundColor }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft stroke={theme.textColor} width={24} height={24} />
        </TouchableOpacity>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="tail" 
          style={[styles.title, { color: theme.textColor }]}
        >
          {title}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
            {isDarkMode ? 
              <Sun stroke={theme.textColor} width={24} height={24} /> :
              <Moon stroke={theme.textColor} width={24} height={24} />
            }
          </TouchableOpacity>
          {route.params?.audio && (
            <TouchableOpacity onPress={toggleAudio} style={styles.headerButton}>
              {isAudioPlaying ? 
                <Pause stroke={theme.textColor} width={24} height={24} /> :
                <Play stroke={theme.textColor} width={24} height={24} />
              }
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {localFilePath ? (
          <View style={styles.readerContainer}>
            <View style={styles.readerHeader}>
              <Text style={[styles.pageInfo, { color: theme.textColor }]}>
                {`${currentPage + 1} / ${totalPages || '?'}`}
              </Text>
            </View>
            <EpubReader
              filePath={localFilePath}
              isDarkMode={isDarkMode}
              onPageChange={handlePageChange}
              onError={setError}
            />
          </View>
        ) : (
          <View style={styles.noFileContainer}>
            <Text style={[styles.noFileText, { color: theme.textColor }]}>
              No EPUB file available
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  readerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  navigationButton: {
    padding: 8,
  },
  pageInfo: {
    fontSize: 14,
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  disabledText: {
    opacity: 0.5,
  },
  noFileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFileText: {
    fontSize: 16,
  },
});

export default BookScreen;