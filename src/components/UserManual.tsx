import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Search, 
  Home, 
  Settings, 
  Play, 
  Volume2, 
  Palette, 
  Monitor, 
  Zap, 
  HelpCircle,
  ChevronRight,
  Clock,
  MousePointer,
  Keyboard,
  Eye,
  Bell,
  Puzzle,
  Database,
  Maximize,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface UserManualProps {
  children: React.ReactNode;
}

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  keywords: string[];
}

export const UserManual = ({ children }: UserManualProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [searchResults, setSearchResults] = useState<Array<{sectionId: string, matches: number}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');

  const manualSections: ManualSection[] = [
    {
      id: 'overview',
      title: 'Visão Geral',
      icon: <Home className="w-4 h-4" />,
      keywords: ['visão', 'geral', 'inicio', 'começar', 'sistema', 'kds', 'kitchen'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sistema Oie! - Painel de Senhas</h3>
          <p className="text-sm text-muted-foreground">
            O sistema Oie!, é um painel de senhas que exibe os números de chamada gerados pelo PDV para facilitar o controle de expedição de pedidos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                Interface Principal
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Coluna Produção (opcional)</li>
                <li>• Coluna Prontos (obrigatória)</li>
                <li>• Coluna Publicidade (opcional)</li>
                <li>• Painel de Controle inferior</li>
              </ul>
            </div>
            
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                Funcionalidades
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Expedição manual de pedidos</li>
                <li>• Auto-expedição configurável</li>
                <li>• Text-to-Speech (TTS)</li>
                <li>• Simulação de pedidos</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-600" />
              Atalhos Rápidos
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><Badge variant="outline">Ctrl + K</Badge> Abrir Configurações</div>
              <div><Badge variant="outline">000</Badge> Fechar Sistema (modo kiosk)</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navegação Básica',
      icon: <MousePointer className="w-4 h-4" />,
      keywords: ['navegação', 'clique', 'botões', 'interface', 'usar', 'operação'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Como Navegar no Sistema</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-purple-500" />
                Interações com Pedidos
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500" />
                  <div>
                    <strong>Clique em pedido na Produção:</strong><br />
                    Move automaticamente para Prontos
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-green-500" />
                  <div>
                    <strong>Clique em pedido Pronto:</strong><br />
                    Expede o pedido (remove da tela)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-orange-500" />
                  <div>
                    <strong>Contador cinza (quando produção oculta):</strong><br />
                    Mostra pedidos em produção em popup
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-green-500" />
                Expedição Manual
              </h4>
              <ul className="text-sm space-y-2">
                <li>1. Digite o número do pedido no campo central</li>
                <li>2. Pressione <Badge variant="outline">Enter</Badge> ou clique no botão enviar</li>
                <li>3. O pedido será expedido automaticamente</li>
                <li>4. Aparecerá no log de expedição</li>
              </ul>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Maximize className="w-4 h-4 text-blue-500" />
                Modo Kiosk
              </h4>
              <ul className="text-sm space-y-2">
                <li>• Sistema entra automaticamente em tela cheia</li>
                <li>• Use o botão minimizar/maximizar no canto inferior esquerdo</li>
                <li>• Digite <Badge variant="destructive">000</Badge> para fechar o sistema</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'production',
      title: 'Coluna Produção',
      icon: <Clock className="w-4 h-4" />,
      keywords: ['produção', 'cozinha', 'preparar', 'pedidos', 'coluna', 'esquerda'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gestão da Coluna Produção</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Exibe pedidos que estão sendo preparados na cozinha. Quando um pedido fica pronto, 
                clique nele para movê-lo automaticamente para a coluna "Prontos".
              </p>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Configurações Disponíveis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Visual:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Título personalizado</li>
                    <li>• Cores do cabeçalho</li>
                    <li>• Altura do cabeçalho</li>
                    <li>• Fonte e tamanho</li>
                    <li>• Largura da coluna</li>
                  </ul>
                </div>
                <div>
                  <strong>Cartões:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Mostrar/ocultar apelido</li>
                    <li>• Mostrar/ocultar itens</li>
                    <li>• Tipo de indicador no card</li>
                    <li>• Número de colunas</li>
                    <li>• Cores personalizadas</li>
                    <li>• Espaçamentos configuráveis</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-600" />
                Visualização com Coluna Oculta
              </h4>
              <div className="text-sm space-y-2">
                <p><strong>Funcionalidade Especial:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Contador cinza aparece no canto superior esquerdo da coluna Prontos</li>
                  <li>• Mostra quantos pedidos estão "Em Produção"</li>
                  <li>• <strong>Clique no contador</strong> para ver todos os pedidos em produção</li>
                  <li>• Mesmo com coluna fechada, ainda é possível interagir com os pedidos</li>
                  <li>• Interface popup permite mover pedidos para "Prontos"</li>
                </ul>
                <p><strong>Vantagem:</strong> Economiza espaço na tela mantendo funcionalidade completa</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Coluna Prontos',
      icon: <CheckCircle2 className="w-4 h-4" />,
      keywords: ['prontos', 'expedição', 'finalizado', 'entrega', 'coluna', 'centro'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gestão da Coluna Prontos</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Exibe pedidos prontos para expedição. Esta é a coluna principal e não pode ser ocultada. 
                Clique em um pedido para expedi-lo ou use o campo de expedição manual.
              </p>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Funcionalidades Especiais</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Último Pedido em Destaque:</strong>
                  <p>O último pedido expedido pode ser mantido fixo no topo com destaque visual, facilitando conferências.</p>
                </div>
                <div>
                  <strong>Contador de Pedidos:</strong>
                  <p>Mostra no cabeçalho quantos pedidos estão prontos (incluindo o último pedido se destacado).</p>
                </div>
                <div>
                  <strong>Contador de Produção:</strong>
                  <p>Quando a coluna produção está oculta, aparece um contador cinza mostrando pedidos em produção.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Layout dos Cartões</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Organização:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Grade configurável (1-4 colunas)</li>
                    <li>• Rolagem automática</li>
                    <li>• Tamanho responsivo</li>
                  </ul>
                </div>
                <div>
                  <strong>Informações:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Número do pedido (grande)</li>
                    <li>• Apelido do cliente</li>
                    <li>• Lista de itens</li>
                    <li>• Indicador de módulo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'advertising',
      title: 'Coluna Publicidade',
      icon: <Palette className="w-4 h-4" />,
      keywords: ['publicidade', 'propaganda', 'notícias', 'coluna', 'direita', 'opcional'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Coluna de Publicidade</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Área dedicada para exibir conteúdo promocional, notícias ou informações da empresa. 
                Totalmente opcional e personalizável.
              </p>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Configurações Visuais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Cabeçalho:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Mostrar/ocultar</li>
                    <li>• Título personalizado</li>
                    <li>• Cores e fontes</li>
                    <li>• Altura ajustável (40-120px)</li>
                  </ul>
                </div>
                <div>
                  <strong>Conteúdo:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Cor de fundo personalizada</li>
                    <li>• Largura da coluna (200-500px)</li>
                    <li>• Layout responsivo</li>
                    <li>• Padding interno ajustável</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                Feed RSS e Links Externos
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Feed RSS - Exemplo de Configuração:</strong>
                  <div className="bg-muted/50 p-3 rounded mt-2 font-mono text-xs">
                    <p><strong>URL:</strong> https://g1.globo.com/rss/g1/</p>
                    <p><strong>Intervalo:</strong> 15 minutos</p>
                    <p><strong>Máx. itens:</strong> 5</p>
                    <p><strong>Filtro:</strong> "economia,política"</p>
                  </div>
                  <ul className="ml-4 mt-2 space-y-1">
                    <li>• URL do feed RSS personalizada</li>
                    <li>• Atualização automática (5-60 minutos)</li>
                    <li>• Filtros por categoria ou palavra-chave</li>
                    <li>• Limitação de itens exibidos (1-20)</li>
                    <li>• Formato de exibição configurável</li>
                  </ul>
                </div>
                <div>
                  <strong>Links Personalizados:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Lista de links úteis</li>
                    <li>• Ícones personalizáveis</li>
                    <li>• Abertura em nova aba</li>
                    <li>• Agrupamento por categorias</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-green-500" />
                Imagens Estáticas e Multimedia
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Dimensões Recomendadas:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <Badge variant="outline">300x200px</Badge> - Banner horizontal</li>
                    <li>• <Badge variant="outline">250x350px</Badge> - Banner vertical</li>
                    <li>• <Badge variant="outline">300x300px</Badge> - Quadrado (logotipos)</li>
                    <li>• <Badge variant="outline">600x400px</Badge> - HD horizontal</li>
                  </ul>
                </div>
                <div>
                  <strong>Formatos Suportados:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• JPG/JPEG (boa compressão)</li>
                    <li>• PNG (transparência)</li>
                    <li>• GIF (animações)</li>
                    <li>• WebP (otimizado para web)</li>
                    <li>• SVG (vetorial, responsivo)</li>
                  </ul>
                </div>
                <div>
                  <strong>Configurações de Exibição:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Rotação automática (slideshow)</li>
                    <li>• Tempo de exibição (3-30 segundos)</li>
                    <li>• Efeitos de transição</li>
                    <li>• Redimensionamento automático</li>
                    <li>• Aspecto preservado ou esticado</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-500" />
                Tipos de Conteúdo Suportados
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Texto e HTML:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• HTML personalizado</li>
                    <li>• Texto simples formatado</li>
                    <li>• Listas e tabelas</li>
                    <li>• Estilos CSS inline</li>
                  </ul>
                </div>
                <div>
                  <strong>Widgets Interativos:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Relógio digital</li>
                    <li>• Clima local</li>
                    <li>• Calendário</li>
                    <li>• Contador personalizado</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                Dicas de Performance
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Mantenha imagens abaixo de 2MB para carregamento rápido</li>
                <li>• Use WebP quando possível para melhor compressão</li>
                <li>• Evite muitas animações simultâneas</li>
                <li>• Teste a velocidade de carregamento dos feeds RSS</li>
                <li>• Configure cache apropriado para conteúdo estático</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'expedition',
      title: 'Sistema de Expedição',
      icon: <Zap className="w-4 h-4" />,
      keywords: ['expedição', 'expedir', 'manual', 'automático', 'pedido', 'finalizar'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sistema de Expedição</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Expedição Manual
              </h4>
              <div className="space-y-3 text-sm">
                <p>Campo localizado no centro da barra inferior, sempre visível e acessível.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Como usar:</strong>
                    <ol className="ml-4 mt-1 space-y-1 list-decimal">
                      <li>Digite o número do pedido</li>
                      <li>Pressione Enter ou clique em enviar</li>
                      <li>Pedido é expedido automaticamente</li>
                    </ol>
                  </div>
                  <div>
                    <strong>Funcionalidades:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Auto-focus no campo</li>
                      <li>• Validação de entrada</li>
                      <li>• Feedback visual</li>
                      <li>• Log de expedição</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Auto-Expedição
              </h4>
              <div className="space-y-3 text-sm">
                <p>Sistema que automaticamente expede pedidos após um tempo configurável.</p>
                <div>
                  <strong>Configurações:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Ativar/desativar</li>
                    <li>• Tempo de espera (1-30 minutos)</li>
                    <li>• Aplicar apenas a pedidos específicos</li>
                    <li>• Indicação visual diferenciada</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Log de Expedição</h4>
              <div className="space-y-3 text-sm">
                <p>Histórico dos últimos 10 pedidos expedidos, visível na barra inferior.</p>
                <div>
                  <strong>Informações mostradas:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Número do pedido</li>
                    <li>• Horário da expedição</li>
                    <li>• Apelido do cliente (tooltip)</li>
                    <li>• Indicação de auto-expedição (cor rosa)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sounds',
      title: 'Sons e Notificações',
      icon: <Volume2 className="w-4 h-4" />,
      keywords: ['som', 'áudio', 'notificação', 'alerta', 'tts', 'text-to-speech'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sistema de Sons e TTS</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                Sons de Notificação
              </h4>
              <div className="space-y-3 text-sm">
                <p>Alertas sonoros para diferentes eventos do sistema, totalmente personalizáveis.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Eventos com som:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Novo pedido na produção</li>
                      <li>• Pedido movido para prontos</li>
                      <li>• Expedição de pedido</li>
                      <li>• Auto-expedição de pedido</li>
                      <li>• Erro na expedição</li>
                      <li>• Sistema iniciado</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Configurações por evento:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Ativar/desativar individualmente</li>
                      <li>• Escolher arquivo de som (.wav, .mp3)</li>
                      <li>• Ajustar volume (0-100%)</li>
                      <li>• Repetir som (1-5 vezes)</li>
                      <li>• Delay entre repetições</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-500" />
                Text-to-Speech (TTS) Avançado
              </h4>
              <div className="space-y-3 text-sm">
                <p>Sistema de narração automática com múltiplas opções e configurações de voz.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Conteúdo Narrado:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Número do pedido</li>
                      <li>• Apelido do cliente</li>
                      <li>• Lista completa de itens</li>
                      <li>• Tipo de módulo (balcão, mesa, etc.)</li>
                      <li>• Instruções especiais</li>
                      <li>• Quantidade de itens</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Configurações de Voz:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Velocidade de fala (0.5x - 3x)</li>
                      <li>• Tom da voz (pitch: -2 a +2)</li>
                      <li>• Volume específico do TTS</li>
                      <li>• Seleção de voz (quando disponível)</li>
                      <li>• Idioma (pt-BR, en, es, fr)</li>
                      <li>• Pausas entre palavras</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <strong>Eventos de TTS Configuráveis:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Novo pedido chegou (produção)</li>
                    <li>• Pedido pronto para expedição</li>
                    <li>• Pedido foi expedido</li>
                    <li>• Lista de pedidos pendentes (resumo)</li>
                    <li>• Avisos personalizados (por horário)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-500" />
                Exemplo Prático - Som "Pronto" + TTS
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Configuração Típica:</strong>
                  <div className="bg-muted/50 p-3 rounded mt-2 font-mono text-xs">
                    <p><strong>Evento:</strong> Pedido movido para "Prontos"</p>
                    <p><strong>Sequência:</strong> Som → Pausa (0.5s) → Voz</p>
                    <p><strong>Arquivo de Som:</strong> kds_sound_bell1.wav</p>
                    <p><strong>Template TTS:</strong> "Pedido &#123;numero&#125; pronto para &#123;apelido&#125;"</p>
                    <p><strong>Resultado Final:</strong> *DING* → "Pedido 123 pronto para Maria"</p>
                  </div>
                </div>
                <div>
                  <strong>Personalização Avançada:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Volume do som: 80% / Volume TTS: 90%</li>
                    <li>• Velocidade da voz: 1.2x (um pouco mais rápida)</li>
                    <li>• Pausas configuráveis entre som e fala</li>
                    <li>• Templates diferentes por módulo</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                Regras e Condições Avançadas
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Filtros de Ativação:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Por horário (ex: só entre 12h-14h)</li>
                    <li>• Por tipo de módulo (só balcão/mesa)</li>
                    <li>• Por quantidade de pedidos pendentes</li>
                    <li>• Por palavras-chave nos itens</li>
                    <li>• Por número do pedido (padrões específicos)</li>
                  </ul>
                </div>
                <div>
                  <strong>Condições de Volume Dinâmico:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Volume mais alto em horários de pico</li>
                    <li>• Redução automática após horário comercial</li>
                    <li>• Aumento gradual para pedidos antigos</li>
                    <li>• Silenciar completamente em períodos definidos</li>
                  </ul>
                </div>
                <div>
                  <strong>Personalização de Mensagens:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Templates de fala personalizáveis</li>
                    <li>• Prefixos/sufixos por módulo</li>
                    <li>• Abreviações de itens longos</li>
                    <li>• Pronúncia personalizada de palavras</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-purple-500" />
                Comandos de Voz e Atalhos
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Comandos Manuais:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Botão "Repetir última narração"</li>
                    <li>• Narrar lista atual de pedidos</li>
                    <li>• Testar configurações de voz</li>
                    <li>• Silenciar temporariamente (30min/1h)</li>
                  </ul>
                </div>
                <div>
                  <strong>Atalhos de Teclado:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <Badge variant="outline">Ctrl + M</Badge> - Silenciar/Ativar TTS</li>
                    <li>• <Badge variant="outline">Ctrl + R</Badge> - Repetir última narração</li>
                    <li>• <Badge variant="outline">Ctrl + L</Badge> - Ler lista atual</li>
                    <li>• <Badge variant="outline">Ctrl + T</Badge> - Testar voz</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Compatibilidade e Limitações
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Navegadores Suportados:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <Badge variant="outline">Chrome</Badge> - Suporte completo, melhor qualidade</li>
                    <li>• <Badge variant="outline">Firefox</Badge> - Suporte bom, algumas limitações</li>
                    <li>• <Badge variant="outline">Safari</Badge> - Suporte básico</li>
                    <li>• <Badge variant="outline">Edge</Badge> - Suporte completo</li>
                  </ul>
                </div>
                <div>
                  <strong>Limitações Técnicas:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Requer interação do usuário para primeiro uso</li>
                    <li>• Qualidade da voz varia por SO</li>
                    <li>• Algumas vozes podem não estar disponíveis</li>
                    <li>• Performance pode variar com textos longos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'modules',
      title: 'Módulos do Sistema',
      icon: <Puzzle className="w-4 h-4" />,
      keywords: ['módulos', 'balcão', 'mesa', 'entrega', 'ficha', 'tipos', 'pedido'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Módulos de Pedidos</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-indigo-500" />
                Tipos de Módulos
              </h4>
              <p className="text-sm mb-3">
                O sistema suporta diferentes tipos de pedidos, cada um com indicação visual específica.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <strong>Balcão</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <strong>Mesa</strong>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <strong>Entrega</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <strong>Ficha</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Opções de Exibição</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Por Módulo (padrão):</strong>
                  <p>Cada tipo de pedido fica em um grupo separado dentro da coluna.</p>
                </div>
                <div>
                  <strong>Misturado:</strong>
                  <p>Todos os pedidos ficam juntos, diferenciados apenas pelo indicador visual.</p>
                </div>
                <div>
                  <strong>Apenas um tipo:</strong>
                  <p>Filtra para mostrar apenas pedidos de um módulo específico.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Tipo de Indicador no Card</h4>
              <div className="space-y-3 text-sm">
                <p>Configure como os módulos serão identificados visualmente nos cartões de pedidos.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Nenhum indicador:</strong>
                    <p>Cartões sem identificação visual de módulo</p>
                  </div>
                  <div>
                    <strong>Bullets:</strong>
                    <p>Pequenos círculos coloridos no canto superior direito</p>
                  </div>
                  <div>
                    <strong>Etiquetas:</strong>
                    <p>Tags retangulares com texto do módulo</p>
                  </div>
                  <div>
                    <strong>Bordas:</strong>
                    <p>Borda colorida ao redor do cartão inteiro</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <p className="font-medium mb-2">Configuração Global:</p>
                  <ul className="space-y-1">
                    <li>• Aplica-se a todas as colunas (Produção e Prontos)</li>
                    <li>• Cores automáticas por módulo (azul=balcão, verde=mesa, laranja=entrega, roxo=ficha)</li>
                    <li>• Configuração dinâmica - mudanças aparecem instantaneamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'simulation',
      title: 'Simulação de Pedidos',
      icon: <Play className="w-4 h-4" />,
      keywords: ['simulação', 'teste', 'demo', 'gerar', 'pedidos', 'automático'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sistema de Simulação</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Play className="w-4 h-4 text-green-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Permite gerar pedidos automaticamente para testar o sistema, treinar funcionários 
                ou fazer demonstrações sem precisar de pedidos reais.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Importante - Dados Simulados
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Sistema em Modo Demonstração:</strong></p>
                <p>• Os pedidos simulados são apenas para fins didáticos</p>
                <p>• Quando conectado a uma base de dados real, estes dados <strong>NÃO</strong> serão salvos</p>
                <p>• Use livremente para treinamento e demonstrações</p>
                <p>• Os dados reais permanecem totalmente seguros e inalterados</p>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Configurações Disponíveis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Simulação Manual:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Botão "Gerar Pedidos"</li>
                    <li>• Quantidade personalizável</li>
                    <li>• Geração imediata</li>
                    <li>• Controle total</li>
                  </ul>
                </div>
                <div>
                  <strong>Simulação Automática:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Intervalo configurável (15-300s)</li>
                    <li>• Pedidos por intervalo (1-5)</li>
                    <li>• Start/Stop simples</li>
                    <li>• Resumo dinâmico</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Pedidos Gerados</h4>
              <div className="space-y-3 text-sm">
                <p>Os pedidos simulados incluem:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Números sequenciais ou aleatórios</li>
                  <li>• Mix de diferentes módulos (balcão, mesa, entrega, ficha)</li>
                  <li>• Apelidos realistas de clientes</li>
                  <li>• Lista variada de itens</li>
                  <li>• Horários realistas</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Integração "KDS da Hora!"
              </h4>
              <div className="text-sm space-y-2">
                <p><strong>Sistema Integrado:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• O sistema "KDS da Hora!" pode estar integrado ao Oie!</li>
                  <li>• Mudança automática: PRODUÇÃO → PRONTO</li>
                  <li>• Confirmação no KDS atualiza status automaticamente</li>
                  <li>• Sincronização em tempo real entre sistemas</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Casos de Uso
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Treinamento de equipe</li>
                <li>• Demonstrações para clientes</li>
                <li>• Testes de performance</li>
                <li>• Ajuste de configurações</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'overlay-controls',
      title: 'Controles Diretos',
      icon: <MousePointer className="w-4 h-4" />,
      keywords: ['controles', 'diretos', 'overlay', 'tempo real', 'ajustes', 'rápidos', 'configuração instantânea'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Controles Diretos em Tempo Real</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-blue-500" />
                O que são os Controles Diretos
              </h4>
              <p className="text-sm">
                Interface de controles sobrepostos que permite ajustar configurações visuais em tempo real, 
                sem precisar abrir o painel de configurações principal. Ideal para ajustes rápidos durante o uso.
              </p>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                Como Ativar
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Localização:</strong> Configurações → Overlays → Controles Diretos</p>
                <p><strong>Ativação:</strong> Marque a opção "Ativar Controles Diretos"</p>
                <p><strong>Interface:</strong> Aparece como um painel flutuante no lado direito da tela</p>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Controles Disponíveis</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Cabeçalhos (Headers):</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Altura dos cabeçalhos (40px - 120px)</li>
                    <li>• Ajuste em tempo real com slider</li>
                    <li>• Visualização imediata das mudanças</li>
                  </ul>
                </div>
                <div>
                  <strong>Coluna 1 (Produção):</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Número de colunas no grid (1-4)</li>
                    <li>• Espaçamento horizontal entre cards</li>
                    <li>• Espaçamento vertical entre cards</li>
                    <li>• Tamanho da fonte dos cards</li>
                  </ul>
                </div>
                <div>
                  <strong>Coluna 2 (Prontos):</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Número de colunas no grid (1-4)</li>
                    <li>• Espaçamento horizontal entre cards</li>
                    <li>• Espaçamento vertical entre cards</li>
                    <li>• Tamanho da fonte dos cards</li>
                  </ul>
                </div>
                <div>
                  <strong>Último Pedido:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Altura da área do último pedido</li>
                    <li>• Tamanho da fonte do último pedido</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Maximize className="w-4 h-4 text-purple-500" />
                Interface dos Controles
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Navegação por Abas:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Headers - Controles dos cabeçalhos</li>
                    <li>• Col1 - Configurações da coluna Produção</li>
                    <li>• Col2 - Configurações da coluna Prontos</li>
                    <li>• Last-Order - Área do último pedido</li>
                  </ul>
                </div>
                <div>
                  <strong>Controles Visuais:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Sliders com valores mínimos e máximos</li>
                    <li>• Labels descritivos para cada controle</li>
                    <li>• Feedback visual imediato das alterações</li>
                    <li>• Botão de minimizar/expandir</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Vantagens dos Controles Diretos
              </h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Ajustes em Tempo Real:</strong> Ver mudanças instantaneamente</li>
                <li>• <strong>Facilidade de Uso:</strong> Não precisa abrir configurações</li>
                <li>• <strong>Otimização Rápida:</strong> Ideal para calibrar a tela</li>
                <li>• <strong>Interface Limpa:</strong> Pode ser minimizado quando não usar</li>
                <li>• <strong>Salvamento Automático:</strong> Mudanças são salvas automaticamente</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Casos de Uso Ideais
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Ajustar layout para diferentes tamanhos de tela</li>
                <li>• Otimizar espaçamento durante horários de pico</li>
                <li>• Calibrar tamanhos de fonte para melhor legibilidade</li>
                <li>• Fazer ajustes finos após mudanças de configuração</li>
                <li>• Demonstrações e treinamentos em tempo real</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'configuration',
      title: 'Configurações Avançadas',
      icon: <Settings className="w-4 h-4" />,
      keywords: ['configurações', 'personalizar', 'cores', 'fontes', 'backup', 'restaurar'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Painel de Configurações</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                Acesso às Configurações
              </h4>
              <div className="space-y-2 text-sm">
                <p>Existem duas formas de abrir o painel:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Atalho: <Badge variant="outline">Ctrl + K</Badge></li>
                  <li>• Botão de engrenagem no canto inferior direito</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Seções de Configuração</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Visual:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Produção</li>
                    <li>• Prontos</li>
                    <li>• Publicidade</li>
                    <li>• Splash Screen</li>
                    <li>• Controles Diretos</li>
                  </ul>
                </div>
                <div>
                  <strong>Funcional:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Sons</li>
                    <li>• Text-to-Speech</li>
                    <li>• Auto-Expedição</li>
                    <li>• Módulos</li>
                    <li>• Simulação</li>
                    <li>• Tipo de Indicador no Card</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                Backup e Restauração
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Exportar Configuração:</strong>
                  <p>Salva todas as configurações em um arquivo JSON para backup.</p>
                </div>
                <div>
                  <strong>Importar Configuração:</strong>
                  <p>Restaura configurações de um arquivo JSON previamente exportado.</p>
                </div>
                <div>
                  <strong>Configuração de Fábrica:</strong>
                  <p>Restaura todas as configurações para os valores padrão do sistema.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Importante
              </h4>
              <p className="text-sm">
                As configurações são salvas automaticamente no navegador. Use a função de backup 
                para preservar configurações entre dispositivos ou reinstalações.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Solução de Problemas',
      icon: <AlertTriangle className="w-4 h-4" />,
      keywords: ['problemas', 'erro', 'bug', 'não funciona', 'ajuda', 'suporte'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Solução de Problemas Comuns</h3>
          
          <div className="space-y-4">
            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 text-red-600">Som não funciona</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Possíveis causas:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Navegador bloqueia reprodução automática</li>
                  <li>• Volume do sistema muito baixo</li>
                  <li>• Sons desabilitados nas configurações</li>
                </ul>
                <p><strong>Soluções:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Clique em qualquer lugar da tela primeiro</li>
                  <li>• Verifique o volume do sistema</li>
                  <li>• Teste os sons nas configurações</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 text-red-600">TTS não fala</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Soluções:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Use Chrome ou Firefox (melhor compatibilidade)</li>
                  <li>• Verifique se TTS está habilitado</li>
                  <li>• Teste com texto simples primeiro</li>
                  <li>• Reinicie o navegador</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 text-red-600">Tela não fica em modo kiosk</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Soluções:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Permita modo tela cheia quando solicitado</li>
                  <li>• Use F11 manualmente se necessário</li>
                  <li>• Clique no botão maximizar no canto inferior esquerdo</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border bg-card/50 rounded-lg shadow-sm">
              <h4 className="font-medium mb-2 text-red-600">Configurações não salvam</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Soluções:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Certifique-se de clicar em "Salvar"</li>
                  <li>• Verifique se o navegador permite localStorage</li>
                  <li>• Não use modo incógnito/privado</li>
                  <li>• Faça backup das configurações</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Contato para Suporte
              </h4>
              <div className="text-sm">
                <p><strong>Jelco Informática</strong></p>
                <p>Para suporte técnico, entre em contato com nossa equipe técnica.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Função para extrair texto de um elemento React
  const extractTextFromReactNode = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (!node) return '';
    
    if (Array.isArray(node)) {
      return node.map(extractTextFromReactNode).join(' ');
    }
    
    if (typeof node === 'object' && 'props' in node) {
      if (node.props?.children) {
        return extractTextFromReactNode(node.props.children);
      }
    }
    
    return '';
  };

  // Função para destacar texto encontrado
  const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Função para processar conteúdo React e destacar texto
  const processReactNodeWithHighlight = (node: React.ReactNode, searchTerm: string): React.ReactNode => {
    if (typeof node === 'string') {
      return highlightText(node, searchTerm);
    }
    
    if (typeof node === 'number') {
      return highlightText(node.toString(), searchTerm);
    }
    
    if (!node) return node;
    
    if (Array.isArray(node)) {
      return node.map((child, index) => 
        React.cloneElement(
          <span key={index}>{processReactNodeWithHighlight(child, searchTerm)}</span>
        )
      );
    }
    
    if (typeof node === 'object' && 'props' in node) {
      const element = node as React.ReactElement;
      if (element.props?.children) {
        return React.cloneElement(element, {
          ...element.props,
          children: processReactNodeWithHighlight(element.props.children, searchTerm)
        });
      }
    }
    
    return node;
  };

  // Busca avançada em todo o conteúdo
  const performAdvancedSearch = (term: string) => {
    if (!term) {
      setSearchResults([]);
      setCurrentResultIndex(0);
      setHighlightedText('');
      return;
    }

    const results: Array<{sectionId: string, matches: number}> = [];
    
    manualSections.forEach(section => {
      let matches = 0;
      
      // Busca no título
      if (section.title.toLowerCase().includes(term.toLowerCase())) {
        matches++;
      }
      
      // Busca nas keywords
      section.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(term.toLowerCase())) {
          matches++;
        }
      });
      
      // Busca no conteúdo
      const contentText = extractTextFromReactNode(section.content);
      const contentMatches = (contentText.toLowerCase().match(new RegExp(term.toLowerCase(), 'g')) || []).length;
      matches += contentMatches;
      
      if (matches > 0) {
        results.push({ sectionId: section.id, matches });
      }
    });
    
    setSearchResults(results);
    setCurrentResultIndex(0);
    setHighlightedText(term);
    
    // Navegar para o primeiro resultado
    if (results.length > 0) {
      scrollToSection(results[0].sectionId);
    }
  };

  // Navegar para próximo resultado
  const goToNextResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    scrollToSection(searchResults[nextIndex].sectionId);
  };

  // Navegar para resultado anterior
  const goToPreviousResult = () => {
    if (searchResults.length === 0) return;
    
    const prevIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    scrollToSection(searchResults[prevIndex].sectionId);
  };

  // Manipular teclas na busca
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPreviousResult();
      } else {
        if (searchTerm && searchResults.length === 0) {
          performAdvancedSearch(searchTerm);
        } else {
          goToNextResult();
        }
      }
    }
  };

  const filteredSections = useMemo(() => {
    if (!searchTerm) return manualSections;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return manualSections.filter(section => {
      // Busca no título
      if (section.title.toLowerCase().includes(lowercaseSearch)) return true;
      
      // Busca nas keywords
      if (section.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseSearch))) return true;
      
      // Busca no conteúdo
      const contentText = extractTextFromReactNode(section.content);
      return contentText.toLowerCase().includes(lowercaseSearch);
    });
  }, [searchTerm, manualSections]);

  const activeContent = useMemo(() => {
    const section = manualSections.find(section => section.id === activeSection);
    if (!section) return null;
    
    // Se há termo de busca e texto destacado, processar o conteúdo
    if (highlightedText && searchTerm) {
      return processReactNodeWithHighlight(section.content, highlightedText);
    }
    
    return section.content;
  }, [activeSection, highlightedText, searchTerm, manualSections]);

  // Função para scroll automático para a seção
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // Pequeno delay para garantir que o conteúdo seja renderizado antes do scroll
    setTimeout(() => {
      const contentElement = document.querySelector('[data-section-content]');
      if (contentElement) {
        contentElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-5xl bg-background overflow-hidden p-0 flex items-center justify-center manual-sheet"
      >
        <div className="w-full max-h-[95vh] my-[2.5vh] bg-background border rounded-lg shadow-xl flex flex-col">
          <SheetHeader className="p-4 pb-3 border-b bg-background">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <SheetTitle className="text-xl">Manual do Usuário</SheetTitle>
                  <SheetDescription className="text-sm">
                    Guia completo do Sistema KDS Oie! v5.0
                  </SheetDescription>
                </div>
              </div>
              
               <div className="relative w-80">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                 <Input
                   placeholder="Buscar no manual... (Enter para pesquisar)"
                   value={searchTerm}
                   onChange={(e) => {
                     setSearchTerm(e.target.value);
                     if (!e.target.value) {
                       setSearchResults([]);
                       setHighlightedText('');
                       setCurrentResultIndex(0);
                     }
                   }}
                   onKeyDown={handleSearchKeyDown}
                   className="pl-10 pr-16"
                   title="Enter: Próximo resultado | Shift+Enter: Resultado anterior"
                 />
                {searchTerm && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {searchResults.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {currentResultIndex + 1}/{searchResults.length}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (searchResults.length === 0) {
                          performAdvancedSearch(searchTerm);
                        } else {
                          goToNextResult();
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Search className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 overflow-hidden bg-background">
            {/* Sidebar de navegação */}
            <div className="w-64 border-r bg-muted/20">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-1">
                  {filteredSections.map((section) => {
                    const hasResults = searchResults.some(result => result.sectionId === section.id);
                    const isCurrentResult = searchResults.length > 0 && 
                      searchResults[currentResultIndex]?.sectionId === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3 relative ${
                          activeSection === section.id 
                            ? 'bg-primary text-primary-foreground border-l-4 border-l-primary-foreground font-medium' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-l-4 hover:border-l-primary/60'
                        } ${
                          isCurrentResult ? 'ring-2 ring-yellow-400' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {section.icon}
                        </div>
                        <span className="font-medium truncate">
                          {highlightedText ? highlightText(section.title, highlightedText) : section.title}
                        </span>
                        {hasResults && searchTerm && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {searchResults.find(r => r.sectionId === section.id)?.matches}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1">
              <ScrollArea className="h-full" data-section-content>
                <div className="p-4">
                   {activeContent || (
                     <div className="text-center py-12">
                       <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                       <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                       <p className="text-muted-foreground">
                         {searchTerm 
                           ? `Nenhum resultado para "${searchTerm}"`
                           : 'Digite algo para pesquisar no manual'
                         }
                       </p>
                       {searchTerm && (
                         <div className="mt-4 space-y-2">
                           <p className="text-sm text-muted-foreground">Dicas de busca:</p>
                           <ul className="text-sm text-muted-foreground space-y-1">
                             <li>• Use palavras-chave simples</li>
                             <li>• Tente termos relacionados</li>
                             <li>• Verifique a ortografia</li>
                             <li>• Pressione Enter para buscar em todo o conteúdo</li>
                           </ul>
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};