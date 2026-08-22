import React from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes, formatSpeed, formatTime } from '../../utils/fileHelpers';
import {
  Layers,
  X,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Download,
  FileText,
  Image,
  Film,
  Music,
  Package,
  FolderArchive,
  ArrowRight
} from 'lucide-react';
import { FileCategory, TransferStatus } from '../../types/databridge';

export const TransferQueueDrawer: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    transfers,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
    retryTransfer,
    clearFinishedTransfers
  } = useDataBridge();

  if (activeModal !== 'queue') return null;

  const activeCount = transfers.filter((t) => t.status === 'transferring').length;
  const completedCount = transfers.filter((t) => t.status === 'completed').length;

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'photo':
        return <Image className="w-4 h-4 text-pink-500" />;
      case 'video':
        return <Film className="w-4 h-4 text-purple-500" />;
      case 'music':
        return <Music className="w-4 h-4 text-amber-500" />;
      case 'apk':
        return <Package className="w-4 h-4 text-emerald-500" />;
      case 'zip':
        return <FolderArchive className="w-4 h-4 text-cyan-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'transferring':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1 animate-pulse">
            <Zap className="w-3 h-3" /> Transferindo
          </span>
        );
      case 'paused':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Pause className="w-3 h-3" /> Pausado
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Erro
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                Gerenciador de Transferências
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeCount > 0
                  ? `${activeCount} transferências ativas em andamento`
                  : `${transfers.length} itens na fila (${completedCount} concluídos)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {transfers.length > 0 && (
              <button
                onClick={clearFinishedTransfers}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                Limpar finalizados
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transfers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transfers.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Fila de transferência vazia</p>
              <p className="text-xs mt-1">Selecione arquivos e um dispositivo de destino para iniciar.</p>
            </div>
          ) : (
            transfers.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl space-y-3 transition"
              >
                {/* Title & Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 shadow-sm flex-shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate block">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <span>{formatBytes(item.size)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span>{item.sourceDevice.name}</span>
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.targetDevice.name}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-emerald-500'
                          : item.status === 'paused'
                          ? 'bg-amber-500'
                          : item.status === 'cancelled'
                          ? 'bg-zinc-400'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span>{item.progress}%</span>
                      <span>•</span>
                      <span>
                        {formatBytes(item.transferredBytes)} / {formatBytes(item.size)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === 'transferring' && (
                        <>
                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                            {formatSpeed(item.speedBytesPerSec)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(item.timeRemainingSec)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  {item.status === 'transferring' && (
                    <>
                      <button
                        onClick={() => pauseTransfer(item.id)}
                        className="px-2.5 py-1 text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition"
                      >
                        <Pause className="w-3 h-3" /> Pausar
                      </button>
                      <button
                        onClick={() => cancelTransfer(item.id)}
                        className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" /> Cancelar
                      </button>
                    </>
                  )}

                  {item.status === 'paused' && (
                    <>
                      <button
                        onClick={() => resumeTransfer(item.id)}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 transition shadow-sm"
                      >
                        <Play className="w-3 h-3" /> Continuar
                      </button>
                      <button
                        onClick={() => cancelTransfer(item.id)}
                        className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" /> Cancelar
                      </button>
                    </>
                  )}

                  {(item.status === 'cancelled' || item.status === 'error') && (
                    <button
                      onClick={() => retryTransfer(item.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 transition shadow-sm"
                    >
                      <RotateCcw className="w-3 h-3" /> Repetir
                    </button>
                  )}

                  {item.status === 'completed' && item.dataUrl && (
                    <a
                      href={item.dataUrl}
                      download={item.name}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition shadow-sm"
                    >
                      <Download className="w-3 h-3" /> Salvar / Abrir
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between flex-shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          <span>DataBridge Transfer Manager Engine</span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
