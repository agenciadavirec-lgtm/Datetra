export type DeviceType = 'windows' | 'android' | 'ios' | 'mac' | 'linux';

export type DeviceStatus = 'available' | 'pairing' | 'connected' | 'busy' | 'offline';

export type ConnectionMethod = 'wifi' | 'qr' | 'pin' | 'usb';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  osVersion: string;
  ip: string;
  port: number;
  status: DeviceStatus;
  connectionMethod: ConnectionMethod;
  batteryLevel?: number;
  storageAvailable?: string;
  avatarColor: string;
  isCurrentDevice?: boolean;
  signalStrength?: number; // 1-5
  lastSeen?: number;
}

export type FileCategory =
  | 'all'
  | 'photo'
  | 'video'
  | 'music'
  | 'document'
  | 'apk'
  | 'zip'
  | 'other'
  | 'folder';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  category: FileCategory;
  mimeType: string;
  extension: string;
  lastModified: number;
  dataUrl?: string;
  previewUrl?: string;
  isFolder?: boolean;
  folderChildrenCount?: number;
  selected?: boolean;
}

export type TransferStatus =
  | 'preparing'
  | 'connecting'
  | 'transferring'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error';

export interface TransferItem {
  id: string;
  fileId: string;
  name: string;
  size: number;
  category: FileCategory;
  sourceDevice: Device;
  targetDevice: Device;
  progress: number; // 0 to 100
  transferredBytes: number;
  speedBytesPerSec: number;
  timeRemainingSec: number;
  status: TransferStatus;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
  dataUrl?: string;
  chunkTotal?: number;
  chunkCurrent?: number;
}

export interface HistoryRecord {
  id: string;
  transferId: string;
  fileName: string;
  fileSize: number;
  fileCategory: FileCategory;
  direction: 'sent' | 'received';
  remoteDeviceName: string;
  remoteDeviceType: DeviceType;
  status: 'completed' | 'failed' | 'cancelled';
  timestamp: number;
  dataUrl?: string;
}

export type ClientViewMode = 'pc' | 'android' | 'ios' | 'split';

export interface AppSettings {
  deviceName: string;
  deviceType: DeviceType;
  defaultFolder: string;
  autoStart: boolean;
  autoDiscovery: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  speedLimitMbps: number; // 0 = unlimited
  autoAcceptPaired: boolean;
  allowUsbBridge: boolean;
  encryptionLevel: string;
}
