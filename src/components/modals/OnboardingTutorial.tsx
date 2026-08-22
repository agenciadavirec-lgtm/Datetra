import React, { useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import {
  Wifi,
  MonitorSmartphone,
  CheckCircle2,
  FolderOpen,
  Send,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const OnboardingTutorial: React.FC = () => {
  const { activeModal, setActiveModal } = useDataBridge();
  const [step, setStep] = useState(1);

  if (activeModal !== 'tutorial') return null;

  const steps = [
    {
      number: 1,
      title: 'Conecte os dispositivos à mesma rede',
      desc: 'Certifique-se de que o seu PC Windows, Android e iPhone/iPad estejam conectados à mesma rede Wi-Fi local ou via cabo USB.',
      icon: Wifi,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      badge: 'Passo 1 de 5'
    },
    {
      number: 2,
      title: 'Abra o DataBridge Transfer',
      desc: 'Inicie o aplicativo em todos os aparelhos. O sistema de descoberta mDNS detectará automaticamente os clientes disponíveis sem depender de internet.',
      icon: MonitorSmartphone,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      badge: 'Passo 2 de 5'
    },
    {
      number: 3,
      title: 'Selecione o dispositivo de destino',
      desc: 'Escolha o aparelho desejado na lista ou conecte via QR Code / Código PIN de 6 dígitos para criar uma sessão criptografada segura.',
      icon: CheckCircle2,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      badge: 'Passo 3 de 5'
    },
    {
      number: 4,
      title: 'Escolha os arquivos para enviar',
      desc: 'Arraste arquivos, selecione fotos, vídeos, músicas, APKs, documentos ou pastas inteiras no gerenciador do DataBridge.',
      icon: FolderOpen,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      badge: 'Passo 4 de 5'
    },
    {
      number: 5,
      title: 'Inicie a transferência em alta velocidade',
      desc: 'Acompanhe o progresso em tempo real com controle de pausa, retomada e velocidades de até 100 MB/s (Wi-Fi) ou 480 MB/s (USB).',
      icon: Send,
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      badge: 'Passo 5 de 5'
    }
  ];

  const current = steps[step - 1];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setActiveModal(null);
      setStep(1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Guia Rápido de Uso
            </span>
          </div>
          <button
            onClick={() => {
              setActiveModal(null);
              setStep(1);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center flex flex-col items-center">
          <div className={`p-4 rounded-2xl border ${current.color} mb-4 shadow-sm transition-all duration-300`}>
            <Icon className="w-8 h-8" />
          </div>

          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            {current.badge}
          </span>

          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {current.title}
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs mb-6">
            {current.desc}
          </p>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 mb-4">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => setStep(s.number)}
                className={`h-1.5 rounded-full transition-all ${
                  s.number === step ? 'w-6 bg-blue-600 dark:bg-blue-500' : 'w-2 bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl flex items-center gap-1.5 transition ${
              step === 1
                ? 'opacity-30 cursor-not-allowed text-zinc-400'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            {step === 5 ? 'Começar a Usar' : 'Próximo'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
