import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Bookmark, Trash2 } from 'react-native-feather';

interface BookmarkItem {
  id: number;
  title: string;
  currentScript: 'lat' | 'cyr';
  currentScriptFile: string;
  progress: number;
  dateAdded: string;
  position?: {
    href: string;
    percentage: number;
  };
}

const BookmarksScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const bookmarksData = await AsyncStorage.getItem('enhanced_bookmarks');
      if (bookmarksData) {
        const parsedBookmarks = JSON.parse(bookmarksData);
        // Sort by most recently added
        setBookmarks(parsedBookmarks.sort((a: BookmarkItem, b: BookmarkItem) => 
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      Alert.alert('Error', 'Failed to load bookmarks');
    }
  };

  const removeBookmark = async (id: number) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
              await AsyncStorage.setItem('enhanced_bookmarks', JSON.stringify(updatedBookmarks));
              
              // Also update the simple bookmarks list for backward compatibility
              const simpleBookmarkIds = updatedBookmarks.map(b => b.id);
              await AsyncStorage.setItem('bookmarks', JSON.stringify(simpleBookmarkIds));
              
              setBookmarks(updatedBookmarks);
            } catch (error) {
              console.error('Error removing bookmark:', error);
              Alert.alert('Error', 'Failed to remove bookmark');
            }
          }
        }
      ]
    );
  };

  const renderBookmarkItem = ({ item }: { item: BookmarkItem }) => {
    const progressText = item.position 
      ? `${Math.round(item.position.percentage * 100)}%`
      : 'Progress not available';

    return (
      <TouchableOpacity
        style={[styles.bookmarkItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => navigation.navigate('Book', {
          id: item.id,
          title: item.title,
          currentScript: item.currentScript,
          currentScriptFile: item.currentScriptFile,
        })}
      >
        <View style={styles.bookmarkContent}>
          <Bookmark width={20} height={20} color={theme.accentColor} style={styles.bookmarkIcon} />
          <View style={styles.bookmarkInfo}>
            <Text style={[styles.bookmarkTitle, { color: theme.textColor }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.bookmarkProgress, { color: theme.textSecondary }]}>
              {progressText} • {new Date(item.dateAdded).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeBookmark(item.id)}
        >
          <Trash2 width={20} height={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft width={24} height={24} color={theme.textColor} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Bookmarks
        </Text>
      </View>

      {/* Bookmarks List */}
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bookmark width={48} height={48} color={theme.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No bookmarks yet
          </Text>
        </View>
      )}
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
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkIcon: {
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookmarkProgress: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default BookmarksScreen;
