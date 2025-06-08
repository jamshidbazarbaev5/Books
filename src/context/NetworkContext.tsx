import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
  checkConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = async () => {
    try {
      // First try to make an actual network request to test connectivity
      try {
        const response = await fetch('https://xaliq-danaligi.uz:8000/api/mobile/authors');
        if (response.ok) {
          console.log('Network request successful, connection is available');
          setIsConnected(true);
          return;
        }
      } catch (fetchError) {
        console.log('Network request failed, falling back to NetInfo');
      }

      // Fallback to NetInfo
      const state = await NetInfo.fetch();
      console.log('Network state:', {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable
      });
      
      setIsConnected(state.type !== 'none' && state.type !== 'unknown');
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Check connection when component mounts
    checkConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      console.log('Network state changed:', {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable
      });

      if (state.type !== 'none' && state.type !== 'unknown') {
        try {
          const response = await fetch('https://xaliq-danaligi.uz:8000/api/mobile/authors');
          setIsConnected(response.ok);
        } catch (error) {
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, checkConnection }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export { NetworkProvider };
