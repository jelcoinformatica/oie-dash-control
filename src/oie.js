    // Arrays para armazenar todos os cards
    const allProdCards = [];
    const allProntosCards = [];
    let ultimoPedido = 125;
    let destacarUltimoPedido = true;
    let actionHistory = [];
    
    // Função para criar um card
    function createCard(id, type, badgeType = null, isUltimoPedido = false) {
      const card = document.createElement('div');
      card.className = 'card';
      if (isUltimoPedido) {
        card.classList.add('ultimo-pedido-card');
      }
      card.textContent = id;
      card.dataset.id = id;
      
      // Adiciona badge se especificado
      if (badgeType) {
        const badge = document.createElement('div');
        badge.className = `card-badge ${badgeType}`;
        card.appendChild(badge);
      }
      
      return card;
    }
    
    // Função para atualizar a exibição dos cards
    function updateCardDisplay(type) {
      if (type === 'prod') {
        const cols = parseInt(document.getElementById('card1-cols').value);
        const rows = parseInt(document.getElementById('card1-rows').value);
        const cardHeight = parseInt(document.getElementById('card1-height').value);
        const container = document.getElementById('cards-producao');
        
        // Atualizar variáveis CSS
        document.documentElement.style.setProperty('--card1-cols', cols);
        document.documentElement.style.setProperty('--card1-rows', rows);
        document.documentElement.style.setProperty('--card1-height', cardHeight + 'px');
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar cards visíveis
        const maxVisible = cols * rows;
        for (let i = 0; i < Math.min(maxVisible, allProdCards.length); i++) {
          container.appendChild(allProdCards[i]);
        }
        
      } else if (type === 'prontos') {
        const cols = parseInt(document.getElementById('card2-cols').value);
        const rows = parseInt(document.getElementById('card2-rows').value);
        const cardHeight = parseInt(document.getElementById('card2-height').value);
        const container = document.getElementById('cards-prontos');
        
        // Atualizar variáveis CSS
        document.documentElement.style.setProperty('--card2-cols', cols);
        document.documentElement.style.setProperty('--card2-rows', rows);
        document.documentElement.style.setProperty('--card2-height', cardHeight + 'px');
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar cards visíveis
        const maxVisible = cols * rows;
        let cardsToShow = [...allProntosCards];
        
        // Se não estiver destacando o último pedido, adicionar o último pedido como primeiro card
        if (!destacarUltimoPedido && ultimoPedido) {
          const ultimoPedidoCard = createCard(ultimoPedido, 'prontos', 'badge-gold', true);
          cardsToShow.unshift(ultimoPedidoCard);
        }
        
        for (let i = 0; i < Math.min(maxVisible, cardsToShow.length); i++) {
          container.appendChild(cardsToShow[i]);
        }
      }
      
      // Atualizar contadores totais
      document.getElementById('prod-total').textContent = allProdCards.length;
      document.getElementById('prontos-total').textContent = allProntosCards.length + (!destacarUltimoPedido ? 1 : 0);
      
      // Atualizar animação para os cards do último pedido
      updatePulseAnimation();
    }
    
    // Função para adicionar cards
    function addCards() {
      // Cards de produção com badges (20 cards)
      for (let i = 1; i <= 20; i++) {
        const badges = ['badge-green', 'badge-blue', 'badge-red', 'badge-purple'];
        const badgeType = badges[i % 4];
        const card = createCard(100 + i, 'prod', badgeType);
        allProdCards.push(card);
      }
      
      // Cards prontos (6 cards)
      const prontosNumbers = [201, 202, 203, 204, 205, 206];
      prontosNumbers.forEach(num => {
        const card = createCard(num, 'prontos');
        allProntosCards.push(card);
      });
      
      // Atualizar exibição
      updateCardDisplay('prod');
      updateCardDisplay('prontos');
    }
    
    // Função para lidar com upload de imagem
    function handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.getElementById('publicidade-img');
          img.src = e.target.result;
          img.style.display = 'block';
          document.getElementById('watermark').style.display = 'none';
          document.getElementById('size-info').style.display = 'none';
        }
        reader.readAsDataURL(file);
      }
    }
    
    // Função para carregar imagem por URL
    function loadImageFromUrl() {
      const url = document.getElementById('publicidade-url').value;
      if (url) {
        const img = document.getElementById('publicidade-img');
        img.src = url;
        img.style.display = 'block';
        document.getElementById('watermark').style.display = 'none';
        document.getElementById('size-info').style.display = 'none';
      }
    }
    
    // Função para atualizar informações de tamanho da imagem
    function updateImageSizeInfo() {
      const container = document.querySelector('.publicidade-content');
      const headerVisible = getComputedStyle(document.getElementById('publicidade-header')).display !== 'none';
      
      // Calcular altura disponível
      let availableHeight = container.clientHeight;
      if (headerVisible) {
        const headerHeight = getComputedStyle(document.getElementById('publicidade-header')).height;
        availableHeight -= parseInt(headerHeight);
      }
      
      // Calcular largura disponível
      const availableWidth = container.clientWidth;
      
      // Atualizar display
      document.getElementById('size-info').querySelector('.pixels').textContent = 
        `${availableWidth} x ${availableHeight} px`;
      
      // Mostrar apenas se não houver imagem
      const hasImage = document.getElementById('publicidade-img').style.display === 'block';
      document.getElementById('size-info').style.display = hasImage ? 'none' : 'block';
      document.getElementById('watermark').style.display = hasImage ? 'none' : 'block';
    }
    
    // Função para alternar colunas
    function toggleColumn(col) {
      const checkbox = document.getElementById(`${col}-visible`);
      const display = checkbox.checked ? (col === 'col1' ? 'block' : 'flex') : 'none';
      
      document.documentElement.style.setProperty(`--${col}-visible`, display);
      document.getElementById(col === 'col1' ? 'col-producao' : 'col-publicidade').style.display = display;
      
      // Atualizar layout
      updateLayout();
      
      // Se for coluna 3, atualizar informações de imagem
      if (col === 'col3') {
        updateImageSizeInfo();
      }
    }
    
    // Função para atualizar o layout quando colunas são ocultadas
    function updateLayout() {
      const col1Visible = document.getElementById('col1-visible').checked;
      const col3Visible = document.getElementById('col3-visible').checked;
      
      // Se a coluna 3 está oculta, expandir coluna 2
      if (!col3Visible) {
        if (col1Visible) {
          const col1Width = document.getElementById('col1-width').value;
          document.documentElement.style.setProperty('--col2-width', `calc(100% - ${col1Width}% - 0.5rem)`);
        } else {
          document.documentElement.style.setProperty('--col2-width', '100%');
        }
      } else {
        // Restaurar valores padrão
        document.documentElement.style.setProperty('--col2-width', document.getElementById('col2-width').value + '%');
      }
    }
    
    // Função para atualizar a animação pulsante
    function updatePulseAnimation() {
      const pulseEnabled = document.getElementById('pulse-animation').checked;
      
      // Atualiza o container destacado
      const numeroPedido = document.querySelector('.numero-pedido');
      if (numeroPedido) {
        if (pulseEnabled) {
          numeroPedido.style.animation = 'pulse 1.5s infinite';
        } else {
          numeroPedido.style.animation = 'none';
        }
      }
      
      // Atualiza os cards com a classe 'ultimo-pedido-card'
      const ultimoCards = document.querySelectorAll('.ultimo-pedido-card');
      ultimoCards.forEach(card => {
        if (pulseEnabled) {
          card.style.animation = 'pulseCard 1.5s infinite';
        } else {
          card.style.animation = 'none';
        }
      });
    }
    
    // Função para alternar a animação pulsante
    function togglePulseAnimation(enabled) {
      updatePulseAnimation();
    }
    
    // Função para alternar destaque do último pedido
    function toggleDestaqueUltimoPedido(enabled) {
      destacarUltimoPedido = enabled;
      
      // Atualizar variável CSS para mostrar/ocultar o container
      document.documentElement.style.setProperty('--destaque-ultimo-pedido', enabled ? 'block' : 'none');
      
      // Atualizar a exibição dos cards prontos
      updateCardDisplay('prontos');
    }
    
    // Função para expedir pedido
    function expedir() {
      const input = document.getElementById('expedicao-input');
      const value = input.value.trim();
      
      if (value === '000') {
        window.close();
        return;
      }
      
      // Verificar se é um número
      if (!/^-?\d+$/.test(value)) {
        alert('Digite um número válido!');
        input.value = '';
        return;
      }
      
      // Verificar se é uma devolução (começa com "-")
      const isDevolucao = value.startsWith('-');
      const numeroPedido = isDevolucao ? parseInt(value.substring(1)) : parseInt(value);
      
      // Adicionar ao histórico
      addToHistory(value);
      
      // Processar o pedido
      if (isDevolucao) {
        devolverParaProducao(numeroPedido);
      } else {
        if (isInProducao(numeroPedido)) {
          moverParaProntos(numeroPedido);
        } else if (isInProntos(numeroPedido) || numeroPedido === ultimoPedido) {
          expedirPedido(numeroPedido);
        } else {
          alert('Pedido não encontrado!');
        }
      }
      
      input.value = '';
    }
    
    // Função para verificar se o pedido está na produção
    function isInProducao(numeroPedido) {
      return allProdCards.some(card => parseInt(card.textContent) === numeroPedido);
    }
    
    // Função para verificar se o pedido está nos prontos
    function isInProntos(numeroPedido) {
      return allProntosCards.some(card => parseInt(card.textContent) === numeroPedido);
    }
    
    // Função para mover pedido para prontos
    function moverParaProntos(numeroPedido) {
      // Move pedido anterior para "Prontos"
      if (ultimoPedido !== null) {
        const prevCard = createCard(ultimoPedido, 'prontos');
        allProntosCards.push(prevCard);
      }
      
      // Remove da produção
      const index = allProdCards.findIndex(card => 
        parseInt(card.textContent) === numeroPedido
      );
      if (index !== -1) {
        allProdCards.splice(index, 1);
      }
      
      // Atualiza último pedido
      ultimoPedido = numeroPedido;
      document.querySelector('.numero-pedido').textContent = numeroPedido;
      
      updateCardDisplay('prod');
      updateCardDisplay('prontos');
    }
    
    // Função para expedir pedido
    function expedirPedido(numeroPedido) {
      // Remover dos prontos (se estiver na lista)
      const indexProntos = allProntosCards.findIndex(card => 
        parseInt(card.textContent) === numeroPedido
      );
      if (indexProntos !== -1) {
        allProntosCards.splice(indexProntos, 1);
      }
      
      // Remover do último pedido se for o mesmo
      if (ultimoPedido === numeroPedido) {
        ultimoPedido = null;
        document.querySelector('.numero-pedido').textContent = '';
      }
      
      // Atualizar exibição
      updateCardDisplay('prontos');
    }
    
    // Função para devolver pedido para produção
    function devolverParaProducao(numeroPedido) {
      // Remove o pedido dos prontos
      const indexProntos = allProntosCards.findIndex(card => 
        parseInt(card.textContent) === numeroPedido
      );
      if (indexProntos !== -1) {
        allProntosCards.splice(indexProntos, 1);
      }
      
      // Remove do último pedido se for o mesmo
      if (ultimoPedido === numeroPedido) {
        ultimoPedido = null;
        document.querySelector('.numero-pedido').textContent = '';
      }
      
      // Adiciona à produção se não existir
      const existeNaProducao = allProdCards.some(card => 
        parseInt(card.textContent) === numeroPedido
      );
      
      if (!existeNaProducao) {
        const badges = ['badge-green', 'badge-blue', 'badge-red', 'badge-purple'];
        const badgeType = badges[Math.floor(Math.random() * badges.length)];
        const newCard = createCard(numeroPedido, 'prod', badgeType);
        allProdCards.push(newCard);
      }
      
      updateCardDisplay('prod');
      updateCardDisplay('prontos');
    }
    
    // Função para adicionar ao histórico de ações
    function addToHistory(value) {
      actionHistory.unshift(value);
      if (actionHistory.length > 5) {
        actionHistory.pop();
      }
      
      // Atualizar histórico
      updateHistoryDisplay();
    }
    
    // Função para atualizar a exibição do histórico
    function updateHistoryDisplay() {
      const historyContainer = document.getElementById('action-history');
      historyContainer.innerHTML = '';
      
      actionHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = item;
        historyItem.onclick = function() {
          document.getElementById('expedicao-input').value = item;
          historyContainer.style.display = 'none';
        };
        historyContainer.appendChild(historyItem);
      });
    }
    
    // Função para salvar configurações
    function saveConfig() {
      const config = {};
      
      // Coletar todas as configurações
      document.querySelectorAll('#panel-config input, #panel-config select').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          config[el.id] = el.checked;
        } else {
          config[el.id] = el.value;
        }
      });
      
      // Salvar no localStorage
      localStorage.setItem('panelConfig', JSON.stringify(config));
    }
    
    // Função para carregar configurações
    function loadConfig() {
      const saved = localStorage.getItem('panelConfig');
      if (saved) {
        const config = JSON.parse(saved);
        
        for (const id in config) {
          const el = document.getElementById(id);
          if (el) {
            if (el.type === 'checkbox' || el.type === 'radio') {
              el.checked = config[id];
              
              // Disparar evento de mudança para aplicar configurações
              const event = new Event('change');
              el.dispatchEvent(event);
            } else {
              el.value = config[id];
              
              // Disparar evento de input para aplicar configurações
              const event = new Event('input');
              el.dispatchEvent(event);
            }
          }
        }
      }
    }
    
    // Botão de configuração
    document.getElementById('btn-config').onclick = () => {
      const panel = document.getElementById('panel-config');
      panel.style.display = 'block';
    };
    
    // Botão de fechar
    document.getElementById('btn-close').onclick = () => {
      const panel = document.getElementById('panel-config');
      panel.style.display = 'none';
    };
    
    // Botão para expandir/recolher todas as seções
    document.getElementById('btn-toggle-all').addEventListener('click', function() {
      const details = document.querySelectorAll('.config-section');
      const isAllOpen = Array.from(details).every(d => d.open);
      
      details.forEach(detail => {
        detail.open = !isAllOpen;
      });
    });
    
    // Função para atualizar a cor do contador no cabeçalho
    function updateHeaderColor(col, color) {
      // Aplica a cor do título
      document.documentElement.style.setProperty(`--${col}-header-color`, color);
      
      // Calcula a cor do contador (50% de opacidade)
      let r = parseInt(color.substr(1, 2), 16);
      let g = parseInt(color.substr(3, 2), 16);
      let b = parseInt(color.substr(5, 2), 16);
      let counterColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
      
      // Aplica a cor do contador
      document.documentElement.style.setProperty(`--${col}-counter-color`, counterColor);
    }
    
    // Função para testar o som
    function testSound(inputId) {
      const input = document.getElementById(inputId);
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        audio.play();
      } else {
        alert('Nenhum arquivo de som selecionado.');
      }
    }
    
    // Função para atualizar o fundo da aplicação
    function updateAppBg(color) {
      document.documentElement.style.setProperty('--app-bg', color);
    }
    
    // Funções para os modais
    function openModal(modalId) {
      document.getElementById(`modal-${modalId}`).style.display = 'flex';
      
      // Carregar dados quando abrir o modal de dados
      if (modalId === 'dados') {
        const savedConfig = localStorage.getItem('configDB');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          document.getElementById('db-servidor').value = config.servidor || '';
          document.getElementById('db-banco').value = config.banco || '';
          document.getElementById('db-usuario').value = config.usuario || '';
          document.getElementById('db-senha').value = config.senha || '';
          document.getElementById('db-porta').value = config.porta || '3306';
          document.getElementById('db-tabela').value = config.tabela || '';
        }
      }
      
      // Carregar dados quando abrir o modal de integrações
      if (modalId === 'integracoes') {
        const savedIntegration = localStorage.getItem('integrationConfig');
        if (savedIntegration) {
          const config = JSON.parse(savedIntegration);
          document.querySelector(`input[value="${config.type}"]`).checked = true;
          document.getElementById('kds-integrado').checked = config.kds || false;
        }
      }
      
      // Carregar dados da empresa
      if (modalId === 'empresa') {
        const saved = localStorage.getItem('empresaData');
        if (saved) {
          const data = JSON.parse(saved);
          document.getElementById('empresa-cnpj').value = data.cnpj || '';
          document.getElementById('empresa-razao').value = data.razao || '';
          document.getElementById('empresa-fantasia').value = data.fantasia || '';
          document.getElementById('empresa-logradouro').value = data.logradouro || '';
          document.getElementById('empresa-numero').value = data.numero || '';
          document.getElementById('empresa-complemento').value = data.complemento || '';
          document.getElementById('empresa-bairro').value = data.bairro || '';
          document.getElementById('empresa-cidade').value = data.cidade || '';
          document.getElementById('empresa-uf').value = data.uf || '';
          document.getElementById('empresa-cep').value = data.cep || '';
          document.getElementById('empresa-serial').value = data.serial || '';
        }
      }
    }
    
    function closeModal(modalId) {
      document.getElementById(`modal-${modalId}`).style.display = 'none';
    }
    
    // Fechar modal ao clicar fora dele
    window.onclick = function(event) {
      if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
      }
    }
    
    // Funções para o modal de Dados
    function testarConexao() {
      const servidor = document.getElementById('db-servidor').value;
      const banco = document.getElementById('db-banco').value;
      const usuario = document.getElementById('db-usuario').value;
      const porta = document.getElementById('db-porta').value;
      
      if (!servidor || !banco || !usuario) {
        alert('Preencha todos os campos obrigatórios!');
        return;
      }
      
      // Simulação de teste de conexão
      const sucesso = Math.random() > 0.3;
      
      if (sucesso) {
        alert('✅ Conexão bem sucedida com o banco de dados!');
      } else {
        alert('❌ Falha na conexão com o banco de dados. Verifique as configurações.');
      }
    }
    
    function limparPedidos() {
      if (confirm('Tem certeza que deseja limpar TODOS os pedidos? Esta ação não pode ser desfeita.')) {
        // Limpar todos os pedidos
        allProdCards.length = 0;
        allProntosCards.length = 0;
        ultimoPedido = null;
        document.querySelector('.numero-pedido').textContent = '';
        updateCardDisplay('prod');
        updateCardDisplay('prontos');
        alert('Todos os pedidos foram removidos!');
      }
    }
    
    function salvarConfigDB() {
      const configDB = {
        servidor: document.getElementById('db-servidor').value,
        banco: document.getElementById('db-banco').value,
        usuario: document.getElementById('db-usuario').value,
        senha: document.getElementById('db-senha').value,
        porta: document.getElementById('db-porta').value,
        tabela: document.getElementById('db-tabela').value
      };
      
      localStorage.setItem('configDB', JSON.stringify(configDB));
      alert('Configurações salvas com sucesso!');
      closeModal('dados');
    }
    
    // Funções para o modal de Integrações
    function selectIntegration(type) {
      const options = document.querySelectorAll('.integration-option');
      options.forEach(option => {
        option.classList.remove('selected');
      });
      
      const selectedOption = document.querySelector(`.integration-option input[value="${type}"]`).parentElement;
      selectedOption.classList.add('selected');
    }
    
    function salvarIntegracao() {
      const integrationType = document.querySelector('input[name="integration-type"]:checked').value;
      const kdsIntegrado = document.getElementById('kds-integrado').checked;
      
      const config = {
        type: integrationType,
        kds: kdsIntegrado
      };
      
      localStorage.setItem('integrationConfig', JSON.stringify(config));
      alert('Configurações de integração salvas com sucesso!');
      closeModal('integracoes');
    }
    
    // Funções para o modal de Logs
    function apagarLogsAntigos() {
      const dias = document.getElementById('log-days').value;
      if (confirm(`Tem certeza que deseja apagar logs com mais de ${dias} dias?`)) {
        alert(`Logs antigos (acima de ${dias} dias) foram apagados!`);
      }
    }
    
    // Exportar configuração
    function exportarConfiguracao() {
      const config = localStorage.getItem('panelConfig');
      if (!config) {
        alert('Não há configurações para exportar!');
        return;
      }
      
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'configuracao-oie.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // Importar configuração
    function importarConfiguracao(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const config = JSON.parse(e.target.result);
          localStorage.setItem('panelConfig', JSON.stringify(config));
          alert('Configurações importadas com sucesso! Recarregando...');
          location.reload();
        } catch (error) {
          alert('Erro ao importar configurações: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
    
    // Restaurar configuração de fábrica
    function restaurarConfiguracaoFabrica() {
      if (confirm('Tem certeza que deseja restaurar as configurações de fábrica? Todas as suas configurações serão perdidas.')) {
        localStorage.removeItem('panelConfig');
        alert('Configurações restauradas! Recarregando...');
        location.reload();
      }
    }
    
    // Buscar CNPJ na Receita Federal
    function buscarCNPJ() {
      const cnpj = document.getElementById('empresa-cnpj').value.replace(/\D/g, '');
      if (cnpj.length !== 14) {
        alert('CNPJ inválido!');
        return;
      }
      
      // Simulação de busca (substituir por chamada real à API)
      // Exemplo de API: https://receitaws.com.br/v1/cnpj/{cnpj}
      alert('Funcionalidade de busca de CNPJ ainda não implementada. Preencha manualmente.');
      
      // Em produção, usar:
      /*
      fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'ERROR') {
            alert(data.message);
            return;
          }
          
          // Preencher campos
          document.getElementById('empresa-razao').value = data.nome;
          document.getElementById('empresa-fantasia').value = data.fantasia;
          document.getElementById('empresa-logradouro').value = data.logradouro;
          document.getElementById('empresa-numero').value = data.numero;
          document.getElementById('empresa-complemento').value = data.complemento;
          document.getElementById('empresa-bairro').value = data.bairro;
          document.getElementById('empresa-cidade').value = data.municipio;
          document.getElementById('empresa-uf').value = data.uf;
          document.getElementById('empresa-cep').value = data.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
        })
        .catch(error => {
          alert('Erro ao buscar CNPJ: ' + error.message);
        });
      */
    }
    
    // Salvar dados da empresa
    function salvarEmpresa() {
      const empresaData = {
        cnpj: document.getElementById('empresa-cnpj').value,
        razao: document.getElementById('empresa-razao').value,
        fantasia: document.getElementById('empresa-fantasia').value,
        logradouro: document.getElementById('empresa-logradouro').value,
        numero: document.getElementById('empresa-numero').value,
        complemento: document.getElementById('empresa-complemento').value,
        bairro: document.getElementById('empresa-bairro').value,
        cidade: document.getElementById('empresa-cidade').value,
        uf: document.getElementById('empresa-uf').value,
        cep: document.getElementById('empresa-cep').value,
        serial: document.getElementById('empresa-serial').value
      };
      
      localStorage.setItem('empresaData', JSON.stringify(empresaData));
      alert('Dados da empresa salvos com sucesso!');
      closeModal('empresa');
    }
    
    // Inicialização
    window.addEventListener('load', () => {
      // Adicionar cards
      addCards();
      
      // Atualizar ao redimensionar
      window.addEventListener('resize', () => {
        updateCardDisplay('prod');
        updateCardDisplay('prontos');
        updateImageSizeInfo();
        updateLayout();
      });
      
      // Atualizar contadores
      document.getElementById('prod-total').textContent = allProdCards.length;
      document.getElementById('prontos-total').textContent = allProntosCards.length;
      
      // Atualizar informações de tamanho da imagem
      updateImageSizeInfo();
      
      // Ativar destaque do último pedido por padrão
      toggleDestaqueUltimoPedido(true);
      
      // Carregar configurações salvas
      loadConfig();
      
      // Atualizar animação pulsante
      updatePulseAnimation();
      
      // Adicionar evento para tecla Enter no campo de expedição
      const expedicaoInput = document.getElementById('expedicao-input');
      expedicaoInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          expedir();
        }
      });
      
      // Mostrar histórico ao focar no campo
      expedicaoInput.addEventListener('focus', function() {
        if (actionHistory.length > 0) {
          document.getElementById('action-history').style.display = 'block';
        }
      });
      
      // Esconder histórico ao sair do campo
      expedicaoInput.addEventListener('blur', function() {
        setTimeout(() => {
          document.getElementById('action-history').style.display = 'none';
        }, 200);
      });
      
      // Inicializar cores dos contadores
      updateHeaderColor('col1', document.getElementById('col1-header-color').value);
      updateHeaderColor('col2', document.getElementById('col2-header-color').value);
    });



let simuladorAtivo = false;
let intervaloSimulacao;
let contadorSimulado = 1000;
const apelidos = ['Ana', 'Carlos', 'Lucas', 'Bia', 'João', 'Lia', 'Rafa', 'Leo', 'Duda', 'Nina'];

function iniciarSimulacao() {
  if (simuladorAtivo) return;
  simuladorAtivo = true;
  console.log("Simulação iniciada");

  const intervalo = parseInt(document.getElementById('sim-intervalo').value) * 1000;
  const digitos = parseInt(document.getElementById('sim-digitos').value);
  const gerarApelido = document.getElementById('sim-apelido').checked;
  const formato = document.getElementById('sim-formato').value;
  let prefixo = document.getElementById('sim-prefixo').value;
  if (prefixo === 'custom') {
    prefixo = document.getElementById('sim-prefixo-custom').value || '';
  }

  const modulos = [];
  if (document.getElementById('sim-mod-balcao').checked) modulos.push('badge-green');
  if (document.getElementById('sim-mod-mesa').checked) modulos.push('badge-blue');
  if (document.getElementById('sim-mod-entrega').checked) modulos.push('badge-red');
  if (document.getElementById('sim-mod-ficha').checked) modulos.push('badge-purple');

  if (modulos.length === 0) {
    alert("Selecione ao menos 1 módulo!");
    simuladorAtivo = false;
    return;
  }

  intervaloSimulacao = setInterval(() => {
    const numero = String(contadorSimulado++).padStart(digitos, '0');
    const apelido = gerarApelido ? apelidos[Math.floor(Math.random() * apelidos.length)] : '';
    const badge = modulos[Math.floor(Math.random() * modulos.length)];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = numero;

    if (formato.includes('apelido')) {
      const linha1 = document.createElement('div');
      linha1.textContent = prefixo + numero;
      const linha2 = document.createElement('div');
      linha2.textContent = apelido;
      linha2.style.fontSize = '70%';
      card.appendChild(linha1);
      if (apelido) card.appendChild(linha2);
    } else {
      card.textContent = prefixo + numero;
    }

    const badgeEl = document.createElement('div');
    badgeEl.className = `card-badge ${badge}`;
    card.appendChild(badgeEl);

    const container = document.querySelector('#col-producao .conteudo');
    if (container) {
      container.prepend(card);
    } else {
      console.warn("Container da Coluna Produção não encontrado.");
    }
  }, intervalo);
}


function confirmarSimulacao(confirma) {
  document.getElementById('confirmar-simulacao').style.display = 'none';
  if (confirma) {
    alternarSimulacao();
  }
}

let simuladorRodando = false;
function alternarSimulacao() {
  const btn1 = document.getElementById('botao-simular');
  const btn2 = document.getElementById('botao-simular-col2');

  if (!simuladorRodando) {
    iniciarSimulacao();
    simuladorRodando = true;
    if (btn1) btn1.innerText = "Parar Simulação";
    if (btn2) btn2.style.display = "inline-block";
  } else {
    const confirmar = confirm("Deseja parar a simulação?");
    if (!confirmar) return;
    clearInterval(intervaloSimulacao);
    simuladorRodando = false;
    if (btn1) btn1.innerText = "Iniciar Simulação";
    if (btn2) btn2.style.display = "none";
  }
}
</script><script>
let intervaloSimulador = null;
function iniciarSimulacao() {
  if (intervaloSimulador) return;
  const intervalo = (parseInt(document.getElementById('sim_intervalo')?.value || "15") || 15) * 1000;
  intervaloSimulador = setInterval(gerarPedidoSimulado, intervalo);
  gerarPedidoSimulado();
  document.getElementById('btn-simulacao')?.classList.add('ativo');
  document.getElementById('btn-simulacao')?.innerText = "Parar Simulação";
}
function pararSimulacao() {
  clearInterval(intervaloSimulador);
  intervaloSimulador = null;
  document.getElementById('btn-simulacao')?.classList.remove('ativo');
  document.getElementById('btn-simulacao')?.innerText = "Iniciar Simulação";
}
function gerarPedidoSimulado() {
  const container = document.getElementById("col1-conteudo");
  if (!container) return;
  const numero = Math.floor(100 + Math.random() * 900);
  const card = document.createElement("div");
  card.className = "card simulacao";
  card.style.cssText = "background:#fff;border:2px solid #000;margin:6px;padding:10px;font-size:22px;text-align:center;border-radius:6px;";
  card.innerText = numero;
  container.appendChild(card);
}
