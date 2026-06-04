import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';

const TrimScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const MAX_DURATION = 10;

  const handleLoad = (data) => {
    const dur = data.duration;
    setDuration(dur);
    setEndTime(Math.min(dur, MAX_DURATION));
  };

  const confirmTrim = () => {
    const clipDuration = endTime - startTime;
    if (clipDuration <= 0) {
      Alert.alert('Erreur', 'La durée doit être supérieure à 0.');
      return;
    }
    // On passe l'URI original avec les timestamps début/fin
    navigation.navigate('Upload', {
      trimmedUri: videoUri,
      startTime,
      endTime,
    });
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUri }}
        style={styles.preview}
        onLoad={handleLoad}
        controls
        resizeMode="contain"
        paused
      />

      <View style={styles.sliderBlock}>
        <Text style={styles.label}>
          ▶️ Début : <Text style={styles.value}>{startTime.toFixed(1)}s</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={startTime}
          onValueChange={(v) => setStartTime(parseFloat(v.toFixed(1)))}
          minimumTrackTintColor="#ff4d4d"
          maximumTrackTintColor="#444"
          thumbTintColor="#ff4d4d"
        />
      </View>

      <View style={styles.sliderBlock}>
        <Text style={styles.label}>
          ⏹️ Fin : <Text style={styles.value}>{endTime.toFixed(1)}s</Text>
          <Text style={styles.max}> (max {MAX_DURATION}s)</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={startTime}
          maximumValue={Math.min(startTime + MAX_DURATION, duration)}
          value={endTime}
          onValueChange={(v) => setEndTime(parseFloat(v.toFixed(1)))}
          minimumTrackTintColor="#00c853"
          maximumTrackTintColor="#444"
          thumbTintColor="#00c853"
        />
      </View>

      <Text style={styles.duration}>
        Durée du clip : {(endTime - startTime).toFixed(1)}s
      </Text>

      <TouchableOpacity style={styles.btn} onPress={confirmTrim}>
        <Text style={styles.btnText}>✂️ Confirmer & continuer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    padding: 20,
  },
  preview: {
    width: 320,
    height: 200,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: '#1a1a1a',
  },
  sliderBlock: {
    width: '100%',
    marginTop: 24,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
  },
  value: {
    color: '#fff',
    fontWeight: 'bold',
  },
  max: {
    color: '#666',
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  duration: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
  },
  btn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 32,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrimScreen;