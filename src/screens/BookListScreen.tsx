"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import SearchBar from '../components/SearchBar';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { Book } from '../types/navigation';
import { booksApi } from '../api/books';
import { ArrowLeft, BookOpen, Clock, Search } from 'react-native-feather';

const { width } = Dimensions.get('window');

const BookListScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { fontSize, readingProgress, script } = useSettings();
  const { translations } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await booksApi.getBooks();
      console.log('API Response:', response);
      console.log('Books data:', response.results);
      setBooks(response.results);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    
    return books.filter(book => {
      const title = script === 'lat' ? book.title_lat : book.title_cyr;
      const description = script === 'lat' ? book.description_lat : book.description_cyr;
      
      return title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             description?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [books, searchQuery, script]);    const renderBookItem = ({ item: book }: { item: Book }) => {
    if (!book) {
      console.error('Received undefined book item');
      return null;
    }

    const progress = readingProgress[book.id];
    // Get title from either script-specific fields or the single title field
    const title = book.title || (script === 'lat' ? book.title_lat : book.title_cyr);
    const description = book.description || (script === 'lat' ? book.description_lat : book.description_cyr);

    // Handle both the single epub_file field and script-specific fields
    let currentScriptFile, otherScriptFile;
    
    if (book.epub_file) {
      // If epub_file contains script indicator in its path
      const epubPath = book.epub_file.toLowerCase();
      const isLatinFile = epubPath.includes('/lat/');
      const isCyrillicFile = epubPath.includes('/cyr/');
      
      if (script === 'lat') {
        currentScriptFile = isLatinFile ? book.epub_file : undefined;
        otherScriptFile = isCyrillicFile ? book.epub_file : undefined;
      } else {
        currentScriptFile = isCyrillicFile ? book.epub_file : undefined;
        otherScriptFile = isLatinFile ? book.epub_file : undefined;
      }
    } else {
      // Use script-specific fields
      currentScriptFile = script === 'lat' ? book.epub_file_lat : book.epub_file_cyr;
      otherScriptFile = script === 'lat' ? book.epub_file_cyr : book.epub_file_lat;
    }
    
    // Debug logging
    console.log(`Book ${title}:`, {
      currentScript: script,
      currentScriptFile,
      epub_file_lat: book.epub_file_lat,
      epub_file_cyr: book.epub_file_cyr,
      otherScriptFile,
      rawEpubFile: book.epub_file
    });
    
    return (
      <TouchableOpacity
        style={[styles.bookItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          // If book is not available in current script but available in other script,
          // use the other script file
          const fileToUse = currentScriptFile || otherScriptFile;
          
          if (!fileToUse) {
            Alert.alert(
              "EPUB Not Available",
              "This book is not yet available in electronic format for either Latin or Cyrillic script."
            );
            return;
          }

          navigation.navigate('Writers', {
            screen: 'AdvancedEpubReader',
            params: {
              title,
              epubUrl: fileToUse,
              bookId: book.id,
              initialPage: readingProgress[book.id]?.position || 0,
            },
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.bookCover}>
          {book.cover_image ? (
            <Image
              source={{ uri: book.cover_image }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <BookOpen width={24} height={24} color={theme.accentColor} />
          )}
        </View>
        <View style={styles.bookItemContent}>
          <Text style={[styles.bookTitle, { color: theme.textColor, fontSize: fontSize * 1.1 }]}>
            {title}
          </Text>
          {book.publication_year && (
            <Text style={[styles.bookYear, { color: theme.secondaryTextColor, fontSize: fontSize * 0.9 }]}>
              {book.publication_year}
            </Text>
          )}
          {description && (
            <Text 
              style={[styles.bookExcerpt, { color: theme.secondaryTextColor, fontSize: fontSize * 0.9 }]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}
          {progress && (
            <View style={styles.progressContainer}>
              <Clock width={14} height={14} color={theme.accentColor} style={styles.progressIcon} />
              <Text style={[styles.progressText, { color: theme.accentColor, fontSize: fontSize * 0.8 }]}>
                {progress.totalPages ? `${Math.round((progress.position / progress.totalPages) * 100)}%` : ''} {translations.completed}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.accentColor }]}
            onPress={fetchBooks}
          >
            <Text style={styles.retryButtonText}>{translations.retry}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: theme.secondaryTextColor, fontSize: fontSize * 1.1 }]}>
        {translations.noBooks}
      </Text>
      <TouchableOpacity 
        style={[styles.emptyStateButton, { backgroundColor: theme.accentColor }]}
        onPress={() => setSearchQuery('')}
      >
        <Text style={[styles.emptyStateButtonText, { color: '#fff', fontSize: fontSize }]}>
          {translations.cancel}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['top']}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft width={24} height={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textColor, fontSize: fontSize * 1.5 }]}>
            {translations.books}
          </Text>
        </View>
        
        <SearchBar
          onSearch={setSearchQuery}
          placeholder={translations.searchBooks}
        />
      </View>

      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        />
      ) : (
        <EmptyState />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  writerGroup: {
    marginBottom: 28,
  },
  writerHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  writerName: {
    fontWeight: 'bold',
    marginRight: 12,
  },
  writerDivider: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  bookItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coverImage: {
    width: 50,
    height: 70,
    borderRadius: 8,
  },
  bookItemContent: {
    flex: 1,
  },
  bookTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  bookYear: {
    fontStyle: 'italic',
    marginBottom: 6,
  },
  bookExcerpt: {
    lineHeight: 18,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    marginRight: 6,
  },
  progressText: {
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  retryButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default BookListScreen;