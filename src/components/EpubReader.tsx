// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Text,
//   TouchableOpacity,
//   Dimensions,
//   Modal,
//   FlatList,
//   SafeAreaView,
//   TextInput,
//   Platform,
// } from 'react-native';
// import {WebView, WebViewMessageEvent} from 'react-native-webview';
// import RNFS from 'react-native-fs';
// import {useTheme} from '../context/ThemeContext';
// import {useSettings} from '../context/SettingsContext';

// interface EpubReaderProps {
//   epubUrl: string;
//   bookId: string;
//   bookTitle: string;
//   onProgress?: (progress: LocationData) => void;
//   onReady?: () => void;
//   onError?: (error: string) => void;
// }

// interface TocItem {
//   id: string;
//   label: string;
//   href: string;
//   subitems?: TocItem[];
//   progress?: number; // Added for progress tracking
// }

// interface LocationData {
//   start: {
//     href: string;
//     percentage: number;
//   };
//   end: any;
//   href: string;
//   percentage: number;
// }

// const {width, height} = Dimensions.get('window');

// const EpubReader: React.FC<EpubReaderProps> = ({
//   epubUrl,
//   bookId,
//   bookTitle,
//   onProgress,
//   onReady,
//   onError,
// }) => {
//   const {theme} = useTheme();
//   const {fontSize} = useSettings();
//   const [isLoading, setIsLoading] = useState(true);
//   const [localPath, setLocalPath] = useState<string | null>(null);
//   const [epubData, setEpubData] = useState<string | null>(null);
//   const [downloadProgress, setDownloadProgress] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [showToc, setShowToc] = useState(false);
//   const [tocItems, setTocItems] = useState<TocItem[]>([]);
//   const [currentLocation, setCurrentLocation] = useState<string>('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [chapterProgress, setChapterProgress] = useState<{[key: string]: number}>({});
//   const webViewRef = useRef<WebView>(null);
//   const setupCompleteRef = useRef(false);

//   useEffect(() => {
//     setupCompleteRef.current = false;

//     if (!epubUrl) {
//       setError('No book URL provided');
//       return;
//     }

//     console.log('Starting book setup with URL:', epubUrl);
//     downloadAndSetupEpub();

//     return () => {
//       setupCompleteRef.current = false;
//     };
//   }, [epubUrl, bookId]);

//   const downloadAndSetupEpub = async () => {
//     if (setupCompleteRef.current) {
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setDownloadProgress(0);
//     setEpubData(null);

//     let downloadDest = '';

//     const ensureDirectoryExists = async (dir: string) => {
//       try {
//         // Check if directory exists
//         const exists = await RNFS.exists(dir);
//         if (!exists) {
//           console.log('Creating directory:', dir);
//           try {
//             await RNFS.mkdir(dir, { NSURLIsExcludedFromBackupKey: false });
//             console.log('Directory created successfully');
//           } catch (mkdirError: any) {
//             // Check if directory was created by another process
//             const existsAfterError = await RNFS.exists(dir);
//             if (!existsAfterError) {
//               console.error('Failed to create directory:', mkdirError);
//               throw mkdirError;
//             }
//           }
//         } else {
//           console.log('Directory already exists:', dir);
//         }

//         // Verify directory is writable
//         const testFile = `${dir}/.test`;
//         try {
//           await RNFS.writeFile(testFile, '', 'utf8');
//           await RNFS.unlink(testFile);
//           return true;
//         } catch (writeError: any) {
//           console.error('Directory is not writable:', writeError);
//           throw new Error('Directory is not writable');
//         }
//       } catch (err) {
//         console.error('Error in ensureDirectoryExists:', err);
//         return false;
//       }
//     };

//     try {
//       // Get the appropriate directory based on platform
//       const baseDir = Platform.select({
//         ios: `${RNFS.DocumentDirectoryPath}/books`,
//         android: `${RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath}/books`,
//       });

//       if (!baseDir) {
//         throw new Error('Could not determine base directory path');
//       }

//       const fileName = `${bookId}.epub`;
//       downloadDest = `${baseDir}/${fileName}`;
//       console.log('Full download path:', downloadDest);

//       // Ensure the directory exists and is writable
//       const dirReady = await ensureDirectoryExists(baseDir);
//       if (!dirReady) {
//         throw new Error('Failed to create or access directory');
//       }

//       // Check if file already exists and try to remove it
//       const fileExists = await RNFS.exists(downloadDest);
//       if (fileExists) {
//         try {
//           await RNFS.unlink(downloadDest);
//           console.log('Removed existing file');
//         } catch (unlinkError) {
//           console.warn('Failed to remove existing file:', unlinkError);
//         }
//       }

//       try {
//         console.log('Starting download from:', epubUrl);
        
//         // Download using RNFS
//         const downloadOptions = {
//           fromUrl: epubUrl,
//           toFile: downloadDest,
//           background: true,
//           discretionary: true,
//           progress: (res) => {
//             const progress = (res.bytesWritten / res.contentLength) * 100;
//             setDownloadProgress(Math.round(progress));
//           },
//           progressDivider: 1,
//           resumable: true, // Allow resuming downloads if interrupted
//           headers: {
//             'Accept': '*/*',
//             'Accept-Encoding': 'gzip, deflate, br',
//             'Connection': 'keep-alive',
//           }
//         };

//         const result = await RNFS.downloadFile(downloadOptions).promise;
//         console.log('Download result:', result);

//         if (result.statusCode !== 200 && result.statusCode !== 206) {
//           throw new Error(`HTTP error! status: ${result.statusCode}`);
//         }

//         // Verify file exists after download
//         const downloadedFileExists = await RNFS.exists(downloadDest);
//         if (!downloadedFileExists) {
//           throw new Error('File does not exist after download');
//         }

//         const base64Data = await RNFS.readFile(downloadDest, 'base64');
//         console.log('File read successfully, size:', base64Data.length);

//         // Validate EPUB format (check for ZIP header)
//         const header = await RNFS.read(downloadDest, 4, 0, 'ascii');
//         if (!header || header.length < 4 || header.charCodeAt(0) !== 0x50 || header.charCodeAt(1) !== 0x4b) {
//           await RNFS.unlink(downloadDest);
//           throw new Error('Downloaded file is not a valid EPUB/ZIP format');
//         }

//         setEpubData(base64Data);
//         setLocalPath(downloadDest);
//         setupCompleteRef.current = true;

//       } catch (error: any) {
//         console.error('Download or validation error:', error);
//         throw error;
//       }

//     } catch (error: any) {
//       const finalErr = error as Error;
//       console.error('Download error:', finalErr);
      
//       // Reset download progress and clean up any failed download
//       setDownloadProgress(0);
//       try {
//         if (downloadDest) {
//           const exists = await RNFS.exists(downloadDest);
//           if (exists) {
//             await RNFS.unlink(downloadDest);
//           }
//         }
//       } catch (cleanupErr) {
//         console.warn('Failed to clean up after error:', cleanupErr);
//       }
      
//       const errorMessage = `Failed to setup EPUB: ${finalErr.message}`;
//       setError(errorMessage);
//       onError?.(errorMessage);
//       Alert.alert('Download Error', errorMessage);
//       setupCompleteRef.current = false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getEpubJsHtml = () => {
//     return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="utf-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
//     <title>${bookTitle}</title>
//     <script>
//         window.EPUBJS_CONFIG = {
//             FILESYSTEM: true
//         };
        
//         console.log = function() {
//             if (window.ReactNativeWebView) {
//                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                     type: 'log',
//                     message: Array.from(arguments).join(' ')
//                 }));
//             }
//         };
//         console.error = function() {
//             if (window.ReactNativeWebView) {
//                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                     type: 'error',
//                     message: Array.from(arguments).join(' ')
//                 }));
//             }
//         };
//     </script>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
//     <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js"></script>
//     <style>
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//             -webkit-overflow-scrolling: touch;
//         }
        
//         html, body {
//             width: 100%;
//             height: 100%;
//             margin: 0;
//             padding: 0;
//             background-color: ${theme.backgroundColor};
//             color: ${theme.textColor};
//             overflow-y: auto;
//             overflow-x: hidden;
//         }
        
//         #viewer {
//             width: 100%;
//             min-height: 100%;
//             position: relative;
//             overflow-y: auto;
//             -webkit-overflow-scrolling: touch;
//         }
        
//         #area {
//             width: 100%;
//             min-height: 100%;
//             padding-bottom: 60px;
//         }
        
//         .loading {
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             font-size: ${fontSize}px;
//             color: ${theme.textColor};
//             z-index: 100;
//             text-align: center;
//         }
        
//         .error {
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center;
//             color: ${theme.textColor};
//             font-size: ${fontSize}px;
//             padding: 20px;
//             z-index: 100;
//             display: none;
//         }
//     </style>
// </head>
// <body>
//     <div class="loading" id="loading">Waiting for book data...</div>
//     <div class="error" id="error">
//         <p>Failed to load book</p>
//         <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: ${theme.accentColor}; color: white; border: none; border-radius: 5px;">Retry</button>
//     </div>
//     <div id="viewer">
//         <div id="area"></div>
//     </div>

//     <script>
//         let book, rendition;
//         let isInitialized = false;
        
//         console.log('WebView HTML loaded successfully');
        
//         // Function to initialize the EPUB reader
//         async function initReader(epubBase64Data) {
//             if (isInitialized) {
//                 console.log('Reader already initialized, skipping');
//                 return;
//             }
            
//             try {
//                 console.log('Starting EPUB reader initialization with data length:', epubBase64Data.length);
//                 document.getElementById('loading').textContent = 'Initializing reader...';
                
//                 // Convert base64 to ArrayBuffer
//                 console.log('Converting base64 to ArrayBuffer...');
//                 const binaryString = atob(epubBase64Data);
//                 const bytes = new Uint8Array(binaryString.length);
//                 for (let i = 0; i < binaryString.length; i++) {
//                     bytes[i] = binaryString.charCodeAt(i);
//                 }
//                 const arrayBuffer = bytes.buffer;
                
//                 console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
                
//                 // Initialize EPUB with ArrayBuffer
//                 book = ePub(arrayBuffer, {
//                     allowScriptedContent: false
//                 });
                
//                 console.log('EPUB book instance created');
                
//                 rendition = book.renderTo("area", {
//                     width: "100%",
//                     height: "100%",
//                     spread: "none",
//                     flow: "scrolled-doc"
//                 });
                
//                 console.log('Rendition created');
                
//                 // Handle scroll events to detect end of chapter
//                 document.getElementById('viewer').addEventListener('scroll', function(e) {
//                     const container = e.target;
//                     if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
//                         console.log('Near bottom, checking for next chapter...');
//                         book.navigation.get().then(function(toc) {
//                             const currentHref = rendition.location.start.href;
//                             const currentIndex = toc.findIndex(item => item.href === currentHref);
//                             if (currentIndex < toc.length - 1) {
//                                 console.log('Moving to next chapter');
//                                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                                     type: 'nextChapter',
//                                     data: toc[currentIndex + 1].href
//                                 }));
//                             }
//                         });
//                     }
//                 });

//                 // Apply theme
//                 rendition.themes.register("default", {
//                     "body": {
//                         "color": "${theme.textColor}",
//                         "background": "${theme.backgroundColor}",
//                         "font-size": "${fontSize}px",
//                         "padding": "20px",
//                         "line-height": "1.5"
//                     }
//                 });
                
//                 rendition.themes.select("default");
//                 console.log('Theme applied');
                
//                 // Wait for book to be ready
//                 await book.ready;
//                 console.log('Book is ready, loading navigation...');
                
//                 // Load and send table of contents
//                 await book.loaded.navigation;
//                 const toc = book.navigation.toc;
//                 console.log('Table of contents loaded:', toc);
                
//                 if (window.ReactNativeWebView) {
//                     window.ReactNativeWebView.postMessage(JSON.stringify({
//                         type: 'toc',
//                         data: toc
//                     }));
//                 }
                
//                 // Display the book
//                 await rendition.display();
//                 console.log('Book displayed successfully');
                
//                 // Track location changes
//                 rendition.on('locationChanged', function(location) {
//                     console.log('Location changed:', location);
//                     if (window.ReactNativeWebView) {
//                         window.ReactNativeWebView.postMessage(JSON.stringify({
//                             type: 'locationChanged',
//                             data: {
//                                 start: location.start,
//                                 end: location.end,
//                                 href: location.start.href
//                             }
//                         }));
//                     }
//                 });
                
//                 // Hide loading indicator
//                 document.getElementById('loading').style.display = 'none';
//                 isInitialized = true;
                
//                 // Notify React Native that the book is ready
//                 if (window.ReactNativeWebView) {
//                     window.ReactNativeWebView.postMessage(JSON.stringify({
//                         type: 'ready',
//                         message: 'Book loaded successfully'
//                     }));
//                 }
                
//             } catch (error) {
//                 console.error('Error initializing reader:', error);
//                 document.getElementById('loading').style.display = 'none';
//                 document.getElementById('error').style.display = 'block';
                
//                 if (window.ReactNativeWebView) {
//                     window.ReactNativeWebView.postMessage(JSON.stringify({
//                         type: 'error',
//                         message: 'Failed to load book: ' + error.toString()
//                     }));
//                 }
//             }
//         }
        
//         // Navigation functions
//         window.nextPage = function() {
//             if (rendition) {
//                 rendition.next();
//             }
//         };
        
//         window.prevPage = function() {
//             if (rendition) {
//                 rendition.prev();
//             }
//         };
        
//         window.goToChapter = function(href) {
//             if (rendition && href) {
//                 console.log('Navigating to:', href);
//                 rendition.display(href);
//             }
//         };
        
//         // Listen for messages from React Native
//         document.addEventListener('message', function(event) {
//             try {
//                 const data = JSON.parse(event.data);
//                 console.log('Received message:', data.type);
                
//                 if (data.type === 'epubData' && data.data) {
//                     console.log('Received EPUB data, initializing reader...');
//                     initReader(data.data);
//                 } else if (data.type === 'goToChapter' && data.href) {
//                     console.log('Go to chapter command received:', data.href);
//                     window.goToChapter(data.href);
//                 }
//             } catch (err) {
//                 console.error('Error parsing message:', err);
//             }
//         });
        
//         // Also listen for postMessage (different browsers/WebViews handle this differently)
//         window.addEventListener('message', function(event) {
//             try {
//                 const data = JSON.parse(event.data);
//                 console.log('Received window message:', data.type);
                
//                 if (data.type === 'epubData' && data.data) {
//                     console.log('Received EPUB data via window message, initializing reader...');
//                     initReader(data.data);
//                 } else if (data.type === 'goToChapter' && data.href) {
//                     console.log('Go to chapter command received via window:', data.href);
//                     window.goToChapter(data.href);
//                 }
//             } catch (err) {
//                 console.error('Error parsing window message:', err);
//             }
//         });
        
//         console.log('Event listeners registered, waiting for EPUB data...');
//     </script>
// </body>
// </html>
//     `;
//   };

//   const handleWebViewMessage = (event: WebViewMessageEvent) => {
//     try {
//       const data = JSON.parse(event.nativeEvent.data);

//       switch (data.type) {
//         case 'ready':
//           console.log('Reader ready message received');
//           setIsLoading(false);
//           onReady?.();
//           break;

//         case 'locationChanged':
//           console.log('Location changed:', data.data);
//           onProgress?.(data.data);
//           // Update chapter progress
//           if (data.data.href && data.data.percentage) {
//             setChapterProgress(prev => ({
//               ...prev,
//               [data.data.href]: data.data.percentage
//             }));
//           }
//           break;

//         case 'toc':
//           console.log('TOC received:', data.data);
//           setTocItems(data.data);
//           break;

//         case 'nextChapter':
//           console.log('Next chapter requested:', data.data);
//           goToChapter(data.data);
//           break;

//         case 'error':
//           console.error('Reader error:', data.message);
//           setError(data.message);
//           onError?.(data.message);
//           break;

//         case 'log':
//           console.log('Reader log:', data.message);
//           break;
//       }
//     } catch (err) {
//       console.error('Error parsing WebView message:', err);
//       setError('Failed to communicate with reader');
//       setIsLoading(false);
//     }
//   };

//   const sendEpubDataToWebView = () => {
//     if (webViewRef.current && epubData) {
//       console.log('Sending EPUB data to WebView...');
//       webViewRef.current.postMessage(
//         JSON.stringify({
//           type: 'epubData',
//           data: epubData,
//         }),
//       );
      
//       // Auto show TOC when initially loading
//       setShowToc(true);
//     }
//   };

//   const goToNextPage = () => {
//     if (webViewRef.current) {
//       webViewRef.current.injectJavaScript(
//         'if (window.nextPage) window.nextPage(); true;',
//       );
//     }
//   };

//   const goToPrevPage = () => {
//     if (webViewRef.current) {
//       webViewRef.current.injectJavaScript(
//         'if (window.prevPage) window.prevPage(); true;',
//       );
//     }
//   };

//   const goToChapter = (href: string) => {
//     if (webViewRef.current && href) {
//       console.log('Navigating to chapter:', href);
//       webViewRef.current.postMessage(
//         JSON.stringify({
//           type: 'goToChapter',
//           href: href,
//         }),
//       );
//       setShowToc(false);
//     }
//   };

//   // Add this function to filter TOC items based on search
//   const getFilteredTocItems = () => {
//     if (!searchQuery) return tocItems;
    
//     const searchLower = searchQuery.toLowerCase();
//     return tocItems.filter(item => {
//       const matchesMain = item.label.toLowerCase().includes(searchLower);
//       const matchesSub = item.subitems?.some(
//         sub => sub.label.toLowerCase().includes(searchLower)
//       );
//       return matchesMain || matchesSub;
//     });
//   };

//   const handleChapterClick = (href: string) => {
//     if (!webViewRef.current) {
//       console.log('WebView not ready yet, saving chapter for later');
//       setShowToc(false);
//       // Try to navigate once WebView is ready
//       const checkWebViewInterval = setInterval(() => {
//         if (webViewRef.current) {
//           clearInterval(checkWebViewInterval);
//           goToChapter(href);
//         }
//       }, 500);
//       // Clear interval after 10 seconds to prevent infinite checking
//       setTimeout(() => clearInterval(checkWebViewInterval), 10000);
//       return;
//     }
//     goToChapter(href);
//   };

//   const renderTocItem = ({item, index}: {item: TocItem; index: number}) => {
//     const isCurrentChapter = currentLocation.includes(item.href);
//     const progress = chapterProgress[item.href] || 0;
//     const chapterNum = `${index + 1}.`;

//     return (
//       <View>
//         <TouchableOpacity
//           style={[
//             styles.tocItem,
//             {
//               backgroundColor: isCurrentChapter
//                 ? theme.accentColor + '20'
//                 : 'transparent',
//             },
//           ]}
//           onPress={() => handleChapterClick(item.href)}>
//           <View style={styles.tocItemContent}>
//             <Text
//               style={[
//                 styles.chapterNumber,
//                 { color: theme.textColor },
//               ]}>
//               {chapterNum}
//             </Text>
//             <Text
//               style={[
//                 styles.tocText,
//                 {
//                   color: isCurrentChapter ? theme.accentColor : theme.textColor,
//                   fontSize: fontSize - 2,
//                   fontWeight: isCurrentChapter ? '600' : '400',
//                 },
//               ]}
//               numberOfLines={2}>
//               {item.label}
//             </Text>
//           </View>
//           <View
//             style={[
//               styles.progressIndicator,
//               {
//                 backgroundColor: theme.accentColor + '40',
//                 width: '100%',
//                 position: 'absolute',
//                 bottom: 0,
//                 left: 20,
//               },
//             ]}>
//             <View
//               style={[
//                 styles.progressIndicator,
//                 {
//                   backgroundColor: theme.accentColor,
//                   width: `${progress}%`,
//                 },
//               ]}
//             />
//           </View>
//         </TouchableOpacity>

//         {item.subitems && item.subitems.map((subitem, subIndex) => {
//           const isCurrentSubChapter = currentLocation.includes(subitem.href);
//           const subProgress = chapterProgress[subitem.href] || 0;
          
//           return (
//             <View key={`${index}-${subIndex}`}>
//               <View
//                 style={[
//                   styles.indentLine,
//                   { backgroundColor: theme.textColor },
//                 ]}
//               />
//               <TouchableOpacity
//                 style={[
//                   styles.tocSubItem,
//                   {
//                     backgroundColor: isCurrentSubChapter
//                       ? theme.accentColor + '15'
//                       : 'transparent',
//                   },
//                 ]}
//                 onPress={() => handleChapterClick(subitem.href)}>
//                 <Text
//                   style={[
//                     styles.chapterNumber,
//                     { color: theme.textColor },
//                   ]}>
//                   {`${chapterNum}${subIndex + 1}`}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.tocSubText,
//                     {
//                       color: isCurrentSubChapter
//                         ? theme.accentColor
//                         : theme.textColor,
//                       fontSize: fontSize - 3,
//                     },
//                   ]}
//                   numberOfLines={2}>
//                   {subitem.label}
//                 </Text>
//                 <View
//                   style={[
//                     styles.progressIndicator,
//                     {
//                       backgroundColor: theme.accentColor + '40',
//                       width: '100%',
//                       position: 'absolute',
//                       bottom: 0,
//                       left: 40,
//                     },
//                   ]}>
//                   <View
//                     style={[
//                       styles.progressIndicator,
//                       {
//                         backgroundColor: theme.accentColor,
//                         width: `${subProgress}%`,
//                       },
//                     ]}
//                   />
//                 </View>
//               </TouchableOpacity>
//             </View>
//           );
//         })}
//       </View>
//     );
//   };

//   if (error) {
//     return (
//       <View
//         style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, {color: theme.textColor, fontSize}]}>
//             {error}
//           </Text>
//           <TouchableOpacity
//             style={[styles.retryButton, {backgroundColor: theme.accentColor}]}
//             onPress={downloadAndSetupEpub}>
//             <Text style={[styles.retryButtonText, {fontSize}]}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (!epubData || isLoading) {
//     return (
//       <View
//         style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={theme.accentColor} />
//           <Text
//             style={[styles.loadingText, {color: theme.textColor, fontSize}]}>
//             {!localPath
//               ? downloadProgress > 0
//                 ? `Downloading book... ${downloadProgress}%`
//                 : 'Preparing to download...'
//               : 'Loading reader...'}
//           </Text>
//           {downloadProgress > 0 && !localPath && (
//             <View style={styles.progressBarContainer}>
//               <View 
//                 style={[
//                   styles.progressBar,
//                   { backgroundColor: theme.accentColor + '40' }
//                 ]}>
//                 <View
//                   style={[
//                     styles.progressFill,
//                     {
//                       backgroundColor: theme.accentColor,
//                       width: `${downloadProgress}%`
//                     }
//                   ]}
//                 />
//               </View>
//               <Text style={[styles.progressText, {color: theme.textColor}]}>
//                 {downloadProgress}%
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <WebView
//         ref={webViewRef}
//         source={{html: getEpubJsHtml()}}
//         style={styles.webView}
//         onMessage={handleWebViewMessage}
//         originWhitelist={['*']}
//         cacheEnabled={false}
//         scalesPageToFit={false}
//         bounces={true}
//         scrollEnabled={true}
//         showsVerticalScrollIndicator={true}
//         showsHorizontalScrollIndicator={false}
//         startInLoadingState={true}
//         onLoadEnd={() => {
//           console.log('WebView load completed, sending EPUB data...');
//           setTimeout(sendEpubDataToWebView, 500);
//         }}
//         onLoadProgress={({nativeEvent}) => {
//           console.log('WebView load progress:', nativeEvent.progress);
//         }}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         allowFileAccess={true}
//         allowUniversalAccessFromFileURLs={true}
//         mixedContentMode="compatibility"
//         onError={syntheticEvent => {
//           const {nativeEvent} = syntheticEvent;
//           console.error('WebView error:', nativeEvent);
//           const errorMessage =
//             nativeEvent.description || 'Failed to load book reader';
//           setError(errorMessage);
//           setIsLoading(false);
//           onError?.(errorMessage);
//         }}
//         onHttpError={syntheticEvent => {
//           const {nativeEvent} = syntheticEvent;
//           console.error('WebView HTTP error:', nativeEvent);
//           const errorMessage = `Network error (${nativeEvent.statusCode}): Failed to load book content`;
//           setError(errorMessage);
//           setIsLoading(false);
//           onError?.(errorMessage);
//         }}
//       />

//       {/* Navigation Controls */}
//       <View
//         style={[
//           styles.controlsContainer,
//           {backgroundColor: theme.backgroundColor + 'E6'},
//         ]}>
//         <TouchableOpacity
//           style={[styles.controlButton, {backgroundColor: theme.accentColor}]}
//           onPress={() => setShowToc(true)}>
//           <Text style={styles.controlButtonText}>📚</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Table of Contents Modal */}
//       <Modal
//         visible={showToc}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setShowToc(false)}>
//         <SafeAreaView
//           style={[
//             styles.tocContainer,
//             {backgroundColor: theme.backgroundColor},
//           ]}>
//           <View
//             style={[
//               styles.tocHeader,
//               {borderBottomColor: theme.textColor + '30'},
//             ]}>
//             <Text
//               style={[
//                 styles.tocTitle,
//                 {color: theme.textColor, fontSize: fontSize + 2},
//               ]}>
//               Table of Contents
//             </Text>
//             <TouchableOpacity
//               style={[styles.closeButton, {backgroundColor: theme.accentColor}]}
//               onPress={() => setShowToc(false)}>
//               <Text style={styles.closeButtonText}>✕</Text>
//             </TouchableOpacity>
//           </View>

//           <View
//             style={[
//               styles.searchContainer,
//               {borderBottomColor: theme.textColor + '30'},
//             ]}>
//             <TextInput
//               style={[
//                 styles.searchInput,
//                 {
//                   backgroundColor: theme.textColor + '10',
//                   color: theme.textColor,
//                 },
//               ]}
//               placeholder="Search chapters..."
//               placeholderTextColor={theme.textColor + '80'}
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>

//           {tocItems.length > 0 ? (
//             <FlatList
//               data={getFilteredTocItems()}
//               renderItem={renderTocItem}
//               keyExtractor={(item, index) => `${index}-${item.id || item.href}`}
//               style={styles.tocList}
//               showsVerticalScrollIndicator={true}
//             />
//           ) : (
//             <View style={styles.noTocContainer}>
//               <Text
//                 style={[styles.noTocText, {color: theme.textColor, fontSize}]}>
//                 No table of contents available for this book
//               </Text>
//             </View>
//           )}
//         </SafeAreaView>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   webView: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   progressBarContainer: {
//     width: '80%',
//     marginTop: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   progressBar: {
//     flex: 1,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 10,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   progressText: {
//     minWidth: 45,
//     textAlign: 'right',
//     fontSize: 14,
//   },
//   loadingText: {
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 24,
//   },
//   retryButton: {
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   controlButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   controlButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   tocContainer: {
//     flex: 1,
//   },
//   tocHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//   },
//   searchContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//   },
//   searchInput: {
//     height: 40,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//   },
//   tocTitle: {
//     fontWeight: 'bold',
//     flex: 1,
//   },
//   closeButton: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   tocList: {
//     flex: 1,
//     paddingHorizontal: 10,
//   },
//   tocItem: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginVertical: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tocItemContent: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   chapterNumber: {
//     width: 30,
//     marginRight: 10,
//     opacity: 0.6,
//   },
//   tocText: {
//     flex: 1,
//     lineHeight: 22,
//   },
//   progressIndicator: {
//     height: 3,
//     borderRadius: 1.5,
//     marginTop: 8,
//   },
//   tocSubItem: {
//     paddingHorizontal: 40,
//     paddingVertical: 12,
//     borderRadius: 6,
//     marginVertical: 1,
//     marginLeft: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   indentLine: {
//     width: 2,
//     position: 'absolute',
//     left: 30,
//     top: 0,
//     bottom: 0,
//     opacity: 0.2,
//   },
//   tocSubText: {
//     flex: 1,
//     lineHeight: 20,
//     opacity: 0.8,
//   },
//   noTocContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   noTocText: {
//     textAlign: 'center',
//     opacity: 0.7,
//   },
  
// });

// export default EpubReader;
