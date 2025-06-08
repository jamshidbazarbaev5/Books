import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { RefreshCw } from 'react-native-feather';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';

export const RefreshButton = () => {
  const { isConnected, checkConnection } = useNetwork();
  const { theme } = useTheme();

  console.log('RefreshButton render, isConnected:', isConnected);

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accentColor }]}
          onPress={checkConnection}
        >
          <RefreshCw stroke="white" width={24} height={24} />
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});