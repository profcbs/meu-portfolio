// ============================================================
//  SCRIPT.JS — Portfolio Interativo
//  Sessões 2, 3 e 4: Dark Mode · Relógio · Visitas · Galeria · Formulário
//
//  CONCEITO FUNDAMENTAL — O QUE É O DOMContentLoaded?
//  ─────────────────────────────────────────────────
//  O browser lê o HTML de cima para baixo. O ficheiro script.js
//  está no final do <body>, mas mesmo assim é boa prática garantir
//  que o HTML está 100% disponível antes de executar código JS.
//
//  document.addEventListener('DOMContentLoaded', função) regista
//  uma função para ser executada quando o browser termina de ler
//  e construir toda a estrutura HTML (o DOM — Document Object Model).
//
//  ⚠️  ATENÇÃO — UM ÚNICO BLOCO DOMContentLoaded:
//  ─────────────────────────────────────────────
//  Versões anteriores deste ficheiro tinham 3 blocos DOMContentLoaded
//  separados (um por sessão). O browser executaria todos e funcionaria,
//  MAS é má prática porque:
//    1. Fica difícil perceber o que corre no arranque da página.
//    2. A ordem de execução não é garantida entre blocos.
//    3. É mais difícil de manter e depurar.
//  Por isso, existe apenas UM bloco DOMContentLoaded (no final do
//  ficheiro) que inicializa tudo de uma vez.
// ============================================================


// ============================================================
//  ATIVIDADE 1: DARK / LIGHT MODE TOGGLE
// ============================================================

/**
 * toggleTheme()
 * Alterna entre o tema claro (light) e o tema escuro (dark).
 *
 * CONCEITO — classList:
 *   Cada elemento HTML pode ter uma ou mais classes CSS.
 *   document.body.classList dá acesso à lista de classes do <body>.
 *     .toggle('dark-mode') → adiciona a classe se não existir, remove se existir.
 *     .contains('dark-mode') → devolve true se a classe estiver presente.
 *     .add('dark-mode') → adiciona a classe.
 *     .remove('dark-mode') → remove a classe.
 *
 * CONCEITO — localStorage:
 *   É um "mini-armazém" do browser onde podemos guardar pares chave/valor
 *   como texto. Os dados persistem mesmo depois de fechar o browser.
 *     localStorage.setItem('chave', 'valor') → guarda
 *     localStorage.getItem('chave') → lê (devolve null se não existir)
 *     localStorage.removeItem('chave') → apaga
 *
 * CONCEITO — Operador ternário (condição ? a : b):
 *   Forma compacta de escrever if/else numa linha.
 *   isDark ? 'dark' : 'light'  →  se isDark for true → 'dark', senão → 'light'
 */
function toggleTheme() {
    // Adiciona ou remove a classe "dark-mode" no elemento <body>.
    // O CSS usa esta classe para mudar as cores de toda a página.
    document.body.classList.toggle('dark-mode');

    // Verifica se a classe "dark-mode" está agora presente (true ou false)
    const isDark = document.body.classList.contains('dark-mode');

    // Guarda a preferência do utilizador para a próxima visita
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    console.log(`Tema alterado para: ${isDark ? 'escuro 🌙' : 'claro ☀️'}`);
}

/**
 * loadSavedTheme()
 * Aplica o tema guardado quando a página carrega.
 *
 * Ordem de prioridade:
 *   1. Se houver preferência guardada no localStorage → usa-a.
 *   2. Se não houver → deteta a preferência do sistema operativo.
 *
 * CONCEITO — window.matchMedia():
 *   Permite perguntar ao browser se uma condição CSS se verifica.
 *   '(prefers-color-scheme: dark)' é uma media query CSS que verifica
 *   se o utilizador tem o modo escuro ativado no sistema (Windows/macOS/etc.).
 *   .matches devolve true ou false.
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme'); // Lê a preferência guardada

    if (savedTheme) {
        // Existe preferência guardada → respeita-a
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        // Se for 'light', não fazemos nada (o tema claro é o padrão do CSS)
    } else {
        // Sem preferência guardada → tenta detetar o tema do sistema operativo
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        }
    }

    console.log(`Tema carregado: ${localStorage.getItem('theme') || 'automático (sistema)'}`);
}


// ============================================================
//  ATIVIDADE 2: RELÓGIO DIGITAL
// ============================================================

// Variáveis declaradas fora das funções para serem partilhadas entre elas.
// "let" significa que o valor pode ser alterado posteriormente.
let is24Hour = true;   // true = formato 24h | false = formato 12h (AM/PM)
let clockInterval;     // Vai guardar o ID do setInterval para o podermos parar

/**
 * updateClock()
 * Calcula a hora atual e atualiza os números no HTML.
 *
 * CONCEITO — new Date():
 *   Cria um objeto com a data e hora atuais do sistema.
 *   Métodos úteis:
 *     .getHours()   → horas (0 a 23)
 *     .getMinutes() → minutos (0 a 59)
 *     .getSeconds() → segundos (0 a 59)
 *     .toLocaleDateString('pt-PT', opções) → data formatada em texto
 *
 * CONCEITO — String.padStart(comprimento, caractere):
 *   Garante que a string tem pelo menos N caracteres,
 *   preenchendo com o caractere indicado à esquerda se necessário.
 *   Exemplo: String(7).padStart(2, '0') → '07'
 *   Sem isso, 7:5:3 ficaria assim em vez de 07:05:03.
 *
 * CONCEITO — document.getElementById('id'):
 *   Procura no HTML o elemento com esse id e devolve-o.
 *   Se não encontrar, devolve null.
 *   Por isso usamos sempre "if (elemento)" antes de o usar.
 *
 * CONCEITO — .textContent:
 *   Propriedade que representa o texto visível dentro de um elemento HTML.
 *   elemento.textContent = 'novo texto' → substitui o texto atual.
 */
function updateClock() {
    const now = new Date(); // Objeto com a data e hora atuais

    let hours   = now.getHours();   // 0–23
    let minutes = now.getMinutes(); // 0–59
    let seconds = now.getSeconds(); // 0–59

    // Converter para formato 12h se necessário
    if (!is24Hour) {
        // O operador % (módulo) devolve o resto da divisão.
        // 13 % 12 = 1, 0 % 12 = 0. O "|| 12" trata o caso especial
        // das 0h (meia-noite) e das 12h (meio-dia): 0 % 12 = 0, então || 12 → 12
        hours = hours % 12 || 12;
    }

    // Garantir sempre 2 dígitos (ex: 7 → '07')
    hours   = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    // Procurar os elementos HTML onde os números aparecem
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Atualizar o texto de cada elemento (o "if" protege contra null)
    if (hoursEl)   hoursEl.textContent   = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;

    // Atualizar a data por extenso (ex: "quinta-feira, 26 de fevereiro de 2026")
    const dateEl = document.getElementById('date');
    if (dateEl) {
        // toLocaleDateString formata a data de acordo com o idioma e opções
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('pt-PT', options);
    }
}

/**
 * startClock()
 * Inicia o relógio e faz com que atualize a cada segundo.
 *
 * CONCEITO — setInterval(função, milissegundos):
 *   Executa a função repetidamente com o intervalo indicado.
 *   1000 ms = 1 segundo.
 *   Devolve um ID numérico que podemos usar para parar o intervalo
 *   com clearInterval(id) se necessário.
 *
 *   Chamamos updateClock() uma vez antes do setInterval para que
 *   o relógio apareça imediatamente sem esperar 1 segundo.
 */
function startClock() {
    updateClock(); // Mostrar imediatamente sem esperar 1 segundo
    clockInterval = setInterval(updateClock, 1000); // Repetir a cada 1000ms
    console.log('⏰ Relógio iniciado!');
}

/**
 * toggleFormat()
 * Alterna entre formato 24h e 12h.
 *
 * CONCEITO — Operador ! (NOT lógico):
 *   Inverte um valor booleano:
 *     !true  → false
 *     !false → true
 *   Assim, is24Hour troca entre true e false a cada clique.
 */
function toggleFormat() {
    is24Hour = !is24Hour; // Inverte: 24h→12h ou 12h→24h
    localStorage.setItem('clockFormat', is24Hour ? '24' : '12');
    updateClock(); // Atualiza imediatamente com o novo formato
    console.log(`Formato do relógio: ${is24Hour ? '24h' : '12h'}`);
}

/**
 * loadClockFormat()
 * Carrega o formato de hora guardado pelo utilizador.
 *
 * (saved === '24') compara a string guardada com '24' e devolve
 * true ou false — que é exatamente o tipo que is24Hour espera.
 */
function loadClockFormat() {
    const saved = localStorage.getItem('clockFormat');
    if (saved) {
        is24Hour = (saved === '24'); // true se '24', false se '12'
    }
    // Se não existir nada guardado, mantém o valor padrão: is24Hour = true (24h)
}


// ============================================================
//  ATIVIDADE 3: CONTADOR DE VISITAS
// ============================================================

/**
 * getVisitCount()
 * Lê o número de visitas guardado no localStorage.
 *
 * CONCEITO — parseInt():
 *   O localStorage guarda tudo como texto (string).
 *   parseInt('5') converte a string '5' para o número inteiro 5.
 *   Sem isto, '5' + 1 = '51' (concatenação) em vez de 6 (soma).
 *
 * CONCEITO — Operador ternário:
 *   count ? parseInt(count) : 0
 *   Se count não for null/undefined/''  →  parseInt(count)
 *   Caso contrário (primeira vez)       →  0
 */
function getVisitCount() {
    const count = localStorage.getItem('visitCount');
    return count ? parseInt(count) : 0;
}

/**
 * incrementVisitCount()
 * Incrementa o contador e guarda a data/hora da visita atual.
 *
 * CONCEITO — new Date().toISOString():
 *   Gera uma string de data no formato universal ISO 8601:
 *   "2026-02-26T10:30:00.000Z"
 *   Este formato é fácil de guardar como texto e depois comparar.
 *
 * count++ é o mesmo que count = count + 1.
 */
function incrementVisitCount() {
    let count = getVisitCount(); // Lê o valor atual
    count++;                     // Adiciona 1
    localStorage.setItem('visitCount', count);                  // Guarda o novo total
    localStorage.setItem('lastVisit', new Date().toISOString()); // Guarda data/hora
    return count;
}

/**
 * formatLastVisit()
 * Converte a data guardada numa frase amigável como "Há 2 horas".
 *
 * CONCEITO — Aritmética com datas:
 *   now - lastVisit → diferença em milissegundos (ms)
 *   Para converter:
 *     ms ÷ 1000 = segundos
 *     ms ÷ 1000 ÷ 60 = minutos
 *     ms ÷ 1000 ÷ 60 ÷ 60 = horas
 *     ms ÷ 1000 ÷ 60 ÷ 60 ÷ 24 = dias
 *
 * CONCEITO — Math.floor():
 *   Arredonda sempre para baixo (trunca os decimais).
 *   Math.floor(2.9) → 2    Math.floor(59.99) → 59
 *
 * CONCEITO — Plural automático com ternário:
 *   `${minutes} minuto${minutes > 1 ? 's' : ''}`
 *   Se minutes for 1 → "1 minuto"
 *   Se minutes for 3 → "3 minutos"
 */
function formatLastVisit() {
    const lastVisitISO = localStorage.getItem('lastVisit');

    // Se não há data guardada, é a primeira visita
    if (!lastVisitISO) return 'Primeira vez aqui! 🎉';

    const lastVisit = new Date(lastVisitISO); // Converte string ISO → objeto Date
    const now       = new Date();
    const diff      = now - lastVisit; // Diferença em milissegundos

    const minutes = Math.floor(diff / 1000 / 60);  // ms → minutos
    const hours   = Math.floor(minutes / 60);        // minutos → horas
    const days    = Math.floor(hours / 24);          // horas → dias

    if (minutes < 1)  return 'Há menos de 1 minuto';
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24)   return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
}

/**
 * updateVisitDisplay()
 * Atualiza o número de visitas visível na página.
 */
function updateVisitDisplay() {
    const countEl = document.getElementById('visit-count');
    if (countEl) countEl.textContent = getVisitCount();
}

/**
 * updateLastVisitDisplay()
 * Atualiza o texto "Última visita: ..." na página.
 */
function updateLastVisitDisplay() {
    const lastVisitEl = document.getElementById('last-visit');
    if (lastVisitEl) lastVisitEl.textContent = formatLastVisit();
}

/**
 * resetVisitCounter()
 * Apaga os dados do contador e atualiza o ecrã.
 *
 * CONCEITO — window.confirm():
 *   Abre uma caixa de diálogo nativa do browser com "OK" e "Cancelar".
 *   Devolve true se o utilizador clicar OK, false se cancelar.
 *   "if (!confirmed) return;" → sai da função sem fazer nada se cancelar.
 *
 * CONCEITO — localStorage.removeItem():
 *   Apaga completamente a chave e o seu valor do localStorage.
 */
function resetVisitCounter() {
    const confirmed = window.confirm('Tens a certeza que queres resetar o contador?');
    if (!confirmed) return; // Se cancelar, sai sem fazer nada

    localStorage.removeItem('visitCount'); // Apaga o total de visitas
    localStorage.removeItem('lastVisit');  // Apaga a data da última visita

    // Atualiza o ecrã (vai mostrar 0 e "Primeira vez!")
    updateVisitDisplay();
    updateLastVisitDisplay();

    console.log('🔄 Contador resetado!');
    alert('Contador resetado com sucesso!');
}

/**
 * initVisitCounter()
 * Inicializa o contador de visitas no arranque da página.
 *
 * A ORDEM AQUI É MUITO IMPORTANTE:
 *   1. Primeiro mostramos a "última visita" (antes desta visita)
 *   2. Depois incrementamos (regista esta visita)
 *   3. Por fim atualizamos o total visível
 *
 *   Se invertêssemos os passos 1 e 2, o texto "última visita"
 *   mostraria "há menos de 1 minuto" logo na primeira vez que
 *   o utilizador vê a página, o que seria confuso.
 */
function initVisitCounter() {
    updateLastVisitDisplay(); // Passo 1: mostrar quando foi a visita ANTERIOR
    incrementVisitCount();    // Passo 2: registar ESTA visita
    updateVisitDisplay();     // Passo 3: mostrar o novo total
    console.log(`📊 Visita registada! Total: ${getVisitCount()}`);
}


// ============================================================
//  FOOTER — ANO AUTOMÁTICO
// ============================================================

/**
 * setFooterYear()
 * Insere o ano atual no rodapé para que o copyright fique sempre atualizado.
 *
 * new Date().getFullYear() devolve o ano atual como número (ex: 2026).
 * Assim não precisamos de editar o HTML todos os anos.
 */
function setFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}


// ============================================================
//  SESSÃO 3: GALERIA DINÂMICA DE PROJETOS
//  Array de projetos + Filtros + Modal + Pesquisa
// ============================================================


// ============================================================
//  DADOS — Array de Projetos
// ============================================================

/**
 * projects — array (lista ordenada) de objetos.
 *
 * CONCEITO — Array:
 *   Coleção de itens numa ordem definida: [item1, item2, item3, ...]
 *   Acesso por índice (começa em 0): projects[0] → primeiro projeto
 *   .length → número de itens
 *   .forEach() → executa uma função para cada item
 *   .filter() → devolve novo array só com itens que passam numa condição
 *   .find()   → devolve o primeiro item que satisfaz uma condição
 *   .map()    → devolve novo array transformando cada item
 *
 * CONCEITO — Objeto:
 *   Conjunto de pares chave: valor entre chavetas { }
 *   Acesso às propriedades: projeto.title ou projeto['title']
 *
 * CONCEITO — const vs let:
 *   const → o "apontador" da variável não pode mudar (não dá para fazer
 *           projects = outraCOisa), mas o conteúdo do array pode mudar.
 *   let   → o valor pode ser completamente substituído.
 */
const projects = [
    {
        id: 1,
        title: 'E-commerce Website',
        category: 'web',
        description: 'Loja online completa com carrinho de compras',
        image: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=E-commerce',
        tags: ['HTML', 'CSS', 'JavaScript', 'API'],
        link: '#',
        longDescription: 'Website de e-commerce completo com sistema de carrinho, checkout e integração com API de pagamentos. Interface moderna e responsiva.',
        features: ['Carrinho de compras', 'Sistema de pagamento', 'Área de utilizador', 'Gestão de produtos'],
        technologies: ['HTML5', 'CSS3', 'JavaScript ES6+', 'LocalStorage', 'Fetch API'],
        date: '2025-01'
    },
    {
        id: 2,
        title: 'App de Tarefas',
        category: 'web',
        description: 'Gestor de tarefas com filtros e categorias',
        image: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Todo+App',
        tags: ['JavaScript', 'CSS', 'LocalStorage'],
        link: '#',
        longDescription: 'Aplicação de gestão de tarefas com sistema de prioridades, categorias e persistência local.',
        features: ['Adicionar/editar/remover tarefas', 'Filtros por estado', 'Categorias', 'Persistência de dados'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage'],
        date: '2024-12'
    },
    {
        id: 3,
        title: 'Portfolio Designer',
        category: 'design',
        description: 'Portfolio criativo para designer gráfico',
        image: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Portfolio',
        tags: ['Figma', 'UI/UX', 'Protótipo'],
        link: '#',
        longDescription: 'Design de portfolio minimalista e elegante para apresentar trabalhos criativos.',
        features: ['Design responsivo', 'Animações suaves', 'Galeria de trabalhos', 'Formulário de contacto'],
        technologies: ['Figma', 'Design System', 'Prototyping'],
        date: '2024-11'
    },
    {
        id: 4,
        title: 'App Meteorologia',
        category: 'mobile',
        description: 'App mobile para consultar previsão do tempo',
        image: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Weather+App',
        tags: ['React Native', 'API', 'Mobile'],
        link: '#',
        longDescription: 'Aplicação mobile para consultar previsão meteorológica com dados em tempo real.',
        features: ['Previsão 7 dias', 'Localização automática', 'Alertas meteorológicos', 'Favoritos'],
        technologies: ['React Native', 'Weather API', 'Geolocation'],
        date: '2025-01'
    },
    {
        id: 5,
        title: 'Dashboard Analytics',
        category: 'web',
        description: 'Dashboard com gráficos e estatísticas',
        image: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Dashboard',
        tags: ['JavaScript', 'Chart.js', 'API'],
        link: '#',
        longDescription: 'Dashboard interativo para visualização de dados e analytics com gráficos dinâmicos.',
        features: ['Gráficos interativos', 'Filtros de data', 'Exportar relatórios', 'Dados em tempo real'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Chart.js', 'Fetch API'],
        date: '2024-10'
    },
    {
        id: 6,
        title: 'Redesign Logo Empresa',
        category: 'design',
        description: 'Redesign de identidade visual corporativa',
        image: 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Logo+Design',
        tags: ['Illustrator', 'Branding', 'Logo'],
        link: '#',
        longDescription: 'Projeto de redesign completo de identidade visual incluindo logo, cores e tipografia.',
        features: ['Logo principal', 'Variações', 'Manual de marca', 'Mockups'],
        technologies: ['Adobe Illustrator', 'Photoshop', 'InDesign'],
        date: '2024-09'
    }
];

// Guarda a categoria atualmente selecionada no filtro.
// É uma variável global para que tanto filterProjects() como
// searchProjects() saibam qual o contexto ativo.
let currentCategory = 'all'; // 'all' = mostrar todos os projetos


// ============================================================
//  RENDERIZAR PROJETOS
// ============================================================

/**
 * renderProjects(projectsToRender)
 * Recebe um array de projetos e desenha os cards no HTML.
 *
 * CONCEITO — innerHTML vs appendChild():
 *   grid.innerHTML = '' → apaga TODO o conteúdo HTML do elemento de uma vez.
 *   É necessário fazer isto antes de redesenhar para não duplicar os cards.
 *   appendChild(elemento) → adiciona um único elemento filho no final.
 *
 * CONCEITO — forEach():
 *   Percorre cada item do array e executa uma função para cada um.
 *   projectsToRender.forEach(project => { ... })
 *   É como dizer "para cada projeto na lista, faz isto".
 *
 * CONCEITO — element.style.display:
 *   Controla a visibilidade via CSS inline.
 *   'block' → visível    'none' → escondido
 *
 * CONCEITO — return antecipado:
 *   Quando chamamos "return" a meio de uma função, a execução para
 *   naquele ponto e o resto da função não corre.
 */
function renderProjects(projectsToRender) {
    const grid      = document.getElementById('projects-grid');
    const noResults = document.getElementById('no-results');

    // Se a grelha não existir no HTML, sai sem fazer nada
    if (!grid) return;

    // Limpa todos os cards anteriores antes de redesenhar
    grid.innerHTML = '';

    // Se não há projetos para mostrar, exibe a mensagem "sem resultados"
    if (projectsToRender.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return; // Sai da função — não há mais nada a fazer
    }

    // Garante que a mensagem "sem resultados" está escondida
    if (noResults) noResults.style.display = 'none';

    // Para cada projeto, cria um card e adiciona-o à grelha
    projectsToRender.forEach(project => {
        const card = createProjectCard(project); // Cria o elemento HTML do card
        grid.appendChild(card);                  // Adiciona ao final da grelha
    });

    updateCounters(); // Atualiza os números nos botões de filtro
}

/**
 * createProjectCard(project)
 * Cria e devolve um elemento HTML <div> com os dados de um projeto.
 *
 * CONCEITO — document.createElement():
 *   Cria um novo elemento HTML em memória (ainda não está na página).
 *   Só fica visível depois de ser adicionado com appendChild().
 *
 * CONCEITO — dataset (atributos data-*):
 *   Permite guardar informação extra num elemento HTML:
 *   card.dataset.id = 1  →  gera data-id="1" no HTML
 *   Mais tarde, ao clicar no card, lemos card.dataset.id para saber
 *   qual projeto foi clicado.
 *
 * CONCEITO — Template Literals (crases ` `):
 *   Permitem escrever strings com variáveis embutidas: ${variavel}
 *   E também strings com múltiplas linhas sem precisar de \n.
 *
 * CONCEITO — .map().join(''):
 *   .map(tag => `<span>${tag}</span>`)  → transforma cada tag numa <span>
 *   .join('')  → junta todas as <span> numa única string sem separador
 *   Resultado: '<span>HTML</span><span>CSS</span><span>JS</span>'
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className        = 'project-card';   // Classe CSS para o estilo
    card.dataset.id       = project.id;        // data-id para identificar no clique
    card.dataset.category = project.category;  // data-category (informação extra)

    // Define o HTML interno do card usando um template literal
    // loading="lazy" → a imagem só carrega quando ficar visível no ecrã
    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" loading="lazy">
        <div class="project-card-body">
            <span class="project-category">${project.category}</span>
            <h3>${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    return card; // Devolve o elemento criado para ser adicionado à grelha
}

/**
 * updateCounters()
 * Atualiza os números nos botões de filtro (ex: "Web 3").
 *
 * CONCEITO — .filter():
 *   Cria um NOVO array com apenas os itens que passam no teste.
 *   projects.filter(p => p.category === 'web')
 *   → devolve um array só com os projetos de categoria 'web'
 *   "p => p.category === 'web'" é uma arrow function (função curta)
 *   === compara valor E tipo (preferir sempre === em vez de ==)
 *
 * CONCEITO — Object.keys(objeto):
 *   Devolve um array com todas as chaves (nomes) do objeto.
 *   Object.keys({all: 6, web: 3}) → ['all', 'web']
 *
 * CONCEITO — document.querySelector():
 *   Seleciona o PRIMEIRO elemento que corresponde ao seletor CSS.
 *   `[data-category="${cat}"] .count` → elemento com classe 'count'
 *   dentro do elemento que tem data-category igual a cat.
 */
function updateCounters() {
    const counts = {
        all:    projects.length,
        web:    projects.filter(p => p.category === 'web').length,
        mobile: projects.filter(p => p.category === 'mobile').length,
        design: projects.filter(p => p.category === 'design').length,
    };

    // Para cada categoria, atualiza o número no botão correspondente
    Object.keys(counts).forEach(cat => {
        const btn = document.querySelector(`[data-category="${cat}"] .count`);
        if (btn) btn.textContent = counts[cat];
    });
}


// ============================================================
//  FILTROS POR CATEGORIA
// ============================================================

/**
 * filterProjects(category)
 * Filtra os projetos pela categoria selecionada e redesenha a grelha.
 *
 * Parâmetro: category → string: 'all', 'web', 'mobile' ou 'design'
 *
 * Também limpa o campo de pesquisa para evitar confusão
 * (filtrar por "web" + pesquisa ativa ao mesmo tempo).
 */
function filterProjects(category) {
    currentCategory = category; // Guarda para a pesquisa saber o contexto

    // Limpa o campo de pesquisa ao mudar o filtro
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Se 'all' → usa todos os projetos; senão filtra pela categoria
    const filtered = category === 'all'
        ? projects
        : projects.filter(p => p.category === category);

    renderProjects(filtered);
    console.log(`🏷️ Filtro: ${category} (${filtered.length} projetos)`);
}

/**
 * setupFilterListeners()
 * Liga os botões de filtro ao seu comportamento (clique).
 *
 * CONCEITO — addEventListener(evento, função):
 *   Regista uma função para ser chamada quando o evento acontece.
 *   O evento 'click' dispara quando o utilizador clica no elemento.
 *   A função passada chama-se "callback" ou "handler".
 *
 * CONCEITO — querySelectorAll():
 *   Como querySelector() mas devolve TODOS os elementos que correspondem,
 *   numa NodeList (semelhante a um array).
 *
 * Lógica da seleção exclusiva:
 *   1. Remove 'active' de TODOS os botões
 *   2. Adiciona 'active' APENAS no botão clicado
 *   → Só um botão fica selecionado de cada vez.
 */
function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a seleção de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Seleciona apenas o botão clicado
            button.classList.add('active');
            // Filtra os projetos pela categoria do botão (atributo data-category)
            filterProjects(button.dataset.category);
        });
    });
}


// ============================================================
//  MODAL DE DETALHES
// ============================================================

/**
 * openModal(projectId)
 * Abre o modal com os detalhes completos de um projeto.
 *
 * Parâmetro: projectId → número do id do projeto a mostrar
 *
 * CONCEITO — .find():
 *   Percorre o array e devolve o PRIMEIRO item onde a condição é true.
 *   Se não encontrar nenhum, devolve undefined.
 *   projects.find(p => p.id === projectId) → projeto com esse id
 *
 * CONCEITO — Mostrar/esconder o modal:
 *   O modal tem display: none por padrão (CSS).
 *   Adicionar a classe 'active' muda para display: flex (CSS).
 *   Assim o modal abre e fecha sem JavaScript alterar o display diretamente.
 *
 * CONCEITO — overflow: 'hidden':
 *   Impede o scroll da página por baixo do modal enquanto está aberto.
 *   Reposto para '' (vazio = padrão CSS) ao fechar.
 */
function openModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return; // Proteção: sai se o projeto não existir

    const modalBody = document.getElementById('modal-body');

    // Preenche o modal com o HTML dos detalhes do projeto
    modalBody.innerHTML = `
        <span class="modal-category">${project.category}</span>
        <h2 id="modal-title">${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" class="modal-image">

        <div class="modal-section">
            <h3>Sobre o Projeto</h3>
            <p>${project.longDescription}</p>
        </div>

        <div class="modal-section">
            <h3>Funcionalidades</h3>
            <ul>
                ${project.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3>Tecnologias Utilizadas</h3>
            <div class="modal-tech">
                ${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
        </div>

        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="modal-link">
            Ver Projeto Completo →
        </a>
    `;

    // Torna o modal visível (o CSS usa a classe 'active' para display: flex)
    const modal = document.getElementById('project-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloqueia o scroll da página
    console.log(`🔍 Modal aberto: ${project.title}`);
}

/**
 * closeModal()
 * Fecha o modal e restaura o scroll da página.
 */
function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active'); // Remove 'active' → CSS aplica display: none
    document.body.style.overflow = '';  // Restaura o scroll normal da página
    console.log('Modal fechado');
}

/**
 * setupModalListeners()
 * Liga todos os eventos para abrir e fechar o modal.
 *
 * CONCEITO — Event Delegation (delegação de eventos):
 *   Em vez de ligar um listener a cada card individualmente (podiam ser
 *   dezenas), ligamos UM único listener ao container pai (a grelha).
 *   Quando clicamos num card, o evento "sobe" pelo DOM até ao pai.
 *   Isso chama-se event bubbling (propagação de eventos).
 *
 *   Vantagem: funciona mesmo para cards criados dinamicamente depois
 *   de o listener ser registado.
 *
 * CONCEITO — e.target vs e.currentTarget:
 *   e.target       → elemento exato onde o rato clicou (pode ser uma imagem
 *                    ou parágrafo dentro do card)
 *   e.currentTarget → elemento onde o listener está registado (a grelha)
 *
 * CONCEITO — .closest(seletor):
 *   A partir de um elemento, sobe no DOM e devolve o PRIMEIRO ancestral
 *   (ou o próprio) que corresponde ao seletor CSS.
 *   e.target.closest('.project-card') → encontra o card independentemente
 *   de onde exatamente clicámos dentro dele.
 *
 * CONCEITO — Fechar ao clicar no overlay:
 *   e.target === modal verifica se clicámos diretamente no overlay escuro
 *   e não no conteúdo branco do modal. Se forem o mesmo elemento, fecha.
 *
 * CONCEITO — Evento 'keydown':
 *   Dispara quando uma tecla é pressionada. e.key contém o nome da tecla.
 *   'Escape' → fechar o modal com a tecla Esc (boa prática de acessibilidade).
 */
function setupModalListeners() {
    // Event delegation no grid — um listener deteta cliques em qualquer card
    const grid = document.getElementById('projects-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card) openModal(parseInt(card.dataset.id));
            // parseInt converte o data-id de string para número
        });
    }

    // Fechar ao clicar no botão × do modal
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Fechar ao clicar no fundo escuro (overlay) fora do conteúdo
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(); // Só fecha se clicou no overlay
        });
    }

    // Fechar com a tecla Escape (acessibilidade)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}


// ============================================================
//  PESQUISA EM TEMPO REAL (com debounce)
// ============================================================

/**
 * debounce(func, delay)
 * Envolve uma função para que só seja executada após um período
 * de inatividade — evita chamadas excessivas.
 *
 * CONCEITO — O problema sem debounce:
 *   Ao escrever "javascript" (10 letras), searchProjects() seria
 *   chamada 10 vezes em milissegundos. Com projetos reais ligados
 *   a uma API, isso causaria 10 pedidos ao servidor.
 *
 * CONCEITO — Como o debounce funciona:
 *   A cada tecla pressionada:
 *     1. Cancela o temporizador anterior (clearTimeout)
 *     2. Inicia um novo temporizador de 'delay' ms
 *   Se não chegarem mais teclas dentro do delay, o temporizador
 *   dispara e a função é executada.
 *   Se chegarem mais teclas, o processo recomeça.
 *
 * CONCEITO — Closures (funções que "lembram" variáveis externas):
 *   A variável 'timeout' vive na função debounce mas é "lembrada"
 *   pela função interna que ela devolve. Isso chama-se closure.
 *
 * CONCEITO — ...args (rest/spread operator):
 *   Captura todos os argumentos passados à função e passa-os adiante.
 *   Garante que o debounce funciona com funções de qualquer número
 *   de parâmetros.
 */
function debounce(func, delay) {
    let timeout; // Guarda o ID do temporizador ativo (ou undefined se não houver)
    return function (...args) {
        clearTimeout(timeout);  // Cancela o temporizador anterior
        timeout = setTimeout(() => func.apply(this, args), delay);
        // Inicia novo temporizador; só executa se não chegarem mais chamadas
    };
}

/**
 * searchProjects(query)
 * Filtra projetos que contenham o texto pesquisado no título,
 * descrição ou tags.
 *
 * Parâmetro: query → texto escrito pelo utilizador
 *
 * CONCEITO — .toLowerCase() e .trim():
 *   .toLowerCase() → converte para minúsculas (pesquisa case-insensitive)
 *     'JavaScript'.toLowerCase() → 'javascript'
 *     Assim 'JAVASCRIPT' e 'javascript' encontram o mesmo resultado.
 *   .trim() → remove espaços no início e no fim
 *     '  js  '.trim() → 'js'
 *
 * CONCEITO — .includes(texto):
 *   Verifica se uma string contém o texto indicado. Devolve true ou false.
 *   'javascript'.includes('java') → true
 *   'javascript'.includes('python') → false
 *
 * CONCEITO — .some(condição):
 *   Verifica se PELO MENOS UM item do array satisfaz a condição.
 *   É como um "OU" entre todos os itens.
 *   ['HTML', 'CSS'].some(t => t.toLowerCase().includes('css')) → true
 *
 * CONCEITO — Operadores lógicos || (OU):
 *   A condição do filter usa || para combinar os três critérios:
 *   encontra projetos onde o título OU a descrição OU as tags contêm o termo.
 */
function searchProjects(query) {
    const term = query.toLowerCase().trim(); // Normaliza a pesquisa

    // Se a pesquisa estiver vazia, volta ao filtro de categoria ativo
    if (term === '') {
        filterProjects(currentCategory);
        return;
    }

    // Base: todos os projetos ou só os da categoria ativa
    const base = currentCategory === 'all'
        ? projects
        : projects.filter(p => p.category === currentCategory);

    // Filtra projetos que contenham o termo em título, descrição ou tags
    const results = base.filter(project =>
        project.title.toLowerCase().includes(term)       ||
        project.description.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
    );

    renderProjects(results);
    console.log(`🔎 Pesquisa: "${query}" — ${results.length} resultado(s)`);
}

// Versão de searchProjects com debounce de 280ms.
// 280ms é tempo suficiente para o utilizador terminar de escrever
// sem sentir que a pesquisa está lenta.
const debouncedSearch = debounce(searchProjects, 280);

/**
 * setupSearchListener()
 * Liga o campo de pesquisa às funções de busca.
 *
 * CONCEITO — Evento 'input' vs 'change':
 *   'input'  → dispara a CADA alteração do campo (tecla, colar, cortar)
 *   'change' → só dispara quando o campo perde o foco (utilizador clica fora)
 *   Usamos 'input' para pesquisa em tempo real.
 *
 * CONCEITO — e.target.value:
 *   e.target → o elemento que gerou o evento (o input)
 *   .value   → o texto atual dentro do campo
 *
 * CONCEITO — .blur():
 *   Remove o foco do elemento (como se o utilizador clicasse noutro sítio).
 *   Usado ao pressionar Escape para "sair" visualmente do campo.
 */
function setupSearchListener() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // A cada tecla, pesquisa com debounce (espera 280ms após última tecla)
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Pressionar Escape: limpa a pesquisa e volta ao filtro ativo
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = ''; // Limpa o campo visualmente
            searchProjects('');      // Volta a mostrar todos da categoria ativa
            searchInput.blur();      // Remove o foco do campo
        }
    });
}


// ============================================================
//  SESSÃO 4: FORMULÁRIO DE CONTACTO & VALIDAÇÃO
// ============================================================


// ============================================================
//  REGRAS DE VALIDAÇÃO
// ============================================================

/**
 * validationRules — objeto que centraliza todas as regras de validação.
 *
 * Por que centralizar as regras num objeto?
 *   → Se precisarmos de mudar o mínimo de caracteres do nome,
 *     mudamos apenas aqui e afeta todo o código.
 *   → Torna o código mais limpo: as regras ficam separadas da lógica.
 *
 * Estrutura de cada campo:
 *   required  → true/false: o campo é obrigatório?
 *   minLength → número mínimo de caracteres
 *   maxLength → número máximo de caracteres
 *   pattern   → expressão regular (RegEx) com o formato esperado
 *   messages  → objeto com as mensagens de erro para cada regra
 *
 * CONCEITO — Expressões Regulares (RegEx):
 *   São padrões para validar o formato de texto.
 *   Escrevem-se entre /barras/.
 *
 *   /^[a-zA-ZÀ-ÿ\s]+$/
 *     ^       → início da string
 *     [...]   → qualquer caractere dentro dos colchetes
 *     a-zA-Z  → letras sem acento (maiúsculas e minúsculas)
 *     À-ÿ     → letras com acento (à, é, ô, ü, etc.)
 *     \s      → espaço em branco
 *     +       → um ou mais caracteres
 *     $       → fim da string
 *
 *   /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *     [^\s@]+ → um ou mais caracteres que NÃO sejam espaço nem @
 *     @       → o símbolo @ literal
 *     \.      → o ponto . literal (\ escapa o significado especial de .)
 *     Valida o padrão básico: algo@algo.algo
 */
const validationRules = {
    name: {
        required: true,
        minLength: 3,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        messages: {
            required:  'Por favor, introduz o teu nome',
            minLength: 'O nome deve ter pelo menos 3 caracteres',
            pattern:   'O nome só pode conter letras'
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
            required: 'Por favor, introduz o teu email',
            pattern:  'Por favor, introduz um email válido'
        }
    },
    subject: {
        required: true,
        messages: {
            required: 'Por favor, seleciona um assunto'
        }
    },
    message: {
        required: true,
        minLength: 10,
        maxLength: 500,
        messages: {
            required:  'Por favor, escreve uma mensagem',
            minLength: 'A mensagem deve ter pelo menos 10 caracteres',
            maxLength: 'A mensagem não pode ter mais de 500 caracteres'
        }
    },
    phone: {
        required: false,
        // Aceita: 912345678 | +351912345678 | +351 912 345 678 | 912 345 678
        pattern: /^(\+351\s?)?([0-9]{3}\s?){3}$/,
        messages: {
            pattern: 'Formato inválido. Ex: 912345678 ou +351 912 345 678'
        }
    }
};

/**
 * validateField(fieldName, value)
 * Valida o valor de um campo individual com base nas regras definidas.
 *
 * Parâmetros:
 *   fieldName → nome do campo (ex: 'name', 'email')
 *   value     → valor atual do campo (texto digitado)
 *
 * Devolve: objeto { valid: boolean, message: string }
 *   valid: true se o valor for válido, false se não
 *   message: mensagem de erro (string vazia se válido)
 *
 * CONCEITO — Ordem das verificações:
 *   A ordem importa! Verificamos primeiro se é obrigatório e está vazio,
 *   porque não faz sentido verificar o tamanho mínimo de uma string vazia.
 *   Cada verificação usa "return" imediato — assim que encontra um erro,
 *   para e devolve o primeiro erro (não todos ao mesmo tempo).
 *
 * CONCEITO — .test(valor):
 *   Método das expressões regulares. Verifica se o valor corresponde
 *   ao padrão. Devolve true se corresponder, false se não.
 *   /^[a-zA-Z]+$/.test('Ana') → true
 *   /^[a-zA-Z]+$/.test('Ana123') → false
 *
 * CONCEITO — A condição do pattern:
 *   rules.pattern && value.trim() && !rules.pattern.test(value)
 *   1. rules.pattern → existe uma regra de padrão?
 *   2. value.trim()  → o campo não está vazio? (campos opcionais vazios são OK)
 *   3. !rules.pattern.test(value) → o valor NÃO corresponde ao padrão?
 *   Só valida o padrão se as três condições forem verdadeiras.
 */
function validateField(fieldName, value) {
    const rules = validationRules[fieldName];
    if (!rules) return { valid: true, message: '' }; // Sem regras = válido

    // 1. Obrigatório e vazio?
    if (rules.required && !value.trim()) {
        return { valid: false, message: rules.messages.required };
    }
    // 2. Tem mínimo de caracteres?
    if (rules.minLength && value.trim().length < rules.minLength) {
        return { valid: false, message: rules.messages.minLength };
    }
    // 3. Excede o máximo de caracteres?
    if (rules.maxLength && value.trim().length > rules.maxLength) {
        return { valid: false, message: rules.messages.maxLength };
    }
    // 4. Corresponde ao padrão? (só testa se o campo não estiver vazio)
    if (rules.pattern && value.trim() && !rules.pattern.test(value)) {
        return { valid: false, message: rules.messages.pattern };
    }

    return { valid: true, message: '' }; // Passou em todas as verificações!
}

/**
 * showFieldFeedback(fieldName, isValid, message)
 * Mostra visualmente se um campo é válido (verde) ou inválido (vermelho).
 *
 * Parâmetros:
 *   fieldName → id do campo HTML
 *   isValid   → true = válido (verde), false = inválido (vermelho)
 *   message   → texto do erro (string vazia se válido)
 *
 * CONCEITO — .closest(seletor):
 *   Sobe no DOM a partir do campo e encontra o ancestral mais próximo
 *   com a classe 'form-group' — o container que engloba label + input + erro.
 *   Assim podemos estilizar o grupo todo (borda, ícone, mensagem).
 *
 * CONCEITO — Remover antes de adicionar:
 *   classList.remove('valid', 'invalid') primeiro garante que nunca
 *   ficamos com as duas classes ao mesmo tempo.
 *   Só depois adicionamos a classe correta.
 *
 * CONCEITO — Parâmetro com valor padrão (message = ''):
 *   Se a função for chamada sem o terceiro argumento, message fica ''.
 *   Ex: showFieldFeedback('name', true) → message é '' por omissão.
 */
function showFieldFeedback(fieldName, isValid, message = '') {
    const field = document.getElementById(fieldName);
    if (!field) return;

    const group   = field.closest('.form-group');    // Container do campo
    const errorEl = group.querySelector('.error-message'); // Elemento do erro

    group.classList.remove('valid', 'invalid');              // Limpa estado anterior
    group.classList.add(isValid ? 'valid' : 'invalid');      // Aplica novo estado

    if (errorEl) errorEl.textContent = isValid ? '' : message; // Mostra/limpa erro
}

/**
 * validateForm(silent)
 * Valida TODOS os campos do formulário de uma vez.
 *
 * Parâmetro: silent → se true, não mostra feedback visual (silencioso)
 *   Usado para verificar se o botão deve ficar ativo/desativado,
 *   sem mostrar erros antes do utilizador tentar submeter.
 *
 * Devolve: true se o formulário for totalmente válido, false caso contrário.
 *
 * CONCEITO — Parâmetro com valor padrão (silent = false):
 *   Se chamado sem argumento, silent é false (mostra feedback).
 *   validateForm()       → mostra erros
 *   validateForm(true)   → verifica silenciosamente
 *
 * CONCEITO — Flag booleano (allValid):
 *   Começa como true e só muda para false se algum campo falhar.
 *   "Se algum campo for inválido, o formulário todo é inválido."
 *   Não há como voltar a true depois de false — garante rigor.
 */
function validateForm(silent = false) {
    const fields = ['name', 'email', 'phone', 'subject', 'message'];
    let allValid = true; // Assume válido até encontrar um erro

    fields.forEach(name => {
        const field = document.getElementById(name);
        if (!field) return;

        const result = validateField(name, field.value);
        if (!silent) showFieldFeedback(name, result.valid, result.message);
        if (!result.valid) allValid = false; // Encontrou erro → formulário inválido
    });

    return allValid;
}

/**
 * updateSubmitButton()
 * Ativa ou desativa o botão "Enviar" conforme o formulário é válido.
 *
 * CONCEITO — btn.disabled:
 *   Propriedade HTML que controla se o botão pode ser clicado.
 *   disabled = true  → botão acinzentado, não responde a cliques
 *   disabled = false → botão ativo, pode ser clicado
 *
 * Chamamos validateForm(true) com silent=true para verificar sem
 * mostrar erros a vermelho prematuramente.
 * O operador ! inverte o resultado:
 *   allValid=true  → disabled=false (botão ativo)
 *   allValid=false → disabled=true (botão desativado)
 */
function updateSubmitButton() {
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = !validateForm(true);
}


// ============================================================
//  EVENT LISTENERS — VALIDAÇÃO EM TEMPO REAL
// ============================================================

/**
 * setupFormValidation()
 * Liga os eventos de validação em tempo real a cada campo do formulário.
 *
 * Cada campo tem dois tipos de eventos:
 *
 * CONCEITO — Evento 'blur' (saída do campo):
 *   Dispara quando o utilizador SAIR do campo (clica noutro sítio ou Tab).
 *   É o momento ideal para mostrar o erro pela primeira vez:
 *   o utilizador terminou de escrever, agora pode ver o feedback.
 *   Evita mostrar "nome inválido" enquanto o utilizador ainda está a escrever.
 *
 * CONCEITO — Evento 'input' (a cada tecla):
 *   Dispara a cada alteração do campo (incluindo colar, cortar).
 *   Usado para corrigir feedback em tempo real DEPOIS de o campo ter sido
 *   "tocado" (já tem classe valid ou invalid).
 *   Se o campo nunca foi tocado, não mostra feedback (evita ansiedade).
 *
 * CONCEITO — Verificar se o campo foi "tocado":
 *   group.classList.contains('invalid') || group.classList.contains('valid')
 *   Se o form-group já tem uma destas classes, o utilizador já interagiu.
 *   Só nesse caso atualizamos o feedback visual no evento 'input'.
 */
function setupFormValidation() {
    const fields = ['name', 'email', 'phone', 'subject', 'message'];

    fields.forEach(name => {
        const field = document.getElementById(name);
        if (!field) return;

        // 'blur': valida ao sair do campo (primeira validação visual)
        field.addEventListener('blur', () => {
            const result = validateField(name, field.value);
            showFieldFeedback(name, result.valid, result.message);
            updateSubmitButton();
        });

        // 'input': valida enquanto escreve, mas só se o campo já foi tocado
        field.addEventListener('input', () => {
            const group = field.closest('.form-group');
            if (group.classList.contains('invalid') || group.classList.contains('valid')) {
                const result = validateField(name, field.value);
                showFieldFeedback(name, result.valid, result.message);
            }
            updateSubmitButton(); // Atualiza o botão sempre
        });
    });

    updateSubmitButton(); // O botão começa desativado
}


// ============================================================
//  CONTADOR DE CARACTERES
// ============================================================

/**
 * setupCharCounter()
 * Conta os caracteres da textarea e avisa quando se aproxima do limite.
 *
 * CONCEITO — textarea.value.length:
 *   .value → texto atual dentro do campo
 *   .length → número de caracteres desse texto
 *
 * CONCEITO — Limiares (thresholds):
 *   > 400 e <= 500 → aviso amarelo (a aproximar-se do limite)
 *   > 500          → erro vermelho (limite ultrapassado)
 *   O CSS usa as classes 'warning' e 'error' para aplicar as cores.
 *
 * Removemos 'warning' e 'error' antes de adicionar a nova classe
 * para garantir que só uma está ativa de cada vez.
 */
function setupCharCounter() {
    const textarea  = document.getElementById('message');
    const countEl   = document.getElementById('char-count');
    const counterEl = document.querySelector('.char-counter');
    if (!textarea || !countEl) return;

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        countEl.textContent = len; // Atualiza o número visível

        counterEl.classList.remove('warning', 'error'); // Limpa estado anterior
        if (len > 400 && len <= 500) counterEl.classList.add('warning'); // Amarelo
        if (len > 500)               counterEl.classList.add('error');   // Vermelho

        updateSubmitButton(); // Desativa o botão se ultrapassar 500
    });
}


// ============================================================
//  TOAST NOTIFICATIONS
// ============================================================

/**
 * showToast(type, title, message, duration)
 * Cria e mostra uma notificação temporária (toast) no canto do ecrã.
 *
 * Parâmetros:
 *   type     → 'success' | 'error' | 'warning' | 'info'
 *   title    → título em negrito
 *   message  → descrição detalhada
 *   duration → tempo em ms antes de desaparecer (padrão: 3000ms = 3s)
 *
 * CONCEITO — Criação dinâmica de elementos:
 *   document.createElement('div') → cria um <div> em memória
 *   .className = '...'           → define as classes CSS
 *   .innerHTML = '...'           → define o HTML interno
 *   container.appendChild(toast) → adiciona à página (torna visível)
 *
 * CONCEITO — Animação de saída + remoção:
 *   Antes de remover o toast do DOM, aplicamos a animação CSS 'toastOut'.
 *   setTimeout(..., 350) aguarda 350ms (duração da animação) e só então
 *   remove o elemento — assim o utilizador vê a animação de saída.
 *
 * CONCEITO — if (toast.parentElement):
 *   Verifica se o toast ainda está na página antes de tentar removê-lo.
 *   Pode ter sido fechado manualmente antes do timer disparar.
 */
function showToast(type, title, message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`; // ex: 'toast toast-success'
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast); // Adiciona à página

    // Função que remove o toast com animação de saída
    const remove = () => {
        toast.style.animation = 'toastOut 0.35s ease forwards';
        setTimeout(() => toast.remove(), 350); // Aguarda a animação acabar
    };

    toast.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(() => { if (toast.parentElement) remove(); }, duration);
}


// ============================================================
//  GUARDAR MENSAGENS (localStorage)
// ============================================================

/**
 * saveMessage(formData)
 * Guarda a mensagem enviada no localStorage.
 *
 * Parâmetro: formData → objeto FormData extraído do formulário
 *   new FormData(form) lê todos os campos do formulário de uma vez.
 *   .get('name') → lê o valor do campo com name="name"
 *
 * CONCEITO — JSON (JavaScript Object Notation):
 *   O localStorage só aceita texto. Para guardar objetos/arrays,
 *   usamos JSON como formato intermediário:
 *     JSON.stringify(array) → converte array/objeto → string de texto
 *     JSON.parse(string)    → converte string de texto → array/objeto
 *   Exemplo: [{ id: 1, name: 'Ana' }] → '[{"id":1,"name":"Ana"}]'
 *
 * CONCEITO — Date.now():
 *   Devolve o número de milissegundos desde 1 de Janeiro de 1970.
 *   É um número único que usamos como ID da mensagem.
 *   Ex: 1740565800000
 *
 * CONCEITO — .unshift() vs .push():
 *   .push(item)    → adiciona no FIM do array
 *   .unshift(item) → adiciona no INÍCIO do array
 *   Usamos unshift para que as mensagens mais recentes apareçam primeiro.
 *
 * CONCEITO — || null (valor por omissão):
 *   formData.get('phone') devolve '' se o campo estiver vazio.
 *   '' || null → null (string vazia é falsy → usa o valor à direita do ||)
 *   Guardamos null em vez de '' para poupar espaço e facilitar verificações.
 */
function saveMessage(formData) {
    // Lê mensagens existentes ou começa com array vazio
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];

    const msg = {
        id:      Date.now(),                    // ID único
        name:    formData.get('name'),
        email:   formData.get('email'),
        phone:   formData.get('phone') || null, // null se campo vazio
        subject: formData.get('subject'),
        message: formData.get('message'),
        date:    new Date().toISOString(),       // Data/hora em formato ISO
        read:    false                           // Ainda não lida pelo admin
    };

    messages.unshift(msg); // Adiciona no início (mais recente primeiro)
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    console.log('💾 Mensagem guardada:', msg);
    return msg;
}


// ============================================================
//  SUBMIT DO FORMULÁRIO
// ============================================================

/**
 * setupFormSubmit()
 * Liga o evento de submissão ao formulário e trata todo o processo.
 *
 * CONCEITO — e.preventDefault():
 *   Por padrão, ao submeter um <form>, o browser recarrega a página
 *   (ou navega para action="..."). preventDefault() cancela esse
 *   comportamento padrão, dando-nos controlo total via JavaScript.
 *
 * CONCEITO — async/await:
 *   Funções 'async' podem conter operações que demoram tempo (assíncronas).
 *   'await' pausa a execução até a operação terminar.
 *   new Promise(resolve => setTimeout(resolve, 1500))
 *   → cria uma pausa de 1.5 segundos para simular envio ao servidor.
 *   Em produção, aqui estaria um fetch() para uma API real.
 *
 * CONCEITO — try / catch / finally:
 *   try    → código que pode falhar (tentativa)
 *   catch  → executa SE houver erro (ex: sem ligação à internet)
 *   finally → executa SEMPRE, com ou sem erro (limpeza obrigatória)
 *   Garante que o botão nunca fica preso no estado "loading".
 *
 * CONCEITO — new FormData(form):
 *   Lê todos os campos do formulário de uma vez, respeitando os
 *   atributos name="..." de cada campo.
 */
function setupFormSubmit() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        // Valida o formulário antes de submeter; se inválido, mostra erros e para
        if (!validateForm()) {
            showToast('error', 'Erro!', 'Por favor, corrige os erros no formulário');
            return;
        }

        // Desativa o botão e mostra animação de carregamento
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            // Simula envio ao servidor (1.5 segundos de espera)
            await new Promise(resolve => setTimeout(resolve, 1500));

            const formData = new FormData(form);
            saveMessage(formData); // Guarda no localStorage

            showToast('success', 'Mensagem Enviada! 🎉',
                'Obrigado pelo contacto. Respondo em breve!');

            // Limpa o formulário após envio bem-sucedido
            form.reset(); // Reseta todos os campos
            document.querySelectorAll('.form-group').forEach(g =>
                g.classList.remove('valid', 'invalid')); // Remove cores de validação
            const charCount = document.getElementById('char-count');
            if (charCount) charCount.textContent = '0'; // Reseta contador

            loadMessages(); // Atualiza o badge do botão admin

        } catch {
            showToast('error', 'Erro ao Enviar', 'Ocorreu um erro. Tenta novamente.');
        } finally {
            // Sempre: reativa o botão e remove animação de carregamento
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            updateSubmitButton();
        }
    });
}


// ============================================================
//  ADMIN VIEW
// ============================================================

/**
 * markAllAsRead()
 * Marca todas as mensagens como lidas (read: true).
 *
 * CONCEITO — Spread operator (...) em objetos:
 *   { ...m, read: true }
 *   Cria um NOVO objeto copiando todas as propriedades de m,
 *   mas substituindo (ou adicionando) a propriedade read por true.
 *   O objeto original m não é modificado — imutabilidade.
 *
 * CONCEITO — .map() para transformar:
 *   Não altera o array original, devolve um novo array transformado.
 *   messages.map(m => ({ ...m, read: true }))
 *   → novo array onde cada mensagem tem read: true
 */
function markAllAsRead() {
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const updated  = messages.map(m => ({ ...m, read: true }));
    localStorage.setItem('contactMessages', JSON.stringify(updated));
}

/**
 * loadMessages(markRead)
 * Carrega e exibe as mensagens na área de administração.
 *
 * Parâmetro: markRead → se true, marca todas como lidas ao abrir
 *   (pressupõe que o admin as leu ao abrir o painel)
 *
 * CONCEITO — Badge de não lidas:
 *   messages.filter(m => !m.read).length
 *   !m.read → true se a mensagem ainda não foi lida (read é false)
 *   filter → retém apenas as não lidas
 *   .length → conta quantas ficaram
 *
 * CONCEITO — Template literal para gerar HTML de múltiplos itens:
 *   messages.map(msg => `<div>...</div>`).join('')
 *   Para cada mensagem cria uma string HTML, depois junta tudo numa
 *   única string que é inserida no list.innerHTML de uma só vez.
 *   Mais eficiente do que usar appendChild() em loop.
 *
 * CONCEITO — Renderização condicional com ternário no template:
 *   ${msg.phone ? `<p>${msg.phone}</p>` : ''}
 *   Se msg.phone não for null, mostra o telefone; senão não mostra nada.
 */
function loadMessages(markRead = false) {
    if (markRead) markAllAsRead();

    const messages   = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const list       = document.getElementById('messages-list');
    const noMessages = document.getElementById('no-messages');
    const totalEl    = document.getElementById('total-messages');
    const badge      = document.getElementById('unread-badge');

    if (totalEl) totalEl.textContent = messages.length;

    // Atualiza o badge de mensagens não lidas
    const unread = messages.filter(m => !m.read).length;
    if (badge) {
        badge.textContent   = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none'; // Mostra ou esconde
    }

    if (!list || !noMessages) return;

    // Sem mensagens: mostra aviso
    if (messages.length === 0) {
        list.style.display       = 'none';
        noMessages.style.display = 'block';
        return;
    }

    list.style.display       = 'flex';
    noMessages.style.display = 'none';

    // Gera o HTML de todos os cards de mensagem de uma vez
    list.innerHTML = messages.map(msg => `
        <div class="message-card ${msg.read ? '' : 'unread'}" data-id="${msg.id}">
            <div class="message-header">
                <div class="message-sender">
                    <h4>${msg.name}</h4>
                    <p>${msg.email}</p>
                    ${msg.phone ? `<p class="msg-phone">📱 ${msg.phone}</p>` : ''}
                </div>
                <div class="message-meta">
                    <div>${new Date(msg.date).toLocaleDateString('pt-PT')}</div>
                    <div>${new Date(msg.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
            <span class="message-subject">${msg.subject}</span>
            <div class="message-body">${msg.message}</div>
            <div class="message-actions">
                <button class="btn-delete" data-id="${msg.id}">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');

    // Liga os botões de eliminar (após inserir o HTML)
    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteMessage(parseInt(btn.dataset.id)));
    });
}

/**
 * deleteMessage(id)
 * Elimina uma mensagem pelo seu id.
 *
 * CONCEITO — Filtrar para excluir:
 *   messages.filter(m => m.id !== id)
 *   !== significa "estritamente diferente de"
 *   Mantém todas as mensagens EXCETO a que tem este id.
 *   O resultado é um novo array sem a mensagem eliminada.
 */
function deleteMessage(id) {
    if (!confirm('Eliminar esta mensagem?')) return;
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages = messages.filter(m => m.id !== id); // Remove a mensagem com este id
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    loadMessages(); // Atualiza a lista visível
    showToast('success', 'Eliminada!', 'Mensagem removida com sucesso');
}

/**
 * clearAllMessages()
 * Apaga TODAS as mensagens (com confirmação).
 */
function clearAllMessages() {
    if (!confirm('Eliminar TODAS as mensagens? Esta ação é irreversível!')) return;
    localStorage.removeItem('contactMessages'); // Apaga a chave completamente
    loadMessages();
    showToast('success', 'Limpo!', 'Todas as mensagens foram removidas');
}

/**
 * setupAdminToggle()
 * Controla a visibilidade do painel de administração.
 *
 * CONCEITO — Variável local como estado:
 *   'let visible = false' é uma variável local de setupAdminToggle().
 *   Guarda se o painel está visível ou não.
 *   Só existe dentro desta função — não "contamina" o espaço global.
 *
 * CONCEITO — .scrollIntoView({ behavior: 'smooth' }):
 *   Faz scroll suave até o elemento ficar visível no ecrã.
 *   Melhor experiência do que o scroll instantâneo padrão.
 */
function setupAdminToggle() {
    const toggleBtn = document.getElementById('toggle-admin');
    const adminSec  = document.getElementById('admin-messages');
    const clearBtn  = document.getElementById('clear-messages');
    if (!toggleBtn || !adminSec) return;

    let visible = false; // Estado inicial: painel escondido

    toggleBtn.addEventListener('click', () => {
        visible = !visible; // Alterna entre true e false
        adminSec.style.display = visible ? 'block' : 'none';
        if (visible) {
            loadMessages(true); // true → marcar como lidas ao abrir
            adminSec.scrollIntoView({ behavior: 'smooth' });
        }
    });

    if (clearBtn) clearBtn.addEventListener('click', clearAllMessages);
}


// ============================================================
//  INICIALIZAÇÃO — UM ÚNICO DOMContentLoaded
//
//  Por que ter apenas UM bloco DOMContentLoaded?
//  ─────────────────────────────────────────────
//  O browser aceita múltiplos listeners DOMContentLoaded e
//  executaria todos — tecnicamente funcionaria.
//
//  Mas ter um único bloco é a boa prática porque:
//    1. Clareza: o fluxo de arranque da página está num só sítio.
//    2. Manutenção: fácil de ver o que corre, em que ordem.
//    3. Profissionalismo: padrão usado em projetos reais.
//
//  Todas as sessões (2, 3 e 4) são inicializadas aqui em conjunto.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Sessão 2: Tema claro/escuro ──────────────────────────
    loadSavedTheme(); // Aplica o tema guardado (ou deteta o do sistema)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    // ── Sessão 2: Relógio digital ────────────────────────────
    loadClockFormat(); // Carrega o formato guardado (24h ou 12h)
    startClock();      // Inicia o relógio (atualiza a cada segundo)
    const formatToggleBtn = document.getElementById('format-toggle');
    if (formatToggleBtn) formatToggleBtn.addEventListener('click', toggleFormat);

    // ── Sessão 2: Contador de visitas ────────────────────────
    initVisitCounter(); // Regista a visita e atualiza os contadores
    const resetBtn = document.getElementById('reset-counter');
    if (resetBtn) resetBtn.addEventListener('click', resetVisitCounter);

    // ── Sessão 2: Footer ─────────────────────────────────────
    setFooterYear(); // Insere o ano atual no rodapé

    // ── Sessão 3: Galeria de projetos ────────────────────────
    renderProjects(projects);  // Desenha todos os projetos inicialmente
    setupFilterListeners();    // Liga os botões de filtro por categoria
    setupModalListeners();     // Liga o modal de detalhes dos projetos
    setupSearchListener();     // Liga a barra de pesquisa em tempo real

    // ── Sessão 4: Formulário de contacto ─────────────────────
    setupFormValidation(); // Liga a validação em tempo real por campo
    setupCharCounter();    // Liga o contador de caracteres da mensagem
    setupFormSubmit();     // Liga o evento de submissão do formulário
    setupAdminToggle();    // Liga o botão do painel de administração
    loadMessages();        // Carrega o badge com mensagens não lidas

    console.log('✅ Portfolio totalmente carregado!');
});
