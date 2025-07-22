import React, { useRef, useState, useMemo, forwardRef, useImperativeHandle, useEffect } from "react";
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


interface PageCurlReaderProps {
  content: string;
  wordsPerPage?: number;
  title?: string;
  initialPage?: number;
  onPageChange?: (page: number, total: number) => void;
}

const { width, height } = Dimensions.get("window");

const theme = {
  background: "#f0eade",
  pageBackground: "#fdf8f1",
  textColor: "#3d3a37",
  headerColor: "#2c2a28",
  subtleText: "#8a817c",
  shadowColor: "#4e433d",
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
    /* ------------------------------------------------------------------ */
    /* Split text into pages                                             */
    /* ------------------------------------------------------------------ */
    const FONT_SIZE = 16;
    const LINE_HEIGHT = 26;
    const pages = useMemo(() => splitIntoPages(content, FONT_SIZE, LINE_HEIGHT), [
      content,
      wordsPerPage,
    ]);

    /* ------------------------------------------------------------------ */
    /* Pagination state                                                  */
    /* ------------------------------------------------------------------ */
    const [currentPage, setCurrentPage] = useState(initialPage);
    const totalPages = pages.length;
    const {translations} = useLanguage();
    console.log('Current translations:', translations);
    const translateX = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const { playSound } = usePageTurnSound();

    const safeCurrentPage = Math.min(Math.max(0, currentPage), totalPages - 1);
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

    if (totalPages === 0) {
      return (
        <View style={[styles.container, styles.center]}>
          <Text>No content available</Text>
        </View>
      );
    }

    /* ------------------------------------------------------------------ */
    /* Render                                                            */
    /* ------------------------------------------------------------------ */
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
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
                {/* ✨ FIX: Simplified and corrected page layering to prevent "mixed text".
                  - The current page is always visible and stationary.
                  - The animated view sits on top and contains the *content of the next page*.
                  - The animated view is opaque, so it correctly covers the current page while turning.
                */}

                {/* Current Page (always visible underneath) */}
                <View style={[styles.page, { zIndex: 1 }]}>
                    <Text style={styles.content}>{pages[safeCurrentPage]}</Text>
                </View>
                
                {/* Animated Turning Page */}
                {/* This view only renders when a forward swipe is possible. */}
                {currentPage < totalPages - 1 && (
                    <Animated.View
                        style={[
                            styles.page,
                            { zIndex: 10 },
                            pageAnimatedStyle,
                            turnPageVisibility,
                        ]}
                    >
                        {/* It ONLY contains the content of the NEXT page. */}
                        <Text style={styles.content}>{pages[safeNextPage]}</Text>

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


        {/* Footer */}
      
      </SafeAreaView>
    );
  }
);

/* -------------------------------------------------------------------- */
/* Styles                                                              */
/* -------------------------------------------------------------------- */
const styles = StyleSheet.create({
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
    width: '70%',  // Reduced width to prevent overlap
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
    maxWidth: '100%',  // Ensure text stays within container
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
    width: '40%',  // Fixed width for page counter
  },
  pageIndicator: {
    fontSize: 14,
    color: theme.subtleText,
    fontFamily: Platform.OS === 'ios' ? 'Iowan Old Style' : 'serif',
    textAlign: 'right',
  }
});
export default PageCurlReader