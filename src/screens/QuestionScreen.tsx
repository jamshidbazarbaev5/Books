import React from 'react';
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
  const { riddle, writer } = route.params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft stroke={theme.textColor} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.writerName, { color: theme.textColor, fontSize: fontSize }]}>
          {writer.name}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: theme.pageBackground }]}
      >
        <Text style={[styles.title, { color: theme.textColor, fontSize: fontSize * 1.5 }]}>
          {riddle.title}
        </Text>
        <Text style={[styles.year, { color: theme.secondaryTextColor, fontSize: fontSize }]}>
          {riddle.year}
        </Text>
        <Text style={[styles.riddleText, { color: theme.textColor, fontSize: fontSize * 1.2 }]}>
          {riddle.content}
        </Text>

        {riddle.answers && riddle.answers.length > 0 && (
          <View style={styles.answersContainer}>
            <Text style={[styles.answersTitle, { color: theme.textColor, fontSize: fontSize * 1.2 }]}>
              Key Points:
            </Text>
            {riddle.answers.map((answer, index) => (
              <View 
                key={index} 
                style={[styles.answerItem, { backgroundColor: theme.cardBackground }]}
              >
                <Text style={[styles.answerText, { color: theme.textColor, fontSize: fontSize }]}>
                  • {answer}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  writerName: {
    fontWeight: '600',
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
    marginBottom: 8,
  },
  year: {
    fontStyle: 'italic',
    marginBottom: 24,
  },
  riddleText: {
    lineHeight: 28,
    marginBottom: 32,
  },
  answersContainer: {
    marginTop: 16,
  },
  answersTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  answerItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  answerText: {
    lineHeight: 24,
  },
});

export default RiddleScreen;