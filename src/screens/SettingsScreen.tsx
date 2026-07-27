"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Switch } from "react-native"
import Slider from "@react-native-community/slider"
import { Moon, Sun, Type, Check, Info, Users, ChevronRight, Type as ScriptIcon } from "react-native-feather"
import { useTheme } from "../context/ThemeContext"
import { useLanguage } from "../context/LanguageContext"
import { useSettings } from "../context/SettingsContext"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { useRef, useEffect } from "react"

type TabParamList = {
  Writers: undefined
  Books: undefined
  National: undefined
  Favorites: undefined
  Settings: undefined
  Developers: undefined
}

type NavigationProp = BottomTabNavigationProp<TabParamList>

const SettingsScreen = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme()
  const { language, changeLanguage, translations } = useLanguage()
  const { fontSize, poemFontSize, setPoemFontSize, script, toggleScript } = useSettings()
  const navigation = useNavigation<NavigationProp>()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    // Animate content when screen loads
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const togglePosition = useRef(new Animated.Value(isDarkMode ? 20 : 0)).current

  useEffect(() => {
    Animated.spring(togglePosition, {
      toValue: isDarkMode ? 20 : 0,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start()
  }, [isDarkMode])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{translations.settings}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{translations.appearance}</Text>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            >
              <View style={styles.settingInfo}>
                {isDarkMode ? (
                  <Moon stroke={theme.accentColor} width={22} height={22} style={styles.settingIcon} />
                ) : (
                  <Sun stroke={theme.accentColor} width={22} height={22} style={styles.settingIcon} />
                )}
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>{translations.theme}</Text>
              </View>
              <TouchableOpacity
                style={[styles.themeToggle, { backgroundColor: isDarkMode ? theme.accentColor : "#e0e0e0" }]}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.toggleCircle, { transform: [{ translateX: togglePosition }] }]} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            >
              <View style={styles.settingInfo}>
                <Type stroke={theme.accentColor} width={22} height={22} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>{translations.fontSize}</Text>
              </View>
              <View style={styles.fontSizeContainer}>
                <Text style={[styles.fontSizeLabel, { color: theme.secondaryTextColor }]}>A</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={14}
                  maximumValue={24}
                  step={1}
                  value={poemFontSize}
                  onValueChange={setPoemFontSize}
                  minimumTrackTintColor={theme.accentColor}
                  maximumTrackTintColor={isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}
                  thumbTintColor={theme.accentColor}
                />
                <Text style={[styles.fontSizeLabelLarge, { color: theme.secondaryTextColor }]}>A</Text>
              </View>
            </View>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            >
              <View style={styles.settingInfo}>
                <ScriptIcon stroke={theme.accentColor} width={22} height={22} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>
                  {translations.script}
                </Text>
              </View>
              <View style={styles.settingControl}>
                <Text style={[styles.settingText, { color: theme.secondaryTextColor, fontSize: fontSize - 2 }]}>
                  {script === "lat" ? translations.latin : translations.cyrillic}
                </Text>
                <Switch
                  value={script === "cyr"}
                  onValueChange={toggleScript}
                  trackColor={{ false: "#767577", true: theme.accentColor }}
                  thumbColor={isDarkMode ? "#f4f3f4" : "#fff"}
                />
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{translations.language}</Text>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
              onPress={() => changeLanguage("ru")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>Русский</Text>
              </View>
              {language === "ru" && (
                <View style={[styles.checkCircle, { backgroundColor: theme.accentColor }]}>
                  <Check stroke="white" width={16} height={16} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
              onPress={() => changeLanguage("uz")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>O'zbekcha</Text>
              </View>
              {language === "uz" && (
                <View style={[styles.checkCircle, { backgroundColor: theme.accentColor }]}>
                  <Check stroke="white" width={16} height={16} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{translations.about}</Text>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            >
              <View style={styles.settingInfo}>
                <Info stroke={theme.accentColor} width={22} height={22} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>{translations.version}</Text>
              </View>
              <Text style={[styles.versionText, { color: theme.secondaryTextColor, fontSize }]}>1.0.0</Text>
            </View>

            {/* <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
                },
              ]}
              onPress={() => navigation.navigate("Developers")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Users stroke={theme.accentColor} width={22} height={22} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: theme.textColor, fontSize }]}>
                  {translations.developers}
                </Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight stroke={theme.accentColor} width={22} height={22} />
              </View>
            </TouchableOpacity> */}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  animatedContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 14,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  themeToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 5,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  fontSizeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 150,
  },
  fontSizeLabel: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: "500",
  },
  fontSizeLabelLarge: {
    fontSize: 20,
    marginLeft: 8,
    fontWeight: "500",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronContainer: {
    opacity: 0.8,
  },
  settingControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})

export default SettingsScreen
