import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const TypebotEmbed: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const typebotUrl = "https://typebot.co/ag-ncia-aplica-es-automatik-labs-1-sb3b1dp";

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // Timeout para detectar se o iframe não carregou
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 10000); // 10 segundos

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      clearTimeout(timeout);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [retryCount, isLoading]);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1);
    
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = `${typebotUrl}?retry=${retryCount + 1}`;
    }
  };

  const openInNewTab = () => {
    window.open(typebotUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-800/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-white/80">Carregando formulário...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-dark-800/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Problema ao carregar o formulário
            </h3>
            <p className="text-white/70 mb-6">
              Não foi possível carregar o formulário. Tente uma das opções abaixo:
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
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

      {/* Main Iframe */}
      <iframe
        ref={iframeRef}
        src={`${typebotUrl}?v=${Date.now()}`}
        className="w-full h-full border-0"
        title="Formulário de Contato - Automatik Labs"
        allow="microphone; camera; clipboard-read; clipboard-write; geolocation; autoplay"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="eager"
        style={{
          colorScheme: 'dark',
          background: 'transparent'
        }}
      />

      {/* Fallback Script Embed */}
      <div 
        id="typebot-fallback" 
        className="absolute inset-0 opacity-0 pointer-events-none"
        dangerouslySetInnerHTML={{
          __html: `
            <script type="module">
              import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js'
              
              try {
                Typebot.initBubble({
                  typebot: "ag-ncia-aplica-es-automatik-labs-1-sb3b1dp",
                  apiHost: "https://typebot.co",
                  theme: {
                    button: { backgroundColor: "#0057FF" },
                    chatWindow: { backgroundColor: "#1A1A1A" }
                  }
                });
              } catch (error) {
                console.warn('Typebot script fallback failed:', error);
              }
            </script>
          `
        }}
      />
    </div>
  );
};

export default TypebotEmbed;