import React, { useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes, formatSpeed } from '../../utils/fileHelpers';
import {
  Monitor,
  Smartphone,
  Apple,
  ArrowRight,
  ArrowLeft,
  Zap,
  Send,
  DownloadCloud,
  CheckCircle2,
  Layers,
  Sparkles,
  Cable,
  Wifi,
  QrCode,
  KeyRound,
  FilePlus,
  Play
} from 'lucide-react';
import { SendQrIcon, ReceiveQrIcon, TransferQrIcon } from '../common/QrBadgedIcons';
import { DeviceType, FileItem } from '../../types/databridge';

export const EcosystemSplitView: React.FC = () => {
  const {
    myDevices,
    availableFiles,
    startTransfer,
    transfers,
    usbConnected,
    toggleUsbBridge,
    setActiveModal
  } = useDataBridge();

  const [mobileType, setMobileType] = useState<'android' | 'ios'>('android');
  const [pcSelectedFileId, setPcSelectedFileId] = useState<string>(availableFiles[0]?.id || '');
  const [mobileSelectedFileId, setMobileSelectedFileId] = useState<string>(availableFiles[1]?.id || '');

  const activeTransfers = transfers.filter((t) => t.status === 'transferring');
  const pcDevice = myDevices.windows;
  const mobileDevice = mobileType === 'android' ? myDevices.android : myDevices.ios;

  const handleSendPcToMobile = () => {
    const file = availableFiles.find((f) => f.id === pcSelectedFileId) || availableFiles[0];
    if (file) {
      startTransfer(mobileDevice, [file], pcDevice);
    }
  };

  const handleSendMobileToPc = () => {
    const file = availableFiles.find((f) => f.id === mobileSelectedFileId) || availableFiles[1];
    if (file) {
      startTransfer(pcDevice, [file], mobileDevice);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Ecosystem Control Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 via-emerald-600 to-violet-600 flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              Ecossistema Multi-Dispositivo DataBridge
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                P2P & QR Code
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Comunicação em tempo real entre Windows PC e Celular (Android ou iPhone)
            </p>
          </div>
        </div>

        {/* Mobile target switcher & quick actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setMobileType('android')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mobileType === 'android'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android
            </button>
            <button
              onClick={() => setMobileType('ios')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mobileType === 'ios'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              iPhone (iOS)
            </button>
          </div>

          <button
            onClick={toggleUsbBridge}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              usbConnected
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <Cable className="w-3.5 h-3.5" />
            {usbConnected ? 'Cabo USB 3.2 (480 MB/s)' : 'Wi-Fi 6 (100 MB/s)'}
          </button>
        </div>
      </div>

      {/* Main Split Body: Left Windows PC, Center Bridge, Right Mobile */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Windows PC Pane (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Computador Windows 11</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">192.168.1.105:8765</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('qr-receive')}
                className="text-xs px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1.5 hover:bg-blue-500/30 transition"
              >
                <ReceiveQrIcon size="sm" />
                <span>Receber</span>
              </button>
            </div>

            {/* PC Files Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Escolha o arquivo no PC para enviar:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setPcSelectedFileId(file.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      pcSelectedFileId === file.id
                        ? 'border-blue-500 bg-blue-500/10 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono flex-shrink-0 ml-2">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 mt-4 flex gap-2">
            <button
              onClick={() => setActiveModal('qr-send')}
              className="py-3 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 text-xs"
              title="Gerar QR Code de Envio"
            >
              <SendQrIcon size="sm" />
              <span>QR</span>
            </button>
            <button
              onClick={handleSendPcToMobile}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-95 text-xs"
            >
              <SendQrIcon size="sm" />
              <span>Transmitir PC → {mobileType === 'android' ? 'Android' : 'iPhone'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Live Transfer Stream Channel (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 bg-zinc-900/60 border border-zinc-800 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 shadow-inner">
            <Wifi className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">Túnel Local P2P</span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {usbConnected ? 'USB CDC (480 MB/s)' : 'Wi-Fi Direct AES-256'}
            </span>
          </div>

          {/* Real-time speed indicator */}
          {activeTransfers.length > 0 ? (
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center w-full animate-fadeIn">
              <span className="text-[10px] text-blue-300 block font-semibold">Transferindo</span>
              <span className="text-xs font-bold text-blue-400 font-mono">
                {formatSpeed(activeTransfers[0].speedBytesPerSec)}
              </span>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${activeTransfers[0].progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500">
              Pronto para transmissão
            </div>
          )}

          <div className="flex flex-col gap-1.5 w-full pt-2 border-t border-zinc-800">
            <button
              onClick={() => setActiveModal('qr-send')}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1"
            >
              <SendQrIcon size="sm" />
              <span>QR de Envio</span>
            </button>
            <button
              onClick={() => setActiveModal('qr-receive')}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1"
            >
              <ReceiveQrIcon size="sm" />
              <span>QR de Recepção</span>
            </button>
          </div>
        </div>

        {/* Right: Mobile Device Pane (Android or iOS) (5 Cols) */}
        <div className={`lg:col-span-5 bg-zinc-900 border rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-colors ${
          mobileType === 'android' ? 'border-emerald-900/60' : 'border-violet-900/60'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  mobileType === 'android' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
                }`}>
                  {mobileType === 'android' ? <Smartphone className="w-5 h-5" /> : <Apple className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {mobileType === 'android' ? 'Samsung Galaxy S24 Ultra' : 'iPhone 15 Pro Max'}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {mobileDevice.ip}:8766
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('qr-receive')}
                className={`text-xs px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1.5 border transition ${
                  mobileType === 'android'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30'
                }`}
              >
                <ReceiveQrIcon size="sm" />
                <span>Receber</span>
              </button>
            </div>

            {/* Mobile Files Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Escolha o arquivo no Celular para enviar ao PC:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setMobileSelectedFileId(file.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      mobileSelectedFileId === file.id
                        ? mobileType === 'android'
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                          : 'border-violet-500 bg-violet-500/10 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono flex-shrink-0 ml-2">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 mt-4 flex gap-2">
            <button
              onClick={() => setActiveModal('qr-send')}
              className="py-3 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 text-xs"
              title="Gerar QR Code de Envio"
            >
              <SendQrIcon size="sm" />
              <span>QR</span>
            </button>
            <button
              onClick={handleSendMobileToPc}
              className={`flex-1 py-3 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 text-xs text-white ${
                mobileType === 'android'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/30'
              }`}
            >
              <SendQrIcon size="sm" />
              <ArrowLeft className="w-4 h-4" />
              <span>Transmitir {mobileType === 'android' ? 'Android' : 'iPhone'} → PC Windows</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
