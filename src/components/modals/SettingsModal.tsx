import React from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Shield,
  Zap,
  Folder,
  Radio,
  Cable,
  Check,
  Smartphone,
  Cpu
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { activeModal, setActiveModal, settings, updateSettings, serverStatus } = useDataBridge();

  if (activeModal !== 'settings') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Configurações do DataBridge</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Preferências locais, segurança e rede</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Device Profile */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Identificação do Dispositivo
            </label>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Nome visível na rede local</span>
                <input
                  type="text"
                  value={settings.deviceName}
                  onChange={(e) => updateSettings({ deviceName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Pasta padrão de recebimento</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{settings.defaultFolder}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newPath = prompt('Informe o caminho da pasta padrão:', settings.defaultFolder);
                      if (newPath) updateSettings({ defaultFolder: newPath });
                    }}
                    className="px-3 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 transition"
                  >
                    Alterar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Network & Transfer Limits */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Desempenho e Limite de Velocidade
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
                <div>
                  <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 block">Limite de largura de banda</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Controle para não saturar a rede Wi-Fi</span>
                </div>
                <select
                  value={settings.speedLimitMbps}
                  onChange={(e) => updateSettings({ speedLimitMbps: Number(e.target.value) })}
                  className="mt-2 text-xs bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg p-2 font-medium text-zinc-800 dark:text-zinc-100 focus:outline-none"
                >
                  <option value={0}>Ilimitado (Velocidade Máxima LAN)</option>
                  <option value={100}>100 MB/s (Gigabit Wi-Fi)</option>
                  <option value={50}>50 MB/s (Wi-Fi 5 GHz)</option>
                  <option value={20}>20 MB/s (Wi-Fi 2.4 GHz)</option>
                  <option value={5}>5 MB/s (Econômico)</option>
                </select>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 block flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-500" /> Descoberta Automática
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Buscar via mDNS e SSDP</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDiscovery}
                  onChange={(e) => updateSettings({ autoDiscovery: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Interface & Feedback */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" /> Aparência e Áudio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {settings.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <div>
                    <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 block">Tema Visual</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {settings.darkMode ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Alternar</span>
              </button>

              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                  <div>
                    <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 block">Sons do Sistema</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {settings.soundEnabled ? 'Chimes ativados' : 'Silencioso'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {settings.soundEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </div>
          </div>

          {/* Security & Bridges */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Segurança e Conexão USB
            </label>
            <div className="space-y-2">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 block flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5 text-blue-500" /> Comunicação via Cabo USB
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Habilitar transferência direta de alta velocidade (480 MB/s)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowUsbBridge}
                  onChange={(e) => updateSettings({ allowUsbBridge: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 block">
                    Aceitar automaticamente de dispositivos pareados
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Sem popup de confirmação para aparelhos confiáveis
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAcceptPaired}
                  onChange={(e) => updateSettings({ autoAcceptPaired: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* System Protocol Specs Card */}
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Especificações do Motor de Rede DataBridge</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-800/90 dark:text-blue-300/80 mt-2">
              <div>• Protocolo: <strong>{serverStatus.protocol}</strong></div>
              <div>• Criptografia: <strong>AES-256-GCM + TLS</strong></div>
              <div>• Porta TCP de Transferência: <strong>8765</strong></div>
              <div>• Descoberta Local: <strong>mDNS UDP 5353</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Alterações salvas automaticamente</span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
