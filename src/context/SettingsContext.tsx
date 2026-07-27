"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from 'lodash';
import { DeviceEventEmitter } from 'react-native';

// Use DeviceEventEmitter for script changes
export const scriptEventEmitter = {
    emit: (event: string, data: any) => DeviceEventEmitter.emit(event, data),
    addListener: (event: string, callback: (data: any) => void) => DeviceEventEmitter.addListener(event, callback),
    removeListener: (event: string, callback: (data: any) => void) => {
        const subscription = DeviceEventEmitter.addListener(event, callback);
        subscription.remove();
    }
};

interface Poem {
    id: number;
    title: string;
    year: string;
    content: string;
}

interface Writer {
    id: number;
    name: string;
    period: string;
    image: string;
    gallery: string[];
    biography: string;
    poems: Poem[];
}

interface FavoriteItem {
    writer: Writer;
    poem: Poem;
}

interface ReadingProgress {
    bookId: number;
    position: number;
    totalPages: number;
    timestamp: number;
}

interface SettingsContextType {
    fontSize: number;
    poemFontSize: number;
    setPoemFontSize: (size: number) => void;
    favorites: FavoriteItem[];
    addToFavorites: (writer: Writer, poem: Poem) => void;
    removeFromFavorites: (poemId: number) => void;
    isFavorite: (poemId: number) => boolean;
    script: 'cyr' | 'lat';
    toggleScript: () => Promise<void>;
    readingProgress: { [key: number]: ReadingProgress };
    updateReadingProgress: (bookId: number, position: number, totalPages: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
    FONT_SIZE: '@books:fontSize',
    POEM_FONT_SIZE: '@books:poemFontSize',
    FAVORITES: '@books:favorites',
    SCRIPT: '@books:script',
    READING_PROGRESS: '@books:readingProgress'
};

// Ensure storage directory exists
const initializeStorage = async () => {
    try {
        await AsyncStorage.setItem('@books:init', 'true');
        await AsyncStorage.getItem('@books:init');
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize] = useState(16); // Fixed default size for UI
    const [poemFontSize, setPoemFontSizeState] = useState(16);
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [script, setScript] = useState<'cyr' | 'lat'>('cyr');
    const [readingProgress, setReadingProgress] = useState<{ [key: number]: ReadingProgress }>({});

    // Load saved settings when the app starts
    useEffect(() => {
        const loadSavedSettings = async () => {
            try {
                const [savedPoemFontSize, savedFavorites, savedScript, savedProgress] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.POEM_FONT_SIZE),
                    AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
                    AsyncStorage.getItem(STORAGE_KEYS.SCRIPT),
                    AsyncStorage.getItem(STORAGE_KEYS.READING_PROGRESS)
                ]);

                if (savedPoemFontSize) {
                    setPoemFontSizeState(Number(savedPoemFontSize));
                }
                if (savedFavorites) {
                    setFavorites(JSON.parse(savedFavorites));
                }
                if (savedScript) {
                    setScript(savedScript as 'cyr' | 'lat');
                }
                if (savedProgress) {
                    setReadingProgress(JSON.parse(savedProgress));
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };

        loadSavedSettings();
    }, []);

    // Debounced poem font size setter
    const debouncedSetPoemFontSize = useCallback(
        debounce(async (size: number) => {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.POEM_FONT_SIZE, size.toString());
            } catch (error) {
                console.error('Error saving poem font size:', error);
            }
        }, 500),
        []
    );

    const setPoemFontSize = (size: number) => {
        setPoemFontSizeState(size);
        debouncedSetPoemFontSize(size);
    };

    const addToFavorites = async (writer: Writer, poem: Poem) => {
        setFavorites(prev => {
            if (prev.some(item => item.poem.id === poem.id)) {
                return prev;
            }
            const newFavorites = [...prev, { writer, poem }];
            // Save to AsyncStorage
            AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites))
                .catch(error => console.error('Error saving favorites:', error));
            return newFavorites;
        });
    };

    const removeFromFavorites = async (poemId: number) => {
        setFavorites(prev => {
            const newFavorites = prev.filter(item => item.poem.id !== poemId);
            // Save to AsyncStorage
            AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites))
                .catch(error => console.error('Error saving favorites:', error));
            return newFavorites;
        });
    };

    const isFavorite = (poemId: number) => {
        return favorites.some(item => item.poem.id === poemId);
    };

    const toggleScript = useCallback(async () => {
        try {
            const newScript = script === 'cyr' ? 'lat' : 'cyr';
            await AsyncStorage.setItem(STORAGE_KEYS.SCRIPT, newScript);
            setScript(newScript);
            
            // Emit event to notify components that script has changed
            scriptEventEmitter.emit('scriptChanged', newScript);
        } catch (error) {
            console.error('Error saving script setting:', error);
        }
    }, [script]);

    const updateReadingProgress = useCallback((bookId: number, position: number, totalPages: number) => {
        setReadingProgress(current => {
            const newProgress = {
                ...current,
                [bookId]: {
                    bookId,
                    position,
                    totalPages,
                    timestamp: Date.now()
                }
            };
            AsyncStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(newProgress))
                .catch(error => console.error('Error saving reading progress:', error));
            return newProgress;
        });
    }, []);

    const value: SettingsContextType = {
        fontSize,
        poemFontSize,
        setPoemFontSize,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        script,
        toggleScript,
        readingProgress,
        updateReadingProgress
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
