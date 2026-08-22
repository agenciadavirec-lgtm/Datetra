import React, { useRef, useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes, formatSpeed } from '../../utils/fileHelpers';
import {
  Monitor,
  Smartphone,
  Apple,
  UploadCloud,
  FolderOpen,
  FilePlus,
  QrCode,
  KeyRound,
  RefreshCw,
  Cable,
  ShieldCheck,
  Send,
  Download,
  Zap,
  CheckCircle2,
  Clock,
  Settings,
  History,
  Layers,
  HardDrive,
  Wifi,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { SendQrIcon, ReceiveQrIcon, TransferQrIcon } from '../common/QrBadgedIcons';
import { Device, DeviceType, FileCategory } from '../../types/databridge';

export const WindowsClient: React.FC = () => {
  const {
    discoveredDevices,
    isScanning,
    triggerDiscoveryRefresh,
    setActiveModal,
    availableFiles,
    selectedFileIds,
    toggleFileSelection,
    clearFileSelection,
    addCustomFiles,
    removeCustomFile,
    transfers,
    startTransfer,
    usbConnected,
    toggleUsbBridge,
    settings,
    myDevices
  } = useDataBridge();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');

  const selectedFilesList = availableFiles.filter((f) => selectedFileIds.has(f.id));
  const totalSelectedBytes = selectedFilesList.reduce((acc, f) => acc + f.size, 0);

  const activeTransfers = transfers.filter((t) => t.status === 'transferring');
  const recentCompleted = transfers.filter((t) => t.status === 'completed').slice(0, 3);

  const filteredFiles = activeCategory === 'all'
    ? availableFiles
    : availableFiles.filter((f) => f.category === activeCategory);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addCustomFiles(e.dataTransfer.files);
    }
  };

  const handleSendToDevice = (targetDevice: Device) => {
    if (selectedFilesList.length === 0) {
      const defaultFiles = availableFiles.slice(0, 2);
      startTransfer(targetDevice, defaultFiles, myDevices.windows);
    } else {
      startTransfer(targetDevice, selectedFilesList, myDevices.windows);
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'android':
        return <Smartphone className="w-5 h-5 text-emerald-500" />;
      case 'ios':
        return <Apple className="w-5 h-5 text-purple-500" />;
      default:
        return <Monitor className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Windows 11 Fluent App Header */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                DataBridge Transfer
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Windows Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Transferência direta PC ↔ Android ↔ iOS com emparelhamento por QR Code
            </p>
          </div>
        </div>

        {/* Quick Toolbar with QR Send / Receive buttons */}
        <div className="flex items-center gap-2">
          {/* Send with QR */}
          <button
            onClick={() => setActiveModal('qr-send')}
            className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
            title="Gerar QR Code de Envio"
          >
            <SendQrIcon size="sm" />
            <span>Enviar (QR)</span>
          </button>

          {/* Receive with QR */}
          <button
            onClick={() => setActiveModal('qr-receive')}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition active:scale-95"
            title="Abrir tela de Receber via QR Code"
          >
            <ReceiveQrIcon size="sm" />
            <span>Receber (QR)</span>
          </button>

          <button
            onClick={() => setActiveModal('pin')}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Código PIN
          </button>

          <button
            onClick={() => setActiveModal('queue')}
            className="relative px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center gap-1.5 transition"
          >
            <Layers className="w-4 h-4 text-blue-500" />
            Fila
            {activeTransfers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />

          <button
            onClick={() => setActiveModal('history')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            title="Histórico"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('settings')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drag & Drop Area, File Selector, Active Transfer Status (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Central Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addCustomFiles(e.target.files)}
            />
            <input
              type="file"
              ref={(el) => {
                folderInputRef.current = el;
                if (el) {
                  el.setAttribute('webkitdirectory', '');
                  el.setAttribute('directory', '');
                }
              }}
              className="hidden"
              onChange={(e) => e.target.files && addCustomFiles(e.target.files)}
            />

            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Arraste arquivos ou pastas para transferir
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
                Fotos, vídeos, músicas, APKs, PDFs, pastas completas ou arquivos de qualquer tamanho
              </p>

              {/* Action Buttons in Dropzone with QR Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  Selecionar arquivos
                </button>

                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  Selecionar pasta
                </button>

                <button
                  onClick={() => setActiveModal('qr-send')}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <SendQrIcon size="sm" />
                  Gerar QR de Envio
                </button>

                <button
                  onClick={() => setActiveModal('qr-receive')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <ReceiveQrIcon size="sm" />
                  Receber via QR
                </button>
              </div>
            </div>

            {/* Selected Files Badge Bar */}
            {selectedFilesList.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {selectedFilesList.length} arquivo(s) selecionado(s)
                  </span>
                  <span>•</span>
                  <span>{formatBytes(totalSelectedBytes)}</span>
                </div>
                <button
                  onClick={clearFileSelection}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Desmarcar todos
                </button>
              </div>
            )}
          </div>

          {/* Local Files Library Browser */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Arquivos Prontos para Compartilhamento
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Selecione os arquivos para enviar via QR Code ou rede local
                </p>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
                {(['all', 'photo', 'video', 'document', 'apk', 'zip'] as FileCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition text-[11px] font-medium ${
                      activeCategory === cat
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat === 'photo' ? 'Fotos' : cat === 'video' ? 'Vídeos' : cat === 'document' ? 'Docs' : cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredFiles.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                    </div>

                    {file.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomFile(file.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 text-xs p-1"
                        title="Remover"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Discovered Devices, USB Bridge Card, Active Transfer Widget (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Discovered Devices Section */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-500" />
                  Dispositivos Encontrados na Rede
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Clique para enviar diretamente via P2P
                </p>
              </div>

              <button
                onClick={triggerDiscoveryRefresh}
                disabled={isScanning}
                className="p-2 text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
                title="Escanear rede novamente"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Devices List with QR Badged Send Buttons */}
            <div className="space-y-3">
              {discoveredDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 hover:border-blue-400 dark:hover:border-blue-600 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-white dark:bg-zinc-700 rounded-xl border border-slate-200 dark:border-zinc-600 shadow-xs flex-shrink-0">
                      {getDeviceIcon(dev.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {dev.name}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        <span>{dev.ip}</span>
                        <span>•</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {dev.connectionMethod === 'usb' ? 'Cabo USB (480 MB/s)' : 'Wi-Fi 6'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleSendToDevice(dev)}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <SendQrIcon size="sm" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* USB Cable Communication Bridge Card */}
          <div className="bg-gradient-to-br from-slate-900 to-zinc-900 text-white rounded-3xl p-5 space-y-3 shadow-md border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cable className="w-4 h-4 text-cyan-400" />
                <h4 className="font-semibold text-xs text-zinc-100">
                  Comunicação Direta via Cabo USB
                </h4>
              </div>
              <button
                onClick={toggleUsbBridge}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  usbConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {usbConnected ? 'USB Conectado' : 'Conectar USB'}
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {usbConnected
                ? 'Canal USB 3.2 de altíssima velocidade ativo. Taxa média de 450 MB/s sem sobrecarregar o roteador.'
                : 'Conecte o smartphone ao PC via cabo USB para transferências ultra-rápidas sem fio.'}
            </p>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
              <span>Driver: <strong>Native Win32 ADB/CDC</strong></span>
              <span className="text-cyan-400 font-mono">Zero Cloud</span>
            </div>
          </div>

          {/* Quick Active Transfer Widget */}
          {activeTransfers.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-3xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                  Transferência em Execução ({activeTransfers[0].progress}%)
                </span>
                <span className="font-mono text-blue-700 dark:text-blue-300">
                  {formatSpeed(activeTransfers[0].speedBytesPerSec)}
                </span>
              </div>

              <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-200"
                  style={{ width: `${activeTransfers[0].progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300">
                <span className="truncate max-w-[200px]">{activeTransfers[0].name}</span>
                <span>Restam ~{activeTransfers[0].timeRemainingSec}s</span>
              </div>
            </div>
          )}

          {/* System Service Specs Footnote */}
          <div className="p-3.5 bg-slate-100/80 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Serviço DataBridge Windows Local: <strong>Online (Porta 8765)</strong></span>
            </div>
            <button
              onClick={() => setActiveModal('archDocs')}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              Protocolo <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
