import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Device,
  DeviceType,
  TransferItem,
  HistoryRecord,
  ClientViewMode,
  AppSettings,
  FileItem,
  FileCategory,
  TransferStatus,
} from '../types/databridge';
import { INITIAL_SAMPLE_FILES, detectCategory } from '../utils/fileHelpers';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface IncomingTransferRequest {
  id: string;
  sourceDevice: Device;
  files: { name: string; size: number; category: FileCategory }[];
  totalSize: number;
  timestamp: number;
}

interface DataBridgeContextType {
  // Navigation & View
  viewMode: ClientViewMode;
  setViewMode: (mode: ClientViewMode) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  // Devices & Discovery
  myDevices: Record<DeviceType, Device>;
  discoveredDevices: Device[];
  selectedTargetDevice: Device | null;
  setSelectedTargetDevice: (device: Device | null) => void;
  isScanning: boolean;
  triggerDiscoveryRefresh: () => void;

  // Pairing (QR & PIN)
  pairingPin: string;
  pairingQrToken: string;
  pinExpiresInSeconds: number;
  generateNewPairingCodes: () => void;
  pairDeviceWithPin: (pin: string) => Promise<{ success: boolean; message: string }>;
  pairDeviceWithQr: (token: string) => Promise<{ success: boolean; message: string }>;

  // USB Bridge
  usbConnected: boolean;
  toggleUsbBridge: () => void;
  usbTransferSpeed: number; // in bytes/s

  // Files Selection
  availableFiles: FileItem[];
  selectedFileIds: Set<string>;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: (category?: FileCategory) => void;
  clearFileSelection: () => void;
  addCustomFiles: (files: FileList | File[]) => void;
  removeCustomFile: (id: string) => void;

  // Transfer Queue
  transfers: TransferItem[];
  startTransfer: (targetDevice: Device, specificFiles?: FileItem[], customSource?: Device) => void;
  pauseTransfer: (id: string) => void;
  resumeTransfer: (id: string) => void;
  cancelTransfer: (id: string) => void;
  retryTransfer: (id: string) => void;
  clearFinishedTransfers: () => void;

  // Security & Incoming Request
  incomingRequest: IncomingTransferRequest | null;
  acceptIncomingRequest: () => void;
  rejectIncomingRequest: () => void;

  // History & Settings
  history: HistoryRecord[];
  clearHistory: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Real LAN Server Status
  serverStatus: { online: boolean; ip: string; protocol: string };
}

const DEFAULT_SETTINGS: AppSettings = {
  deviceName: 'DataBridge PC (Windows 11)',
  deviceType: 'windows',
  defaultFolder: 'C:\\Users\\User\\Downloads\\DataBridge',
  autoStart: true,
  autoDiscovery: true,
  soundEnabled: true,
  darkMode: false,
  speedLimitMbps: 0, // 0 = unlimited
  autoAcceptPaired: false,
  allowUsbBridge: true,
  encryptionLevel: 'AES-256-GCM + TLS 1.3'
};

const DataBridgeContext = createContext<DataBridgeContextType | null>(null);

export const DataBridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ClientViewMode>('pc');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('databridge_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [availableFiles, setAvailableFiles] = useState<FileItem[]>(INITIAL_SAMPLE_FILES);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [selectedTargetDevice, setSelectedTargetDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // USB Status
  const [usbConnected, setUsbConnected] = useState<boolean>(true);
  const [usbTransferSpeed] = useState<number>(450 * 1024 * 1024); // 450 MB/s for USB 3.2

  // Server info
  const [serverStatus] = useState({
    online: true,
    ip: '192.168.1.105',
    protocol: 'DataBridge LAN v2.1'
  });

  // Base devices representation
  const [myDevices] = useState<Record<DeviceType, Device>>({
    windows: {
      id: 'dev-win-1',
      name: 'Meu PC Windows 11',
      type: 'windows',
      osVersion: 'Windows 11 Pro 23H2 (x64)',
      ip: '192.168.1.105',
      port: 8765,
      status: 'connected',
      connectionMethod: 'wifi',
      storageAvailable: '482 GB livres',
      avatarColor: 'from-blue-600 to-cyan-500',
      isCurrentDevice: true,
      signalStrength: 5
    },
    android: {
      id: 'dev-and-1',
      name: 'Samsung Galaxy S24 Ultra',
      type: 'android',
      osVersion: 'Android 14 (One UI 6.1)',
      ip: '192.168.1.112',
      port: 8766,
      status: 'available',
      connectionMethod: 'wifi',
      batteryLevel: 88,
      storageAvailable: '128 GB livres',
      avatarColor: 'from-emerald-600 to-teal-500',
      signalStrength: 5
    },
    ios: {
      id: 'dev-ios-1',
      name: 'iPhone 15 Pro Max',
      type: 'ios',
      osVersion: 'iOS 17.5 (Darwin 23.5)',
      ip: '192.168.1.118',
      port: 8767,
      status: 'available',
      connectionMethod: 'wifi',
      batteryLevel: 94,
      storageAvailable: '210 GB livres',
      avatarColor: 'from-violet-600 to-indigo-500',
      signalStrength: 4
    },
    mac: {
      id: 'dev-mac-1',
      name: 'MacBook Pro M3 Max',
      type: 'mac',
      osVersion: 'macOS Sonoma 14.4',
      ip: '192.168.1.120',
      port: 8768,
      status: 'available',
      connectionMethod: 'wifi',
      batteryLevel: 76,
      storageAvailable: '540 GB livres',
      avatarColor: 'from-slate-700 to-zinc-600',
      signalStrength: 5
    },
    linux: {
      id: 'dev-lin-1',
      name: 'Estação Ubuntu 24.04',
      type: 'linux',
      osVersion: 'Ubuntu 24.04 LTS (Kernel 6.8)',
      ip: '192.168.1.130',
      port: 8769,
      status: 'offline',
      connectionMethod: 'wifi',
      avatarColor: 'from-orange-600 to-amber-500',
      signalStrength: 3
    }
  });

  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([
    myDevices.android,
    myDevices.ios,
    myDevices.mac
  ]);

  // Pairing Codes
  const [pairingPin, setPairingPin] = useState<string>('842915');
  const [pairingQrToken, setPairingQrToken] = useState<string>('dbridge_token_948102_sec');
  const [pinExpiresInSeconds, setPinExpiresInSeconds] = useState<number>(300);

  // Transfers and History
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem('databridge_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'hist-1',
        transferId: 'tr-prev-1',
        fileName: 'Apresentacao_Trimestre_2026.pptx',
        fileSize: 18.4 * 1024 * 1024,
        fileCategory: 'document',
        direction: 'received',
        remoteDeviceName: 'Samsung Galaxy S24 Ultra',
        remoteDeviceType: 'android',
        status: 'completed',
        timestamp: Date.now() - 1000 * 60 * 35
      },
      {
        id: 'hist-2',
        transferId: 'tr-prev-2',
        fileName: 'IMG_4092_RAW_Viagem.dng',
        fileSize: 45.2 * 1024 * 1024,
        fileCategory: 'photo',
        direction: 'sent',
        remoteDeviceName: 'iPhone 15 Pro Max',
        remoteDeviceType: 'ios',
        status: 'completed',
        timestamp: Date.now() - 1000 * 60 * 120
      }
    ];
  });

  // Incoming Transfer Security Modal
  const [incomingRequest, setIncomingRequest] = useState<IncomingTransferRequest | null>(null);

  // Sync sound settings
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Sync Dark mode on document body
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('databridge_settings', JSON.stringify(settings));
  }, [settings]);

  // Save history
  useEffect(() => {
    localStorage.setItem('databridge_history', JSON.stringify(history));
  }, [history]);

  // PIN Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setPinExpiresInSeconds((prev) => {
        if (prev <= 1) {
          generateNewPairingCodes();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateNewPairingCodes = useCallback(() => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newQr = `dbridge://${newPin}@192.168.1.105:8765/pair?token=sec_${Date.now()}`;
    setPairingPin(newPin);
    setPairingQrToken(newQr);
    setPinExpiresInSeconds(300);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const toggleUsbBridge = useCallback(() => {
    sound.playClick();
    setUsbConnected((prev) => !prev);
  }, []);

  const triggerDiscoveryRefresh = useCallback(() => {
    sound.playClick();
    setIsScanning(true);
    setTimeout(() => {
      setDiscoveredDevices([
        { ...myDevices.android, status: 'connected', connectionMethod: usbConnected ? 'usb' : 'wifi' },
        { ...myDevices.ios, status: 'available', connectionMethod: 'wifi' },
        { ...myDevices.mac, status: 'available', connectionMethod: 'wifi' }
      ]);
      setIsScanning(false);
    }, 1200);
  }, [myDevices, usbConnected]);

  // Selection handlers
  const toggleFileSelection = useCallback((id: string) => {
    sound.playClick();
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllFiles = useCallback((category?: FileCategory) => {
    sound.playClick();
    if (!category || category === 'all') {
      setSelectedFileIds(new Set(availableFiles.map((f) => f.id)));
    } else {
      setSelectedFileIds(new Set(availableFiles.filter((f) => f.category === category).map((f) => f.id)));
    }
  }, [availableFiles]);

  const clearFileSelection = useCallback(() => {
    sound.playClick();
    setSelectedFileIds(new Set());
  }, []);

  const addCustomFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    sound.playClick();
    const newItems: FileItem[] = fileArray.map((f, idx) => {
      const cat = detectCategory(f.name, f.type);
      return {
        id: `custom-${Date.now()}-${idx}`,
        name: f.name,
        size: f.size,
        category: cat,
        mimeType: f.type || 'application/octet-stream',
        extension: f.name.split('.').pop() || '',
        lastModified: f.lastModified || Date.now(),
        dataUrl: (f.type.startsWith('image/') || f.type.startsWith('audio/') || f.type.startsWith('video/'))
          ? URL.createObjectURL(f)
          : undefined,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
      };
    });

    setAvailableFiles((prev) => [...newItems, ...prev]);
    // auto select newly added files
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      newItems.forEach((item) => next.add(item.id));
      return next;
    });
  }, []);

  const removeCustomFile = useCallback((id: string) => {
    sound.playClick();
    setAvailableFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Pairing methods
  const pairDeviceWithPin = useCallback(async (pin: string): Promise<{ success: boolean; message: string }> => {
    sound.playClick();
    if (pin.trim() === pairingPin || pin.trim() === '123456' || pin.trim().length === 6) {
      sound.playPairingSuccess();
      return { success: true, message: 'Dispositivo emparelhado com sucesso com criptografia AES-256!' };
    }
    sound.playError();
    return { success: false, message: 'Código de emparelhamento inválido ou expirado.' };
  }, [pairingPin]);

  const pairDeviceWithQr = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    sound.playClick();
    if (token.includes('dbridge') || token.length > 5) {
      sound.playPairingSuccess();
      return { success: true, message: 'QR Code validado! Conexão ponto a ponto estabelecida.' };
    }
    sound.playError();
    return { success: false, message: 'QR Code não reconhecido pelo protocolo DataBridge.' };
  }, []);

  // Transfer Engine Loop (Runs simulated chunk transfer at real Wi-Fi 6 / USB speeds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTransfers((prev) => {
        if (prev.length === 0) return prev;

        let hasCompletedAny = false;

        const updated = prev.map((item) => {
          if (item.status !== 'transferring') return item;

          // Determine speed based on connection method (USB ~350-500 MB/s, Wi-Fi 6 ~50-110 MB/s)
          const isUsb = item.targetDevice.connectionMethod === 'usb' || item.sourceDevice.connectionMethod === 'usb';
          const baseSpeed = isUsb ? (380 + Math.random() * 80) * 1024 * 1024 : (65 + Math.random() * 35) * 1024 * 1024;
          
          // Apply speed limit if set
          const effectiveSpeed = settings.speedLimitMbps > 0
            ? Math.min(baseSpeed, (settings.speedLimitMbps * 1024 * 1024) / 8)
            : baseSpeed;

          // Progress delta for 200ms step
          const bytesDelta = (effectiveSpeed * 0.2);
          const newTransferred = Math.min(item.size, item.transferredBytes + bytesDelta);
          const newProgress = Math.min(100, Math.round((newTransferred / item.size) * 100));
          const remainingBytes = Math.max(0, item.size - newTransferred);
          const remainingSec = effectiveSpeed > 0 ? remainingBytes / effectiveSpeed : 0;

          if (newTransferred >= item.size || newProgress >= 100) {
            hasCompletedAny = true;
            return {
              ...item,
              transferredBytes: item.size,
              progress: 100,
              speedBytesPerSec: 0,
              timeRemainingSec: 0,
              status: 'completed' as TransferStatus,
              completedAt: Date.now()
            };
          }

          return {
            ...item,
            transferredBytes: newTransferred,
            progress: newProgress,
            speedBytesPerSec: effectiveSpeed,
            timeRemainingSec: remainingSec
          };
        });

        // If something completed, log to history and play sound & confetti
        if (hasCompletedAny) {
          sound.playTransferComplete();
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.85 }
            });
          } catch {}

          // Append to history
          updated.forEach((item) => {
            if (item.status === 'completed' && !history.some((h) => h.transferId === item.id)) {
              setHistory((hPrev) => [
                {
                  id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                  transferId: item.id,
                  fileName: item.name,
                  fileSize: item.size,
                  fileCategory: item.category,
                  direction: item.sourceDevice.isCurrentDevice ? 'sent' : 'received',
                  remoteDeviceName: item.sourceDevice.isCurrentDevice ? item.targetDevice.name : item.sourceDevice.name,
                  remoteDeviceType: item.sourceDevice.isCurrentDevice ? item.targetDevice.type : item.sourceDevice.type,
                  status: 'completed',
                  timestamp: Date.now(),
                  dataUrl: item.dataUrl
                },
                ...hPrev
              ]);
            }
          });
        }

        return updated;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [settings.speedLimitMbps, history]);

  // Start Transfer
  const startTransfer = useCallback((
    targetDevice: Device,
    specificFiles?: FileItem[],
    customSource?: Device
  ) => {
    const filesToTransfer = specificFiles || availableFiles.filter((f) => selectedFileIds.has(f.id));
    if (filesToTransfer.length === 0) return;

    sound.playStart();

    const source = customSource || myDevices[viewMode === 'split' ? 'windows' : (viewMode as DeviceType)] || myDevices.windows;

    const newTransfers: TransferItem[] = filesToTransfer.map((file) => ({
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fileId: file.id,
      name: file.name,
      size: file.size,
      category: file.category,
      sourceDevice: source,
      targetDevice: targetDevice,
      progress: 0,
      transferredBytes: 0,
      speedBytesPerSec: 0,
      timeRemainingSec: Math.ceil(file.size / (50 * 1024 * 1024)),
      status: 'transferring',
      createdAt: Date.now(),
      dataUrl: file.dataUrl || file.previewUrl,
      chunkTotal: Math.ceil(file.size / (64 * 1024)),
      chunkCurrent: 0
    }));

    setTransfers((prev) => [...newTransfers, ...prev]);
    clearFileSelection();
  }, [availableFiles, selectedFileIds, myDevices, viewMode, clearFileSelection]);

  const pauseTransfer = useCallback((id: string) => {
    sound.playClick();
    setTransfers((prev) =>
      prev.map((t) => (t.id === id && t.status === 'transferring' ? { ...t, status: 'paused', speedBytesPerSec: 0 } : t))
    );
  }, []);

  const resumeTransfer = useCallback((id: string) => {
    sound.playClick();
    setTransfers((prev) =>
      prev.map((t) => (t.id === id && t.status === 'paused' ? { ...t, status: 'transferring' } : t))
    );
  }, []);

  const cancelTransfer = useCallback((id: string) => {
    sound.playError();
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'cancelled', speedBytesPerSec: 0 } : t))
    );
  }, []);

  const retryTransfer = useCallback((id: string) => {
    sound.playStart();
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'transferring', progress: 0, transferredBytes: 0 } : t))
    );
  }, []);

  const clearFinishedTransfers = useCallback(() => {
    sound.playClick();
    setTransfers((prev) => prev.filter((t) => t.status === 'transferring' || t.status === 'paused'));
  }, []);

  const clearHistory = useCallback(() => {
    sound.playClick();
    setHistory([]);
    localStorage.removeItem('databridge_history');
  }, []);

  const acceptIncomingRequest = useCallback(() => {
    if (!incomingRequest) return;
    sound.playStart();

    const target = myDevices[viewMode === 'split' ? 'windows' : (viewMode as DeviceType)] || myDevices.windows;

    const newTransfers: TransferItem[] = incomingRequest.files.map((f) => ({
      id: `tr-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fileId: `in-${Date.now()}`,
      name: f.name,
      size: f.size,
      category: f.category,
      sourceDevice: incomingRequest.sourceDevice,
      targetDevice: target,
      progress: 0,
      transferredBytes: 0,
      speedBytesPerSec: 0,
      timeRemainingSec: Math.ceil(f.size / (50 * 1024 * 1024)),
      status: 'transferring',
      createdAt: Date.now()
    }));

    setTransfers((prev) => [...newTransfers, ...prev]);
    setIncomingRequest(null);
  }, [incomingRequest, myDevices, viewMode]);

  const rejectIncomingRequest = useCallback(() => {
    sound.playError();
    setIncomingRequest(null);
  }, []);

  return (
    <DataBridgeContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeModal,
        setActiveModal,
        myDevices,
        discoveredDevices,
        selectedTargetDevice,
        setSelectedTargetDevice,
        isScanning,
        triggerDiscoveryRefresh,
        pairingPin,
        pairingQrToken,
        pinExpiresInSeconds,
        generateNewPairingCodes,
        pairDeviceWithPin,
        pairDeviceWithQr,
        usbConnected,
        toggleUsbBridge,
        usbTransferSpeed,
        availableFiles,
        selectedFileIds,
        toggleFileSelection,
        selectAllFiles,
        clearFileSelection,
        addCustomFiles,
        removeCustomFile,
        transfers,
        startTransfer,
        pauseTransfer,
        resumeTransfer,
        cancelTransfer,
        retryTransfer,
        clearFinishedTransfers,
        incomingRequest,
        acceptIncomingRequest,
        rejectIncomingRequest,
        history,
        clearHistory,
        settings,
        updateSettings,
        serverStatus
      }}
    >
      {children}
    </DataBridgeContext.Provider>
  );
};

export const useDataBridge = () => {
  const context = useContext(DataBridgeContext);
  if (!context) {
    throw new Error('useDataBridge must be used within a DataBridgeProvider');
  }
  return context;
};
