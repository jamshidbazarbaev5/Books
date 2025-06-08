"use client"

import { useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { PanGestureHandler, State } from "react-native-gesture-handler"
import LinearGradient from "react-native-linear-gradient"

const { width, height } = Dimensions.get("window")

// Mock data for pages
const mockPages = [
  {
    id: 1,
    header: "PAGE HEADER - 1",
    image: "https://picsum.photos/id/1018/800/400",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat. Integer non tristique quam. Suspendisse rutrum, augue ac sollicitudin mollis, eros velit viverra metus, a venenatis tellus tellus id magna. Aliquam ac nulla rhoncus, accumsan eros sed, viverra enim. Pellentesque non justo vel nibh sollicitudin pharetra suscipit ut ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat.",
  },
  {
    id: 2,
    header: "PAGE HEADER - 2",
    image: "https://picsum.photos/id/1015/800/400",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat. Integer non tristique quam. Suspendisse rutrum, augue ac sollicitudin mollis, eros velit viverra metus, a venenatis tellus tellus id magna. Aliquam ac nulla rhoncus, accumsan eros sed, viverra enim. Pellentesque non justo vel nibh sollicitudin pharetra suscipit ut ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat.",
  },
  {
    id: 3,
    header: "PAGE HEADER - 3",
    image: "https://picsum.photos/id/1019/800/400",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat. Integer non tristique quam. Suspendisse rutrum, augue ac sollicitudin mollis, eros velit viverra metus, a venenatis tellus tellus id magna. Aliquam ac nulla rhoncus, accumsan eros sed, viverra enim. Pellentesque non justo vel nibh sollicitudin pharetra suscipit ut ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat.",
  },
  {
    id: 4,
    header: "PAGE HEADER - 4",
    image: "https://picsum.photos/id/1022/800/400",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat. Integer non tristique quam. Suspendisse rutrum, augue ac sollicitudin mollis, eros velit viverra metus, a venenatis tellus tellus id magna. Aliquam ac nulla rhoncus, accumsan eros sed, viverra enim. Pellentesque non justo vel nibh sollicitudin pharetra suscipit ut ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus mollis nibh, non convallis ex convallis eu. Suspendisse potenti. Aenean vitae pellentesque erat.",
  },
]

const Ss = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = mockPages.length
  const translateX = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculate the safe current and next page indices
  const safeCurrentPage = Math.min(Math.max(0, currentPage), totalPages - 1)
  const safeNextPage = Math.min(safeCurrentPage + 1, totalPages - 1)
  const safePrevPage = Math.max(safeCurrentPage - 1, 0)

  // Create interpolated values for the page curl effect
  const pageRotation = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ["-45deg", "0deg", "45deg"],
    extrapolate: "clamp",
  })

  const pageCurlAmount = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.3, 0, 0.3],
    extrapolate: "clamp",
  })

  const pageElevation = translateX.interpolate({
    inputRange: [-width, -width / 2, 0, width / 2, width],
    outputRange: [8, 16, 0, 16, 8],
    extrapolate: "clamp",
  })

  const shadowOpacity = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.6, 0.2, 0.6],
    extrapolate: "clamp",
  })

  const gradientOpacity = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.9, 0.3, 0.9],
    extrapolate: "clamp",
  })

  // Corner curl effect
  const cornerCurlOpacity = translateX.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  })

  // Handle gesture events
  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], { useNativeDriver: true })

  const animateToPage = (toValue: number, callback?: () => void) => {
    setIsAnimating(true)
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start(() => {
      setIsAnimating(false)
      if (callback) callback()
    })
  }

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const velocity = nativeEvent.velocityX
      const translation = nativeEvent.translationX

      // Determine swipe direction based on velocity or translation
      let direction = 0

      if (Math.abs(velocity) > 500) {
        // Fast swipe - use velocity direction
        direction = velocity > 0 ? -1 : 1
      } else if (Math.abs(translation) > width / 3) {
        // Slow swipe - use translation direction
        direction = translation > 0 ? -1 : 1
      }

      if (direction !== 0) {
        const newPage = Math.max(0, Math.min(totalPages - 1, currentPage + direction))

        if (newPage !== currentPage) {
          // Animate in the direction of the swipe
          animateToPage(direction * -width, () => {
            setCurrentPage(newPage)
            translateX.setValue(0)
          })
        } else {
          // Bounce back if we can't change page
          animateToPage(0)
        }
      } else {
        // Return to current page if swipe wasn't far enough
        animateToPage(0)
      }
    }
  }

  // Navigate to previous page
  const goToPrevPage = () => {
    if (currentPage > 0 && !isAnimating) {
      animateToPage(width, () => {
        setCurrentPage(currentPage - 1)
        translateX.setValue(0)
      })
    }
  }

  // Navigate to next page
  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && !isAnimating) {
      animateToPage(-width, () => {
        setCurrentPage(currentPage + 1)
        translateX.setValue(0)
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

    

      <View style={styles.bookContainer}>
        {/* Current page */}
        <View style={[styles.page, styles.currentPage]}>
          <Text style={styles.header}>{mockPages[safeCurrentPage].header}</Text>
          <Text style={styles.content}>{mockPages[safeCurrentPage].content}</Text>
          <Text style={styles.pageNumber}>{safeCurrentPage + 1}</Text>
        </View>

        {/* Next page with curl effect */}
        {currentPage < totalPages - 1 && (
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            enabled={!isAnimating}
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
                  shadowOpacity: shadowOpacity,
                  zIndex: 10,
                },
              ]}
            >
              <Text style={styles.header}>{mockPages[safeNextPage].header}</Text>
              <Text style={styles.content}>{mockPages[safeNextPage].content}</Text>
              <Text style={[styles.pageNumber, { right: 20 }]}>{safeNextPage + 1}</Text>

              {/* Page corner curl effect */}
              <Animated.View style={[styles.cornerCurl, { opacity: cornerCurlOpacity }]}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(0,0,0,0.2)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cornerGradient}
                />
              </Animated.View>

              {/* Shadow gradient overlay */}
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

        {/* Previous page */}
        {currentPage > 0 && (
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            enabled={!isAnimating}
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
                  shadowOpacity: shadowOpacity,
                  zIndex: 5,
                },
              ]}
            >
              <Text style={styles.header}>{mockPages[safePrevPage].header}</Text>
              <Text style={styles.content}>{mockPages[safePrevPage].content}</Text>
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

      <View style={styles.footer}>
        <Text style={styles.pageIndicator}>
          Page {currentPage + 1} of {totalPages}
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    position: 'relative',
  },
  header: {
    padding: 20,
    alignItems: "center",
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  bookContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  page: {
    position: "absolute",
    width: width - 40,
    height: height - 200,
    backgroundColor: "white",
    borderRadius: 2,
    padding: 20,
    backfaceVisibility: 'hidden',
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

  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
    zIndex: 2,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 12,
    color: "#888",
    zIndex: 3,
  },
  cornerCurl: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 80,
    height: 80,
    overflow: "hidden",
    zIndex: 4,
  },
  cornerGradient: {
    width: "100%",
    height: "100%",
    transform: [{ rotate: "45deg" }, { translateX: 20 }, { translateY: 20 }],
    zIndex: 4,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 3,
  },
  navigationContainer: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 80,
    zIndex: 5,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
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
  navButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    position: 'relative',
    zIndex: 1,
  },
  pageIndicator: {
    fontSize: 14,
    color: "#666",
  },
})

export default Ss
