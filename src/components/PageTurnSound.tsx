import { useEffect, useCallback } from 'react';
import Sound from 'react-native-sound';
import { Platform } from 'react-native';

export const usePageTurnSound = () => {
  let sound: Sound | null = null;

  useEffect(() => {
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    const soundPath = Platform.select({
      ios: 'turn.mp3',
      android: 'turn.mp3',
    });

    sound = new Sound(soundPath, Platform.OS === 'ios' ? '' : Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
      }
    });

    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, []);

  const playSound = useCallback(() => {
    if (!sound) return;

    sound.stop(() => {
      sound?.play((success) => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    });
  }, []);

  return { playSound };
};
