import { APKRecord, SecurityReport, UserProfile } from './types';
import { INITIAL_FILES, INITIAL_USER_PROFILE, MOCK_REPORTS } from './mock-data';
import { formatFileSize } from './file-validation';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// LocalStorage Keys for persistent client-side store when backend is not connected
const STORAGE_FILES_KEY = 'apkguard_files';
const STORAGE_REPORTS_KEY = 'apkguard_reports';
const STORAGE_PROFILE_KEY = 'apkguard_profile';

// Helper to access LocalStorage safely in Next.js
function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getStoredFiles(): APKRecord[] {
  if (!isClient()) return INITIAL_FILES;
  try {
    const raw = localStorage.getItem(STORAGE_FILES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(INITIAL_FILES));
      return INITIAL_FILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FILES;
  }
}

function saveStoredFiles(files: APKRecord[]) {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save files to localStorage', e);
  }
}

function getStoredReports(): Record<string, SecurityReport> {
  if (!isClient()) return MOCK_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(MOCK_REPORTS));
      return MOCK_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_REPORTS;
  }
}

function saveStoredReports(reports: Record<string, SecurityReport>) {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save reports to localStorage', e);
  }
}

export const api = {
  // Check if real backend is configured
  isBackendConfigured(): boolean {
    return !!BACKEND_API_URL;
  },

  // 1. Get user's uploaded files
  async getFiles(): Promise<APKRecord[]> {
    if (BACKEND_API_URL) {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/files`);
        if (!res.ok) throw new Error('Failed to fetch files from backend');
        return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to local store:', err);
      }
    }
    return getStoredFiles();
  },

  // 2. Delete uploaded APK
  async deleteFile(apkId: string): Promise<boolean> {
    if (BACKEND_API_URL) {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/files/${apkId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Backend failed to delete file');
      } catch (err) {
        console.warn('Backend unavailable for deletion, falling back to local store:', err);
      }
    }

    const files = getStoredFiles();
    const target = files.find((f) => f.id === apkId);
    const updated = files.filter((f) => f.id !== apkId);
    saveStoredFiles(updated);

    if (target?.reportId) {
      const reports = getStoredReports();
      delete reports[target.reportId];
      saveStoredReports(reports);
    }
    return true;
  },

  // 3. Get Security Report by Report ID
  async getReport(reportId: string): Promise<SecurityReport | null> {
    if (BACKEND_API_URL) {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/reports/${reportId}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable for report retrieval:', err);
      }
    }

    const reports = getStoredReports();
    return reports[reportId] || null;
  },

  // 4. Upload APK file with progress notification
  async uploadAPK(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ fileId: string; fileName: string; sizeBytes: number }> {
    if (BACKEND_API_URL) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BACKEND_API_URL}/api/upload`);
        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        const formData = new FormData();
        formData.append('apk_file', file);
        xhr.send(formData);
      });
    }

    // Client-side simulation of upload stream if backend not connected
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          if (onProgress) onProgress(100);

          const fileId = `apk-${Date.now().toString(36)}`;
          resolve({
            fileId,
            fileName: file.name,
            sizeBytes: file.size,
          });
        } else {
          if (onProgress) onProgress(progress);
        }
      }, 150);
    });
  },

  // 5. Start scan & poll stages
  async startScan(
    fileId: string,
    fileName: string,
    fileSize: number,
    onStageUpdate?: (stageIndex: number, logMessage: string) => void
  ): Promise<SecurityReport> {
    if (BACKEND_API_URL) {
      const res = await fetch(`${BACKEND_API_URL}/api/scan/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error('Failed to start scan on backend');
      return await res.json();
    }

    // Step-by-step security pipeline simulation
    const stages = [
      'Extracting APK archive and parsing ZIP directory...',
      'Decompiling AndroidManifest.xml and evaluating component flags...',
      'Inspecting requested permissions and protection levels...',
      'Disassembling DEX bytecode & analyzing abstract syntax trees...',
      'Cross-referencing security rules & detecting vulnerabilities...',
      'Compiling final security score and synthesizing audit report...',
    ];

    for (let i = 0; i < stages.length; i++) {
      if (onStageUpdate) {
        onStageUpdate(i, stages[i]);
      }
      await new Promise((r) => setTimeout(r, 800));
    }

    // Generate dynamic report for the newly uploaded file
    const reportId = `rep-${Date.now().toString(36)}`;
    const pkgName = `com.${fileName.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`;

    const newReport: SecurityReport = {
      id: reportId,
      apkId: fileId,
      fileName,
      fileSizeBytes: fileSize,
      formattedSize: formatFileSize(fileSize),
      packageName: pkgName,
      versionName: '1.0.0',
      versionCode: '1',
      minSdkVersion: 26,
      targetSdkVersion: 34,
      sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      scanDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' UTC',
      status: 'ISSUES_FOUND',
      riskScore: {
        score: 62,
        level: 'MEDIUM',
        methodology:
          'Calculated using CVSS-weighted penalty metric across decompiled static analysis rules: High (-15 pts), Medium (-8 pts), Low (-2 pts).',
        breakdown: {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
          informational: 2,
        },
      },
      permissions: [
        { name: 'android.permission.INTERNET', description: 'Network communication', isDangerous: false },
        { name: 'android.permission.ACCESS_NETWORK_STATE', description: 'Access connection state', isDangerous: false },
        { name: 'android.permission.READ_EXTERNAL_STORAGE', description: 'Read media storage', isDangerous: true },
        { name: 'android.permission.WAKE_LOCK', description: 'Prevent screen timeout', isDangerous: false },
      ],
      summary: {
        totalFindings: 8,
        confirmedFindings: 5,
        heuristicDetections: 3,
      },
      findings: [
        {
          id: `find-dyn-1`,
          title: 'Exported BroadcastReceiver Without Restrictive Permission',
          severity: 'HIGH',
          category: 'Component Exposure',
          shortExplanation: 'BroadcastReceiver is declared with android:exported="true" without an explicit permission barrier.',
          evidence: '<receiver android:name=".receivers.AlarmReceiver" android:exported="true" />',
          affectedComponent: 'AndroidManifest.xml',
          whyItMatters:
            'Any external rogue app can trigger internal alarm routines or manipulate application background state.',
          recommendedFix:
            'Set android:exported="false" or require a signature-level permission to protect incoming broadcasts.',
          isHeuristic: false,
          cwe: 'CWE-926',
        },
        {
          id: `find-dyn-2`,
          title: 'Cleartext HTTP Traffic Permitted on Specific Subdomains',
          severity: 'MEDIUM',
          category: 'Network Security',
          shortExplanation: 'Network security configuration allows non-HTTPS transmission to staging servers.',
          evidence: '<domain includeSubdomains="true" cleartextTrafficPermitted="true">staging.api.host.com</domain>',
          affectedComponent: 'res/xml/network_security_config.xml',
          whyItMatters: 'Cleartext network communication is susceptible to eavesdropping and data tampering.',
          recommendedFix: 'Disable cleartext traffic and use valid TLS certificates across all environments.',
          isHeuristic: false,
          cwe: 'CWE-319',
        },
        {
          id: `find-dyn-3`,
          title: 'Hardcoded Encryption Key / Salt Candidate Detected',
          severity: 'MEDIUM',
          category: 'Cryptography',
          shortExplanation: 'Static byte array matching standard AES key lengths identified in decompiled constants.',
          evidence: 'private static final byte[] KEY_SALT = { 0x4f, 0x12, 0x9a, 0x33, ... };',
          affectedComponent: 'com.util.SecurityHelper.java',
          whyItMatters: 'Fixed cryptographic salts negate password hashing and encryption strength.',
          recommendedFix: 'Generate random salts per credential and utilize Android Keystore for key material.',
          isHeuristic: true,
          cwe: 'CWE-321',
        },
        {
          id: `find-dyn-4`,
          title: 'Potential Tapjacking Vulnerability via Missing FilterTouches',
          severity: 'LOW',
          category: 'Component Exposure',
          shortExplanation: 'Views do not specify android:filterTouchesWhenObscured="true".',
          evidence: '<FrameLayout android:id="@+id/auth_container" ...>',
          affectedComponent: 'res/layout/activity_auth.xml',
          whyItMatters: 'Overlays could deceive users into clicking sensitive authorization buttons.',
          recommendedFix: 'Add android:filterTouchesWhenObscured="true" to interactive button layouts.',
          isHeuristic: true,
          cwe: 'CWE-1021',
        },
      ],
    };

    // Store report
    const currentReports = getStoredReports();
    currentReports[reportId] = newReport;
    saveStoredReports(currentReports);

    // Save record to files library
    const currentFiles = getStoredFiles();
    const newRecord: APKRecord = {
      id: fileId,
      fileName,
      fileSizeBytes: fileSize,
      formattedSize: formatFileSize(fileSize),
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastScanDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'ISSUES_FOUND',
      findingsCount: newReport.findings.length,
      packageName: pkgName,
      reportId,
    };
    currentFiles.unshift(newRecord);
    saveStoredFiles(currentFiles);

    return newReport;
  },

  // 6. User Profile Management
  getUserProfile(): UserProfile {
    if (!isClient()) return INITIAL_USER_PROFILE;
    try {
      const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  },

  updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update user profile in localStorage', e);
      }
    }
    return updated;
  },

  // 7. Export JSON Report
  exportReportJSON(report: SecurityReport) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.fileName.replace('.apk', '')}-security-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
