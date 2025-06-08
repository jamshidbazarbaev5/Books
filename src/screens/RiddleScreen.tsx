import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft } from 'react-native-feather';
import { WritersStackParamList } from '../types/navigation';

const RiddleScreen = () => {
  const route = useRoute<RouteProp<WritersStackParamList, 'Riddle'>>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { fontSize } = useSettings();
  const { riddle } = route.params;
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft stroke={theme.textColor} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: theme.pageBackground }]}
      >
        <Text style={[styles.title, { color: theme.textColor, fontSize: fontSize * 1.5 }]}>
          {riddle.title}
        </Text>

        <View style={[styles.riddleCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.riddleText, { color: theme.textColor, fontSize: fontSize * 1.2 }]}>
            {riddle.content}
          </Text>
        </View>

        <View style={styles.answerSection}>
          <TouchableOpacity 
            style={[styles.answerButton, { backgroundColor: theme.accentColor }]}
            onPress={() => setShowAnswer(!showAnswer)}
          >
            <Text style={[styles.answerButtonText, { color: theme.cardBackground, fontSize: fontSize }]}>
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </Text>
          </TouchableOpacity>

          {showAnswer && riddle.answers && riddle.answers.map((answer, index) => (
            <View key={index} style={[styles.answerCard, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.answerText, { color: theme.textColor, fontSize: fontSize * 1.2 }]}>
                {answer}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    borderRadius: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  riddleCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  riddleText: {
    lineHeight: 28,
    textAlign: 'center',
  },
  answerSection: {
    alignItems: 'center',
  },
  answerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  answerButtonText: {
    fontWeight: '600',
  },
  answerCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  answerLabel: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  answerText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default RiddleScreen;