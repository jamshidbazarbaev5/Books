import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_LAUNCHED = 'hasLaunched';

export function useFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED);
        if (hasLaunched === null) {
          await AsyncStorage.setItem(HAS_LAUNCHED, 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
    }
    
    checkFirstLaunch();
  }, []);

  return isFirstLaunch;
}
