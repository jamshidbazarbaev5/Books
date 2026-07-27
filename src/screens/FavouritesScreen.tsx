"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ChevronRight, Trash2 } from "react-native-feather"
import { useTheme } from "../context/ThemeContext"
import { useLanguage } from "../context/LanguageContext"
import { useSettings } from "../context/SettingsContext"
import { SafeAreaView } from "react-native-safe-area-context"
import { Poem, Writer } from "../types/navigation"
import ConfirmationModal from "../components/ConfirmationModal"
import { useState } from "react"
import { CompositeNavigationProp } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'

type TabParamList = {
    Writers: undefined;
    Favorites: undefined;
    Settings: undefined;
    Developers: undefined;
};

type WritersStackParamList = {
    WritersList: undefined;
    WriterDetail: { writer: Writer };
    Poem: { poem: Poem; writer: Writer };
};

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<WritersStackParamList>
>;

const FavouritesScreen = () => {
    const navigation = useNavigation<NavigationProp>()
    const { theme } = useTheme()
    const { translations } = useLanguage()
    const { fontSize, favorites, removeFromFavorites } = useSettings()
    const [poemToDelete, setPoemToDelete] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [animations, setAnimations] = useState<{ [key: number]: any }>({})

    const handleDeletePress = (poemId: number) => {
        setPoemToDelete(poemId)
        setDeletingId(poemId)
        if (!animations[poemId]) {
            setAnimations(prev => ({ ...prev, [poemId]: new Animated.Value(1) }))
        }
    }

    const handleConfirmDelete = () => {
        if (poemToDelete !== null && animations[poemToDelete]) {
            Animated.timing(animations[poemToDelete], {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                removeFromFavorites(poemToDelete)
                setPoemToDelete(null)
                setDeletingId(null)
                setAnimations(prev => {
                    const copy = { ...prev }
                    delete copy[poemToDelete]
                    return copy
                })
            })
        } else if (poemToDelete !== null) {
            removeFromFavorites(poemToDelete)
            setPoemToDelete(null)
            setDeletingId(null)
        }
    }
    
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}> 
            <Text style={[styles.title, { color: theme.textColor }]}>{translations.favorites}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.secondaryTextColor, fontSize: fontSize }]}> 
                            {translations.noFavoritesYet}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.favoritesContainer}>
                        {favorites.map(({ poem, writer }) => {
                            const isBookPage = poem && poem.title && poem.title.includes('Page ');
                            const animatedStyle = animations[poem.id]
                                ? {
                                    opacity: animations[poem.id],
                                    transform: [{ translateX: animations[poem.id].interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }],
                                  }
                                : {};
                            return (
                                <Animated.View key={poem.id} style={[styles.favoriteCard, { backgroundColor: theme.cardBackground }, animatedStyle]}>
                                    <TouchableOpacity
                                        style={{ flex: 1 }}
                                        onPress={() => {
                                            if (isBookPage) {
                                                navigation.navigate('Writers', {
                                                    screen: 'AdvancedEpubReader',
                                                    params: {
                                                        title: writer.name,
                                                        epubUrl: poem.epubUrl,
                                                        initialPage: poem.id,
                                                    }
                                                });
                                            } 
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.poemInfo}>
                                            <Text style={[styles.poemTitle, { color: theme.textColor, fontSize: fontSize * 1.125 }]}> 
                                                {poem.title}
                                            </Text>
                                            <Text style={[styles.writerName, { color: theme.secondaryTextColor, fontSize: fontSize * 0.875 }]}> 
                                                {writer.name}
                                            </Text>
                                            <Text style={[styles.poemYear, { color: theme.secondaryTextColor, fontSize: fontSize * 0.875 }]}> 
                                                {poem.year}
                                            </Text>
                                        </View>
                                        <View style={styles.actionContainer}>
                                            <TouchableOpacity
                                                onPress={() => handleDeletePress(poem.id)}
                                                style={styles.deleteButton}
                                            >
                                                <Trash2 width={20} height={20} color={theme.secondaryTextColor} />
                                            </TouchableOpacity>
                                            <ChevronRight width={24} height={24} color={theme.accentColor} />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
            <ConfirmationModal
                isVisible={poemToDelete !== null}
                title="Remove from Favorites"
                message="Are you sure you want to remove this poem from your favorites?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setPoemToDelete(null)}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 32,
    },
    emptyText: {
        textAlign: "center",
        opacity: 0.7,
    },
    favoritesContainer: {
        padding: 16,
    },
    favoriteCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    poemInfo: {
        flex: 1,
    },
    poemTitle: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    writerName: {
        marginBottom: 2,
    },
    poemYear: {
        opacity: 0.7,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteButton: {
        padding: 8,
    },
})

export default FavouritesScreen
