"use client"

import { useState, useRef } from "react"
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity } from "react-native"
import { useTheme } from "../context/ThemeContext"

const { width } = Dimensions.get("window")

const ImageSlider = ({ images }:{images:any}) => {
    const { theme } = useTheme()
    const [activeIndex, setActiveIndex] = useState(0)
    const flatListRef = useRef(null)

    const handleScroll = (event:any) => {
        const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width)
        if (slideIndex !== activeIndex) {
            setActiveIndex(slideIndex)
        }
    }

    const goToSlide = (index) => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: index * width, animated: true })
        }
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} />}
                keyExtractor={(_, index) => index.toString()}
            />

            <View style={styles.pagination}>
                {images.map((_:any, index:any) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.paginationDot,
                            { backgroundColor: index === activeIndex ? theme.accentColor : theme.secondaryTextColor },
                        ]}
                        onPress={() => goToSlide(index)}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 250,
    },
    image: {
        width,
        height: 250,
        resizeMode: "cover",
    },
    pagination: {
        flexDirection: "row",
        position: "absolute",
        bottom: 16,
        alignSelf: "center",
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        opacity: 0.8,
    },
})

export default ImageSlider
