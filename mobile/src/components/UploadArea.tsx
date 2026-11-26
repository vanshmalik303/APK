import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { formatFileSize } from '../services/api';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

export interface SelectedFile {
  name: string;
  size: number;
  uri: string;
}

interface UploadAreaProps {
  onStartScan: (file: SelectedFile) => void;
  isScanning: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onStartScan, isScanning }) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePickFile = async () => {
    try {
      setErrorMessage(null);
      setIsPicking(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.android.package-archive', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsPicking(false);
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.name || 'unnamed.apk';
      const fileSize = asset.size || 0;

      // Validation 1: Extension check
      if (!fileName.toLowerCase().endsWith('.apk')) {
        setErrorMessage('Invalid file format. APKGuard exclusively analyzes compiled Android application packages (.apk).');
        setIsPicking(false);
        return;
      }

      // Validation 2: Size check
      if (fileSize > MAX_FILE_SIZE) {
        setErrorMessage(`File exceeds the maximum analysis threshold of 200 MB (Current: ${formatFileSize(fileSize)}).`);
        setIsPicking(false);
        return;
      }

      setSelectedFile({
        name: fileName,
        size: fileSize,
        uri: asset.uri,
      });
    } catch (err) {
      console.error('Error picking document:', err);
      setErrorMessage('Failed to select file. Please check device permissions.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
  };

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={COLORS.critical} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {!selectedFile ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePickFile}
          disabled={isPicking || isScanning}
          style={styles.dropzone}
        >
          <View style={styles.iconCircle}>
            {isPicking ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <MaterialCommunityIcons name="cloud-upload-outline" size={36} color={COLORS.primary} />
            )}
          </View>

          <Text style={styles.dropzoneTitle}>Select Android APK</Text>
          <Text style={styles.dropzoneSubtitle}>
            Tap to browse and select a compiled APK file from your device
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>.APK ONLY</Text>
            </View>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>MAX 200 MB</Text>
            </View>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>OFFLINE STATIC</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.fileSelectedCard}>
          <View style={styles.fileHeader}>
            <View style={styles.apkIconContainer}>
              <MaterialCommunityIcons name="android" size={26} color={COLORS.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                {selectedFile.name}
              </Text>
              <Text style={styles.fileMeta}>
                Size: {formatFileSize(selectedFile.size)} • Ready for analysis
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRemoveFile}
              disabled={isScanning}
              style={styles.removeBtn}
            >
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={handlePickFile}
              disabled={isScanning}
            >
              <Ionicons name="repeat" size={16} color={COLORS.textSecondary} />
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startScanBtn, isScanning && styles.startScanBtnDisabled]}
              onPress={() => onStartScan(selectedFile)}
              disabled={isScanning}
            >
              <MaterialCommunityIcons name="shield-search" size={18} color={COLORS.textDark} />
              <Text style={styles.startScanText}>
                {isScanning ? 'Scan in Progress...' : 'Start Security Scan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.criticalBg,
    borderColor: COLORS.criticalBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.critical,
    fontSize: 12,
    lineHeight: 16,
  },
  dropzone: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dropzoneTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  dropzoneSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specBadgeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fileSelectedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
    padding: 16,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  apkIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  fileMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  removeBtn: {
    padding: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  changeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  startScanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  startScanBtnDisabled: {
    opacity: 0.6,
  },
  startScanText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
});
