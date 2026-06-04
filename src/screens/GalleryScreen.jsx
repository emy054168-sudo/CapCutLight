import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { supabase } from '../services/supabase';

const GalleryScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les vidéos.');
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (video) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${video.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const fileName = video.url.split('/storage/v1/object/public/videos/')[1];
              await supabase.storage.from('videos').remove([fileName]);
              await supabase.from('videos').delete().eq('id', video.id);
              fetchVideos();
            } catch (e) {
              Alert.alert('Erreur', 'Impossible de supprimer la vidéo.');
            }
          },
        },
      ]
    );
  };

  const renameVideo = (video) => {
    Alert.prompt(
      'Renommer',
      'Nouveau nom :',
      async (newName) => {
        if (newName && newName.trim()) {
          await supabase
            .from('videos')
            .update({ name: newName.trim() })
            .eq('id', video.id);
          fetchVideos();
        }
      },
      'plain-text',
      video.name
    );
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {playing === item.id ? (
        <Video
          source={{ uri: item.url }}
          style={styles.video}
          controls
          resizeMode="contain"
          autoPlay
        />
      ) : (
        <TouchableOpacity
          style={styles.thumbPlaceholder}
          onPress={() => setPlaying(item.id)}>
          <Text style={styles.playIcon}>▶️</Text>
          <Text style={styles.playText}>Appuie pour lire</Text>
        </TouchableOpacity>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.renameBtn]}
          onPress={() => renameVideo(item)}>
          <Text style={styles.actionText}>✏️ Renommer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => deleteVideo(item)}>
          <Text style={styles.actionText}>🗑️ Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Chargement des vidéos...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🎬</Text>
        <Text style={styles.emptyText}>Aucune vidéo pour l'instant</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnText}>+ Importer une vidéo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  thumbPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 40,
  },
  playText: {
    color: '#666',
    fontSize: 13,
    marginTop: 8,
  },
  info: {
    padding: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  renameBtn: {
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
  },
  deleteBtn: {},
  actionText: {
    color: '#ccc',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default GalleryScreen;