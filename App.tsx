import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ThemeProvider, useTheme } from './src/context/ThemeContext.tsx'
import { LanguageProvider, useLanguage } from "./src/context/LanguageContext"
import { SettingsProvider, useSettings } from "./src/context/SettingsContext"
import { NetworkProvider } from "./src/context/NetworkContext.tsx"
import { RefreshButton } from "./src/components/RefreshButton"
import { Users, Heart, Settings, Book, Globe } from "react-native-feather"

// Screens
import WritersScreen from './src/screens/WritersScreen'
import WriterDetailScreen from './src/screens/WriterDetailScreen'
import PoemScreen from './src/screens/PoemScreen'
import FavoritesScreen from './src/screens/FavouritesScreen.tsx'
import SettingsScreen from "./src/screens/SettingsScreen"
import BookListScreen from "./src/screens/BookListScreen.tsx"
import DevelopersScreen from "./src/screens/DevelopersScreen"
import NationalWritingsScreen from "./src/screens/NationalWritingsScreen"
import IntroductionScreen from "./src/screens/IntroductionScreen"
import RiddleScreen from './src/screens/RiddleScreen'
import AdvancedEpubReaderScreen from './src/screens/AdvancedEpubReaderScreen'
import { useFirstLaunch } from "./src/hooks/useFirstLaunch"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function WritersStack() {
  const { theme } = useTheme()
  const { fontSize } = useSettings()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.cardBackground,
        },
        headerTintColor: theme.textColor,
        headerTitleStyle: {
          fontWeight: "bold",
          color: theme.textColor,
          fontSize: fontSize * 1.2,
        },
      }}
    >
      <Stack.Screen name="WritersList" component={WritersScreen} options={{headerShown:false}} />
      <Stack.Screen
        name="WriterDetail"
        component={WriterDetailScreen}
        options={({ route }) => ({ title: route.params?.writer?.name_cyr })}
      />
      <Stack.Screen
        name="Poem"
        component={PoemScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Riddle"
        component={RiddleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NationalWritings"
        component={NationalWritingsScreen}
        options={{ title: "National Writings" }}
      />
      <Stack.Screen
        name="AdvancedEpubReader"
        component={AdvancedEpubReaderScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

function TabNavigator() {
  const { theme } = useTheme()
  const { fontSize } = useSettings()
  const { translations } = useLanguage()
  const isFirstLaunch = useFirstLaunch()
  
  if (isFirstLaunch === null) {
    return null; // or a loading screen
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconSize = fontSize * 1.2
          if (route.name === "Writers") {
            return <Users stroke={color} width={iconSize} height={iconSize} />
          } else if (route.name === "Books") {
            return <Book stroke={color} width={iconSize} height={iconSize} />
          } else if (route.name === "Favorites") {
            return <Heart stroke={color} width={iconSize} height={iconSize} />
          } else if (route.name === "Settings") {
            return <Settings stroke={color} width={iconSize} height={iconSize} />
          }
        },
        tabBarActiveTintColor: theme.accentColor,
        tabBarInactiveTintColor: theme.secondaryTextColor,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.secondaryTextColor,
          elevation: 0,
          height: 80,
          paddingBottom: 50
        },
        tabBarLabelStyle: {
          fontSize: fontSize * 0.8,
          paddingBottom: 5
        },
        headerShown: false
      })}
    >
      {isFirstLaunch ? (
        <Tab.Screen 
          name="Introduction" 
          component={IntroductionScreen}
          options={{ 
            tabBarStyle: { display: 'none' },
            tabBarItemStyle: { display: 'none' }
          }}
        />
      ) : null}
      <Tab.Screen 
        name="Writers" 
        component={WritersStack}
        options={{ tabBarLabel: translations.authors }} 
      />
      <Tab.Screen 
        name="Books" 
        component={BookListScreen}
        options={{ tabBarLabel: translations.books }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ tabBarLabel: translations.favorites }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: translations.settings }} 
      />
      {/* <Tab.Screen name="ss" component={ss} /> */}
      {/* <Tab.Screen name="Bookmarks" component={BookmarksScreen} /> */}

      <Tab.Screen 
        name="Developers" 
        component={DevelopersScreen} 
        options={{ 
          tabBarStyle: { display: 'none' },
          tabBarItemStyle: { display: 'none' }
        }} 
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <LanguageProvider>
              <NetworkProvider>
                <NavigationContainer>
                  <TabNavigator />
                  <RefreshButton />
                </NavigationContainer>
              </NetworkProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}