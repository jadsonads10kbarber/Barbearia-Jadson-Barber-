import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Scissors, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.removeItem('jadson_custom_sound_audio_data');
    } catch {}
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-amber-500 selection:text-black">
          <div className="max-w-md w-full bg-[#111111] border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#DAA520] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#DAA520]/20">
              <Scissors className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Recuperação do Sistema</span>
              </div>
              <h1 className="text-xl font-mono font-black uppercase text-white">
                Barbearia Jadson Barber
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                O aplicativo encontrou uma instabilidade temporária no navegador e reiniciará os componentes com segurança.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#DAA520]/20 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                <span>Recarregar Aplicativo</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-mono text-xs font-semibold uppercase transition-colors cursor-pointer"
              >
                <span>Limpar Cache & Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
