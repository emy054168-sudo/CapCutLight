import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';
import { supabase } from '../services/supabase';

const UploadScreen = ({ route, navigation }) => {
  const { trimmedUri } = route.params;
  const [status, setStatus] = useState('uploading'); // uploading | done | error
  const [publicUrl, setPublicUrl] = useState(null);

  const uploadVideo = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setStatus('error');
        return;
      }

      const fileName = `${user.id}/${Date.now()}.mp4`;
      const fileData = await RNFS.readFile(trimmedUri, 'base64');

      const byteCharacters = atob(fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const { error: upErr } = await supabase.storage
        .from('videos')
        .upload(fileName, byteArray, { contentType: 'video/mp4' });

      if (upErr) throw upErr;

      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      setPublicUrl(data.publicUrl);

      await supabase.from('videos').insert({
        user_id: user.id,
        name: `Clip ${new Date().toLocaleDateString()}`,
        url: data.publicUrl,
      });

      setStatus('done');
    } catch (e) {
      console.error('Upload error:', e);
      setStatus('error');
    }
  };

  useEffect(() => {
    uploadVideo();
  }, []);

  return (
    <View style={styles.container}>
      {status === 'uploading' && (
        <>
          <ActivityIndicator size="large" color="#ff4d4d" />
          <Text style={styles.text}>⬆️ Upload en cours...</Text>
          <Text style={styles.sub}>Ne ferme pas l'application</Text>
        </>
      )}

      {status === 'done' && (
        <>
          <Text style={styles.success}>✅ Upload terminé !</Text>
          <Text style={styles.sub}>Ton clip est disponible dans ta galerie</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Gallery')}>
            <Text style={styles.btnText}>📂 Voir ma galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnGray]}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnText}>🏠 Accueil</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'error' && (
        <>
          <Text style={styles.error}>❌ Erreur lors de l'upload</Text>
          <Text style={styles.sub}>Vérifie ta connexion et tes clés Supabase</Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnGray]}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnText}>🔄 Réessayer</Text>
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
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  sub: {
    color: '#666',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  success: {
    color: '#00c853',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  error: {
    color: '#ff4d4d',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    width: '80%',
    alignItems: 'center',
  },
  btnGray: {
    backgroundColor: '#333',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadScreen;