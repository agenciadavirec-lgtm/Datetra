import { FileCategory, FileItem } from '../types/databridge';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return '0 KB/s';
  if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  }
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '--';
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export function detectCategory(fileName: string, mimeType?: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg', 'bmp', 'dng', 'raw'].includes(ext)) {
    return 'photo';
  }
  if (['mp4', 'mov', 'mkv', 'avi', 'webm', 'wmv', 'flv', 'm4v'].includes(ext)) {
    return 'video';
  }
  if (['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'wma'].includes(ext)) {
    return 'music';
  }
  if (['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'csv', 'md'].includes(ext)) {
    return 'document';
  }
  if (['apk', 'xapk', 'apkm', 'aab'].includes(ext)) {
    return 'apk';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'zip';
  }
  return 'other';
}

export const INITIAL_SAMPLE_FILES: FileItem[] = [
  {
    id: 'f-photo-1',
    name: 'IMG_2026_Viagem_Rio.heic',
    size: 4.8 * 1024 * 1024,
    category: 'photo',
    mimeType: 'image/heic',
    extension: 'heic',
    lastModified: Date.now() - 1000 * 60 * 60 * 2,
    previewUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'f-photo-2',
    name: 'DSC_0984_Praia_Sunset.jpg',
    size: 8.2 * 1024 * 1024,
    category: 'photo',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    lastModified: Date.now() - 1000 * 60 * 60 * 5,
    previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'f-video-1',
    name: '4K_Drone_Video_Praia.mp4',
    size: 142.5 * 1024 * 1024,
    category: 'video',
    mimeType: 'video/mp4',
    extension: 'mp4',
    lastModified: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: 'f-music-1',
    name: 'Alok_Live_Set_2026.flac',
    size: 38.6 * 1024 * 1024,
    category: 'music',
    mimeType: 'audio/flac',
    extension: 'flac',
    lastModified: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 'f-doc-1',
    name: 'Contrato_Prestacao_Servicos_2026.pdf',
    size: 2.4 * 1024 * 1024,
    category: 'document',
    mimeType: 'application/pdf',
    extension: 'pdf',
    lastModified: Date.now() - 1000 * 60 * 60 * 8
  },
  {
    id: 'f-apk-1',
    name: 'DataBridge_Companion_v2.4.apk',
    size: 28.1 * 1024 * 1024,
    category: 'apk',
    mimeType: 'application/vnd.android.package-archive',
    extension: 'apk',
    lastModified: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'f-zip-1',
    name: 'Backup_WhatsApp_Fotos_2026.zip',
    size: 89.4 * 1024 * 1024,
    category: 'zip',
    mimeType: 'application/zip',
    extension: 'zip',
    lastModified: Date.now() - 1000 * 60 * 60 * 48
  },
  {
    id: 'f-folder-1',
    name: 'Projetos_Design_UI_2026',
    size: 215.0 * 1024 * 1024,
    category: 'folder',
    mimeType: 'application/x-directory',
    extension: 'folder',
    isFolder: true,
    folderChildrenCount: 34,
    lastModified: Date.now() - 1000 * 60 * 60 * 15
  }
];
