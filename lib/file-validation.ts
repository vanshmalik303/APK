export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
export const ALLOWED_EXTENSIONS = ['.apk'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formattedSize?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function validateAPKFile(file: File): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'Please select an Android APK file to continue.',
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file format "${file.name}". Only Android application packages (.apk) are supported.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed upload limit of 200 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected APK file appears to be empty (0 bytes). Please choose a valid package.',
    };
  }

  return {
    isValid: true,
    formattedSize: formatFileSize(file.size),
  };
}
