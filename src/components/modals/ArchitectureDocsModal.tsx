import React, { useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import {
  Layers,
  X,
  Radio,
  Lock,
  Zap,
  Monitor,
  Smartphone,
  Apple,
  FileCode,
  Network,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';

export const ArchitectureDocsModal: React.FC = () => {
  const { activeModal, setActiveModal } = useDataBridge();
  const [activeTab, setActiveTab] = useState<'protocol' | 'windows' | 'android' | 'ios' | 'security'>('protocol');
  const [copied, setCopied] = useState(false);

  if (activeModal !== 'archDocs') return null;

  const protocolSpecJson = `{
  "protocol": "DataBridge-P2P",
  "version": "2.1",
  "discovery": {
    "type": "mDNS / SSDP UDP Broadcast",
    "port": 5353,
    "serviceType": "_databridge._tcp.local."
  },
  "handshake": {
    "auth": "ECDH Curve25519 + AES-256-GCM",
    "pinLength": 6,
    "qrFormat": "dbridge://<PIN>@<IP>:<PORT>/pair?token=<TOKEN>"
  },
  "chunking": {
    "chunkSizeBytes": 65536,
    "integrity": "CRC32 + SHA-256 Checksum",
    "flowControl": "Sliding Window with ACK",
    "resumeSupport": "Byte-Offset Resumption"
  }
}`;

  const copySpec = () => {
    navigator.clipboard.writeText(protocolSpecJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                Arquitetura & Protocolo DataBridge Transfer
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Especificação técnica para Windows ↔ Android ↔ iOS
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex gap-2 overflow-x-auto flex-shrink-0">
          {[
            { id: 'protocol', label: 'Protocolo P2P', icon: Network },
            { id: 'windows', label: 'Cliente Windows / PC', icon: Monitor },
            { id: 'android', label: 'Cliente Android', icon: Smartphone },
            { id: 'ios', label: 'Cliente iOS', icon: Apple },
            { id: 'security', label: 'Segurança & Criptografia', icon: Lock }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-zinc-700 dark:text-zinc-300">
          {activeTab === 'protocol' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
                  <Radio className="w-4 h-4 text-blue-500" />
                  1. Descoberta e Registro de Serviços na Rede Local (ZeroConfig)
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Utiliza <strong>mDNS (Multicast DNS)</strong> na porta UDP 5353 sob o serviço{' '}
                  <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-blue-600 dark:text-blue-400 font-mono">
                    _databridge._tcp.local.
                  </code>
                  . Os dispositivos transmitem beacons periódicos contendo identificador, chave pública efêmera, capacidades e portas de escuta. Não há dependência de servidores de nuvem externos.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  2. Motor de Chunking & Transferência em Streaming
                </h4>
                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-5">
                  <li>Divisão de arquivos em chunks binários de <strong>64 KB</strong>.</li>
                  <li>Controle de fluxo de janela deslizante (Sliding Window) para saturação ideal da banda LAN (Wi-Fi 6 e Gigabit).</li>
                  <li>Checksum individual por chunk (CRC32) e digest global SHA-256 do arquivo final.</li>
                  <li>Suporte a <strong>Retomada de Transferência (Resume Offset)</strong> em caso de perda transitória de sinal.</li>
                </ul>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase text-zinc-400">Estrutura do Pacote DataBridge Frame</span>
                  <button
                    onClick={copySpec}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado' : 'Copiar JSON'}
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-zinc-800">
                  {protocolSpecJson}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  DataBridge Transfer para Windows (WinUI 3 / C# / Node Service)
                </h4>
                <p className="text-xs text-blue-900/80 dark:text-blue-300/80">
                  Arquitetura desktop de alta fidelidade com interface Fluent Design (Mica, Acrylic) e serviço em segundo plano no Windows.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Serviço Local Windows (Background Service)
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Escuta nativa em socket TCP assíncrono para recepção de arquivos mesmo com a janela minimizada na bandeja do sistema (System Tray).
                  </p>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Comunicação USB Direta (ADB / WebUSB / MTP Bridge)
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Quando o dispositivo móvel é conectado via cabo USB, o DataBridge estabelece túnel de porta direta (`adb reverse` ou interface USB CDC), atingindo taxas de transferência superiores a 450 MB/s.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  DataBridge Transfer para Android (Kotlin / Material You)
                </h4>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80">
                  Desenvolvido em total conformidade com as diretrizes do Android 14+, utilizando APIs modernas sem root ou bypasses de segurança.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                    • Storage Access Framework (SAF) & MediaStore API
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Acesso seguro a fotos, músicas, APKs, pastas inteiras e armazenamento compartilhado (`ACTION_OPEN_DOCUMENT_TREE`) respeitando o Scoped Storage.
                  </p>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                    • Foreground Service & Wi-Fi Aware / NSD
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Execução contínua de grandes transferências com notificação de progresso interativo e descoberta via Android NsdManager.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-950 dark:text-purple-200 flex items-center gap-2 mb-1">
                  <Apple className="w-4 h-4 text-purple-600" />
                  DataBridge Transfer para iPhone/iPad (Swift / iOS 17+)
                </h4>
                <p className="text-xs text-purple-900/80 dark:text-purple-300/80">
                  Totalmente integrado ao ecossistema Apple, respeitando o App Sandbox e usando exclusivamente APIs públicas da Apple.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                    • Document Picker & PHPhotoLibrary
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Seleção de arquivos através do aplicativo Arquivos (Files) e fotos em resolução nativa (HEIC / ProRAW) sem compressão destrutiva.
                  </p>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                    • Network.framework & UIActivityViewController (Share Sheet)
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Conexões socket de alto desempenho com `NWConnection` e extensão de compartilhamento para transferir qualquer arquivo diretamente do menu de compartilhamento do iOS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Modelo de Segurança de Ponta a Ponta
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  O DataBridge Transfer adota o princípio de <strong>Zero Trust na rede local</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">Criptografia AES-256-GCM</span>
                    <span className="text-zinc-500 dark:text-zinc-400">Cada payload binário é cifrado com chave de sessão efêmera negociada por ECDH.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">Autorização Explícita</span>
                    <span className="text-zinc-500 dark:text-zinc-400">Dispositivos não autenticados recebem prompt de confirmação obrigatório antes do streaming.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Especificação DataBridge Open Protocol v2.1</span>
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
