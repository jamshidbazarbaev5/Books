import React, { useRef, useState, useMemo, forwardRef, useImperativeHandle, useEffect } from "react";
import { TouchableOpacity, Modal, Animated as RNAnimated } from "react-native";
import { Menu, Minus, Plus, Star, Star as StarFilled, Star as StarOutline, X } from 'react-native-feather';
import { useSettings } from "../context/SettingsContext";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from     "react-native";
import LinearGradient from "react-native-linear-gradient";
import { usePageTurnSound } from './PageTurnSound';
import { splitIntoPages } from "../utils/pagination";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";


interface PageCurlReaderProps {
  content: string;
  wordsPerPage?: number;
  title?: string;
  initialPage?: number;
  onPageChange?: (page: number, total: number) => void;
}

const { width, height } = Dimensions.get("window");

const lightTheme = {
  background: "#f0eade",
  pageBackground: "#fdf8f1",
  textColor: "#3d3a37",
  headerColor: "#2c2a28",
  subtleText: "#8a817c",
  shadowColor: "#4e433d",
};

const darkTheme = {
  background: "#1a1a1a",
  pageBackground: "#2d2d2d",
  textColor: "#e0e0e0",
  headerColor: "#ffffff",
  subtleText: "#a0a0a0",
  shadowColor: "#000000",
};

const PageCurlReader = forwardRef<any, PageCurlReaderProps>(
  (
    {
      content,
      wordsPerPage = 150,
      title,
      initialPage = 0,
      onPageChange,
    },
    ref
  ) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;

    /* ------------------------------------------------------------------ */
    /* Split text into pages                                             */
    /* ------------------------------------------------------------------ */
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT = 26;
const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
const [lineHeight, setLineHeight] = useState(DEFAULT_LINE_HEIGHT);
const pages = useMemo(() => splitIntoPages(content, fontSize, lineHeight), [content, fontSize, lineHeight]);

    /* ------------------------------------------------------------------ */
    /* Pagination state                                                  */
    /* ------------------------------------------------------------------ */

const [currentPage, setCurrentPage] = useState(initialPage);
const totalPages = pages.length;
const {translations} = useLanguage();
const translateX = useSharedValue(0);
const isAnimating = useSharedValue(false);
const { playSound } = usePageTurnSound();

// Favourites state (global)
const { addToFavorites, favorites } = useSettings();

    // Controls bar state (top bar, not modal)
    const [controlsVisible, setControlsVisible] = useState(false);

    const safeCurrentPage = Math.min(Math.max(0, currentPage), totalPages - 1);
    // Define a 'book page' as a favourite item
    const bookId = title ? title : "Untitled"; // Use title as bookId for now
    const pageSnippet = pages[safeCurrentPage]?.slice(0, 120) || "";
    type FavoriteItem = {
      writer: { name: string };
      poem: { id: number };
    };
    const isFavourited = favorites.some((fav: FavoriteItem) => fav.poem && fav.poem.id === safeCurrentPage && fav.writer && fav.writer.name === bookId);
    const safeNextPage = Math.min(safeCurrentPage + 1, totalPages - 1);
    const safePrevPage = Math.max(safeCurrentPage - 1, 0);

    /* ------------------------------------------------------------------ */
    /* Animated styles                                                   */
    /* ------------------------------------------------------------------ */
    const pageAnimatedStyle = useAnimatedStyle(() => {
      const rotate = interpolate(translateX.value, [-width, 0, width], [-45, 0, 45]);
      const rotateZ = interpolate(translateX.value, [-width / 2, 0, width / 2], [-5, 0, 5]);
      const scale = 1 + interpolate(translateX.value, [-width, 0, width], [0.3, 0, 0.3]);

      return {
        transform: [
          { perspective: 1500 },
          { translateX: translateX.value },
          { rotateY: `${rotate}deg` },
          { rotateZ: `${rotateZ}deg`},
          { scale },
        ],
        elevation: interpolate(
          Math.abs(translateX.value),
          [0, width / 2, width],
          [0, 12, 12]
        ),
        shadowOpacity: interpolate(Math.abs(translateX.value), [0, width / 2], [0.1, 0.4]),
      };
    });

    const turnPageVisibility = useAnimatedStyle(() => ({
      opacity: Math.abs(translateX.value) < 1 ? 0 : 1,
    }));
    
    const gradientOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(Math.abs(translateX.value), [0, width / 2, width], [0, 0.5, 0.5]),
    }));
    
    const cornerOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(Math.abs(translateX.value), [0, 40], [0, 1]),
    }));

    const notifyParent = (page: number) => {
      if (onPageChange) onPageChange(page, totalPages);
    };

    /* ------------------------------------------------------------------ */
    /* Gesture                                                           */
    /* ------------------------------------------------------------------ */
    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        if (isAnimating.value) return;

        // Prevent swiping left past the last page or swiping right past the first page
        if (currentPage === totalPages - 1 && e.translationX < 0) return;
        if (currentPage === 0 && e.translationX > 0) return;

        translateX.value = e.translationX;
      })
      .onEnd((e) => {
        const { velocityX, translationX } = e;
        let direction = 0;
        
        if (Math.abs(velocityX) > 300) {
            direction = velocityX > 0 ? -1 : 1;
        } else if (Math.abs(translationX) > width / 4) {
            direction = translationX > 0 ? -1 : 1;
        }

        // Prevent invalid page turns
        const destPage = currentPage + direction;
        if (destPage < 0 || destPage >= totalPages) {
            translateX.value = withSpring(0);
            return;
        }

        if (direction !== 0) {
            isAnimating.value = true;
            runOnJS(playSound)();
            translateX.value = withSpring(direction > 0 ? -width : width, { damping: 18, stiffness: 120 }, (fin) => {
              if (fin) {
                runOnJS(setCurrentPage)(destPage);
                runOnJS(notifyParent)(destPage);
                translateX.value = 0;
                isAnimating.value = false;
              }
            });
        } else {
          translateX.value = withSpring(0);
        }
      });

    /* ------------------------------------------------------------------ */
    /* Expose imperative methods                                         */
    /* ------------------------------------------------------------------ */
    useImperativeHandle(ref, () => ({
      next: () => {
        if (currentPage < totalPages - 1) {
          setCurrentPage(currentPage + 1);
          notifyParent(currentPage + 1);
        }
      },
      prev: () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
          notifyParent(currentPage - 1);
        }
      },
      goToPage: (page: number) => {
        const clamped = Math.max(0, Math.min(totalPages - 1, page));
        setCurrentPage(clamped);
        notifyParent(clamped);
      },
    }));

    const styles = StyleSheet.create({
      hamburger: {
        position: 'absolute',
        top: 45,
        right: 18,
        zIndex: 30,
        backgroundColor: theme.pageBackground,
        borderRadius: 24,
        padding: 8,
        shadowColor: theme.shadowColor,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
      },
      controlsBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.pageBackground,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        shadowColor: theme.shadowColor,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      },
      controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.background,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginHorizontal: 6,
        elevation: 2,
        shadowColor: theme.shadowColor,
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      controlText: {
        fontSize: 15,
        color: theme.textColor,
        marginLeft: 7,
        fontWeight: '500',
      },
      favIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffd700',
        borderRadius: 18,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginLeft: 8,
      },
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      center: { justifyContent: "center", alignItems: "center" },
      header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start",
        width: '70%',
      },
      titleContainer: {
        flex: 1,
        marginRight: 16,
      },
      title: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.headerColor,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        maxWidth: '100%',
      },
      bookContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      page: {
        position: "absolute",
        width: width - 10,
        height: height - 200,
        backgroundColor: theme.pageBackground,
        borderRadius: 8,
        padding: 24,
        ...Platform.select({
          ios: {
            shadowColor: theme.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          },
          android: {
            elevation: 6,
            shadowColor: theme.shadowColor,
          },
        }),
      },
      content: {
        fontSize: 16,
        lineHeight: 26,
        color: theme.textColor,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      },
      cornerCurl: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        overflow: "hidden",
      },
      cornerGradient: {
        flex: 1,
      },
      gradientOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
      footer: {
        position: "absolute",
        top: 0,
        right: 18,
        zIndex: 2,
        paddingVertical: 18,
        paddingLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '40%',
      },
      pageIndicator: {
        fontSize: 14,
        color: theme.subtleText,
        fontFamily: Platform.OS === 'ios' ? 'Iowan Old Style' : 'serif',
        textAlign: 'right',
      }
    });


    // Controls handlers
    const handleFontSizeChange = (delta: number) => {
      let newFontSize = Math.max(12, Math.min(32, fontSize + delta));
      setFontSize(newFontSize);
      setLineHeight(Math.round(newFontSize * 1.6));
    };

    // Add current page to global favourites
    const handleAddToFavourites = () => {
      if (!isFavourited) {
        addToFavorites(
          {
            id: 0,
            name: bookId,
            period: "",
            image: "",
            gallery: [],
            biography: "",
            poems: [],
          },
          {
            id: safeCurrentPage,
            title: `${title || "Untitled"} - Page ${safeCurrentPage + 1}`,
            year: "",
            content: pageSnippet,
          }
        );
      }
    };

    if (totalPages === 0) {
      return (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.content}>No content available</Text>
        </View>
      );
    }

    /* ------------------------------------------------------------------ */
    /* Render                                                            */
    /* ------------------------------------------------------------------ */
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle={isDarkMode ? "light-content" : "dark-content"} 
          backgroundColor={theme.background}
        />

        {/* Hamburger menu button */}
        <TouchableOpacity style={styles.hamburger} onPress={() => setControlsVisible(!controlsVisible)}>
          <Menu width={26} height={26} color={theme.headerColor} />
        </TouchableOpacity>

        {/* Top controls bar (not modal) */}
        {controlsVisible && (
          <View style={styles.controlsBar}>
            <TouchableOpacity style={styles.controlButton} onPress={() => handleFontSizeChange(2)}>
              <Text style={styles.controlText}>A</Text>
              <Plus width={16} height={16} color={theme.textColor} />

            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => handleFontSizeChange(-2)}>
              <Text style={styles.controlText}>A</Text>
              <Minus width={16} height={16} color={theme.textColor} />

            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleAddToFavourites} disabled={isFavourited}>
              {isFavourited ? (
                <StarFilled width={20} height={20} color="#ffd700" />
              ) : (
                <StarOutline width={20} height={20} color={theme.textColor} />
              )}
              <Text style={styles.controlText}>{isFavourited ? "Favourited" : "Favourite"}</Text>
            </TouchableOpacity>
           
          </View>
        )}

       

        {title && (
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="middle">{title}</Text>
          </View>
        )}
        <View style={styles.footer}>
          <Text style={styles.pageIndicator}>
            {translations.page} {currentPage + 1} {translations.of} {totalPages}
          </Text>
        </View>

        <GestureDetector gesture={panGesture}>
          <View style={styles.bookContainer}>
            {/* Current Page (always visible underneath) */}
            <View style={[styles.page, { zIndex: 1 }]}>
              <Text style={[styles.content, { fontSize, lineHeight }]}>{pages[safeCurrentPage]}</Text>
            </View>
            {/* Animated Turning Page */}
            {currentPage < totalPages - 1 && (
              <Animated.View
                style={[
                  styles.page,
                  { zIndex: 10 },
                  pageAnimatedStyle,
                  turnPageVisibility,
                ]}
              >
                <Text style={[styles.content, { fontSize, lineHeight }]}>{pages[safeNextPage]}</Text>
                {/* Overlays for shadow and corner curl effect */}
                <Animated.View style={[styles.cornerCurl, cornerOpacity]}>
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.25)"]}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cornerGradient}
                  />
                </Animated.View>
                <Animated.View style={[styles.gradientOverlay, gradientOpacity]}>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={[`${theme.shadowColor}55`, "transparent"]}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </Animated.View>
            )}
          </View>
        </GestureDetector>
      </SafeAreaView>
    );
  }
);

export default PageCurlReader