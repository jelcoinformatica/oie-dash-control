import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';

interface NewsItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  source: string;
}

interface NewsDisplayProps {
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
  showSource?: boolean;
  newsSource?: 'g1' | 'uol' | 'cnn' | 'panelinha' | 'cybercook' | 'tudogostoso' | 'foodnetwork';
  fontSize?: number; // Tamanho da fonte em rem
}

export const NewsDisplay = ({ 
  className = "",
  autoRotate = true,
  rotationInterval = 20000, // 20 segundos
  showSource = true,
  newsSource = 'g1',
  fontSize = 1 // Tamanho padrão 1rem
}: NewsDisplayProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adaptiveFontSize, setAdaptiveFontSize] = useState(fontSize); // Fonte adaptativa

  // Função para ajustar fonte automaticamente baseado no conteúdo
  const adjustFontSize = (element: HTMLElement | null, originalSize: number, maxLines: number) => {
    if (!element) return originalSize;
    
    let currentSize = originalSize;
    const minSize = originalSize * 0.6; // Não reduzir mais que 60% do tamanho original
    
    // Resetar para tamanho original
    element.style.fontSize = `${currentSize * 1.5}rem`;
    element.style.webkitLineClamp = maxLines.toString();
    
    // Verificar se está sendo cortado
    while (element.scrollHeight > element.clientHeight && currentSize > minSize) {
      currentSize -= 0.1;
      element.style.fontSize = `${currentSize * 1.5}rem`;
    }
    
    return currentSize;
  };

  // Effect para ajustar fonte quando notícia muda
  useEffect(() => {
    const titleElement = document.querySelector('.adaptive-title') as HTMLElement;
    if (titleElement && news.length > 0) {
      const newSize = adjustFontSize(titleElement, fontSize, fontSize > 3 ? 2 : fontSize > 2 ? 3 : 4);
      setAdaptiveFontSize(newSize);
    }
  }, [currentIndex, news, fontSize]);

  // Reset adaptive font size when base font size changes
  useEffect(() => {
    setAdaptiveFontSize(fontSize);
  }, [fontSize]);

  // Função para obter nome da fonte formatado
  const getSourceName = (source: string) => {
    const sourceNames = {
      g1: 'G1',
      uol: 'UOL', 
      cnn: 'CNN Brasil',
      panelinha: 'G1', // Está usando G1 como fallback
      cybercook: 'G1', // Está usando G1 como fallback
      tudogostoso: 'G1', // Está usando G1 como fallback
      foodnetwork: 'G1' // Está usando G1 como fallback
    };
    return sourceNames[source] || source.toUpperCase();
  };

  // Mock data REMOVIDO - apenas RSS real
  const mockNews: NewsItem[] = [];

  // Função para buscar notícias via RSS
  const fetchRSSNews = async () => {
    try {
      setLoading(true);
      
      const rssUrls = {
        g1: 'https://g1.globo.com/rss/g1/',
        uol: 'https://rss.uol.com.br/feed/noticias.xml',
        cnn: 'https://www.cnnbrasil.com.br/rss/',
        panelinha: 'https://g1.globo.com/rss/g1/', // Fallback para G1
        cybercook: 'https://g1.globo.com/rss/g1/', // Fallback para G1
        tudogostoso: 'https://g1.globo.com/rss/g1/', // Fallback para G1
        foodnetwork: 'https://g1.globo.com/rss/g1/' // Fallback para G1
      };
      
      const rssUrl = rssUrls[newsSource];
      
      // Usar AllOrigins como proxy para contornar CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      
      console.log('🔄 Fetching RSS from:', rssUrl);
      
      const response = await fetch(proxyUrl);
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from proxy');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid JSON response from proxy');
      }
      
      if (!data.contents) {
        throw new Error('No content in proxy response');
      }
      
      // Parse do XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const newsItems: NewsItem[] = [];
      
      items.forEach((item, index) => {
        if (index < 10) { // Limitar a 10 notícias
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          const link = item.querySelector('link')?.textContent || '';
          
          // Limpar descrição de tags HTML se houver
          const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
          
          if (title) {
            newsItems.push({
              title,
              description: cleanDescription,
              pubDate,
              link,
              source: getSourceName(newsSource)
            });
          }
        }
      });
      
      console.log('📰 Parsed news items:', newsItems);
      
      if (newsItems.length > 0) {
        setNews(newsItems);
        setError(null);
      } else {
        throw new Error('No valid news items found in RSS feed');
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar notícias RSS:', error);
      setError(`Falha ao carregar notícias de ${newsSource.toUpperCase()}. Verifique a conexão.`);
      // NÃO usar dados mock - deixar vazio quando há erro
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect para buscar notícias na inicialização e quando a fonte muda
  useEffect(() => {
    fetchRSSNews();
    
    // Buscar a cada 5 minutos
    const interval = setInterval(fetchRSSNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [newsSource]);

  // Effect para rotação automática
  useEffect(() => {
    if (!autoRotate || news.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, rotationInterval);
    
    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, news.length]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100 ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 text-2xl mb-2">📡</div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            {error || `Erro ao carregar ${newsSource.toUpperCase()}`}
          </p>
          <p className="text-gray-500 text-xs">
            Verifique a conexão com a internet
          </p>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  if (!currentNews) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100 ${className}`}>
        <p className="text-gray-600 text-sm">Nenhuma notícia disponível</p>
      </div>
    );
  }

  return (
    <div className={`h-full bg-gradient-to-b from-slate-50 to-slate-100 ${className}`}>
      <Card className="h-full border-0 shadow-none bg-transparent">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header com moldura estilizada */}
          {showSource && (
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span 
                    className="font-bold uppercase tracking-wider"
                    style={{ fontSize: `${adaptiveFontSize * 0.7}rem` }}
                  >
                    NOTÍCIAS
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border">
                <span 
                  className="font-medium"
                  style={{ fontSize: `${adaptiveFontSize * 0.6}rem` }}
                >
                  {currentNews.source}
                </span>
              </div>
            </div>
          )}

          {/* Conteúdo principal expandido */}
          <div className="flex-1 flex flex-col justify-center min-h-0 pb-8">
            <h2 
              className="adaptive-title font-bold text-gray-800 leading-tight mb-4 animate-fadeIn"
              style={{
                fontSize: `${adaptiveFontSize * 1.5}rem`,
                lineHeight: '1.2',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: adaptiveFontSize > 3 ? 2 : adaptiveFontSize > 2 ? 3 : 4,
              }}
            >
              {currentNews.title}
            </h2>
            
            {currentNews.description && (
              <p 
                className="text-gray-600 leading-relaxed animate-fadeIn"
                style={{
                  fontSize: `${adaptiveFontSize * 0.8}rem`,
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: adaptiveFontSize > 4 ? 2 : adaptiveFontSize > 3 ? 3 : adaptiveFontSize > 2 ? 4 : 5,
                }}
              >
                {currentNews.description}
              </p>
            )}
          </div>

          {/* Footer fixo na parte inferior */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-shrink-0 mt-auto">
            {/* Indicadores de posição */}
            <div className="flex gap-1">
              {news.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-500 scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            {/* Timestamp com estilo aprimorado */}
            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full border">
              <span 
                className="font-mono font-medium"
                style={{ fontSize: `${adaptiveFontSize * 0.6}rem` }}
              >
                {new Date(currentNews.pubDate).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <style>
        {`
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
`}
      </style>
    </div>
  );
};