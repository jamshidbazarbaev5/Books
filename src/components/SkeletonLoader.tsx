import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SkeletonPiece = () => {
    const { theme } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <View style={[styles.writerCard, { backgroundColor: theme.cardBackground, borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Animated.View style={[styles.writerImage, { opacity, backgroundColor: theme.inputBackground }]} />
            <View style={styles.writerInfo}>
                <Animated.View style={[styles.textLine, { width: '70%', opacity, backgroundColor: theme.inputBackground }]} />
                <Animated.View style={[styles.textLine, { width: '40%', opacity, backgroundColor: theme.inputBackground, marginTop: 8 }]} />
            </View>
        </View>
    );
};

const SkeletonLoader = () => {
    return (
        <View style={styles.container}>
            {[...Array(5)].map((_, index) => (
                <SkeletonPiece key={index} />
            ))}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
    writerCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
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
    textLine: {
        height: 20,
        borderRadius: 4,
        marginBottom: 6,
    },
});

export default SkeletonLoader;
