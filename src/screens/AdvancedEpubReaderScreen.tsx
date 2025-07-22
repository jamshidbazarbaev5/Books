import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import JSZip from 'jszip';
import PageCurlReader from '../components/PageCurlReader';
import { splitIntoPages } from '../utils/pagination';

// -----------------------------
// Navigation types
// -----------------------------

type AdvancedEpubReaderRouteProp = RouteProp<{
  AdvancedEpubReader: {
    title: string;
    epubUrl: string; // absolute URL or local file path
    initialPage?: number;
  };
}, 'AdvancedEpubReader'>;

const { width } = Dimensions.get('window');

// Utility: very naive html -> plain text
const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const AdvancedEpubReaderScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<AdvancedEpubReaderRouteProp>();

  const { title, epubUrl, initialPage = 0 } = route.params;

  const [pages, setPages] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const readerRef = useRef<any>(null);

  // ------------------------------------------------------------------
  //  Load & extract EPUB as plain text on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      console.log('[AdvancedEpubReader] fetching', epubUrl);
      try {
        setError(null);
        const res = await fetch(epubUrl);
        console.log('[AdvancedEpubReader] fetch status', res.status);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch EPUB: ${res.status} ${res.statusText}`,
          );
        }
        const arrayBuffer = await res.arrayBuffer();
        console.log('[AdvancedEpubReader] arrayBuffer bytes', arrayBuffer.byteLength);
        const zip = await JSZip.loadAsync(arrayBuffer);

        let combinedText = '';
        const tasks: Promise<void>[] = [];
        let htmlFileCount = 0;
        zip.forEach((relPath, file) => {
          if (/\.(xhtml|html|htm)$/i.test(relPath)) {
            htmlFileCount++;
            tasks.push(
              file.async('text').then((content) => {
                combinedText += ' ' + stripHtml(content);
              }),
            );
          }
        });

        await Promise.all(tasks);
        console.log('[AdvancedEpubReader] htmlFileCount', htmlFileCount);
        if (htmlFileCount === 0) {
          throw new Error('No XHTML/HTML files were found inside this EPUB.');
        }
        if (cancelled) return;

        // --- paginate
        const FONT_SIZE = 14;
        const LINE_HEIGHT = 22;
        const paginated = splitIntoPages(combinedText, FONT_SIZE, LINE_HEIGHT);
        console.log('[AdvancedEpubReader] paginated pages', paginated.length);
        setPages(paginated);
      } catch (e: any) {
        console.error('[AdvancedEpubReader] extraction error', e);
        if (cancelled) return;
        setError(e.message || 'Unknown error');
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [epubUrl]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ------------------------------------------------------------------
  //  Render states
  // ------------------------------------------------------------------
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!pages) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading book...</Text>
      </SafeAreaView>
    );
  }

  const fullText = pages.join(' ');

  return (
    <SafeAreaView style={styles.container}>
      <PageCurlReader
        ref={readerRef}
        content={fullText}
        initialPage={currentPage}
        title={title}
        onPageChange={handlePageChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: { marginTop: 12, fontSize: 16 },
});

export default AdvancedEpubReaderScreen;
