import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Search, X } from 'react-native-feather';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

// Simple debounce function
const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
    const { theme } = useTheme();
    const { fontSize } = useSettings();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const searchBarWidth = useRef(new Animated.Value(0)).current;

    // Debounced search handler
    const debouncedSearch = useRef(debounce(onSearch, 300)).current;

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    useEffect(() => {
        // Animate width on mount
        Animated.timing(searchBarWidth, {
            toValue: 1,
            duration: 350,
            useNativeDriver: false,
        }).start();
    }, [searchBarWidth]);

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    const animatedWidth = searchBarWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['80%', '100%'],
    });

    return (
        <Animated.View
            style={[
                styles.searchContainer,
                {
                    backgroundColor: theme.inputBackground,
                    width: animatedWidth,
                    borderColor: isFocused
                        ? theme.accentColor
                        : theme.dark
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.05)',
                },
            ]}
        >
            <Search
                width={20}
                height={20}
                stroke={isFocused ? theme.accentColor : theme.secondaryTextColor}
                style={styles.searchIcon}
            />
            <TextInput
                style={[
                    styles.searchInput,
                    {
                        color: theme.textColor,
                        fontSize: fontSize * 1,
                    },
                ]}
                placeholder={placeholder}
                placeholderTextColor={theme.secondaryTextColor}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="search"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton} activeOpacity={0.6}>
                     <View style={[styles.clearButtonInner, { backgroundColor: theme.secondaryTextColor + '30' }]}>
                        <X width={14} height={14} stroke={theme.textColor} />
                    </View>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        alignSelf: 'center',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    clearButtonInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SearchBar;