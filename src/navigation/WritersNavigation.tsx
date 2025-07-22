import { createStackNavigator } from "@react-navigation/stack"
import WritersScreen from "../screens/WritersScreen"
import WriterDetailScreen from "../screens/WriterDetailScreen"
import PoemScreen from "../screens/PoemScreen"
// import BookScreen from '../screens/BookScreen'
import BookListScreen from "../screens/BookListScreen"
import RiddleScreen from '../screens/RiddleScreen'
import NationalWritingsScreen from "../screens/NationalWritingsScreen"
import AdvancedEpubReaderScreen from "../screens/AdvancedEpubReaderScreen"
import { useTheme } from "../context/ThemeContext"
import { useSettings } from "../context/SettingsContext"
import { WritersStackParamList } from "../types/navigation"
import { Text } from 'react-native'

const Stack = createStackNavigator<WritersStackParamList>()

const WritersNavigator = () => {
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
                options={({ route }) => ({ title: route.params?.writer?.name_cyr, })}
            />
            <Stack.Screen
                name="Poem"
                component={PoemScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="BookList"
                component={BookListScreen}
                options={{ headerShown: false }}
            />
            {/* <Stack.Screen
                name="Book"
                component={BookScreen}
                options={({ route }) => ({ 
                    title: route.params?.title || "Book",
                    headerShown: false,
                    headerTitleContainerStyle: {
                        width: '70%',
                    },
                    headerTitle: () => (
                        <Text 
                            numberOfLines={1} 
                            ellipsizeMode="tail" 
                            style={{ 
                                color: theme.textColor,
                                fontSize: fontSize * 1.2,
                                fontWeight: 'bold',
                                flexShrink: 1
                            }}
                        >
                            {route.params?.title || "Book"}...
                        </Text>
                    )
                })}
            /> */}
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

export default WritersNavigator
