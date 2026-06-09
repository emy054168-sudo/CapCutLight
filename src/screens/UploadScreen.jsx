import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { supabase } from '../services/supabase';

const UploadScreen = ({ route, navigation }) => {
  const { trimmedUri, videoUris, filterName = 'Normal' } = route.params ?? {};
  const selectedUri = trimmedUri || (Array.isArray(videoUris) ? videoUris[0] : null);
  const projectType = Array.isArray(videoUris) && videoUris.length > 1 ? 'Montage' : 'Clip';
  const [status, setStatus] = useState('processing'); // processing | uploading | done | error
  const [publicUrl, setPublicUrl] = useState(null);

  const getFilterExpression = (name) => {
    switch (name) {
      case 'Sépia':
        return 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
      case 'Noir':
        return 'hue=s=0,eq=contrast=1.2:brightness=0.0';
      case 'Cool':
        return "curves=blue='0/0 0.5/0.8 1/1'";
      case 'Sunset':
        return 'colorchannelmixer=1:.2:0:0:.1:.9:0:0:0:.1:.9';
      default:
        return '';
    }
  };

  const executeFFmpegCommand = (command) =>
    new Promise((resolve, reject) => {
      FFmpegKit.executeAsync(command, async (session) => {
        const returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          resolve();
        } else {
          const failStack = await session.getFailStackTrace();
          reject(new Error(`FFmpeg failed: ${returnCode?.getValue()} ${failStack || ''}`));
        }
      });
    });

  const base64ToUint8Array = (base64) => {
    let binaryString = '';
    if (typeof global.atob === 'function') {
      binaryString = global.atob(base64);
    } else if (typeof atob === 'function') {
      binaryString = atob(base64);
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = base64.replace(/=+$/, '');
      let output = '';
      for (let i = 0; i < str.length; i += 4) {
        const enc1 = chars.indexOf(str.charAt(i));
        const enc2 = chars.indexOf(str.charAt(i + 1));
        const enc3 = chars.indexOf(str.charAt(i + 2));
        const enc4 = chars.indexOf(str.charAt(i + 3));
        output += String.fromCharCode((enc1 << 2) | (enc2 >> 4));
        if (enc3 !== 64) {
          output += String.fromCharCode(((enc2 & 15) << 4) | (enc3 >> 2));
        }
        if (enc4 !== 64) {
          output += String.fromCharCode(((enc3 & 3) << 6) | enc4);
        }
      }
      binaryString = output;
    }

    const byteNumbers = new Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteNumbers[i] = binaryString.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  };

  const buildConcatCommand = (paths, filterExpr, outputPath) => {
    const inputs = paths.map((path) => `-i "${path}"`).join(' ');
    const streamLabels = paths.map((_, index) => `[${index}:v:0][${index}:a:0]`).join('');
    const concatLabel = `[concatv][conca]`;
    const filterComplex = `${streamLabels}concat=n=${paths.length}:v=1:a=1[concatv][conca]${
      filterExpr ? `;[concatv]${filterExpr}[outv]` : ''
    }`;
    const mapVideo = filterExpr ? '-map "[outv]"' : '-map "[concatv]"';
    return `-y ${inputs} -filter_complex "${filterComplex}" ${mapVideo} -map "[conca]" -c:v libx264 -preset ultrafast -crf 23 -c:a aac "${outputPath}"`;
  };

  const buildSingleCommand = (path, filterExpr, outputPath) => {
    if (!filterExpr) {
      return `-y -i "${path}" -c copy "${outputPath}"`;
    }
    return `-y -i "${path}" -vf "${filterExpr}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac "${outputPath}"`;
  };

  const uploadVideo = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user || !selectedUri) {
        setStatus('error');
        return;
      }

      let uriToUpload = selectedUri;
      const shouldRender =
        (Array.isArray(videoUris) && videoUris.length > 1) ||
        (filterName && filterName !== 'Normal');

      if (shouldRender) {
        const outputPath = `${RNFS.CachesDirectoryPath}/capcutlight-export-${Date.now()}.mp4`;
        const filterExpr = getFilterExpression(filterName);

        if (Array.isArray(videoUris) && videoUris.length > 1) {
          const command = buildConcatCommand(videoUris, filterExpr, outputPath);
          await executeFFmpegCommand(command);
        } else {
          const command = buildSingleCommand(selectedUri, filterExpr, outputPath);
          await executeFFmpegCommand(command);
        }

        uriToUpload = outputPath;
      }

      setStatus('uploading');
      const fileName = `${user.id}/${Date.now()}.mp4`;
      const fileData = await RNFS.readFile(uriToUpload, 'base64');
      const byteArray = base64ToUint8Array(fileData);

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
        name: `${projectType} ${new Date().toLocaleDateString()}`,
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
      {status === 'processing' && (
        <>
          <ActivityIndicator size="large" color="#ff4d4d" />
          <Text style={styles.text}>🛠️ Rendu en cours...</Text>
          <Text style={styles.sub}>Patiente pendant la création du montage.</Text>
        </>
      )}
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
          <Text style={styles.sub}>
            {projectType} enregistré{filterName ? ` avec ${filterName}` : ''}.
          </Text>
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