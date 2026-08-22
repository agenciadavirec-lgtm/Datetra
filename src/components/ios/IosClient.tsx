import React, { useRef, useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes, formatSpeed, formatTime } from '../../utils/fileHelpers';
import {
  Apple,
  Send,
  Download,
  QrCode,
  KeyRound,
  History,
  FolderOpen,
  Image,
  Share2,
  CheckCircle2,
  Zap,
  Clock,
  Radio,
  FileCheck,
  ChevronRight,
  Plus,
  Monitor,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { SendQrIcon, ReceiveQrIcon, TransferQrIcon } from '../common/QrBadgedIcons';
import { FileCategory, Device, DeviceType } from '../../types/databridge';

export const IosClient: React.FC = () => {
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

  const [activeSection, setActiveSection] = useState<'files' | 'photos' | 'devices' | 'history'>('files');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(discoveredDevices[0] || null);
  const [showShareSheetMock, setShowShareSheetMock] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedFilesList = availableFiles.filter((f) => selectedFileIds.has(f.id));
  const totalSelectedBytes = selectedFilesList.reduce((acc, f) => acc + f.size, 0);

  const activeTransfers = transfers.filter((t) => t.status === 'transferring');
  const lastCompleted = transfers.find((t) => t.status === 'completed');

  const photosList = availableFiles.filter((f) => f.category === 'photo' || f.category === 'video');
  const documentsList = availableFiles.filter((f) => f.category !== 'photo' && f.category !== 'video');

  const handleSendAction = () => {
    if (!selectedDevice) return;
    const files = selectedFilesList.length > 0 ? selectedFilesList : availableFiles.slice(0, 2);
    startTransfer(selectedDevice, files, myDevices.ios);
  };

  const getDeviceIcon = (type: DeviceType) => {
    if (type === 'windows' || type === 'mac') {
      return <Monitor className="w-5 h-5 text-blue-500" />;
    }
    return <Smartphone className="w-5 h-5 text-purple-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors">
      {/* iOS Frosted Navigation Bar */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Apple className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                DataBridge Transfer
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
                iOS 17
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              iPhone 15 Pro Max • Sandboxed P2P
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowShareSheetMock(true)}
            className="p-2 text-violet-600 dark:text-violet-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
            title="Share Sheet"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveModal('qr')}
            className="p-2 text-violet-600 dark:text-violet-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
            title="QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveModal('pin')}
            className="p-2 text-violet-600 dark:text-violet-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
            title="Código PIN"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Action Buttons Grid with QR Badged Send and Receive */}
      <div className="p-3.5 grid grid-cols-4 gap-2 bg-white dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 flex-shrink-0">
        {/* Send with QR */}
        <button
          onClick={() => setActiveModal('qr-send')}
          className="py-2.5 px-1 rounded-2xl flex flex-col items-center gap-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 transition"
        >
          <SendQrIcon size="md" />
          <span className="text-xs font-bold">Enviar (QR)</span>
        </button>

        {/* Receive with QR */}
        <button
          onClick={() => setActiveModal('qr-receive')}
          className="py-2.5 px-1 rounded-2xl flex flex-col items-center gap-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 transition"
        >
          <ReceiveQrIcon size="md" />
          <span className="text-xs font-bold">Receber (QR)</span>
        </button>

        {/* Photos Tab */}
        <button
          onClick={() => setActiveSection('photos')}
          className={`py-2.5 px-1 rounded-2xl flex flex-col items-center gap-1 transition ${
            activeSection === 'photos'
              ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 font-semibold'
              : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Image className="w-5 h-5 text-pink-500" />
          <span className="text-xs font-semibold">Fotos</span>
        </button>

        {/* Files Tab */}
        <button
          onClick={() => setActiveSection('files')}
          className={`py-2.5 px-1 rounded-2xl flex flex-col items-center gap-1 transition ${
            activeSection === 'files'
              ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 font-semibold'
              : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400'
          }`}
        >
          <FolderOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span className="text-xs font-semibold">Arquivos</span>
        </button>
      </div>

      {/* iOS Segmented Target Device Header */}
      <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-zinc-900/40 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-zinc-400">Enviar para:</span>
          <select
            value={selectedDevice?.id || ''}
            onChange={(e) => {
              const d = discoveredDevices.find((x) => x.id === e.target.value) || null;
              setSelectedDevice(d);
            }}
            className="font-semibold text-violet-700 dark:text-violet-300 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-2.5 py-1 text-xs focus:outline-none shadow-xs"
          >
            {discoveredDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.ip})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => selectAllFiles()}
            className="text-violet-600 dark:text-violet-400 font-semibold hover:underline text-xs"
          >
            Selecionar tudo
          </button>
          {selectedFileIds.size > 0 && (
            <button
              onClick={clearFileSelection}
              className="text-rose-500 hover:underline text-xs"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addCustomFiles(e.target.files)}
        />

        {/* Section: Photos & Media (PHPickerViewController style) */}
        {activeSection === 'photos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Biblioteca de Fotos & Vídeos (Resolução Total)
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Fotos
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photosList.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`relative rounded-2xl overflow-hidden border transition cursor-pointer select-none aspect-square group ${
                      isSelected
                        ? 'border-violet-600 ring-2 ring-violet-600'
                        : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-2 text-center">
                        <Image className="w-8 h-8 text-pink-500 mb-1" />
                        <span className="text-[11px] font-semibold truncate max-w-full text-slate-800 dark:text-zinc-200">
                          {file.name}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                      <span className="text-xs font-semibold truncate">{file.name}</span>
                      <span className="text-[10px] text-white/80">{formatBytes(file.size)}</span>
                    </div>

                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-violet-600 border-white text-white'
                          : 'border-white/90 bg-black/30'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Files & Documents (UIDocumentPickerViewController style) */}
        {activeSection === 'files' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Aplicativo Arquivos (Files App / iCloud Drive)
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Importar do Files
              </button>
            </div>

            <div className="space-y-2">
              {documentsList.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400 flex-shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate block">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {formatBytes(file.size)} • {file.extension.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                        isSelected
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Discovered Devices (AirDrop Radar style) */}
        {activeSection === 'devices' && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 rounded-3xl text-center flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full border-2 border-violet-500/30 flex items-center justify-center mb-3">
                <div className="absolute inset-2 rounded-full border border-violet-500/40 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                  <Radio className="w-6 h-6" />
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Radar Local DataBridge
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
                Transmitindo via Network.framework com TLS 1.3
              </p>
            </div>

            <div className="space-y-2.5">
              {discoveredDevices.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    selectedDevice?.id === dev.id
                      ? 'border-violet-600 bg-violet-50/70 dark:bg-violet-950/40'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 rounded-xl">
                      {getDeviceIcon(dev.type)}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                        {dev.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {dev.ip} • {dev.osVersion}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {selectedDevice?.id === dev.id ? 'Selecionado' : 'Escolher'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Active Transfer Indicator */}
      {activeTransfers.length > 0 && (
        <div className="mx-4 mb-2 p-3.5 bg-violet-600 text-white rounded-2xl shadow-lg space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 animate-bounce" /> Enviando para {activeTransfers[0].targetDevice.name}
            </span>
            <span className="font-mono">{formatSpeed(activeTransfers[0].speedBytesPerSec)}</span>
          </div>
          <div className="w-full h-1.5 bg-violet-900/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-200"
              style={{ width: `${activeTransfers[0].progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-violet-100">
            <span>{activeTransfers[0].progress}% ({formatBytes(activeTransfers[0].transferredBytes)})</span>
            <span>Restam {formatTime(activeTransfers[0].timeRemainingSec)}</span>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar with QR Badged Buttons */}
      <div className="p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
        <div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white block">
            {selectedFilesList.length > 0
              ? `${selectedFilesList.length} item(ns) selecionado(s)`
              : 'Selecione para enviar'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {selectedFilesList.length > 0 ? formatBytes(totalSelectedBytes) : 'Fotos, vídeos ou docs'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick QR Send Button */}
          <button
            onClick={() => setActiveModal('qr-send')}
            className="px-3.5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 text-xs"
            title="Gerar QR Code de Envio"
          >
            <SendQrIcon size="sm" />
            <span>QR</span>
          </button>

          {/* Main Direct Send Button with SendQrIcon */}
          <button
            onClick={handleSendAction}
            disabled={!selectedDevice}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-600/30 transition active:scale-95 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Enviar {selectedFilesList.length > 0 ? `(${selectedFilesList.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* iOS Share Sheet Mock Modal */}
      {showShareSheetMock && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-zinc-800 animate-slideUp">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Extensão de Compartilhamento iOS
              </span>
              <button
                onClick={() => setShowShareSheetMock(false)}
                className="text-xs text-violet-600 font-semibold"
              >
                Concluído
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              O DataBridge Transfer registra-se como receptor nativo no Share Sheet do iOS para enviar arquivos diretamente de qualquer aplicativo.
            </p>

            <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                DB
              </div>
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Enviar com DataBridge
                </span>
                <span className="text-[11px] text-violet-700 dark:text-violet-300">
                  Transferência P2P com QR Handshake
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowShareSheetMock(false);
                handleSendAction();
              }}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl text-xs shadow-md transition"
            >
              Transferir para {selectedDevice?.name || 'PC Windows'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
