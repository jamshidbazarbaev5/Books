import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { ChevronRight } from 'react-native-feather';

// Define the Writer type, mirroring the structure in WritersScreen
interface Writer {
    id: number;
    name_lat?: string;
    name_cyr?: string;
    photo: string;
    date_of_birth: string;
    date_of_death: string;
}

interface WriterListItemProps {
    item: Writer;
    index: number;
}

const WriterListItem: React.FC<WriterListItemProps> = ({ item, index }) => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { fontSize, script } = useSettings();

    // Animation for list items
    const listAnimation = new Animated.Value(0);
    React.useEffect(() => {
        Animated.timing(listAnimation, {
            toValue: 1,
            duration: 300,
            delay: index * 50, // Stagger animation
            useNativeDriver: true,
        }).start();
    }, []);

    const translateY = listAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
    });

    const opacity = listAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 16 }}>
            <TouchableOpacity
                style={[
                    styles.writerCard,
                    {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    },
                ]}
                onPress={() => navigation.navigate("WriterDetail", { writer: item })}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.photo }}
                        style={styles.writerImage}
                        resizeMode="cover"
                        // Add a placeholder for better UX
                        // defaultSource={require('../assets/placeholder.png')}
                    />
                </View>

                <View style={styles.writerInfo}>
                    <Text
                        style={[styles.writerName, { color: theme.textColor, fontSize: fontSize * 1.25 }]}
                        numberOfLines={1}
                    >
                        {script === 'lat' ? item.name_lat : item.name_cyr}
                    </Text>
                    <Text style={[styles.writerPeriod, { color: theme.secondaryTextColor, fontSize: fontSize * 0.875 }]}>
                        {`${item.date_of_birth} - ${item.date_of_death || 'Present'}`}
                    </Text>
                </View>

                <View style={[styles.chevronContainer, { backgroundColor: theme.accentColor + '15' }]}>
                    <ChevronRight width={18} height={18} stroke={theme.accentColor} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
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
        justifyContent: "center",
    },
    writerName: {
        fontWeight: "700",
        marginBottom: 4,
    },
    writerPeriod: {
        opacity: 0.8,
    },
    chevronContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(WriterListItem);
