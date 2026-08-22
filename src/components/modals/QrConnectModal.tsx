import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes } from '../../utils/fileHelpers';
import {
  QrCode,
  Camera,
  ShieldCheck,
  RefreshCw,
  X,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Send,
  Download,
  FileText,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  ArrowLeft,
  Image,
  Film,
  Music,
  Package,
  FolderArchive,
  FolderOpen,
  FilePlus,
  Lock,
  Unlock,
  AlertCircle,
  DownloadCloud,
  ChevronRight,
  Eye
} from 'lucide-react';
import { SendQrIcon, ReceiveQrIcon, TransferQrIcon } from '../common/QrBadgedIcons';
import { Device, FileCategory } from '../../types/databridge';

export const QrConnectModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    pairingQrToken,
    pairingPin,
    pairDeviceWithQr,
    discoveredDevices,
    availableFiles,
    selectedFileIds,
    toggleFileSelection,
    selectAllFiles,
    clearFileSelection,
    addCustomFiles,
    startTransfer,
    myDevices,
    viewMode
  } = useDataBridge();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'scan'>('send');
  const [sendStep, setSendStep] = useState<'select' | 'qr'>('select');
  const [itemCategory, setItemCategory] = useState<FileCategory>('all');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Sync tab with activeModal type
  useEffect(() => {
    if (activeModal === 'qr-send') {
      setActiveTab('send');
      // If user hasn't selected items yet, start in 'select' step
      if (selectedFileIds.size === 0) {
        setSendStep('select');
      }
    } else if (activeModal === 'qr-receive') {
      setActiveTab('receive');
    } else if (activeModal === 'qr') {
      setActiveTab('send');
    }
  }, [activeModal, selectedFileIds.size]);

  const selectedFilesList = availableFiles.filter((f) => selectedFileIds.has(f.id));
  const totalBytes = selectedFilesList.reduce((acc, f) => acc + f.size, 0);

  const filteredAvailableFiles = itemCategory === 'all'
    ? availableFiles
    : availableFiles.filter((f) => f.category === itemCategory);

  const categories = [
    { id: 'all', label: 'Tudo', icon: Layers, count: availableFiles.length },
    { id: 'photo', label: 'Fotos', icon: Image, count: availableFiles.filter((f) => f.category === 'photo').length },
    { id: 'video', label: 'Vídeos', icon: Film, count: availableFiles.filter((f) => f.category === 'video').length },
    { id: 'music', label: 'Músicas', icon: Music, count: availableFiles.filter((f) => f.category === 'music').length },
    { id: 'document', label: 'Docs', icon: FileText, count: availableFiles.filter((f) => f.category === 'document').length },
    { id: 'apk', label: 'Apps / APK', icon: Package, count: availableFiles.filter((f) => f.category === 'apk').length },
    { id: 'zip', label: 'Arquivos ZIP', icon: FolderArchive, count: availableFiles.filter((f) => f.category === 'zip').length },
    { id: 'folder', label: 'Pastas', icon: FolderOpen, count: availableFiles.filter((f) => f.category === 'folder').length }
  ];

  // Generate QR Code on canvas ONLY when in 'qr' step (or in 'receive' tab)
  useEffect(() => {
    const isQrModal = activeModal === 'qr' || activeModal === 'qr-send' || activeModal === 'qr-receive';
    if (isQrModal && canvasRef.current) {
      let qrPayload = pairingQrToken;

      if (activeTab === 'send' && sendStep === 'qr') {
        if (selectedFilesList.length === 0) return;
        const fileNames = selectedFilesList.map((f) => f.name).join(',');
        qrPayload = `dbridge://send-payload?token=tx_${Date.now()}&files=${encodeURIComponent(fileNames)}&count=${selectedFilesList.length}&size=${totalBytes}&sender=${viewMode}&hash=${Math.random().toString(36).substring(2, 9)}`;
      } else if (activeTab === 'receive') {
        qrPayload = `dbridge://receive-ready?token=rx_${Date.now()}&device=${viewMode}&pin=${pairingPin}&ip=192.168.1.105`;
      } else {
        return;
      }

      QRCode.toCanvas(canvasRef.current, qrPayload, {
        width: 210,
        margin: 2,
        color: {
          dark: '#09090b',
          light: '#ffffff'
        }
      }).catch((err) => console.error('QR Render error:', err));
    }
  }, [activeModal, pairingQrToken, activeTab, sendStep, selectedFilesList, totalBytes, viewMode, pairingPin]);

  const isVisible = activeModal === 'qr' || activeModal === 'qr-send' || activeModal === 'qr-receive';
  if (!isVisible) return null;

  const handleCopyPayload = () => {
    if (activeTab === 'send') {
      const fileNames = selectedFilesList.map((f) => f.name).join(', ');
      navigator.clipboard.writeText(`DataBridge Transfer Package: ${selectedFilesList.length} items (${formatBytes(totalBytes)}) - Token: ${pairingQrToken}`);
    } else {
      navigator.clipboard.writeText(pairingQrToken);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportQrImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `databridge-qr-${activeTab}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setStatusMessage({ text: 'Imagem do QR Code exportada com sucesso!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleSimulateReceiveFromSender = (targetDevice: Device) => {
    setIsProcessing(true);
    setStatusMessage({ text: 'Escaneando QR Code e iniciando transferência segura P2P...', type: 'info' });

    setTimeout(() => {
      startTransfer(targetDevice, selectedFilesList.length > 0 ? selectedFilesList : availableFiles.slice(0, 2));
      setIsProcessing(false);
      setStatusMessage({ text: 'Transferência iniciada com sucesso via QR Code!', type: 'success' });
      setTimeout(() => {
        setActiveModal(null);
      }, 1200);
    }, 900);
  };

  const handleSimulateScan = async (sampleToken?: string) => {
    setIsProcessing(true);
    setStatusMessage({ text: 'Validando certificado e chave criptográfica do QR Code...', type: 'info' });

    setTimeout(async () => {
      const tokenToUse = sampleToken || pairingQrToken;
      const res = await pairDeviceWithQr(tokenToUse);
      setIsProcessing(false);
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
        setTimeout(() => {
          setActiveModal(null);
        }, 1300);
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    }, 1000);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      setStatusMessage({ text: 'Processando imagem capturada pela câmera...', type: 'info' });
      setTimeout(() => {
        handleSimulateScan('dbridge_token_scanned_photo');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden transition-colors flex flex-col max-h-[94vh]">
        {/* Hidden File and Camera Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addCustomFiles(e.target.files)}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoCapture}
        />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  Transferência com QR Code
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  P2P Direto Zero Trust
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Selecione tudo o que deseja enviar ou aponte a câmera para escanear
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Action Mode Tabs */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            {/* Send with QR Tab */}
            <button
              onClick={() => {
                setActiveTab('send');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2.5 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'send'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <SendQrIcon size="sm" />
              <span>Enviar (QR)</span>
            </button>

            {/* Receive with QR Tab */}
            <button
              onClick={() => {
                setActiveTab('receive');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2.5 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'receive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ReceiveQrIcon size="sm" />
              <span>Receber (QR)</span>
            </button>

            {/* Scan QR / Camera Tab */}
            <button
              onClick={() => {
                setActiveTab('scan');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2.5 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'scan'
                  ? 'bg-zinc-800 dark:bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Câmera / Escanear</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 pt-2 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SEND WITH QR CODE (2-STEP WIZARD) */}
          {activeTab === 'send' && (
            <div className="space-y-4">
              {/* STEP 1: ITEM SELECTION MANDATE */}
              {sendStep === 'select' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Step Progress & Guard Notice */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-slate-950 flex-shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <span>Passo 1 de 2: Selecione o Objetivo de Envio</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 font-bold">
                          Obrigatório
                        </span>
                      </div>
                      <p className="text-amber-800 dark:text-amber-300">
                        O QR Code <strong>só poderá ser gerado e exportado após a seleção de pelo menos um item</strong>. Você pode incluir fotos, vídeos, músicas, arquivos ZIP, aplicativos APK e tudo o que desejar.
                      </p>
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = itemCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setItemCategory(cat.id as FileCategory)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition flex-shrink-0 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-amber-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Select & Add Controls */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold flex items-center gap-1.5 transition"
                    >
                      <FilePlus className="w-3.5 h-3.5 text-amber-500" />
                      Adicionar do Disco
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllFiles(itemCategory)}
                        className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                      >
                        Selecionar Todos ({filteredAvailableFiles.length})
                      </button>
                      {selectedFileIds.size > 0 && (
                        <button
                          onClick={clearFileSelection}
                          className="text-rose-500 hover:underline"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable File Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {filteredAvailableFiles.map((file) => {
                      const isSelected = selectedFileIds.has(file.id);
                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleFileSelection(file.id)}
                          className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                            isSelected
                              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                              : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {file.previewUrl ? (
                              <img
                                src={file.previewUrl}
                                alt={file.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 flex-shrink-0 shadow-xs">
                                {file.category === 'photo' ? (
                                  <Image className="w-4 h-4 text-pink-500" />
                                ) : file.category === 'video' ? (
                                  <Film className="w-4 h-4 text-purple-500" />
                                ) : file.category === 'music' ? (
                                  <Music className="w-4 h-4 text-amber-500" />
                                ) : file.category === 'apk' ? (
                                  <Package className="w-4 h-4 text-emerald-500" />
                                ) : file.category === 'zip' ? (
                                  <FolderArchive className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate block">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                {formatBytes(file.size)} • {file.category.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-slate-950'
                                : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & Advance Button */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                        {selectedFilesList.length > 0
                          ? `${selectedFilesList.length} item(ns) selecionado(s)`
                          : 'Nenhum item selecionado'}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {selectedFilesList.length > 0 ? formatBytes(totalBytes) : 'Selecione itens acima'}
                      </span>
                    </div>

                    <button
                      onClick={() => setSendStep('qr')}
                      disabled={selectedFilesList.length === 0}
                      className="py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 text-xs"
                    >
                      <span>Avançar para Gerar QR Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: QR CODE GENERATED & ACTIVE */}
              {sendStep === 'qr' && (
                <div className="flex flex-col items-center text-center space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Passo 2 de 2: QR Code Gerado
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                      <SendQrIcon size="sm" />
                      QR Code Pronto para Envio
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                      O receptor só precisa apontar a câmera ou o leitor de QR Code para baixar todos os {selectedFilesList.length} itens selecionados.
                    </p>
                  </div>

                  {/* QR Code Canvas */}
                  <div className="p-3.5 bg-white border-2 border-amber-400 rounded-3xl shadow-xl relative group">
                    <canvas ref={canvasRef} className="rounded-xl block" />
                    <div className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] shadow-sm flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-slate-950" />
                      {selectedFilesList.length} item(ns) ({formatBytes(totalBytes)})
                    </div>
                  </div>

                  {/* Bundled Files Summary Card */}
                  <div className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-3.5 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Conteúdo empacotado neste QR Code:
                      </span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">
                        {formatBytes(totalBytes)}
                      </span>
                    </div>

                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {selectedFilesList.map((file) => (
                        <div
                          key={file.id}
                          className="text-xs flex items-center justify-between py-1 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                        >
                          <span className="truncate max-w-[260px] text-zinc-800 dark:text-zinc-200 font-medium">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0 ml-2">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export and Action Buttons */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setSendStep('select')}
                      className="py-2.5 px-3 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Modificar Itens
                    </button>

                    <button
                      onClick={handleExportQrImage}
                      className="py-2.5 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      Exportar QR Code
                    </button>

                    <button
                      onClick={handleCopyPayload}
                      className="py-2.5 px-3 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar Token'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIVE WITH QR CODE ("VOCÊ SÓ PRECISA RECEBER") */}
          {activeTab === 'receive' && (
            <div className="flex flex-col items-center text-center space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    Modo Receptor Ativo
                  </span>
                </div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                  <ReceiveQrIcon size="sm" />
                  Você Só Precisa Receber
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Mantenha este QR Code na tela. O emissor deve escanear este código com a câmera para transmitir os dados instantaneamente.
                </p>
              </div>

              {/* QR Code Canvas */}
              <div className="p-3.5 bg-white border-2 border-blue-500/80 rounded-3xl shadow-xl relative group">
                <canvas ref={canvasRef} className="rounded-xl block" />
                <div className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Pronto para Receber
                </div>
              </div>

              {/* PIN Code & IP Badge */}
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/80 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-semibold">
                    PIN Alternativo:
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm tracking-widest">
                    {pairingPin}
                  </span>
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-semibold">
                    Endereço Local:
                  </span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300 text-xs">
                    192.168.1.105:8765
                  </span>
                </div>
              </div>

              {/* Security info */}
              <div className="w-full flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-800 dark:text-emerald-300">
                  Canal seguro Zero Trust: Os arquivos serão recebidos diretamente na rede local sem passar pela nuvem.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2 pt-1">
                <button
                  onClick={handleExportQrImage}
                  className="flex-1 py-2.5 px-3 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  Exportar Imagem QR
                </button>
                <button
                  onClick={() => handleSimulateReceiveFromSender(discoveredDevices[0])}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Simular Recepção
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SCANNER / TAKE PHOTO */}
          {activeTab === 'scan' && (
            <div className="flex flex-col items-center text-center space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Escanear ou Tirar Foto do QR Code
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Aponte a câmera para o QR Code de outro dispositivo ou tire uma foto para conectar e transferir instantaneamente.
                </p>
              </div>

              {/* Scanner Viewfinder Simulator */}
              <div className="relative w-full h-52 bg-zinc-950 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800 shadow-inner">
                {/* Viewfinder frame */}
                <div className="relative w-36 h-36 border-2 border-blue-500/80 rounded-xl flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-blue-400" />
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-blue-400" />
                  <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-blue-400" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-blue-400" />

                  {/* Animated laser line */}
                  <div className="w-full h-0.5 bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-bounce" />
                </div>

                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-[11px] bg-black/75 backdrop-blur-sm text-zinc-200 px-3 py-1 rounded-full border border-zinc-700">
                    Aponte para o QR Code do outro aparelho
                  </span>
                </div>
              </div>

              {/* Quick Camera Snapshot / File Scan Triggers */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tirar Foto / Abrir Câmera</span>
                </button>

                <button
                  onClick={() => handleSimulateScan()}
                  disabled={isProcessing}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Simular Leitura QR</span>
                </button>
              </div>

              {/* Discovered nearby devices quick scan */}
              <div className="space-y-2 w-full text-left pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  Dispositivos disponíveis para pareamento por QR Code:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {discoveredDevices.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => handleSimulateScan(`dbridge_token_${dev.id}`)}
                      disabled={isProcessing}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left transition flex items-center justify-between text-xs text-zinc-800 dark:text-zinc-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {dev.type === 'windows' || dev.type === 'mac' ? (
                          <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        )}
                        <span className="truncate font-semibold">{dev.name}</span>
                      </div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">
                        Parear
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Status Toast */}
          {statusMessage && (
            <div
              className={`w-full p-3 rounded-xl text-xs flex items-center justify-center gap-2 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold'
              }`}
            >
              {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Global Bottom Universal Camera / QR Scan Trigger Bar */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">P2P Criptografado de ponta a ponta</span>
            <span className="sm:hidden">P2P Seguro</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 text-xs"
              title="Tirar foto do QR Code com a câmera"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Tirar Foto</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('scan');
                setStatusMessage(null);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 text-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Escanear QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
