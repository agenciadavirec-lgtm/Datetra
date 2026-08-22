import React from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { formatBytes } from '../../utils/fileHelpers';
import {
  ShieldAlert,
  Check,
  X,
  FileText,
  Smartphone,
  Monitor,
  DownloadCloud
} from 'lucide-react';

export const IncomingTransferDialog: React.FC = () => {
  const { incomingRequest, acceptIncomingRequest, rejectIncomingRequest } = useDataBridge();

  if (!incomingRequest) return null;

  const isDesktop = incomingRequest.sourceDevice.type === 'windows' || incomingRequest.sourceDevice.type === 'mac';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border-2 border-blue-500/80 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-colors animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-50/80 dark:bg-blue-950/60 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                Solicitação de Transferência
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Dispositivo na rede local quer enviar arquivos
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Source Device Card */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm text-zinc-700 dark:text-zinc-200">
              {isDesktop ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 block">
                {incomingRequest.sourceDevice.name}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                IP: {incomingRequest.sourceDevice.ip} • {incomingRequest.sourceDevice.osVersion}
              </span>
            </div>
          </div>

          {/* Files List Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span>{incomingRequest.files.length} arquivo(s) prontos para envio:</span>
              <span>Total: {formatBytes(incomingRequest.totalSize)}</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
              {incomingRequest.files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate text-zinc-800 dark:text-zinc-200">{f.name}</span>
                  </div>
                  <span className="text-zinc-400 font-mono text-[11px] flex-shrink-0">
                    {formatBytes(f.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              Autorize apenas se você reconhecer o dispositivo emissor. O arquivo será salvo na sua pasta padrão.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center gap-3">
          <button
            onClick={rejectIncomingRequest}
            className="flex-1 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <X className="w-4 h-4 text-rose-500" />
            Recusar
          </button>
          <button
            onClick={acceptIncomingRequest}
            className="flex-1 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Check className="w-4 h-4" />
            Aceitar e Receber
          </button>
        </div>
      </div>
    </div>
  );
};
