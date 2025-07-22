"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from "react-native"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NavigationProp } from '@react-navigation/native'
import { ArrowLeft, ChevronRight, Heart, ChevronUp, ChevronDown } from "react-native-feather"
import { useTheme } from "../context/ThemeContext"
import { useLanguage } from "../context/LanguageContext"
import ImageSlider from "../components/ImageSlider"
import { useSettings } from "../context/SettingsContext"
import { SafeAreaView } from "react-native-safe-area-context"
import Sound from "react-native-sound"

interface Writer {
    id: number;
    name_cyr: string;
    name_lat: string;
    photo: string;
    biography_cyr: string;
    biography_lat: string;
    date_of_birth: string;
    date_of_death: string;
    created_at: string;
    updated_at: string;
    poems?: Poem[];
    books?: Book[];
    gallery?: string[];
}

interface Poem {
    id: number;
    title: string;
    year: string;
    content: string;
    audio?: string | AudioPaths;
}

interface Book {
    id: number;
    title: string;
    year: string;
    content: string;
    audio?: string | AudioPaths;
}

interface AudioPaths {
    ios: string;
    android: string;
}

type RootStackParamList = {
    WriterDetail: { writer: Writer };
    Poem: { poem: Poem; writer: Writer };
    Book: { content: string; title: string; bookId: number; audio?: string };
};

const { width } = Dimensions.get("window")

const WriterDetailScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const route = useRoute<RouteProp<RootStackParamList, 'WriterDetail'>>()
    const { writer } = route.params
    console.log('Writer data received:', writer);
    const { theme } = useTheme()
    const { translations } = useLanguage()
    const { fontSize, poemFontSize, isFavorite, addToFavorites, removeFromFavorites, script } = useSettings()
    const [activeTab, setActiveTab] = useState("biography")
    const [expandedPoems, setExpandedPoems] = useState<{[key: number]: boolean}>({})
    const [expandedBooks, setExpandedBooks] = useState<{[key: number]: boolean}>({})
    const [gallery] = useState<string[]>([writer.photo]) // Using photo as gallery for now
    const [playingAudioId, setPlayingAudioId] = useState<number | null>(null)
    const sound = useRef<Sound | null>(null)

    useEffect(() => {
        return () => {
            if (sound.current) {
                sound.current.release();
            }
        };
    }, []);

    const handleFavoritePress = (poem: Poem) => {
        if (isFavorite(poem.id)) {
            removeFromFavorites(poem.id);
        } else {
            addToFavorites(writer, poem);
        }
    };

    const togglePoemExpansion = (poemId: number) => {
        setExpandedPoems(prev => ({
            ...prev,
            [poemId]: !prev[poemId]
        }));
    };

    const toggleBookExpansion = (bookId: number) => {
        setExpandedBooks(prev => ({
            ...prev,
            [bookId]: !prev[bookId]
        }));
    };

    const toggleAudio = async (item: Poem | Book) => {
        // Handle audio type checking using type guard
        const audio = item.audio && typeof item.audio === 'object' 
            ? Platform.OS === 'ios'
                ? (item.audio as AudioPaths).ios
                : (item.audio as AudioPaths).android
            : item.audio;
                
        if (!audio) return;
        
        if (playingAudioId === item.id) {
            // Stop playing
            if (sound.current) {
                sound.current.stop();
                sound.current.release();
                sound.current = null;
            }
            setPlayingAudioId(null);
        } else {
            // Stop previous audio if playing
            if (sound.current) {
                sound.current.stop();
                sound.current.release();
            }

            // Start new audio
            sound.current = new Sound(audio, Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.error('Failed to load sound', error);
                    return;
                }
                sound.current?.play((success) => {
                    if (success) {
                        setPlayingAudioId(null);
                        sound.current?.release();
                    }
                });
            });
            setPlayingAudioId(item.id);
        }
    };

    const renderPoemItem = ({ item }: { item: Poem }) => (
        <TouchableOpacity
            style={[styles.poemCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate("Poem", { poem: item, writer })}
        >
            <View style={styles.poemInfo}>
                <Text style={[styles.poemTitle, { color: theme.textColor, fontSize: fontSize * 1.125 }]}>{item.title}</Text>
                <Text style={[styles.poemYear, { color: theme.secondaryTextColor, fontSize: fontSize * 0.875 }]}>{item.year}</Text>
                {expandedPoems[item.id] && (
                    <Text 
                        style={[
                            styles.poemPreview, 
                            { color: theme.textColor, fontSize: poemFontSize * 0.9 }
                        ]}
                        numberOfLines={expandedPoems[item.id] ? undefined : 3}
                    >
                        {item.content.slice(0, Math.floor(item.content.length * 0.3))}...
                    </Text>
                )}
            </View>
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    onPress={() => handleFavoritePress(item)}
                    style={styles.iconButton}
                >
                    <Heart
                        width={22}
                        height={22}
                        stroke={theme.accentColor}
                        fill={isFavorite(item.id) ? theme.accentColor : 'none'}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => togglePoemExpansion(item.id)}
                    style={styles.iconButton}
                >
                    {expandedPoems[item.id] ? (
                        <ChevronUp width={24} height={24} color={theme.accentColor} />
                    ) : (
                        <ChevronDown width={24} height={24} color={theme.accentColor} />
                    )}
                </TouchableOpacity>
                {item.audio && (
                    <TouchableOpacity
                        onPress={() => toggleAudio(item)}
                        style={styles.iconButton}
                    >
                        <Text style={{ color: theme.accentColor }}>
                            {playingAudioId === item.id ? "Pause" : "Play"}
                        </Text>
                    </TouchableOpacity>
                )}
                <ChevronRight width={24} height={24} color={theme.accentColor} />
            </View>
        </TouchableOpacity>
    )

    const renderBookItem = ({ item }: { item: Book }) => (
        <TouchableOpacity
            style={[styles.bookCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate("Book", { 
                content: item.content, 
                title: item.title, 
                bookId: item.id,
                audio: item.audio
            })}
        >
            <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: theme.textColor, fontSize: fontSize * 1.125 }]}>{item.title}</Text>
                <Text style={[styles.bookYear, { color: theme.secondaryTextColor, fontSize: fontSize * 0.875 }]}>{item.year}</Text>
                {expandedBooks[item.id] && (
                    <Text 
                        style={[
                            styles.bookPreview, 
                            { color: theme.textColor, fontSize: poemFontSize * 0.9 }
                        ]}
                        numberOfLines={expandedBooks[item.id] ? undefined : 3}
                    >
                        {item.content.slice(0, Math.floor(item.content.length * 0.3))}...
                    </Text>
                )}
            </View>
            <View style={styles.bookActionsContainer}>
                <TouchableOpacity
                    onPress={() => toggleBookExpansion(item.id)}
                    style={styles.iconButton}
                >
                    {expandedBooks[item.id] ? (
                        <ChevronUp width={24} height={24} color={theme.accentColor} />
                    ) : (
                        <ChevronDown width={24} height={24} color={theme.accentColor} />
                    )}
                </TouchableOpacity>
               
                <ChevronRight width={24} height={24} color={theme.accentColor} />
            </View>
        </TouchableOpacity>
    )

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 0 }}>
                <View style={styles.header}>
                    <ImageSlider 
                        images={gallery}
                        containerStyle={{ width: width, height: width }}
                    />
                </View>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.tabContainer}
                    contentContainerStyle={styles.tabContentContainer}
                >
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "biography" && { borderBottomColor: theme.accentColor, borderBottomWidth: 2 },
                        ]}
                        onPress={() => setActiveTab("biography")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === "biography" ? theme.accentColor : theme.secondaryTextColor, fontSize: fontSize * 1.25 },
                            ]}
                        >
                            {translations.biography}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "poems" && { borderBottomColor: theme.accentColor, borderBottomWidth: 2 },
                        ]}
                        onPress={() => setActiveTab("poems")}
                    >
                        <Text
                            style={[styles.tabText, { color: activeTab === "poems" ? theme.accentColor : theme.secondaryTextColor, fontSize: fontSize * 1.25 }]}
                        >
                            {translations?.poems} ({writer.poems?.length || 0})
                        </Text>
                    </TouchableOpacity>

                    {writer.books && writer.books.length > 0 && (
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === "books" && { borderBottomColor: theme.accentColor, borderBottomWidth: 2 },
                            ]}
                            onPress={() => setActiveTab("books")}
                        >
                            <Text
                                style={[styles.tabText, { color: activeTab === "books" ? theme.accentColor : theme.secondaryTextColor, fontSize: fontSize * 1.25 }]}
                            >
                                {translations?.books} ({writer.books.length})
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {activeTab === "biography" ? (
                    <View style={styles.biographyContainer}>
                        <Text style={[styles.biographyText, { color: theme.textColor, fontSize: fontSize }]}>
                            {(() => {
                                // Handle both formats - legacy API format with single biography field
                                // and new format with separate cyr/lat fields
                                if (writer.biography_cyr || writer.biography_lat) {
                                    return script === 'cyr' ? writer.biography_cyr : writer.biography_lat;
                                }
                                return writer.biography || '';
                            })()}
                        </Text>
                    </View>
                ) : activeTab === "poems" ? (
                    <View style={styles.poemsContainer}>
                        {writer.poems?.map((poem) => renderPoemItem({ item: poem })) || (
                            <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>No poems available</Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.booksContainer}>
                        {writer.books?.map((book) => renderBookItem({ item: book })) || (
                            <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>No books available</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        padding: 20,
    },
    header: {
        height: width,
        width: width,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    tabContainer: {
        flexDirection: "row",
        marginTop: 8,
        // backgroundColor: theme.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabContentContainer: {
        flexGrow: 1,
        justifyContent: 'space-around',
        minWidth: '100%',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: Math.min(16, width * 0.04), // Responsive font size
        fontWeight: "600",
        textAlign: 'center',
        fontFamily: 'System',
    },
    biographyContainer: {
        padding: 16,
        marginTop: 8,
    },
    biographyText: {
        fontSize: Math.min(16, width * 0.04),
        lineHeight: Math.max(22, width * 0.05),
        fontFamily: 'System',
    },
    poemsContainer: {
        padding: 16,
    },
    poemCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: Math.max(12, width * 0.03),
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    poemInfo: {
        flex: 1,
        justifyContent: "flex-start",
        paddingRight: 8,
    },
    chevronContainer: {
        paddingTop: 2,
    },
    poemTitle: {
        fontWeight: "bold",
        marginBottom: 4,
        flexWrap: 'wrap',
        fontFamily: 'System',
    },
    poemYear: {
        opacity: 0.7,
        marginBottom: 4,
        fontFamily: 'System',
    },
    writerName: {
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
        fontFamily: 'System',
    },
    period: {
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'System',
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 16,
        fontFamily: 'System',
    },
    biography: {
        lineHeight: 24,
        fontFamily: 'System',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Math.max(8, width * 0.02),
    },
    favoriteButton: {
        padding: 4,
    },
    iconButton: {
        padding: Math.max(6, width * 0.015),
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    poemPreview: {
        marginTop: 8,
        lineHeight: Math.max(20, width * 0.045),
    },
    bookCard: {
        flexDirection: "row",
        padding: Math.max(12, width * 0.03),
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    bookInfo: {
        flex: 1,
        marginRight: Math.max(12, width * 0.03),
    },
    bookActionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Math.max(8, width * 0.02),
    },
    bookTitle: {
        fontWeight: "600",
        marginBottom: 4,
        fontFamily: 'System',
    },
    bookYear: {
        marginBottom: 2,
        fontFamily: 'System',
    },
    bookPreview: {
        marginTop: 8,
        lineHeight: Math.max(20, width * 0.045),
        fontFamily: 'System',
    },
    booksContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
})

export default WriterDetailScreen
