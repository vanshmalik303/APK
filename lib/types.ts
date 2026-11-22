export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type ScanStatus = 'SAFE' | 'ISSUES_FOUND' | 'PENDING' | 'SCANNING' | 'FAILED';

export interface Finding {
  id: string;
  title: string;
  severity: SeverityLevel;
  category: 'Manifest & Permissions' | 'Cryptography' | 'Network Security' | 'Storage & Privacy' | 'Component Exposure' | 'Code Quality';
  shortExplanation: string;
  evidence: string;
  affectedComponent: string;
  whyItMatters: string;
  recommendedFix: string;
  isHeuristic: boolean; // Confirmed observation vs heuristic detection
  cwe?: string;
}

export interface RiskScoreBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface RiskScore {
  score: number; // 0 - 100 (0 is safest, 100 is most critical risk)
  level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  methodology: string;
  breakdown: RiskScoreBreakdown;
}

export interface SecurityReport {
  id: string;
  apkId: string;
  fileName: string;
  fileSizeBytes: number;
  formattedSize: string;
  packageName: string;
  versionName: string;
  versionCode: string;
  minSdkVersion: number;
  targetSdkVersion: number;
  sha256: string;
  scanDate: string;
  status: ScanStatus;
  riskScore: RiskScore;
  findings: Finding[];
  permissions: {
    name: string;
    description: string;
    isDangerous: boolean;
  }[];
  summary: {
    totalFindings: number;
    confirmedFindings: number;
    heuristicDetections: number;
  };
}

export interface APKRecord {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  formattedSize: string;
  uploadDate: string;
  lastScanDate: string;
  status: ScanStatus;
  findingsCount: number;
  packageName: string;
  reportId: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  joinedDate: string;
  avatarUrl?: string;
  apiAccessEnabled: boolean;
  autoScanHeuristics: boolean;
  notificationsEnabled: boolean;
  defaultExportFormat: 'PDF' | 'JSON';
}

export type ScanStageIndex = 0 | 1 | 2 | 3 | 4 | 5;

export interface ScanStage {
  id: number;
  label: string;
  description: string;
}
