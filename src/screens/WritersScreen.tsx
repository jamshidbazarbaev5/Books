"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSettings, scriptEventEmitter } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthorsApi } from '../api/authors';
import { Search } from 'react-native-feather';

// Import the new components
import WriterListItem from '../components/WriterListItem';
import SkeletonLoader from '../components/SkeletonLoader';
import SearchBar from '../components/SearchBar';

// Define interfaces
interface ApiWriter {
    id: number;
    name: string;
    photo: string;
    biography: string;
    date_of_birth: string;
    date_of_death: string;
}

interface Writer {
    id: number;
    name_lat: string;
    name_cyr: string;
    photo: string;
    biography_lat: string;
    biography_cyr: string;
    date_of_birth: string;
    date_of_death: string;
}

const WritersScreen = () => {
    const { theme } = useTheme();
    const { fontSize, script } = useSettings();
    const { translations } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [writers, setWriters] = useState<Writer[]>([]);
    const [filteredWriters, setFilteredWriters] = useState<Writer[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    
    const authorsApi = useRef(new AuthorsApi()).current;

    const mapApiData = (apiWriters: ApiWriter[]): Writer[] => {
        return apiWriters.map(writer => ({
            id: writer.id,
            name_lat: writer.name, // Assuming API provides one name, used for both scripts
            name_cyr: writer.name,
            photo: writer.photo,
            biography_lat: writer.biography,
            biography_cyr: writer.biography,
            date_of_birth: writer.date_of_birth,
            date_of_death: writer.date_of_death,
        }));
    };

    const fetchWriters = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        setError(null);
        try {
            console.log('Fetching initial writers...');
            const response = await authorsApi.getAuthors();
            const mappedWriters = mapApiData(response.results);
            setWriters(mappedWriters);
            setFilteredWriters(mappedWriters);
            setNextPageUrl(response.next);
        } catch (err) {
            console.error('Error fetching writers:', err);
            setError('Failed to load authors. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [authorsApi]);

    const fetchMoreWriters = async () => {
        if (loadingMore || !nextPageUrl) return;

        setLoadingMore(true);
        try {
            console.log('Fetching more writers from:', nextPageUrl);
            // This assumes your API client can handle full URLs.
            // You might need to adjust this part based on your `AuthorsApi` implementation.
            const response = await authorsApi.getAuthors(nextPageUrl);
            const newWriters = mapApiData(response.results);
            const updatedWriters = [...writers, ...newWriters];
            setWriters(updatedWriters);
            // Also update filtered writers if no search query is active
            if (searchQuery === "") {
                setFilteredWriters(updatedWriters);
            }
            setNextPageUrl(response.next);
        } catch (err) {
            console.error('Error fetching more writers:', err);
            // Optionally set an error state for the footer
        } finally {
            setLoadingMore(false);
        }
    };

    // Initial fetch and script change listener
    useEffect(() => {
        fetchWriters();
        
        const handleScriptChange = () => fetchWriters(true);
        scriptEventEmitter.addListener('scriptChanged', handleScriptChange);

        return () => {
            scriptEventEmitter.removeListener('scriptChanged', handleScriptChange);
        };
    }, [fetchWriters]);

    // Handle search filtering
    useEffect(() => {
        if (searchQuery) {
            const filtered = writers.filter((writer) => {
                const writerName = script === 'lat' ? writer.name_lat : writer.name_cyr;
                return writerName.toLowerCase().includes(searchQuery.toLowerCase());
            });
            setFilteredWriters(filtered);
        } else {
            setFilteredWriters(writers);
        }
    }, [searchQuery, writers, script]);

    const onRefresh = () => fetchWriters(true);

    const renderItem = useCallback(({ item, index }: { item: Writer, index: number }) => (
        <WriterListItem item={item} index={index} />
    ), []);

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={theme.accentColor} />;
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Search width={30} height={30} stroke={theme.secondaryTextColor} />
            </View>
            <Text style={[styles.emptyText, { color: theme.secondaryTextColor, fontSize: fontSize * 1.1 }]}>
               {translations.noWritersFound}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.secondaryTextColor, fontSize: fontSize * 0.9 }]}>
                {translations.tryDifferentSearch}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.textColor, fontSize: fontSize * 1.75 }]}>Authors</Text>
                </View>
                <SearchBar onSearch={setSearchQuery} placeholder="Search authors..." />
                <SkeletonLoader />
            </SafeAreaView>
        );
    }

    if (error && !writers.length) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
                <View style={styles.errorContainer}>
                    <Text style={{ color: theme.textColor, fontSize: fontSize * 1.1, textAlign: 'center' }}>{error}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.accentColor }]} onPress={() => fetchWriters()}>
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.backgroundColor} />
            
            <FlatList
                data={filteredWriters}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={onRefresh}
                refreshing={loading}
                onEndReached={fetchMoreWriters}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: theme.textColor, fontSize: fontSize * 1.75 }]}>{translations.authors}</Text>
                            <Text style={[styles.headerSubtitle, { color: theme.secondaryTextColor, fontSize: fontSize * 1 }]}>
                                {writers.length} {translations.availableAuthors}
                            </Text>
                        </View>
                        <SearchBar onSearch={setSearchQuery} placeholder={translations.searchAuthors} />
                    </>
                }
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyComponent}
                 // Performance optimizations
                initialNumToRender={10}
                windowSize={21}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 8,
    },
    headerTitle: {
        fontWeight: "700",
        marginBottom: 4,
    },
    headerSubtitle: {
        opacity: 0.7,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        marginTop: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        marginBottom: 8,
        fontWeight: '600',
    },
    emptySubtext: {
        textAlign: 'center',
        opacity: 0.7,
    },
});

export default WritersScreen;
