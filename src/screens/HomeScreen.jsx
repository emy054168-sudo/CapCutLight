import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-video';

const HomeScreen = ({ navigation }) => {
  const [videoUri, setVideoUri] = useState(null);

  const requestPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
};   

const pickVideo = async () => {
  try {
    const video = await ImagePicker.openPicker({
      mediaType: 'video',
      cropping: false,
    });
    setVideoUri(video.path);
  } catch (e) {
    if (e.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie.');
    }
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CapCut Light 🎬</Text>
      <Text style={styles.subtitle}>Importe, découpe et partage tes vidéos</Text>

      <TouchableOpacity style={styles.btn} onPress={pickVideo}>
        <Text style={styles.btnText}>📹 Choisir une vidéo</Text>
      </TouchableOpacity>

      {videoUri && (
        <>
          <Video
            source={{ uri: videoUri }}
            style={styles.preview}
            controls
            resizeMode="contain"
            paused
          />
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen]}
            onPress={() => navigation.navigate('Trim', { videoUri })}>
            <Text style={styles.btnText}>✂️ Découper la vidéo</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  btn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  btnGreen: {
    backgroundColor: '#00c853',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    width: 320,
    height: 200,
    borderRadius: 12,
    marginTop: 24,
    backgroundColor: '#1a1a1a',
  },
});

export default HomeScreen;