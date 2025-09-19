import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, ExternalLink, Settings } from 'lucide-react';

const TypebotEmbed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    typebotId: 'ag-ncia-aplica-es-automatik-labs-1-sb3b1dp',
    apiHost: 'https://typebot.co',
    publicId: '',
    apiKey: ''
  });

  // Função para carregar o Typebot via script
  const loadTypebotScript = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Remove script anterior se existir
      const existingScript = document.querySelector('script[src*="typebot.io"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Carrega o script do Typebot
      const script = document.createElement('script');
      script.type = 'module';
      script.innerHTML = `
        import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js'
        
        try {
          const container = document.getElementById('typebot-container');
          if (container) {
            container.innerHTML = '';
            
            Typebot.initContainer('typebot-container', {
              typebot: "${config.typebotId}",
              apiHost: "${config.apiHost}",
              ${config.publicId ? `publicId: "${config.publicId}",` : ''}
              ${config.apiKey ? `apiKey: "${config.apiKey}",` : ''}
              theme: {
                button: { backgroundColor: "#0057FF" },
                chatWindow: { 
                  backgroundColor: "#1A1A1A",
                  textColor: "#FFFFFF"
                }
              },
              onInit: () => {
                window.dispatchEvent(new CustomEvent('typebotLoaded'));
              },
              onError: (error) => {
                console.error('Typebot error:', error);
                window.dispatchEvent(new CustomEvent('typebotError', { detail: error }));
              }
            });
          }
        } catch (error) {
          console.error('Typebot script error:', error);
          window.dispatchEvent(new CustomEvent('typebotError', { detail: error }));
        }
      `;

      document.head.appendChild(script);

      // Timeout para detectar falha no carregamento
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
      }, 15000);

      // Listeners para eventos do Typebot
      const handleLoad = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(false);
      };

      const handleError = (event: any) => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(true);
        console.error('Typebot loading error:', event.detail);
      };

      window.addEventListener('typebotLoaded', handleLoad);
      window.addEventListener('typebotError', handleError);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('typebotLoaded', handleLoad);
        window.removeEventListener('typebotError', handleError);
      };

    } catch (error) {
      console.error('Error loading Typebot:', error);
      setIsLoading(false);
      setHasError(true);
    }
  };

  // Função para carregar via iframe como fallback
  const loadTypebotIframe = () => {
    if (containerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.src = `${config.apiHost}/${config.typebotId}`;
      iframe.style.cssText = 'width: 100%; height: 600px; border: none; border-radius: 12px;';
      iframe.allow = 'microphone; camera; clipboard-read; clipboard-write; autoplay';
      iframe.allowFullscreen = true;
      
      iframe.onload = () => {
        setIsLoading(false);
        setHasError(false);
      };
      
      iframe.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
    }
  };

  useEffect(() => {
    loadTypebotScript();
  }, [config]);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    loadTypebotScript();
  };

  const handleIframeFallback = () => {
    setIsLoading(true);
    setHasError(false);
    loadTypebotIframe();
  };

  const openInNewTab = () => {
    window.open(`${config.apiHost}/${config.typebotId}`, '_blank', 'noopener,noreferrer');
  };

  const handleConfigSave = () => {
    setShowConfig(false);
    loadTypebotScript();
  };

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden relative bg-dark-800/50">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-800/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-white/80">Carregando Typebot...</p>
            <p className="text-white/60 text-sm mt-2">Conectando com o servidor...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-dark-800/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Erro de Conexão com Typebot
            </h3>
            <p className="text-white/70 mb-6">
              Não foi possível conectar com o Typebot. Isso pode ser devido a configurações de API ou permissões.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowConfig(true)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar API
              </button>
              <button
                onClick={handleIframeFallback}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Tentar Iframe
              </button>
              <button
                onClick={handleRetry}
                className="w-full bg-dark-600 hover:bg-dark-500 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={openInNewTab}
                className="w-full bg-dark-700 hover:bg-dark-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir em Nova Aba
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfig && (
        <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm flex items-center justify-center z-30 p-4">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md border border-dark-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configurar Typebot</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Typebot ID
                </label>
                <input
                  type="text"
                  value={config.typebotId}
                  onChange={(e) => setConfig(prev => ({ ...prev, typebotId: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="ag-ncia-aplica-es-automatik-labs-1-sb3b1dp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  API Host
                </label>
                <input
                  type="text"
                  value={config.apiHost}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiHost: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="https://typebot.co"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Public ID (opcional)
                </label>
                <input
                  type="text"
                  value={config.publicId}
                  onChange={(e) => setConfig(prev => ({ ...prev, publicId: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="Deixe vazio se não tiver"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  API Key (opcional)
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="Deixe vazio se não tiver"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfigSave}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Salvar e Conectar
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-dark-600 hover:bg-dark-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typebot Container */}
      <div 
        id="typebot-container" 
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};

export default TypebotEmbed;