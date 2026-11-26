import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APKRecord } from '../types';
import { FileCard } from '../components/FileCard';
import { DeleteModal } from '../components/DeleteModal';
import { mobileApi } from '../services/api';
import { COLORS } from '../theme/colors';

interface FilesScreenProps {
  onViewReport: (reportId: string) => void;
  onNavigateToUpload: () => void;
}

type FilterType = 'ALL' | 'ISSUES_FOUND' | 'SAFE';

export const FilesScreen: React.FC<FilesScreenProps> = ({
  onViewReport,
  onNavigateToUpload,
}) => {
  const [files, setFiles] = useState<APKRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [fileToDelete, setFileToDelete] = useState<APKRecord | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      const data = await mobileApi.getFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFiles();
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    await mobileApi.deleteFile(fileToDelete.id);
    setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
    setFileToDelete(null);
  };

  // Filter & Search Logic
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.packageName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ISSUES_FOUND') {
      return file.status === 'ISSUES_FOUND';
    }
    if (activeFilter === 'SAFE') {
      return file.status === 'SAFE';
    }
    return true;
  });

  const issuesCount = files.filter((f) => f.status === 'ISSUES_FOUND').length;
  const safeCount = files.filter((f) => f.status === 'SAFE').length;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>Scanned APK Library</Text>
        <Text style={styles.subtitle}>
          {files.length} {files.length === 1 ? 'application' : 'applications'} stored in local memory
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by filename or package name..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
            All ({files.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'ISSUES_FOUND' && styles.filterChipActive]}
          onPress={() => setActiveFilter('ISSUES_FOUND')}
        >
          <View style={styles.filterChipWithDot}>
            <View style={[styles.chipDot, { backgroundColor: COLORS.critical }]} />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'ISSUES_FOUND' && styles.filterChipTextActive,
              ]}
            >
              Issues Found ({issuesCount})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'SAFE' && styles.filterChipActive]}
          onPress={() => setActiveFilter('SAFE')}
        >
          <View style={styles.filterChipWithDot}>
            <View style={[styles.chipDot, { backgroundColor: COLORS.success }]} />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'SAFE' && styles.filterChipTextActive,
              ]}
            >
              Safe ({safeCount})
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading APK library...</Text>
        </View>
      ) : filteredFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="folder-open-outline" size={32} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matching APK files' : 'No APKs analyzed yet'}
          </Text>
          <Text style={styles.emptyDesc}>
            {searchQuery
              ? 'Try modifying your search keywords or active filters.'
              : 'Upload and audit your first Android APK to start populating your security history.'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.emptyUploadBtn} onPress={onNavigateToUpload}>
              <Ionicons name="cloud-upload" size={16} color={COLORS.textDark} />
              <Text style={styles.emptyUploadText}>Upload APK</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FileCard
              file={item}
              onViewReport={onViewReport}
              onDelete={(file) => setFileToDelete(file)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        visible={!!fileToDelete}
        file={fileToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setFileToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    paddingVertical: 10,
  },
  clearBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.borderOrange,
  },
  filterChipWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.primaryLight,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  emptyUploadText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
});
