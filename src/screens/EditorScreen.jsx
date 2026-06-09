import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Video from 'react-native-video';

const FILTERS = [
  { key: 'normal', label: 'Normal', overlay: 'transparent' },
  { key: 'sepia', label: 'Sépia', overlay: 'rgba(112, 66, 20, 0.18)' },
  { key: 'noir', label: 'Noir', overlay: 'rgba(0, 0, 0, 0.22)' },
  { key: 'cool', label: 'Cool', overlay: 'rgba(45, 119, 200, 0.16)' },
  { key: 'sunset', label: 'Sunset', overlay: 'rgba(255, 94, 77, 0.18)' },
];

const EditorScreen = ({ route, navigation }) => {
  const { videoUris = [] } = route.params ?? {};
  const [clips, setClips] = useState(videoUris);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('normal');

  if (!clips.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Aucune vidéo sélectionnée.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentUri = clips[currentIndex];
  const activeFilter = FILTERS.find((filter) => filter.key === selectedFilter) || FILTERS[0];

  const moveClip = (index, direction) => {
    const destination = index + direction;
    if (destination < 0 || destination >= clips.length) return;
    const updated = [...clips];
    [updated[index], updated[destination]] = [updated[destination], updated[index]];
    setClips(updated);
    if (currentIndex === index) {
      setCurrentIndex(destination);
    } else if (currentIndex === destination) {
      setCurrentIndex(index);
    }
  };

  const saveProject = () => {
    navigation.navigate('Upload', {
      trimmedUri: currentUri,
      videoUris: clips,
      filterName: activeFilter.label,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Édition de ton clip</Text>
      <Text style={styles.subtitle}>
        {clips.length > 1
          ? `Clip ${currentIndex + 1} sur ${clips.length}`
          : 'Aperçu du clip'}
      </Text>

      <View style={styles.previewWrapper}>
        <Video
          source={{ uri: currentUri }}
          style={styles.video}
          controls
          resizeMode="contain"
        />
        <View style={[styles.filterOverlay, { backgroundColor: activeFilter.overlay }]} />
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.filterTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {clips.length > 1 && (
        <View style={styles.clipList}>
          <Text style={styles.sectionTitle}>Ordre des clips</Text>
          {clips.map((clip, index) => (
            <View key={`${clip}-${index}`} style={styles.clipRow}>
              <Text style={styles.clipLabel}>Clip {index + 1}</Text>
              <View style={styles.moveActions}>
                <TouchableOpacity
                  style={styles.moveBtn}
                  onPress={() => moveClip(index, -1)}>
                  <Text style={styles.moveText}>⬆️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moveBtn}
                  onPress={() => moveClip(index, 1)}>
                  <Text style={styles.moveText}>⬇️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={saveProject}>
        <Text style={styles.btnText}>
          {clips.length > 1 ? '📤 Enregistrer le montage' : '📤 Appliquer le filtre'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    marginBottom: 16,
  },
  previewWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  filterBar: {
    marginTop: 18,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#1f1f1f',
  },
  filterButtonActive: {
    backgroundColor: '#ff4d4d',
  },
  filterText: {
    color: '#ddd',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  clipList: {
    marginTop: 22,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  clipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  clipLabel: {
    color: '#fff',
    fontSize: 15,
  },
  moveActions: {
    flexDirection: 'row',
  },
  moveBtn: {
    marginLeft: 10,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
  },
  moveText: {
    color: '#fff',
  },
  btn: {
    backgroundColor: '#ff4d4d',
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#ff4d4d',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
});

export default EditorScreen;
