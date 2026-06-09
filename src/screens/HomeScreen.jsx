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
  const [selectedVideos, setSelectedVideos] = useState([]);

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
  const granted = await requestPermission();
  if (!granted) {
    Alert.alert('Autorisation requise', 'Autorise l\'accès aux vidéos pour sélectionner un clip.');
    return;
  }

  try {
    const video = await ImagePicker.openPicker({
      mediaType: 'video',
      cropping: false,
    });
    if (Array.isArray(video)) {
      setSelectedVideos(video.map((item) => item.path || item.uri));
    } else {
      setSelectedVideos([video.path || video.uri]);
    }
  } catch (e) {
    if (e.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie.');
    }
  }
};

const pickVideos = async () => {
  const granted = await requestPermission();
  if (!granted) {
    Alert.alert('Autorisation requise', 'Autorise l\'accès aux vidéos pour sélectionner plusieurs clips.');
    return;
  }

  try {
    const videos = await ImagePicker.openPicker({
      mediaType: 'video',
      multiple: true,
      cropping: false,
    });
    if (Array.isArray(videos) && videos.length > 0) {
      setSelectedVideos(videos.map((item) => item.path || item.uri));
    }
  } catch (e) {
    if (e.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie.');
    }
  }
};

const startEditing = () => {
  if (selectedVideos.length === 0) {
    Alert.alert('Attention', 'Sélectionne d\'abord une ou plusieurs vidéos.');
    return;
  }
  navigation.navigate('Editor', { videoUris: selectedVideos });
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CapCut Light 🎬</Text>
      <Text style={styles.subtitle}>Importe, découpe et partage tes vidéos</Text>

      <TouchableOpacity style={styles.btn} onPress={pickVideo}>
        <Text style={styles.btnText}>📹 Choisir une vidéo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnGray]} onPress={pickVideos}>
        <Text style={styles.btnText}>🎞️ Choisir plusieurs vidéos</Text>
      </TouchableOpacity>

      {selectedVideos.length > 0 && (
        <>
          <Text style={styles.selectedText}>
            {selectedVideos.length === 1
              ? '1 clip sélectionné'
              : `${selectedVideos.length} clips sélectionnés`}
          </Text>
          <Video
            source={{ uri: selectedVideos[0] }}
            style={styles.preview}
            controls
            resizeMode="contain"
            paused
          />
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen]}
            onPress={startEditing}>
            <Text style={styles.btnText}>
              {selectedVideos.length === 1 ? '🎨 Éditer le clip' : '🎬 Créer un montage'}
            </Text>
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
  btnGray: {
    backgroundColor: '#333',
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
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