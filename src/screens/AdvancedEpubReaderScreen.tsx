import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import JSZip from 'jszip';
import PageCurlReader from '../components/PageCurlReader';
import { splitIntoPages } from '../utils/pagination';

// -----------------------------
// Navigation types
// -----------------------------

type AdvancedEpubReaderRouteProp = RouteProp<{
  AdvancedEpubReader: {
    title: string;
    epubUrl: string; // absolute URL or local file path
    bookId: number;
    initialPage?: number;
  };
}, 'AdvancedEpubReader'>;

const { width } = Dimensions.get('window');

// Utility: very naive html -> plain text
const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const AdvancedEpubReaderScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<AdvancedEpubReaderRouteProp>();
  const { isDarkMode } = useTheme();
  const { readingProgress, updateReadingProgress } = useSettings();
  const styles = getStyles(isDarkMode);
  
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const pageAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Page turning animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pageAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(pageAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    ).start();
  }, []);

  const { title, epubUrl, initialPage = 0 } = route.params;

  const { bookId } = route.params;

  const [pages, setPages] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(
    // Use saved reading progress if available, otherwise use initialPage
    readingProgress[bookId]?.position ?? initialPage
  );

  const readerRef = useRef<any>(null);

  // ------------------------------------------------------------------
  //  Load & extract EPUB as plain text on mount
  // ------------------------------------------------------------------



  
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      console.log('[AdvancedEpubReader] fetching', epubUrl);
      try {
        setError(null);
        const res = await fetch(epubUrl);
        console.log('[AdvancedEpubReader] fetch status', res.status);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch EPUB: ${res.status} ${res.statusText}`,
          );
        }
        const arrayBuffer = await res.arrayBuffer();
        console.log('[AdvancedEpubReader] arrayBuffer bytes', arrayBuffer.byteLength);
        const zip = await JSZip.loadAsync(arrayBuffer);

        let combinedText = '';
        const tasks: Promise<void>[] = [];
        let htmlFileCount = 0;
        zip.forEach((relPath, file) => {
          if (/\.(xhtml|html|htm)$/i.test(relPath)) {
            htmlFileCount++;
            tasks.push(
              file.async('text').then((content) => {
                combinedText += ' ' + stripHtml(content);
              }),
            );
          }
        });

        await Promise.all(tasks);
        console.log('[AdvancedEpubReader] htmlFileCount', htmlFileCount);
        if (htmlFileCount === 0) {
          throw new Error('No XHTML/HTML files were found inside this EPUB.');
        }
        if (cancelled) return;

        // --- paginate
        const FONT_SIZE = 14;
        const LINE_HEIGHT = 22;
        const paginated = splitIntoPages(combinedText, FONT_SIZE, LINE_HEIGHT);
        console.log('[AdvancedEpubReader] paginated pages', paginated.length);
        setPages(paginated);
      } catch (e: any) {
        console.error('[AdvancedEpubReader] extraction error', e);
        if (cancelled) return;
        setError(e.message || 'Unknown error');
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [epubUrl]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Save reading progress when page changes
    if (pages) {
      updateReadingProgress(bookId, page, pages.length);
    }
  };

  // ------------------------------------------------------------------
  //  Render states
  // ------------------------------------------------------------------
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!pages) {
    const translateY = loadingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });

    const scale = loadingAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.02, 1],
    });

    const rotateY = pageAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-180deg'],
    });

    const opacity = pageAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.5, 1],
    });

    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.bookLoadingContainer}>
          <Animated.View 
            style={[
              styles.bookLoading,
              {
                transform: [
                  { translateY },
                  { scale }
                ]
              }
            ]}
          >
            {/* Base pages */}
            <View style={[styles.bookLoadingPage, { backgroundColor: isDarkMode ? '#444' : '#e8e8e8' }]} />
            <View style={[styles.bookLoadingPage, { backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0', top: 4 }]} />
            <View style={[styles.bookLoadingPage, { backgroundColor: isDarkMode ? '#333' : '#f8f8f8', top: 8 }]} />
            
            {/* Animated turning page */}
            <Animated.View 
              style={[
                styles.bookLoadingPage, 
                styles.turningPage,
                {
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                  opacity,
                  transform: [
                    { perspective: 1000 },
                    { rotateY }
                  ]
                }
              ]} 
            />
          </Animated.View>
        </View>
        <Text style={styles.loadingText}>Opening book...</Text>
      </SafeAreaView>
    );
  }

  const fullText = pages.join(' ');

  return (
    <SafeAreaView style={styles.container}>
      <PageCurlReader
        ref={readerRef}
        content={fullText}
        initialPage={currentPage}
        title={title}
        onPageChange={handlePageChange}
      />
    </SafeAreaView>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' 
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  loadingText: { 
    marginTop: 24, 
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: isDarkMode ? '#e0e0e0' : '#000000',
    opacity: 0.8
  },
  bookLoadingContainer: {
    width: 140,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bookLoading: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookLoadingPage: {
    position: 'absolute',
    width: '90%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  turningPage: {
    backfaceVisibility: 'hidden',
    transformOrigin: 'left',
    borderRightWidth: 1,
    borderRightColor: isDarkMode ? '#555' : '#ddd',
  }
});

export default AdvancedEpubReaderScreen;
