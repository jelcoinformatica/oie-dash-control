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

  const manualSections: ManualSection[] = [
    {
      id: 'overview',
      title: 'Visão Geral',
      icon: <Home className="w-4 h-4" />,
      keywords: ['visão', 'geral', 'inicio', 'começar', 'sistema', 'kds', 'kitchen'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sistema KDS - Kitchen Display System</h3>
          <p className="text-sm text-muted-foreground">
            O Sistema Oie! é uma solução completa para gerenciamento de pedidos em cozinhas e estabelecimentos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
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
            
            <div className="p-4 border rounded-lg">
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
            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Exibe pedidos que estão sendo preparados na cozinha. Quando um pedido fica pronto, 
                clique nele para movê-lo automaticamente para a coluna "Prontos".
              </p>
            </div>

            <div className="p-4 border rounded-lg">
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
                    <li>• Indicador de módulo</li>
                    <li>• Número de colunas</li>
                    <li>• Cores personalizadas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-600" />
                Coluna Oculta
              </h4>
              <p className="text-sm">
                Quando a coluna produção está oculta, um contador cinza aparece no canto superior 
                esquerdo da coluna Prontos, mostrando quantos pedidos estão em produção. 
                Clique no contador para ver e interagir com os pedidos.
              </p>
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
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Exibe pedidos prontos para expedição. Esta é a coluna principal e não pode ser ocultada. 
                Clique em um pedido para expedi-lo ou use o campo de expedição manual.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Área dedicada para exibir conteúdo promocional, notícias ou informações da empresa. 
                Totalmente opcional e personalizável.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Configurações</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Cabeçalho:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Mostrar/ocultar</li>
                    <li>• Título personalizado</li>
                    <li>• Cores e fontes</li>
                    <li>• Altura ajustável</li>
                  </ul>
                </div>
                <div>
                  <strong>Conteúdo:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Cor de fundo</li>
                    <li>• Largura da coluna</li>
                    <li>• Layout responsivo</li>
                    <li>• Integração com notícias</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                Dica de Uso
              </h4>
              <p className="text-sm">
                Use esta coluna para promover pratos especiais, horários de funcionamento, 
                informações de contato ou qualquer conteúdo que queira destacar para a equipe da cozinha.
              </p>
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
            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                Sons de Notificação
              </h4>
              <div className="space-y-3 text-sm">
                <p>Alertas sonoros para diferentes eventos do sistema.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Eventos com som:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Novo pedido na produção</li>
                      <li>• Pedido movido para prontos</li>
                      <li>• Expedição de pedido</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Configurações:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Ativar/desativar por evento</li>
                      <li>• Escolher arquivo de som</li>
                      <li>• Ajustar volume</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-500" />
                Text-to-Speech (TTS)
              </h4>
              <div className="space-y-3 text-sm">
                <p>Narração automática de informações dos pedidos.</p>
                <div>
                  <strong>Funcionalidades:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Leitura do número do pedido</li>
                    <li>• Leitura do apelido do cliente</li>
                    <li>• Leitura dos itens do pedido</li>
                    <li>• Configuração de voz (velocidade, pitch)</li>
                    <li>• Ativar/desativar por evento</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Compatibilidade
              </h4>
              <p className="text-sm">
                Os recursos de TTS dependem do navegador utilizado. Funciona melhor em 
                Chrome, Firefox e Safari. Teste sempre antes de usar em produção.
              </p>
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
            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Indicadores Visuais</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Bullet (padrão):</strong>
                  <p>Pequeno círculo colorido no cartão</p>
                </div>
                <div>
                  <strong>Background:</strong>
                  <p>Fundo do cartão na cor do módulo</p>
                </div>
                <div>
                  <strong>Border:</strong>
                  <p>Borda colorida no cartão</p>
                </div>
                <div>
                  <strong>Nenhum:</strong>
                  <p>Sem indicação visual</p>
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
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Play className="w-4 h-4 text-green-500" />
                Objetivo
              </h4>
              <p className="text-sm">
                Permite gerar pedidos automaticamente para testar o sistema, treinar funcionários 
                ou fazer demonstrações sem precisar de pedidos reais.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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
      id: 'configuration',
      title: 'Configurações Avançadas',
      icon: <Settings className="w-4 h-4" />,
      keywords: ['configurações', 'personalizar', 'cores', 'fontes', 'backup', 'restaurar'],
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Painel de Configurações</h3>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Seções de Configuração</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Visual:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Produção</li>
                    <li>• Prontos</li>
                    <li>• Publicidade</li>
                    <li>• Splash Screen</li>
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
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
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
            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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

            <div className="p-4 border rounded-lg">
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

  const filteredSections = useMemo(() => {
    if (!searchTerm) return manualSections;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return manualSections.filter(section => 
      section.title.toLowerCase().includes(lowercaseSearch) ||
      section.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseSearch))
    );
  }, [searchTerm, manualSections]);

  const activeContent = manualSections.find(section => section.id === activeSection)?.content;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <SheetTitle className="text-xl">Manual do Usuário</SheetTitle>
              <SheetDescription>
                Guia completo do Sistema KDS Oie! v5.0
              </SheetDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar no manual..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </SheetHeader>

        <div className="flex h-[calc(100vh-140px)]">
          {/* Sidebar de navegação */}
          <div className="w-64 border-r bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {filteredSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveSection(section.id)}
                    className="w-full justify-start text-left h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0">
                        {section.icon}
                      </div>
                      <span className="text-sm font-medium truncate">
                        {section.title}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              <div className="p-6">
                {activeContent || (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Tente buscar por outros termos ou navegue pelas seções disponíveis.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};