// "use client"

// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform } from "react-native"
// import { useRoute, RouteProp, useNavigation } from "@react-navigation/native"
// import { useTheme } from "../context/ThemeContext"
// import { useSettings } from "../context/SettingsContext"
// import { ArrowLeft, Moon, Sun, AlignLeft, AlignCenter, Play, Pause, ChevronLeft, ChevronRight } from "react-native-feather"
// import { useState, useEffect, useRef } from "react"
// import { WritersStackParamList } from "../types/navigation"
// import { SafeAreaView } from "react-native-safe-area-context"
// import Sound from "react-native-sound"

// const { width, height } = Dimensions.get("window")

// const BookScreen = () => {
//   const route = useRoute<RouteProp<WritersStackParamList, "Book">>()
//   const navigation = useNavigation()
//   const { content = "Select a book to start reading", title = "Welcome", bookId = 0 } = route.params || {}
//   const { theme, toggleTheme, isDarkMode } = useTheme()
//   const { fontSize, updateReadingProgress, readingProgress } = useSettings()
//   const [currentPage, setCurrentPage] = useState(() => {
//     return readingProgress[bookId]?.position || 0
//   })
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [alignment, setAlignment] = useState<'left' | 'center'>('left')
//   const [isAudioPlaying, setIsAudioPlaying] = useState(false)
//   const sound = useRef<Sound | null>(null)
//   const [isTitleTruncated, setIsTitleTruncated] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (sound.current) {
//         sound.current.release()
//       }
//     }
//   }, [])

//   const toggleAudio = async () => {
//     if (isAudioPlaying) {
//       if (sound.current) {
//         console.log('Stopping audio playback');
//         sound.current.stop();
//         sound.current.release();
//         sound.current = null;
//       }
//       setIsAudioPlaying(false);
//     } else {
//       if (sound.current) {
//         console.log('Cleaning up previous audio instance');
//         sound.current.stop();
//         sound.current.release();
//       }

//       const audio = route.params?.audio;
//       const fileName = typeof audio === 'string' 
//         ? audio 
//         : Platform.OS === 'ios'
//           ? audio?.ios
//           : audio?.android;

//       console.log('Audio file name:', fileName);
      
//       if (!fileName) {
//         console.log('No audio file specified');
//         Alert.alert('Error', 'No audio file specified for this book');
//         return;
//       }

//       try {
//         Sound.setCategory('Playback');

//         const soundPath = fileName;

//         console.log('Platform:', Platform.OS);
//         console.log('Attempting to load audio file:', soundPath);
        
//         const basePath = Platform.OS === 'ios' ? '' : Sound.MAIN_BUNDLE;
//         console.log('Base path:', basePath);

//         sound.current = new Sound(soundPath, basePath, (error) => {
//           if (error) {
//             console.error('Failed to load sound. Error details:', error);
//             Alert.alert('Error', `Could not load audio file: ${error.message}`);
//             setIsAudioPlaying(false);
//             return;
//           }
          
//           if (sound.current) {
//             console.log('Sound loaded successfully');
//             console.log('Duration:', sound.current.getDuration(), 'seconds');
            
//             sound.current.play((success) => {
//               if (!success) {
//                 console.log('Playback failed');
//                 Alert.alert('Error', 'Audio playback failed');
//                 setIsAudioPlaying(false);
//               } else {
//                 console.log('Audio playback finished successfully');
//               }
//               setIsAudioPlaying(false);
//               if (sound.current) {
//                 sound.current.release();
//               }
//             });
//           }
//         });
//         setIsAudioPlaying(true);
//       } catch (e: any) {
//         console.error('Error in audio setup:', e);
//         Alert.alert('Error', `Failed to initialize audio playback: ${e?.message || 'Unknown error'}`);
//         setIsAudioPlaying(false);
//       }
//     }
//   }

//   // Split content into pages (roughly 500 words per page)
//   const pages = Array.isArray(content) ? content : [content].reduce((acc: string[], text) => {
//     const words = text.split(' ')
//     const pagesArray: string[] = []
//     let currentPageWords: string[] = []

//     words.forEach(word => {
//       currentPageWords.push(word)
//       if (currentPageWords.length >= 500) {
//         pagesArray.push(currentPageWords.join(' '))
//         currentPageWords = []
//       }
//     })

//     if (currentPageWords.length > 0) {
//       pagesArray.push(currentPageWords.join(' '))
//     }

//     return pagesArray
//   }, [])

//   // Auto-play functionality
//   useEffect(() => {
//     let interval: NodeJS.Timeout | null = null
//     if (isPlaying) {
//       interval = setInterval(() => {
//         setCurrentPage(prev => {
//           const nextPage = prev + 1
//           if (nextPage >= pages.length) {
//             setIsPlaying(false)
//             return prev
//           }
//           updateReadingProgress(bookId, nextPage)
//           return nextPage
//         })
//       }, 5000) // Change page every 5 seconds
//     }
//     return () => {
//       if (interval) clearInterval(interval)
//     }
//   }, [isPlaying, pages.length, bookId, updateReadingProgress])

//   // Save progress when changing pages manually
//   const changePage = (newPage: number) => {
//     if (newPage >= 0 && newPage < pages.length) {
//       setCurrentPage(newPage)
//       updateReadingProgress(bookId, newPage)
//     }
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
//       <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
//           <ArrowLeft stroke={theme.textColor} width={24} height={24} />
//         </TouchableOpacity>
//         <Text 
//           numberOfLines={1} 
//           ellipsizeMode="tail" 
//           style={[styles.title, { color: theme.textColor }]}
//           onTextLayout={({ nativeEvent: { lines } }) => {
//             setIsTitleTruncated(lines.length > 1);
//           }}
//         >
//           {title}{isTitleTruncated ? '...' : ''}
//         </Text>
//         <View style={styles.headerButtons}>
//           <TouchableOpacity onPress={() => setAlignment(prev => prev === 'left' ? 'center' : 'left')} style={styles.headerButton}>
//             {alignment === 'left' ? 
//               <AlignLeft stroke={theme.textColor} width={24} height={24} /> :
//               <AlignCenter stroke={theme.textColor} width={24} height={24} />
//             }
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
//             {isDarkMode ? 
//               <Sun stroke={theme.textColor} width={24} height={24} /> :
//               <Moon stroke={theme.textColor} width={24} height={24} />
//             }
//           </TouchableOpacity>
         
//           {route.params?.audio && (
//             <TouchableOpacity onPress={toggleAudio} style={styles.headerButton}>
//               {isAudioPlaying ? 
//                <Pause stroke={theme.textColor} width={24} height={24} /> :
//                <Play stroke={theme.textColor} width={24} height={24} />
//               }
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <View style={styles.content}>
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Text style={[
//             styles.text, 
//             { 
//               color: theme.textColor, 
//               fontSize: fontSize * 1.2,
//               textAlign: alignment
//             }
//           ]}>
//             {pages[currentPage]}
//           </Text>
//         </ScrollView>
        
//         <View style={styles.pageNavigation}>
//           <TouchableOpacity 
//             onPress={() => changePage(currentPage - 1)}
//             disabled={currentPage === 0}
//             style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
//           >
//             <ChevronLeft stroke={theme.textColor} width={24} height={24} />
//           </TouchableOpacity>
//           <Text style={[styles.pageInfo, { color: theme.textColor }]}>
//             Page {currentPage + 1} of {pages.length}
//           </Text>
//           <TouchableOpacity 
//             onPress={() => changePage(currentPage + 1)}
//             disabled={currentPage === pages.length - 1}
//             style={[styles.pageButton, currentPage === pages.length - 1 && styles.pageButtonDisabled]}
//           >
//             <ChevronRight stroke={theme.textColor} width={24} height={24} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   headerButton: {
//     padding: 8,
//   },
//   headerButtons: {
//     flexDirection: 'row',
//     marginLeft: 'auto',
//     gap: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginLeft: 16,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   text: {
//     lineHeight: 24,
//   },
//   pageNavigation: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   pageButton: {
//     padding: 8,
//   },
//   pageButtonDisabled: {
//     opacity: 0.5,
//   },
//   pageInfo: {
//     fontSize: 16,
//   },
// })

// export default BookScreen