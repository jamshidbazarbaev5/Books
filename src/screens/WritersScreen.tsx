"use client"

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TextInput, TouchableOpacity, Animated, Dimensions, StyleSheet, Platform, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings, scriptEventEmitter } from '../context/SettingsContext';
import { Search, ChevronRight } from 'react-native-feather';
import { AuthorsApi } from '../api/authors';

interface ApiWriter {
    id: number;
    name: string;
    photo: string;
    biography: string;
    date_of_birth: string;
    date_of_death: string;
}

interface Writer extends ApiWriter {
    // Additional UI fields
    poems?: Poem[];
    books?: Book[];
    gallery?: string[];
    name_lat?: string; // For Latin script
    name_cyr?: string; // For Cyrillic script
}

interface Poem {
    id: number;
    title: string;
    year: string;
    content: string;
}

interface Book {
    id: number;
    title: string;
    year: string;
    content: string;
}

interface ApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        id: number;
        name: string;
        photo: string;
        biography: string;
        date_of_birth: string;
        date_of_death: string;
    }[];
}

interface ApiError {
    response?: {
        status: number;
        data: any;
    };
}

const { width } = Dimensions.get('window')

const WritersScreen = () => {
    const navigation = useNavigation<any>()
    const { theme } = useTheme()
    const { translations } = useLanguage()
    const { fontSize, script } = useSettings()
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [writers, setWriters] = useState<Writer[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Animation values
    const searchBarWidth = useRef(new Animated.Value(width - 32)).current
    const headerOpacity = useRef(new Animated.Value(1)).current
    const listAnimation = useRef(new Animated.Value(0)).current
    
    const fetchWriters = async () => {
        try {
            setLoading(true);
            const authorsApi = new AuthorsApi();
            console.log('Fetching writers...');
            const response = await authorsApi.getAuthors();
            console.log('Writers response:', response);
            
            // Map the API response to match our Writer interface
            const mappedWriters: any = response.results.map(writer => ({
                id: writer.id,
                name_lat: writer.name, // Use the same name for both lat and cyr since API doesn't differentiate
                name_cyr: writer.name,
                photo: writer.photo,
                biography_lat: writer.biography, // Use the same biography for both lat and cyr
                biography_cyr: writer.biography,
                date_of_birth: writer.date_of_birth,
                date_of_death: writer.date_of_death,
                created_at: new Date().toISOString(), // Use current date since API doesn't provide these
                updated_at: new Date().toISOString()
            }));
            
            console.log('Mapped writers:', mappedWriters); // Add this to debug the mapping
            setWriters(mappedWriters);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching writers:', err);
            const apiError = err as ApiError;
            if (apiError.response) {
                console.error('Response status:', apiError.response.status);
                console.error('Response data:', apiError.response.data);
            }
            setError('Failed to load writers');
            setLoading(false);
        }
    };
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchWriters();
        setRefreshing(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchWriters();
    }, []);

    // Listen for script changes
    useEffect(() => {
        const handleScriptChange = (newScript: 'cyr' | 'lat') => {
            fetchWriters();
        };

        scriptEventEmitter.addListener('scriptChanged', handleScriptChange);

        return () => {
            scriptEventEmitter.removeListener('scriptChanged', handleScriptChange);
        };
    }, []);
    
    // Filter writers based on search query
    const filteredWriters = writers.filter((writer:any) => {
        const writerName = script === 'lat' ? writer.name_lat : writer.name_cyr;
        return writerName && writerName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    // Animate search bar on focus/blur
    useEffect(() => {
        if (isSearchFocused) {
            Animated.parallel([
                Animated.timing(searchBarWidth, {
                    toValue: width - 32,
                    duration: 300,
                    useNativeDriver: false
                }),
                Animated.timing(headerOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                })
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(searchBarWidth, {
                    toValue: width - 32,
                    duration: 300,
                    useNativeDriver: false
                }),
                Animated.timing(headerOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false
                })
            ]).start()
        }
    }, [isSearchFocused])
    
    // Animate list items on mount
    useEffect(() => {
        Animated.timing(listAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start()
    }, [])

    const renderWriterItem = ({ item, index }: { item: Writer, index: number }) => {
        const translateY = listAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
        })
        
        const opacity = listAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        })
        
        return (
            <Animated.View
                style={{
                    opacity,
                    transform: [{ translateY }],
                    marginBottom: 16
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.writerCard, 
                        { 
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }
                    ]}
                    onPress={() => navigation.navigate("WriterDetail", { writer: item })}
                    activeOpacity={0.7}
                >
                    <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: item.photo }} 
                            style={styles.writerImage} 
                            resizeMode="cover"
                        />
                    </View>
                    
                    <View style={styles.writerInfo}>
                        <Text 
                            style={[
                                styles.writerName, 
                                { color: theme.textColor, fontSize: fontSize * 1.25 }
                            ]}
                            numberOfLines={1}
                        >
                            {script === 'lat' ? item.name_lat : item.name_cyr}
                        </Text>
                        
                        <Text 
                            style={[
                                styles.writerPeriod, 
                                { color: theme.secondaryTextColor, fontSize: fontSize * 0.875 }
                            ]}
                        >
                            {`${item.date_of_birth}` }
                        </Text>
                    </View>
                    
                    <View style={[
                        styles.chevronContainer, 
                        { backgroundColor: theme.accentColor + '15' }
                    ]}>
                        <ChevronRight 
                            width={18} 
                            height={18} 
                            stroke={theme.accentColor} 
                        />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                <ActivityIndicator size="large" color={theme.accentColor} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                <Text style={{ color: theme.textColor }}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.backgroundColor}
            />
            
            <View style={styles.container}>
                {/* Header */}
                <Animated.View 
                    style={[
                        styles.header,
                        { opacity: headerOpacity }
                    ]}
                >
                    <Text 
                        style={[
                            styles.headerTitle, 
                            { color: theme.textColor, fontSize: fontSize * 1.75 }
                        ]}
                    >
                        Authors
                    </Text>
                    <Text 
                        style={[
                            styles.headerSubtitle, 
                            { color: theme.secondaryTextColor, fontSize: fontSize * 1 }
                        ]}
                    >
                        {filteredWriters.length} authors available
                    </Text>
                </Animated.View>
                
                {/* Search Bar */}
                <Animated.View 
                    style={[
                        styles.searchContainer, 
                        { 
                            backgroundColor: theme.inputBackground,
                            width: searchBarWidth,
                            borderColor: isSearchFocused 
                                ? theme.accentColor 
                                : theme.dark 
                                    ? 'rgba(255,255,255,0.1)' 
                                    : 'rgba(0,0,0,0.05)'
                        }
                    ]}
                >
                    <Search
                        width={20}
                        height={20}
                        stroke={isSearchFocused ? theme.accentColor : theme.secondaryTextColor}
                        style={styles.searchIcon}
                    />
                    
                    <TextInput
                        style={[
                            styles.searchInput, 
                            { 
                                color: theme.textColor,
                                fontSize: fontSize * 1
                            }
                        ]}
                        placeholder="Search authors..."
                        placeholderTextColor={theme.secondaryTextColor}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        returnKeyType="search"
                    />
                </Animated.View>

                {/* Writers List */}
                <FlatList
                    data={filteredWriters}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderWriterItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[
                                styles.emptyIconContainer,
                                { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                            ]}>
                                <Search width={30} height={30} stroke={theme.secondaryTextColor} />
                            </View>
                            <Text style={[
                                styles.emptyText, 
                                { color: theme.secondaryTextColor, fontSize: fontSize * 1.1 }
                            ]}>
                                No authors found
                            </Text>
                            <Text style={[
                                styles.emptySubtext, 
                                { color: theme.secondaryTextColor, fontSize: fontSize * 0.9 }
                            ]}>
                                Try a different search term
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        marginTop: -26,
    },
    header: {
        marginBottom: 24,
        marginTop: 8,
    },
    headerTitle: {
        fontWeight: "700",
        marginBottom: 4,
    },
    headerSubtitle: {
        opacity: 0.7,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 4 : 0,
    },
    clearButton: {
        marginLeft: 8,
    },
    clearButtonInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    writerCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
    },
    imageContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    writerImage: {
        width: 70,
        height: 70,
        borderRadius: 16,
    },
    writerInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "flex-start",
    },
    chevronContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    writerName: {
        fontWeight: "700",
        marginBottom: 4,
    },
    writerPeriod: {
        marginBottom: 6,
    },
    poemCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    poemIcon: {
        marginRight: 6,
    },
    writerPoemCount: {
        fontSize: 14,
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
})

export default WritersScreen