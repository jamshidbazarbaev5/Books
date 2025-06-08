import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import RNFS from 'react-native-fs';
import {useTheme} from '../context/ThemeContext';
import {useSettings} from '../context/SettingsContext';

interface EpubReaderProps {
  epubUrl: string;
  bookId: string;
  bookTitle: string;
  onProgress?: (progress: LocationData) => void;
  onReady?: () => void;
  onError?: (error: string) => void;
}

interface TocItem {
  id: string;
  label: string;
  href: string;
  subitems?: TocItem[];
  progress?: number;
}

interface LocationData {
  start: {
    href: string;
    percentage: number;
  };
  end: any;
  href: string;
  percentage: number;
}

const {width, height} = Dimensions.get('window');

const EpubReader: React.FC<EpubReaderProps> = ({
  epubUrl,
  bookId,
  bookTitle,
  onProgress,
  onReady,
  onError,
}) => {
  const {theme} = useTheme();
  const {fontSize} = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [epubData, setEpubData] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterProgress, setChapterProgress] = useState<{[key: string]: number}>({});
  const webViewRef = useRef<WebView>(null);
  const setupCompleteRef = useRef(false);

  useEffect(() => {
    setupCompleteRef.current = false;

    if (!epubUrl) {
      setError('No book URL provided');
      return;
    }

    console.log('Starting book setup with URL:', epubUrl);
    downloadAndSetupEpub();

    return () => {
      setupCompleteRef.current = false;
    };
  }, [epubUrl, bookId]);

  const downloadAndSetupEpub = async () => {
    if (setupCompleteRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadProgress(0);
    setEpubData(null);

    let downloadDest = '';

    try {
      const baseDir = RNFS.DocumentDirectoryPath;
      const fileName = `${bookId}.epub`;
      downloadDest = `${baseDir}/${fileName}`;
      console.log('Full download path:', downloadDest);

      // Ensure the directory exists
      try {
        await RNFS.mkdir(baseDir);
      } catch (mkdirErr) {
        // Ignore error if directory already exists
        console.log('Directory already exists or creation failed:', mkdirErr);
      }

      try {
        console.log('Starting download...');
        const response = await fetch(epubUrl, {
          headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get content length for progress tracking
        const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
        const reader = response.body?.getReader();
        
        if (!reader) {
          throw new Error('Unable to read response body');
        }

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          if (contentLength) {
            const progress = Math.round((receivedLength / contentLength) * 100);
            setDownloadProgress(progress);
          }
        }

        // Combine chunks into a single Uint8Array
        const allChunks = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        // Convert to base64
        const base64Data = Buffer.from(allChunks).toString('base64');

        console.log('Download complete, writing to file...');
        await RNFS.writeFile(downloadDest, base64Data, 'base64');
        console.log('File written successfully');

        // Validate EPUB format
        const header = await RNFS.read(downloadDest, 4, 0, 'ascii');
        if (header.charCodeAt(0) !== 0x50 || header.charCodeAt(1) !== 0x4b) {
          await RNFS.unlink(downloadDest);
          throw new Error('Downloaded file is not a valid EPUB/ZIP format');
        }

        // Load the validated EPUB
        const fileData = await RNFS.readFile(downloadDest, 'base64');
        console.log('EPUB loaded successfully, size:', fileData.length);
        setEpubData(fileData);
        setLocalPath(downloadDest);
        setupCompleteRef.current = true;
        
        // Show TOC immediately after loading
        setShowToc(true);

      } catch (error: any) {
        console.error('Download or validation error:', error);
        throw error;
      }

    } catch (error: any) {
      const finalErr = error as Error;
      console.error('Download error:', finalErr);
      
      // Reset download progress and clean up any failed download
      setDownloadProgress(0);
      try {
        if (downloadDest) {
          const exists = await RNFS.exists(downloadDest);
          if (exists) {
            await RNFS.unlink(downloadDest);
          }
        }
      } catch (cleanupErr) {
        console.warn('Failed to clean up after error:', cleanupErr);
      }
      
      const errorMessage = `Failed to setup EPUB: ${finalErr.message}`;
      setError(errorMessage);
      onError?.(errorMessage);
      Alert.alert('Download Error', errorMessage);
      setupCompleteRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your existing code ...

  return (
    <View style={styles.container}>
      {/* ... rest of your JSX ... */}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... your existing styles ...
});

export default EpubReader;
