// import React, { useRef, useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
// import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
// import LinearGradient from 'react-native-linear-gradient';
// import { useTheme } from '../context/ThemeContext';
// import { mockWriters } from '../data/mockData';

// const { width, height } = Dimensions.get('window');

// interface Page {
//   id: number;
//   text: string;
//   color: string;
// }

// const ss = () => {
//   const [currentPage, setCurrentPage] = useState(0);
//   const translateX = useRef(new Animated.Value(0)).current;
//   const { theme, isDarkMode } = useTheme();
  
//   // Get the first book from mockData
//   const book = mockWriters[0].books[0];
//   const bookTitle = book.title;
  
//   // Ensure content is properly handled as an array
//   const bookContent = Array.isArray(book.content) 
//     ? book.content 
//     : book.content.split('\n\n'); // Split by double newlines if it's a string

//   // Enhance page curling animations with multiple interpolations
//   const pageAngle = translateX.interpolate({
//     inputRange: [-width, 0, width],
//     outputRange: ['-45deg', '0deg', '45deg'],
//   });

//   const pageCurl = translateX.interpolate({
//     inputRange: [-width, 0, width],
//     outputRange: [0.3, 0, 0.3],
//   });

//   const pageElevation = translateX.interpolate({
//     inputRange: [-width, -width/2, 0, width/2, width],
//     outputRange: [8, 16, 0, 16, 8],
//   });

//   const shadowOpacity = translateX.interpolate({
//     inputRange: [-width, 0, width],
//     outputRange: [0.6, 0.2, 0.6],
//   });

//   const gradientOpacity = translateX.interpolate({
//     inputRange: [-width, 0, width],
//     outputRange: [0.9, 0.3, 0.9],
//   });

//   // Enhance page curling animations to include corner curling
//   const pageCornerCurlX = translateX.interpolate({
//     inputRange: [-width, 0, width],
//     outputRange: ['45deg', '0deg', '-45deg'],
//   });

//   const pageCornerCurlY = translateX.interpolate({
//     inputRange: [-width, 0, width],
//     outputRange: ['-45deg', '0deg', '45deg'],
//   });

//   // Replace static pages with actual book content with proper typing
//   const pages: Page[] = bookContent.map((content: string, index: number) => ({
//     id: index + 1,
//     text: content,
//     color: theme.pageBackground,
//   }));

//   const onGestureEvent = Animated.event(
//     [{ nativeEvent: { translationX: translateX } }],
//     { useNativeDriver: true }
//   );

//   const animateToPage = (toValue: number, callback?: () => void) => {
//     Animated.spring(translateX, {
//       toValue,
//       useNativeDriver: true,
//       tension: 40,
//       friction: 8,
//     }).start(callback);
//   };

//   const onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
//     if (nativeEvent.state === State.END) {
//       const velocity = nativeEvent.velocityX;
//       const translation = nativeEvent.translationX;
      
//       // Determine swipe direction based on velocity or translation
//       let direction = 0;
      
//       if (Math.abs(velocity) > 500) {
//         // Fast swipe - use velocity direction
//         direction = velocity > 0 ? -1 : 1;
//       } else if (Math.abs(translation) > width / 3) {
//         // Slow swipe - use translation direction
//         direction = translation > 0 ? -1 : 1;
//       }

//       if (direction !== 0) {
//         const newPage = Math.max(0, Math.min(pages.length - 1, currentPage + direction));
        
//         if (newPage !== currentPage) {
//           // Animate in the direction of the swipe
//           animateToPage(direction * -width, () => {
//             setCurrentPage(newPage);
//             translateX.setValue(0);
//           });
//         } else {
//           // Bounce back if we can't change page
//           animateToPage(0);
//         }
//       } else {
//         // Return to current page if swipe wasn't far enough
//         animateToPage(0);
//       }
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
//       <View style={styles.header}>
//         <Text style={[styles.title, { color: theme.textColor }]}>{bookTitle}</Text>
//       </View>
      
//       {/* Current page */}
//       <View style={[styles.page, { backgroundColor: theme.pageBackground }]}>
//         <Text style={[styles.text, { color: theme.textColor }]}>{pages[currentPage].text}</Text>
//       </View>

//       {/* Next page */}
//       {currentPage < pages.length - 1 && (
//         <PanGestureHandler
//           onGestureEvent={onGestureEvent}
//           onHandlerStateChange={onHandlerStateChange}
//         >
//           <Animated.View
//             style={[
//               styles.page,
//               {
//                 backgroundColor: theme.pageBackground,
//                 transform: [
//                   { perspective: 1200 },
//                   { translateX },
//                   { rotateY: pageAngle },
//                   { rotateX: pageCornerCurlX }, // Add corner curling on X-axis
//                   { rotateY: pageCornerCurlY }, // Add corner curling on Y-axis
//                   { scale: Animated.add(1, pageCurl) },
//                 ],
//                 elevation: pageElevation,
//                 shadowColor: isDarkMode ? '#000' : '#333',
//                 shadowOffset: { width: -3, height: 1 },
//                 shadowRadius: 10,
//                 shadowOpacity: shadowOpacity,
//               },
//             ]}
//           >
//             <Text style={[styles.text, { color: theme.textColor }]}>{pages[currentPage + 1].text}</Text>
//             <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
//               <LinearGradient
//                 start={{x: 0, y: 0}}
//                 end={{x: 1, y: 0}}
//                 colors={[isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)', 'transparent']}
//                 style={StyleSheet.absoluteFill}
//               />
//             </Animated.View>
//           </Animated.View>
//         </PanGestureHandler>
//       )}

//       {/* Previous page */}
//       {currentPage > 0 && (
//         <PanGestureHandler
//           onGestureEvent={onGestureEvent}
//           onHandlerStateChange={onHandlerStateChange}
//         >
//           <Animated.View
//             style={[
//               styles.page,
//               {
//                 backgroundColor: theme.pageBackground,
//                 transform: [
//                   { perspective: 1200 },
//                   { translateX },
//                   { rotateY: pageAngle },
//                   { rotateX: pageCornerCurlX }, // Add corner curling on X-axis
//                   { rotateY: pageCornerCurlY }, // Add corner curling on Y-axis
//                   { scale: Animated.add(1, pageCurl) },
//                 ],
//                 elevation: pageElevation,
//                 shadowColor: isDarkMode ? '#000' : '#333',
//                 shadowOffset: { width: 2, height: 0 },
//                 shadowRadius: 10,
//                 shadowOpacity: shadowOpacity,
//               },
//             ]}
//           >
//             <Text style={[styles.text, { color: theme.textColor }]}>{pages[currentPage - 1].text}</Text>
//             <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
//               <LinearGradient
//                 start={{x: 1, y: 0}}
//                 end={{x: 0, y: 0}}
//                 colors={[isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)', 'transparent']}
//                 style={StyleSheet.absoluteFill}
//               />
//             </Animated.View>
//           </Animated.View>
//         </PanGestureHandler>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   page: {
//     position: 'absolute',
//     width,
//     height,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backfaceVisibility: 'hidden',
//     padding: 20,
//   },
//   text: {
//     fontSize: 16,
//     lineHeight: 24,
//     fontFamily: 'System',  // System font provides good readability across platforms
//   },
//   gradientOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//   },
//   header: {
//     position: 'absolute',
//     top: 40,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     fontFamily: 'System',  // System font for consistency
//   },
// });

// export default ss;