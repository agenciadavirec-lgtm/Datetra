import React from 'react';
import { DataBridgeProvider, useDataBridge } from './context/DataBridgeContext';
import { WindowsClient } from './components/pc/WindowsClient';
import { AndroidClient } from './components/android/AndroidClient';
import { IosClient } from './components/ios/IosClient';
import { EcosystemSplitView } from './components/split/EcosystemSplitView';
import { QrConnectModal } from './components/modals/QrConnectModal';
import { PinConnectModal } from './components/modals/PinConnectModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ArchitectureDocsModal } from './components/modals/ArchitectureDocsModal';
import { OnboardingTutorial } from './components/modals/OnboardingTutorial';
import { TransferQueueDrawer } from './components/modals/TransferQueueDrawer';
import { IncomingTransferDialog } from './components/modals/IncomingTransferDialog';
import {
  Monitor,
  Smartphone,
  Apple,
  Layers,
  Sparkles,
  BookOpen,
  Wifi,
  Sun,
  Moon,
  Zap,
  Volume2,
  VolumeX,
  Lock
} from 'lucide-react';
import { ClientViewMode } from './types/databridge';

const MainAppLayout: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setActiveModal,
    settings,
    updateSettings,
    transfers
  } = useDataBridge();

  const activeTransfersCount = transfers.filter((t) => t.status === 'transferring').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Universal Ecosystem Switcher & Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-20">
        {/* Brand & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              DataBridge
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Client Platform Switcher Tabs */}
          <div className="flex p-1 bg-slate-800/90 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewMode('pc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'pc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows PC</span>
            </button>

            <button
              onClick={() => setViewMode('android')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'android'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setViewMode('ios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'ios'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iOS</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulador Duplo</span>
              <span className="md:hidden">Duplo</span>
            </button>
          </div>
        </div>

        {/* Right Tools & Status Badges */}
        <div className="flex items-center gap-2">
          {/* Active transfers floating trigger */}
          {activeTransfersCount > 0 && (
            <button
              onClick={() => setActiveModal('queue')}
              className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-pulse transition"
            >
              <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
              <span>{activeTransfersCount} ativo(s)</span>
            </button>
          )}

          {/* Universal QR Code Launcher Button */}
          <button
            onClick={() => setActiveModal('qr')}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-blue-500/20 hover:from-amber-500/30 hover:to-blue-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
            title="Conectar por QR Code"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>QR Code</span>
          </button>

          {/* Quick Guide */}
          <button
            onClick={() => setActiveModal('tutorial')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Como Usar</span>
          </button>

          {/* Architecture & Protocol Docs */}
          <button
            onClick={() => setActiveModal('archDocs')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Arquitetura & Protocolo</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title={settings.soundEnabled ? 'Áudio ativado' : 'Silencioso'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Alternar Tema"
          >
            {settings.darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </header>

      {/* Client View Container */}
      <main className="flex-1 overflow-hidden relative">
        {viewMode === 'pc' && <WindowsClient />}
        {viewMode === 'android' && <AndroidClient />}
        {viewMode === 'ios' && <IosClient />}
        {viewMode === 'split' && <EcosystemSplitView />}
      </main>

      {/* Global Modals & Dialogs */}
      <QrConnectModal />
      <PinConnectModal />
      <HistoryModal />
      <SettingsModal />
      <ArchitectureDocsModal />
      <OnboardingTutorial />
      <TransferQueueDrawer />
      <IncomingTransferDialog />
    </div>
  );
};

export default function App() {
  return (
    <DataBridgeProvider>
      <MainAppLayout />
    </DataBridgeProvider>
  );
}
