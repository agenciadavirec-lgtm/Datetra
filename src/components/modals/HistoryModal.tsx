import React, { useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes } from '../../utils/fileHelpers';
import {
  History,
  X,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Image,
  Film,
  Music,
  Package,
  FolderArchive,
  Download,
  Smartphone,
  Monitor
} from 'lucide-react';
import { FileCategory, DeviceType } from '../../types/databridge';

export const HistoryModal: React.FC = () => {
  const { activeModal, setActiveModal, history, clearHistory } = useDataBridge();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [search, setSearch] = useState('');

  if (activeModal !== 'history') return null;

  const filteredHistory = history.filter((item) => {
    const matchesFilter = filter === 'all' || item.direction === filter;
    const matchesSearch =
      item.fileName.toLowerCase().includes(search.toLowerCase()) ||
      item.remoteDeviceName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  const getDeviceIcon = (type: DeviceType) => {
    if (type === 'windows' || type === 'mac' || type === 'linux') {
      return <Monitor className="w-3.5 h-3.5" />;
    }
    return <Smartphone className="w-3.5 h-3.5" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Histórico de Transferências</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Registros de arquivos enviados e recebidos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-1.5 transition border border-rose-200 dark:border-rose-900/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar histórico
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

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Todos ({history.length})
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 ${
                filter === 'sent'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-blue-500" />
              Enviados
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 ${
                filter === 'received'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
              Recebidos
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por arquivo ou dispositivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Nenhum registro encontrado</p>
              <p className="text-xs mt-1">As transferências concluídas aparecerão aqui.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-white dark:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm flex-shrink-0">
                    {getCategoryIcon(item.fileCategory)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate">
                        {item.fileName}
                      </span>
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex-wrap">
                      <span>{formatBytes(item.fileSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                        {item.direction === 'sent' ? (
                          <ArrowUpRight className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
                        )}
                        {item.direction === 'sent' ? 'Para:' : 'De:'}
                        <span className="font-medium inline-flex items-center gap-0.5">
                          {getDeviceIcon(item.remoteDeviceType)}
                          {item.remoteDeviceName}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.dataUrl && (
                    <a
                      href={item.dataUrl}
                      download={item.fileName}
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                      title="Baixar arquivo novamente"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {item.status === 'completed' ? 'Concluído' : 'Falha'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between flex-shrink-0">
          <span>Armazenamento local persistido</span>
          <span>DataBridge Transfer v2.4</span>
        </div>
      </div>
    </div>
  );
};
