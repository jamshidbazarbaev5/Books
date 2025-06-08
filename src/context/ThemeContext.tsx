"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from 'lodash';

interface Theme {
    backgroundColor: string;
    textColor: string;
    cardBackground: string;
    accentColor: string;
    secondaryTextColor: string;
    inputBackground: string;
    pageBackground: string;
    disabledColor: string;
}

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDarkMode: boolean;
}

const lightTheme: Theme = {
    backgroundColor: "#f5f5f5",
    cardBackground: "#ffffff",
    textColor: "#333333",
    secondaryTextColor: "#666666",
    accentColor: "#6366f1",
    inputBackground: "#e0e0e0",
    pageBackground: "#ffffff",
    disabledColor: "#CCCCCC",
}

const darkTheme: Theme = {
    backgroundColor: "#121212",
    cardBackground: "#1e1e1e",
    textColor: "#f5f5f5",
    secondaryTextColor: "#a0a0a0",
    accentColor: "#818cf8",
    inputBackground: "#2a2a2a",
    pageBackground: "#1e1e1e",
    disabledColor: "#666666",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@books:theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceTheme = useColorScheme()
    const [isDarkMode, setIsDarkMode] = useState(deviceTheme === "dark")
    const theme = isDarkMode ? darkTheme : lightTheme

    // Load saved theme preference
    useEffect(() => {
        const loadSavedTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                } else {
                    setIsDarkMode(deviceTheme === "dark")
                }
            } catch (error) {
                console.error('Error loading theme:', error);
                setIsDarkMode(deviceTheme === "dark")
            }
        };
        loadSavedTheme();
    }, [deviceTheme]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light')
                .catch(error => console.error('Error saving theme:', error));
            return newMode;
        });
    }, []);

    return <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
