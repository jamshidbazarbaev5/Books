"use client"

import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Animated } from "react-native"
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { useSettings } from "../context/SettingsContext"
import { useLanguage } from "../context/LanguageContext"
import { ArrowLeft, Heart, Moon, Sun, AlignLeft, AlignCenter, Play, Pause } from "react-native-feather"
import { useState, useRef, useEffect } from "react"
import { WritersStackParamList, Poem, Writer } from "../types/navigation"
import { SafeAreaView } from "react-native-safe-area-context"
import Sound from "react-native-sound"

const { width, height } = Dimensions.get("window")

const PoemScreen = () => {
  const route = useRoute<RouteProp<WritersStackParamList, "Poem">>()
  const navigation = useNavigation()
  const { poem, writer } = route.params
  const { theme, toggleTheme, isDarkMode } = useTheme()
  const { fontSize, poemFontSize, setPoemFontSize, isFavorite, addToFavorites, removeFromFavorites, script } = useSettings()
  const { translations } = useLanguage()
  const [isTextAlignCenter, setIsTextAlignCenter] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const headerOpacity = useRef(new Animated.Value(1)).current
  const sound = useRef<Sound | null>(null)

  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.release()
      }
    }
  }, [])

  const handleFavoritePress = () => {
    if (isFavorite(poem.id)) {
      removeFromFavorites(poem.id)
    } else {
      addToFavorites(writer, poem)
    }
  }

  const handleFontSizeChange = (increase: boolean) => {
    const newSize = increase ? poemFontSize + 1 : poemFontSize - 1
    if (newSize >= 14 && newSize <= 24) {
      setPoemFontSize(newSize)
    }
  }

  const toggleTextAlign = () => {
    setIsTextAlignCenter(!isTextAlignCenter)
  }

  const toggleControls = () => {
    const toValue = controlsVisible ? 0 : 1
    setControlsVisible(!controlsVisible)
    Animated.timing(headerOpacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const toggleAudio = () => {
    if (!poem.audio) return

    if (isPlaying) {
      if (sound.current) {
        sound.current.stop()
        sound.current.release()
        sound.current = null
      }
      setIsPlaying(false)
    } else {
      sound.current = new Sound(poem.audio, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error("Failed to load sound", error)
          return
        }
        sound.current?.play((success) => {
          if (success) {
            setIsPlaying(false)
            sound.current?.release()
          }
        })
      })
      setIsPlaying(true)
    }
  }

  // Convert text based on script setting
  const displayText = script === "latin" ? poem.content : poem.content // Add conversion logic here

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Animated.View style={[styles.header, { backgroundColor: theme.cardBackground, opacity: headerOpacity }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <ArrowLeft stroke={theme.textColor} width={24} height={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <TouchableOpacity onPress={() => handleFontSizeChange(false)} style={styles.headerButton}>
            <Text style={[styles.fontSizeButton, { color: theme.textColor }]}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFontSizeChange(true)} style={styles.headerButton}>
            <Text style={[styles.fontSizeButton, { color: theme.textColor }]}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTextAlign} style={styles.headerButton}>
            {isTextAlignCenter ? (
              <AlignCenter stroke={theme.accentColor} width={24} height={24} />
            ) : (
              <AlignLeft stroke={theme.accentColor} width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.headerButton, { marginRight: 12 }]}>
            {isDarkMode ? (
              <Moon stroke={theme.accentColor} width={24} height={24} />
            ) : (
              <Sun stroke={theme.accentColor} width={24} height={24} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFavoritePress} style={[styles.headerButton, styles.favoriteButton]}>
            <Heart
              width={24}
              height={24}
              stroke={theme.accentColor}
              fill={isFavorite(poem.id) ? theme.accentColor : 'none'}
            />
          </TouchableOpacity>
          {poem.audio && (
            <TouchableOpacity onPress={toggleAudio} style={styles.headerButton}>
              {isPlaying ? (
                <Pause stroke={theme.accentColor} width={24} height={24} />
              ) : (
                <Play stroke={theme.accentColor} width={24} height={24} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.bookContainer}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: theme.pageBackground }]}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y > 20 && controlsVisible) {
            toggleControls()
          } else if (nativeEvent.contentOffset.y < 20 && !controlsVisible) {
            toggleControls()
          }
        }}
        scrollEventThrottle={16}
      >
        <TouchableOpacity 
          style={styles.pageContent} 
          activeOpacity={1} 
          onPress={toggleControls}
        >
          <Text style={[
            styles.poemTitle, 
            { 
              color: theme.textColor, 
              fontSize: fontSize * 1.5,
              textAlign: isTextAlignCenter ? 'center' : 'left' 
            }
          ]}>
            {poem.title}
          </Text>
          <Text style={[
            styles.poemAuthor, 
            { 
              color: theme.secondaryTextColor, 
              fontSize: fontSize,
              textAlign: isTextAlignCenter ? 'center' : 'left'
            }
          ]}>
            {writer.name}, {poem.year}
          </Text>
          <Text style={[
            styles.poemText, 
            { 
              color: theme.textColor, 
              fontSize: poemFontSize,
              textAlign: isTextAlignCenter ? 'center' : 'left' 
            }
          ]}>
            {displayText}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fontSizeButton: {
    fontSize: 18,
    fontFamily: 'System',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookContainer: {
    flex: 1,
    width: width - 32,
    alignSelf: "center",
    marginTop: 10,
  },
  contentContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    minHeight: height - 140,
  },
  pageContent: {
    flex: 1,
    paddingTop: 24,
  },
  poemTitle: {
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  poemAuthor: {
    marginBottom: 32,
    fontStyle: "italic",
    fontFamily: 'System',
  },
  poemText: {
    lineHeight: 32,
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
})

export default PoemScreen
