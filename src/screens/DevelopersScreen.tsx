import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArrowLeft} from 'react-native-feather';
import {useNavigation} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { developersApi } from '../api/developers';

interface Developer {
  name: string;
  position: string;
}


const DevelopersScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const [developers,setDevelopers] = useState<any>([]) 

  useEffect(()=>{
    const fetchDevelopers = async ()=>{
      try {
        const developers = await developersApi.getDevelopers()
        console.log('API Response:', developers)
        setDevelopers(developers.results)
      } catch (error) {
        console.error('Error fetching developers:', error)
      }
    }

    fetchDevelopers()
  },[])

  console.log(developers)

  return (
    <>
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
           
        <ScrollView style={styles.scrollView}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 16}}>
                    <ArrowLeft stroke={theme.textColor} width={24} height={24} />
                  </TouchableOpacity>
          {developers.map((developer:any, index:any) => (
            <View
              key={index}
              style={[
                styles.developerCard,
                {backgroundColor: theme.cardBackground},
              ]}>
              <Text style={[styles.name, {color: theme.textColor}]}>
                {developer.name}
              </Text>
              <Text
                style={[styles.position, {color: theme.secondaryTextColor}]}>
                {developer.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  developerCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
  },
});

export default DevelopersScreen;
