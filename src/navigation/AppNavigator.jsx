import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import TrimScreen from '../screens/TrimScreen';
import UploadScreen from '../screens/UploadScreen';
import GalleryScreen from '../screens/GalleryScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🎬 CapCut Light' }}
        />
        <Stack.Screen
          name="Trim"
          component={TrimScreen}
          options={{ title: '✂️ Découper' }}
        />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{ title: '⬆️ Upload' }}
        />
        <Stack.Screen
          name="Gallery"
          component={GalleryScreen}
          options={{ title: '📂 Ma Galerie' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;