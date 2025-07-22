import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  TextInput,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { Writer, Poem } from '../types/navigation';
import { mockWriters } from '../data/mockData';
import { Filter, Book, HelpCircle, Search, ArrowLeft } from 'react-native-feather';

const { width } = Dimensions.get('window');

type WritingType = 'poems' | 'books' | 'riddles';
type NationGroup = {
  nation: string;
  writers: Writer[];
};

const NationalWritingsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { fontSize } = useSettings();
  const { translations } = useLanguage();
  const [selectedType, setSelectedType] = useState<WritingType>('poems');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Group writers by nation (using period as nation for now)
  const nationGroups = useMemo(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);

    const groups: { [key: string]: Writer[] } = {};
    mockWriters.forEach((writer: Writer) => {
      if (!groups[writer.period]) {
        groups[writer.period] = [];
      }
      groups[writer.period].push(writer);
    });
    return Object.entries(groups)
      .map(([nation, writers]) => ({
        nation,
        writers
      }))
      .filter((group: NationGroup) => {
        if (!searchQuery) return true;
        
        const allWritings = group.writers.flatMap((writer: Writer) => 
          selectedType === 'poems' ? writer.poems : 
          selectedType === 'books' ? (writer.books || []) :
          (writer.riddles || [])
        );
        
        return allWritings.some((writing:any) => 
          writing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          writing.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [selectedType, searchQuery]);

  const renderWritingItem = ({ item, writer }: { item: any; writer: Writer }) => {
    return (
      <TouchableOpacity
        style={[styles.writingItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          navigation.navigate('Writers', {
            screen: selectedType === 'poems' ? 'Poem' : 
                   selectedType === 'books' ? 'Book' : 'Riddle',
            params: selectedType === 'poems' ? { poem: item, writer } : 
                   selectedType === 'books' ? { title: item.title, content: item.content } :
                   { riddle: item }
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.writingContent}>
          <Text style={[styles.writingTitle, { color: theme.textColor, fontSize: fontSize * 1.1 }]}>
            {item.title}
          </Text>
          {(selectedType === 'poems' || selectedType === 'books') && item.year && (
            <Text style={[styles.writingYear, { color: theme.secondaryTextColor, fontSize: fontSize * 0.9 }]}>
              {item.year}
            </Text>
          )}
        
        </View>
      </TouchableOpacity>
    );
  };

  const renderNationGroup = ({ item }: { item: NationGroup }) => {
    const allWritings = item.writers.flatMap(writer => {
      const writings = selectedType === 'poems' ? writer.poems : 
                      selectedType === 'books' ? (writer.books || []) :
                      (writer.riddles || []);
      return writings.map(writing => ({
        ...writing,
        writer // Attach the writer to each writing
      }));
    });

    if (allWritings.length === 0) return null;

    return (
      <View style={styles.nationGroup}>
        <View style={styles.nationTitleContainer}>
          <Text style={[styles.nationTitle, { color: theme.textColor, fontSize: fontSize * 1.3 }]}>
            {item.nation}
          </Text>
          <View style={[styles.nationDivider, { backgroundColor: theme.accentColor }]} />
        </View>
        <FlatList
          data={allWritings}
          renderItem={({ item }) => renderWritingItem({ 
            item: item,
            writer: item.writer
          })}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: theme.secondaryTextColor, fontSize: fontSize * 1.1 }]}>
        No writings found for "{searchQuery}"
      </Text>
      <TouchableOpacity 
        style={[styles.emptyStateButton, { backgroundColor: theme.accentColor }]}
        onPress={() => setSearchQuery('')}
      >
        <Text style={[styles.emptyStateButtonText, { color: '#fff', fontSize: fontSize }]}>
          Clear Search
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
            {translations.nationalWritings}
          </Text>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
          <Search width={20} height={20} color={theme.secondaryTextColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textColor, fontSize: fontSize * 1.1 }]}
            placeholder={translations.searchNationalWritings}
            placeholderTextColor={theme.secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <View style={[styles.clearButton, { backgroundColor: theme.secondaryTextColor }]}>
                <Text style={[styles.clearButtonText, { color: theme.cardBackground }]}>×</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedType === 'poems' ? theme.accentColor : 'transparent',
                borderColor: theme.accentColor
              }
            ]}
            onPress={() => setSelectedType('poems')}
          >
            <Filter
              width={18}
              height={18}
              stroke={selectedType === 'poems' ? '#fff' : theme.accentColor}
            />
            <Text style={[
              styles.filterText,
              { 
                color: selectedType === 'poems' ? '#fff' : theme.accentColor,
                fontSize: fontSize
              }
            ]}>
              {translations.poems}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedType === 'books' ? theme.accentColor : 'transparent',
                borderColor: theme.accentColor
              }
            ]}
            onPress={() => setSelectedType('books')}
          >
            <Book
              width={18}
              height={18}
              stroke={selectedType === 'books' ? '#fff' : theme.accentColor}
            />
            <Text style={[
              styles.filterText,
              { 
                color: selectedType === 'books' ? '#fff' : theme.accentColor,
                fontSize: fontSize
              }
            ]}>
              {translations.books}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedType === 'riddles' ? theme.accentColor : 'transparent',
                borderColor: theme.accentColor
              }
            ]}
            onPress={() => setSelectedType('riddles')}
          >
            <HelpCircle
              width={18}
              height={18}
              stroke={selectedType === 'riddles' ? '#fff' : theme.accentColor}
            />
            <Text style={[
              styles.filterText,
              { 
                color: selectedType === 'riddles' ? '#fff' : theme.accentColor,
                fontSize: fontSize
              }
            ]}>
              {translations.riddles}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentColor} />
        </View>
      ) : nationGroups.length > 0 ? (
        <FlatList
          data={nationGroups}
          renderItem={renderNationGroup}
          keyExtractor={(item) => item.nation}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  filterContainer: {
    paddingHorizontal: 8,
  },
  filterContentContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
  },
  filterText: {
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  nationGroup: {
    marginBottom: 28,
  },
  nationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nationTitle: {
    fontWeight: 'bold',
    marginRight: 12,
  },
  nationDivider: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  writingItem: {
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
  writingContent: {
    flex: 1,
  },
  writingTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  writingYear: {
    fontStyle: 'italic',
    marginBottom: 6,
  },
  writingExcerpt: {
    lineHeight: 18,
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
});

export default NationalWritingsScreen;