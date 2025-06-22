"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { splitIntoPages } from "../utils/pagination";

interface PopReaderProps {
  /**
   * Raw **plain-text** content of the book or chapter.
   * HTML / markup is **not** supported – strip tags before passing.
   */
  content: string;
  /**
   * Custom words-per-page count. Defaults to `150`.
   */
  wordsPerPage?: number;
  /**
   * Optional title rendered above the page.
   */
  title?: string;
}

const { width, height } = Dimensions.get("window");

const PopReader: React.FC<PopReaderProps> = ({ content, wordsPerPage = 150, title }) => {
  /* ------------------------------------------------------------------ */
  /*  Split the text into pages once – memoised for performance         */
  /* ------------------------------------------------------------------ */
  const pages = useMemo(() => splitIntoPages(content, wordsPerPage), [content, wordsPerPage]);

  /* ------------------------------------------------------------------ */
  /*  Pagination / animation state                                      */
  /* ------------------------------------------------------------------ */
  const [currentPage, setCurrentPage] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const totalPages = pages.length;

  /* ------------------------------------------------------------------ */
  /*  Derived indices with clamping                                     */
  /* ------------------------------------------------------------------ */
  const safeCurrentPage = Math.min(Math.max(0, currentPage), totalPages - 1);
  const safeNextPage = Math.min(safeCurrentPage + 1, totalPages - 1);
  const safePrevPage = Math.max(safeCurrentPage - 1, 0);

  /* ------------------------------------------------------------------ */
  /*  Animated interpolations for the page curl effect                  */
  /* ------------------------------------------------------------------ */
  const pageRotation = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ["-45deg", "0deg", "45deg"],
    extrapolate: "clamp",
  });

  const pageCurlAmount = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.3, 0, 0.3],
    extrapolate: "clamp",
  });

  const pageElevation = translateX.interpolate({
    inputRange: [-width, -width / 2, 0, width / 2, width],
    outputRange: [8, 16, 0, 16, 8],
    extrapolate: "clamp",
  });

  const shadowOpacity = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.6, 0.2, 0.6],
    extrapolate: "clamp",
  });

  const gradientOpacity = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.9, 0.3, 0.9],
    extrapolate: "clamp",
  });

  const cornerCurlOpacity = translateX.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  /* ------------------------------------------------------------------ */
  /*  Gesture handling                                                  */
  /* ------------------------------------------------------------------ */
  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: true,
  });

  const animateToPage = (toValue: number, callback?: () => void) => {
    setIsAnimating(true);
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start(() => {
      setIsAnimating(false);
      callback?.();
    });
  };

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { velocityX: velocity, translationX: translation } = nativeEvent;

      let direction = 0;
      if (Math.abs(velocity) > 500) {
        direction = velocity > 0 ? -1 : 1; // fast swipe
      } else if (Math.abs(translation) > width / 3) {
        direction = translation > 0 ? -1 : 1; // slower swipe long drag
      }

      if (direction !== 0) {
        const newPage = Math.max(0, Math.min(totalPages - 1, currentPage + direction));
        if (newPage !== currentPage) {
          animateToPage(direction * -width, () => {
            setCurrentPage(newPage);
            translateX.setValue(0);
          });
        } else {
          animateToPage(0);
        }
      } else {
        animateToPage(0);
      }
    }
  };

  if (totalPages === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No content available</Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      <View style={styles.bookContainer}>
        {/* Current page (static) */}
        <View style={[styles.page, styles.currentPage]}>
          <Text style={styles.content}>{pages[safeCurrentPage]}</Text>
          <Text style={styles.pageNumber}>{safeCurrentPage + 1}</Text>
        </View>

        {/* Next page with curl */}
        {currentPage < totalPages - 1 && (
          <PanGestureHandler
            enabled={!isAnimating}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.page,
                {
                  transform: [
                    { perspective: 1200 },
                    { translateX },
                    { rotateY: pageRotation },
                    { scale: Animated.add(1, pageCurlAmount) },
                  ],
                  elevation: pageElevation,
                  shadowColor: "#000",
                  shadowOffset: { width: -3, height: 1 },
                  shadowRadius: 10,
                  shadowOpacity: shadowOpacity as any,
                  zIndex: 10,
                },
              ]}
            >
              <Text style={styles.content}>{pages[safeNextPage]}</Text>
              <Text style={[styles.pageNumber, { right: 20 }]}>{safeNextPage + 1}</Text>

              {/* Corner curl */}
              <Animated.View style={[styles.cornerCurl, { opacity: cornerCurlOpacity }]}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(0,0,0,0.2)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cornerGradient}
                />
              </Animated.View>

              {/* Shadow gradient */}
              <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  colors={["rgba(0,0,0,0.3)", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        )}

        {/* Previous page (behind) */}
        {currentPage > 0 && (
          <PanGestureHandler
            enabled={!isAnimating}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.page,
                {
                  transform: [
                    { perspective: 1200 },
                    { translateX },
                    { rotateY: pageRotation },
                    { scale: Animated.add(1, pageCurlAmount) },
                  ],
                  elevation: pageElevation,
                  shadowColor: "#000",
                  shadowOffset: { width: 2, height: 0 },
                  shadowRadius: 10,
                  shadowOpacity: shadowOpacity as any,
                  zIndex: 5,
                },
              ]}
            >
              <Text style={styles.content}>{pages[safePrevPage]}</Text>
              <Text style={styles.pageNumber}>{safePrevPage + 1}</Text>

              <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
                <LinearGradient
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  colors={["rgba(0,0,0,0.3)", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        )}
      </View>

      {/* Footer indicator */}
      <View style={styles.footer}>
        <Text style={styles.pageIndicator}>
          Page {currentPage + 1} of {totalPages}
        </Text>
      </View>
    </SafeAreaView>
  );
};

/* -------------------------------------------------------------------- */
/*  Styles                                                              */
/* -------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  bookContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    position: "absolute",
    width: width - 40,
    height: height - 200,
    backgroundColor: "white",
    borderRadius: 2,
    padding: 20,
    backfaceVisibility: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  currentPage: {
    zIndex: 1,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 12,
    color: "#888",
  },
  cornerCurl: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 80,
    height: 80,
    overflow: "hidden",
  },
  cornerGradient: {
    width: "100%",
    height: "100%",
    transform: [{ rotate: "45deg" }, { translateX: 20 }, { translateY: 20 }],
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  pageIndicator: {
    fontSize: 14,
    color: "#666",
  },
});

export default PopReader;
