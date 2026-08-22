import React, { useState } from 'react';
import { useDataBridge } from '../../context/DataBridgeContext';
import { KeyRound, Shield, RefreshCw, X, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const PinConnectModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    pairingPin,
    pinExpiresInSeconds,
    generateNewPairingCodes,
    pairDeviceWithPin
  } = useDataBridge();

  const [mode, setMode] = useState<'view' | 'enter'>('view');
  const [inputPin, setInputPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (activeModal !== 'pin') return null;

  const minutes = Math.floor(pinExpiresInSeconds / 60);
  const seconds = pinExpiresInSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleVerify = async (pinToTest?: string) => {
    const finalPin = pinToTest || inputPin;
    if (finalPin.length < 6) return;

    setIsVerifying(true);
    setFeedback(null);

    const result = await pairDeviceWithPin(finalPin);
    setIsVerifying(false);
    setFeedback(result);

    if (result.success) {
      setTimeout(() => {
        setActiveModal(null);
      }, 1400);
    }
  };

  const handleDigitInput = (val: string) => {
    if (inputPin.length < 6 && /^\d+$/.test(val)) {
      const next = inputPin + val;
      setInputPin(next);
      if (next.length === 6) {
        handleVerify(next);
      }
    }
  };

  const handleBackspace = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Código de Emparelhamento</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Conexão rápida com PIN temporário</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              onClick={() => { setMode('view'); setFeedback(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                mode === 'view'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Meu Código de Conexão
            </button>
            <button
              onClick={() => { setMode('enter'); setFeedback(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                mode === 'enter'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Inserir Código de Outro
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 pt-2">
          {mode === 'view' ? (
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                Digite este código de 6 dígitos no aplicativo <strong>DataBridge Transfer</strong> do outro dispositivo (Android, iPhone ou PC):
              </p>

              {/* Big PIN display */}
              <div className="flex items-center gap-2 mb-4">
                {pairingPin.split('').map((digit, i) => (
                  <div
                    key={i}
                    className="w-11 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 shadow-sm"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Timer indicator */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Expira em <strong>{timeFormatted}</strong></span>
                <button
                  onClick={generateNewPairingCodes}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" /> Gerar novo
                </button>
              </div>

              {/* Security info */}
              <div className="w-full flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-left">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-300">
                  Os códigos são efêmeros e descartáveis. Nenhuma chave privada sai do seu dispositivo local.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Insira o código de 6 dígitos gerado pelo dispositivo remoto:
              </p>

              {/* Input Boxes */}
              <div className="flex items-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono transition-all ${
                      inputPin[idx]
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {inputPin[idx] || '•'}
                  </div>
                ))}
              </div>

              {/* Status feedback */}
              {feedback && (
                <div
                  className={`w-full p-2.5 rounded-xl text-xs mb-3 flex items-center justify-center gap-2 ${
                    feedback.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {feedback.message}
                </div>
              )}

              {/* Virtual keypad */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mb-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Limpar', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      if (k === 'Limpar') {
                        setInputPin('');
                        setFeedback(null);
                      } else if (k === '⌫') {
                        handleBackspace();
                      } else {
                        handleDigitInput(k);
                      }
                    }}
                    className="py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-semibold text-sm text-zinc-800 dark:text-zinc-200 transition active:scale-95"
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* Quick test with current active pin */}
              <button
                onClick={() => handleVerify(pairingPin)}
                disabled={isVerifying}
                className="w-full py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Conectar com PIN ativo ({pairingPin})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
