import React, { useRef, useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes, formatSpeed, formatTime } from '../../utils/fileHelpers';
import {
  Smartphone,
  Send,
  Download,
  QrCode,
  KeyRound,
  History,
  FolderOpen,
  Image,
  Film,
  Music,
  FileText,
  Package,
  FolderArchive,
  MoreVertical,
  CheckCircle2,
  Zap,
  Clock,
  Layers,
  Sparkles,
  Wifi,
  Battery,
  HardDrive
} from 'lucide-react';
import { SendQrIcon, ReceiveQrIcon, TransferQrIcon } from '../common/QrBadgedIcons';
import { FileCategory, Device, DeviceType } from '../../types/databridge';

export const AndroidClient: React.FC = () => {
  const {
    availableFiles,
    selectedFileIds,
    toggleFileSelection,
    selectAllFiles,
    clearFileSelection,
    addCustomFiles,
    discoveredDevices,
    startTransfer,
    transfers,
    setActiveModal,
    myDevices
  } = useDataBridge();

  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(discoveredDevices[0] || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories = [
    { id: 'all', label: 'Todos', icon: Layers, count: availableFiles.length },
    { id: 'photo', label: 'Fotos', icon: Image, count: availableFiles.filter((f) => f.category === 'photo').length },
    { id: 'video', label: 'Vídeos', icon: Film, count: availableFiles.filter((f) => f.category === 'video').length },
    { id: 'music', label: 'Música', icon: Music, count: availableFiles.filter((f) => f.category === 'music').length },
    { id: 'document', label: 'Documentos', icon: FileText, count: availableFiles.filter((f) => f.category === 'document').length },
    { id: 'apk', label: 'APKs', icon: Package, count: availableFiles.filter((f) => f.category === 'apk').length },
    { id: 'zip', label: 'ZIPs', icon: FolderArchive, count: availableFiles.filter((f) => f.category === 'zip').length },
    { id: 'folder', label: 'Pastas (SAF)', icon: FolderOpen, count: availableFiles.filter((f) => f.category === 'folder').length }
  ];

  const filteredFiles = activeCategory === 'all'
    ? availableFiles
    : availableFiles.filter((f) => f.category === activeCategory);

  const selectedFilesList = availableFiles.filter((f) => selectedFileIds.has(f.id));
  const totalSelectedBytes = selectedFilesList.reduce((acc, f) => acc + f.size, 0);

  const activeTransfers = transfers.filter((t) => t.status === 'transferring');
  const lastCompletedTransfer = transfers.find((t) => t.status === 'completed');

  const handleSendAction = () => {
    if (!selectedDevice) return;
    const files = selectedFilesList.length > 0 ? selectedFilesList : availableFiles.slice(0, 2);
    startTransfer(selectedDevice, files, myDevices.android);
  };

  const handleOpenQrSend = () => {
    setActiveModal('qr-send');
  };

  const handleOpenQrReceive = () => {
    setActiveModal('qr-receive');
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 transition-colors font-sans">
      {/* Android Top App Bar (Material 3) */}
      <div className="bg-stone-50/90 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-3.5 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-stone-900 dark:text-white">
                DataBridge Transfer
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                Android 14
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400">
              Galaxy S24 Ultra • P2P QR Ativo
            </p>
          </div>
        </div>

        {/* Quick actions in app bar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveModal('qr')}
            className="p-2 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-full transition"
            title="Escanear QR Code"
          >
            <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>
          <button
            onClick={() => setActiveModal('pin')}
            className="p-2 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-full transition"
            title="Inserir PIN"
          >
            <KeyRound className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveModal('history')}
            className="p-2 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-full transition"
            title="Histórico"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 4 Action Buttons Bar with QR badges on Send and Receive icons */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 grid grid-cols-4 gap-2.5 flex-shrink-0">
        {/* Send Action with QR badge */}
        <button
          onClick={handleOpenQrSend}
          className="py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 transition shadow-xs group"
        >
          <SendQrIcon size="md" className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Enviar (QR)</span>
        </button>

        {/* Receive Action with QR badge */}
        <button
          onClick={handleOpenQrReceive}
          className="py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 transition shadow-xs group"
        >
          <ReceiveQrIcon size="md" className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Receber (QR)</span>
        </button>

        {/* Connect via Scanner */}
        <button
          onClick={() => setActiveModal('qr')}
          className="py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 transition"
        >
          <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold">Câmera QR</span>
        </button>

        {/* History */}
        <button
          onClick={() => setActiveModal('history')}
          className="py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 transition"
        >
          <History className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span className="text-xs font-semibold">Histórico</span>
        </button>
      </div>

      {/* Target Device Quick Bar */}
      <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 dark:text-zinc-400">Enviar para:</span>
          <select
            value={selectedDevice?.id || ''}
            onChange={(e) => {
              const d = discoveredDevices.find((x) => x.id === e.target.value) || null;
              setSelectedDevice(d);
            }}
            className="font-semibold text-stone-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
          >
            {discoveredDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.connectionMethod === 'usb' ? 'USB 3.2' : 'Wi-Fi 6'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => selectAllFiles(activeCategory)}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Selecionar todos
          </button>
          {selectedFileIds.size > 0 && (
            <button
              onClick={clearFileSelection}
              className="text-[11px] text-rose-500 hover:underline"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroll Pills (Material 3 Filter Chips) */}
      <div className="p-3 overflow-x-auto flex gap-2 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as FileCategory)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-400'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* File List / Multi-Selection Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addCustomFiles(e.target.files)}
        />

        {/* Add custom Android files button */}
        <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl mb-3">
          <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
            <FolderOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Adicionar arquivos ou pastas do armazenamento do dispositivo</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Navegar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredFiles.map((file) => {
            const isSelected = selectedFileIds.has(file.id);
            return (
              <div
                key={file.id}
                onClick={() => toggleFileSelection(file.id)}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail or Icon */}
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-stone-200 dark:border-zinc-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300 flex-shrink-0">
                      {file.category === 'photo' ? (
                        <Image className="w-5 h-5 text-pink-500" />
                      ) : file.category === 'video' ? (
                        <Film className="w-5 h-5 text-purple-500" />
                      ) : file.category === 'music' ? (
                        <Music className="w-5 h-5 text-amber-500" />
                      ) : file.category === 'apk' ? (
                        <Package className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-stone-900 dark:text-zinc-100 truncate block">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                      {formatBytes(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Checkbox indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-300 dark:border-zinc-600'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Active Transfer / Completion Card */}
      {activeTransfers.length > 0 && (
        <div className="mx-4 mb-2 p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 animate-bounce" /> Transferindo para {activeTransfers[0].targetDevice.name}
            </span>
            <span className="font-mono">{formatSpeed(activeTransfers[0].speedBytesPerSec)}</span>
          </div>
          <div className="w-full h-2 bg-emerald-800/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-200"
              style={{ width: `${activeTransfers[0].progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-100">
            <span>{activeTransfers[0].progress}% • {formatBytes(activeTransfers[0].transferredBytes)} / {formatBytes(activeTransfers[0].size)}</span>
            <span>Tempo restante: {formatTime(activeTransfers[0].timeRemainingSec)}</span>
          </div>
        </div>
      )}

      {/* Transfer Finished Toast Notification */}
      {lastCompletedTransfer && activeTransfers.length === 0 && (
        <div className="mx-4 mb-2 p-3 bg-stone-900 text-white rounded-2xl shadow-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Transferência concluída com sucesso!</span>
          </div>
          <button
            onClick={() => setActiveModal('history')}
            className="text-emerald-400 font-semibold hover:underline text-[11px]"
          >
            Ver
          </button>
        </div>
      )}

      {/* Bottom Sticky Action Bar with QR Code Badged Send Buttons */}
      <div className="p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
        <div>
          <span className="text-xs font-semibold text-stone-900 dark:text-white block">
            {selectedFilesList.length > 0
              ? `${selectedFilesList.length} arquivo(s) selecionado(s)`
              : 'Nenhum arquivo selecionado'}
          </span>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400">
            {selectedFilesList.length > 0 ? formatBytes(totalSelectedBytes) : 'Toque nos itens acima'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick QR Send Button */}
          <button
            onClick={handleOpenQrSend}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-amber-500/20 transition active:scale-95 text-xs"
            title="Gerar QR Code de Envio"
          >
            <SendQrIcon size="sm" />
            <span>Gerar QR</span>
          </button>

          {/* Main Direct Send Button with SendQrIcon */}
          <button
            onClick={handleSendAction}
            disabled={!selectedDevice}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Enviar {selectedFilesList.length > 0 ? `(${selectedFilesList.length})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
