import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';

interface NewsItem {
  title: string;
  description?: string;
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

  // Mock data para demonstração - pode ser substituído por RSS real
  const mockNews: NewsItem[] = [
    {
      title: "Nova receita de pão caseiro vira sucesso nas redes sociais",
      description: "Chef ensina técnica simples que não requer fermento biológico",
      pubDate: new Date().toISOString(),
      link: "#",
      source: "Panelinha"
    },
    {
      title: "Restaurantes apostam em ingredientes orgânicos e locais",
      description: "Movimento sustentável ganha força no setor gastronômico brasileiro",
      pubDate: new Date().toISOString(),
      link: "#",
      source: "Cyber Cook"
    },
    {
      title: "Festival de Food Trucks movimenta R$ 2 milhões em SP",
      description: "Evento gastronômico atrai milhares de visitantes no fim de semana",
      pubDate: new Date().toISOString(),
      link: "#",
      source: "UOL Gastronomia"
    },
    {
      title: "Dicas para economizar no supermercado sem perder qualidade",
      description: "Nutricionistas ensinam como fazer compras inteligentes e saudáveis",
      pubDate: new Date().toISOString(),
      link: "#",
      source: "Tudo Gostoso"
    },
    {
      title: "Massa artesanal: chef ensina preparo em 5 passos simples",
      description: "Técnica tradicional italiana pode ser feita em casa facilmente",
      pubDate: new Date().toISOString(),
      link: "#",
      source: "Food Network"
    },
    {
      title: "Delivery saudável cresce 150% no último ano",
      description: "Brasileiros buscam opções nutritivas para pedidos em casa",
      pubDate: new Date().toISOString(),
      link: "#",
      source: "G1 Saúde"
    }
  ];

  // Função para buscar notícias via RSS
  const fetchRSSNews = async () => {
    try {
      setLoading(true);
      
      const rssUrls = {
        g1: 'https://g1.globo.com/rss/g1/',
        uol: 'https://rss.uol.com.br/feed/noticias.xml',
        cnn: 'https://www.cnnbrasil.com.br/rss/',
        panelinha: 'https://www.panelinha.com.br/rss',
        cybercook: 'https://cybercook.com.br/rss.xml',
        tudogostoso: 'https://www.tudogostoso.com.br/rss/receitas.xml',
        foodnetwork: 'https://www.foodnetwork.com/feeds/recipes.xml'
      };
      
      const rssUrl = rssUrls[newsSource];
      
      // Usar AllOrigins como proxy para contornar CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.contents) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const newsItems: NewsItem[] = Array.from(items).slice(0, 10).map(item => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          const link = item.querySelector('link')?.textContent || '#';
          
          return {
            title: title.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags
            description: description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200),
            pubDate,
            link,
            source: newsSource === 'g1' ? 'G1' : newsSource === 'uol' ? 'UOL Notícias' : 'CNN Brasil'
          };
        });
        
        if (newsItems.length > 0) {
          setNews(newsItems);
          setError(null);
        } else {
          throw new Error('Nenhuma notícia encontrada');
        }
      } else {
        throw new Error('Erro ao acessar RSS');
      }
    } catch (err) {
      console.error('Erro ao buscar notícias RSS:', err);
      setError('Usando notícias de demonstração');
      setNews(mockNews); // Fallback para mock data
    } finally {
      setLoading(false);
    }
  };

  // Carregar notícias inicialmente e a cada 5 minutos
  useEffect(() => {
    fetchRSSNews();
    const interval = setInterval(fetchRSSNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [newsSource]); // Refetch quando a fonte muda

  // Auto rotação das notícias
  useEffect(() => {
    if (!autoRotate || news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === news.length - 1 ? 0 : prevIndex + 1
      );
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, news.length]);

  const currentNews = news[currentIndex];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-blue-50 to-blue-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-blue-600 text-sm">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  if (error && news.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-red-50 to-red-100 ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

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
        <CardContent className="p-6 h-full flex flex-col min-h-0">
          {/* Header com indicador de fonte */}
          {showSource && (
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span 
                  className="font-medium text-gray-600 uppercase tracking-wider"
                  style={{ fontSize: `${fontSize * 0.6}rem` }}
                >
                  Notícias
                </span>
              </div>
              <span 
                className="text-gray-500"
                style={{ fontSize: `${fontSize * 0.6}rem` }}
              >
                {currentNews.source}
              </span>
            </div>
          )}

          {/* Conteúdo principal */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <h2 
              className="font-bold text-gray-800 leading-tight mb-3 animate-fadeIn overflow-hidden"
              style={{
                fontSize: `${fontSize * 1.5}rem`,
                // Ajustar número de linhas baseado no tamanho da fonte
                display: '-webkit-box',
                WebkitLineClamp: fontSize > 3 ? 2 : fontSize > 2 ? 3 : 4,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.2'
              }}
            >
              {currentNews.title}
            </h2>
            
            {currentNews.description && (
              <p 
                className="text-gray-600 leading-relaxed animate-fadeIn flex-1 overflow-hidden"
                style={{
                  fontSize: `${fontSize * 0.8}rem`, // Descrição um pouco menor que o tamanho base
                  // Ajustar número de linhas para descrição baseado no espaço restante
                  display: '-webkit-box',
                  WebkitLineClamp: fontSize > 4 ? 2 : fontSize > 3 ? 3 : fontSize > 2 ? 4 : 5,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4'
                }}
              >
                {currentNews.description}
              </p>
            )}
          </div>

          {/* Footer com indicadores */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-shrink-0" style={{ marginTop: 'auto' }}>
            {/* Indicadores de posição */}
            <div className="flex gap-1">
              {news.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-500 w-4' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Timestamp */}
            <span 
              className="text-gray-400"
              style={{ fontSize: `${fontSize * 0.5}rem` }}
            >
              {new Date(currentNews.pubDate).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Estilo CSS para animações suaves
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
`;