// --- JS para SPA/CMS - Copa do Mundo de Clubes ---
// Atualizado às 17:00h 30/06/25 - Incluído chaveamento das oitavas de final

// Variáveis para controle de navegação entre fases
let currentPhase = 'groups'; // 'groups' ou 'knockout'

// Função para aguardar elemento aparecer no DOM
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
    }, timeout);
  });
}

// Função para toggle dos termos
function toggleTerms() {
  const content = document.getElementById('terms-content');
  const icon = document.getElementById('terms-icon');
  const chevron = document.getElementById('chevron-icon');
  if (content && icon && chevron) {
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.textContent = '−';
      chevron.style.transform = 'rotate(180deg)';
    } else {
      content.classList.add('hidden');
      icon.textContent = '+';
      chevron.style.transform = 'rotate(0deg)';
    }
  }
}

// API dos artilheiros
const ARTILHEIROS_API_URL = 'https://cdn.jsdelivr.net/gh/mu-costa/artilheiros@refs/heads/main/artilheiros.json';

// API fixtures
const FIXTURES_API_URL = 'https://v3.football.api-sports.io/fixtures?league=15&season=2025&round=8th%20Finals';

// Função para buscar artilheiros da API
async function fetchArtilheiros() {
  try {
    console.log('🔄 Buscando dados dos artilheiros...');
    const response = await fetch(ARTILHEIROS_API_URL);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const artilheiros = await response.json();
    console.log('✅ Dados dos artilheiros carregados:', artilheiros.length, 'jogadores');
    return artilheiros;
  } catch (error) {
    console.warn('⚠️ Erro ao buscar artilheiros:', error.message);
    
    // Fallback com dados mockados
    return [
      {
        "jogador-foto": "https://s.sde.globo.com/media/person_role/2024/06/14/photo_140x140_jGREsGd.png",
        "jogador-escudo": "https://s.sde.globo.com/media/organizations/2017/09/22/Bayer-Munique-65.png",
        "jogador-nome": "Musiala",
        "jogador-posicao": "Meio-campo",
        "jogador-gols": "3"
      },
      {
        "jogador-foto": "https://s.sde.globo.com/media/person_role/2019/03/13/e3906271f3caccb8796dc63477b6a451_140x140.png",
        "jogador-escudo": "https://s.sde.globo.com/media/organizations/2017/09/22/Bayer-Munique-65.png",
        "jogador-nome": "Coman",
        "jogador-posicao": "Atacante",
        "jogador-gols": "2"
      },
      {
        "jogador-foto": "https://s.sde.globo.com/media/person_role/2022/11/01/photo_140x140_yB5pM4u.png",
        "jogador-escudo": "https://s.sde.globo.com/media/organizations/2025/06/09/Juventus-65x65.png",
        "jogador-nome": "Kolo Muani",
        "jogador-posicao": "Atacante",
        "jogador-gols": "2"
      },
      {
        "jogador-foto": "https://s.sde.globo.com/media/person_role/2019/04/16/2144ecb394516ea16dcf9b465a1bdefe_140x140.png",
        "jogador-escudo": "https://s.sde.globo.com/media/organizations/2023/07/25/inter-miami-65x65-62396.png",
        "jogador-nome": "Messi",
        "jogador-posicao": "Atacante",
        "jogador-gols": "1"
      },
      {
        "jogador-foto": "https://s.sde.globo.com/media/person_role/2020/06/13/7f7d74c23caddf25e45fc48416ddc6d7_140x140.png",
        "jogador-escudo": "https://s.sde.globo.com/media/organizations/2021/03/31/65_Inter_de_Milão_2021.png",
        "jogador-nome": "Lautaro Martínez",
        "jogador-posicao": "Atacante",
        "jogador-gols": "1"
      }
    ];
  }
}

// Renderização dinâmica dos artilheiros (top scorers) - Aguarda elemento e busca da API
async function renderArtilheiros() {
  try {
    const artilheirosDiv = await waitForElement('#artilheiros-copa', 5000);
    
    // Busca dados da API
    const artilheiros = await fetchArtilheiros();
    
    // Ordena por gols (decrescente) e pega os top 10
    const topArtilheiros = artilheiros
      .sort((a, b) => parseInt(b['jogador-gols']) - parseInt(a['jogador-gols']))
      .slice(0, 10);
    
    artilheirosDiv.innerHTML = '';
    
    topArtilheiros.forEach((artilheiro, idx) => {
      const gols = parseInt(artilheiro['jogador-gols']) || 0;
      const posicao = artilheiro['jogador-posicao'] || 'N/A';
      
      artilheirosDiv.insertAdjacentHTML('beforeend', `        <div class="flex-shrink-0 w-36 sm:w-40 md:w-48 lg:w-56 rounded-lg bg-gradient-to-b from-neutral-900 to-neutral-800 shadow-lg overflow-hidden flex flex-col items-center justify-between border border-amber-500/20">
          <div class="flex flex-col items-center justify-center bg-gradient-to-r from-amber-600 to-amber-500 p-3 sm:p-4 w-full">
            <div class="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">#${idx + 1}</div>
            <img src="${artilheiro['jogador-foto']}" alt="${artilheiro['jogador-nome']}" class="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white mb-1 sm:mb-2 object-cover shadow-md bg-white" onerror="this.src='https://via.placeholder.com/64x64/cccccc/666666?text=?'">
            <div class="flex items-center gap-1 mb-1 sm:mb-2">
              <img src="${artilheiro['jogador-escudo']}" alt="Escudo" class="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white object-cover" onerror="this.src='https://via.placeholder.com/32x32/cccccc/666666?text=?'">
              <span class="block text-xs font-semibold text-white/80 truncate max-w-[80px] sm:max-w-[100px]">${posicao}</span>
            </div>
            <span class="block text-xl sm:text-2xl font-bold text-white">${gols} <span class='text-sm sm:text-base font-normal'>gol${gols !== 1 ? 's' : ''}</span></span>
          </div>
          <div class="p-2 sm:p-3 w-full text-center">
            <h4 class="text-sm sm:text-base font-semibold text-amber-300 break-words leading-tight">${artilheiro['jogador-nome']}</h4>
          </div>
        </div>
      `);
    });
    
    console.log('✅ Artilheiros renderizados com sucesso:', topArtilheiros.length, 'jogadores');
  } catch (error) {
    console.warn('⚠️ Container de artilheiros não encontrado:', error.message);
  }
}

// Função para garantir que os artilheiros sejam renderizados também na variável global window.artilheiros (compatibilidade)
async function setupArtilheirosGlobal() {
  try {
    const artilheiros = await fetchArtilheiros();
    
    // Converte formato da API para formato usado anteriormente
    window.artilheiros = artilheiros
      .sort((a, b) => parseInt(b['jogador-gols']) - parseInt(a['jogador-gols']))
      .slice(0, 10)
      .map(artilheiro => ({
        name: artilheiro['jogador-nome'],
        logo: artilheiro['jogador-foto'],
        team: artilheiro['jogador-posicao'],
        goals: parseInt(artilheiro['jogador-gols']) || 0
      }));
    
    console.log('✅ window.artilheiros configurado com', window.artilheiros.length, 'jogadores');
  } catch (error) {
    console.warn('⚠️ Erro ao configurar artilheiros globais:', error.message);
    window.artilheiros = [];
  }
}

// Standings API - Adaptado para SPA
const STANDINGS_API_URL = 'https://v3.football.api-sports.io/standings?league=15&season=2025';
const API_KEY = '6ab9fabfb32d18cad9adb9525d1076ac';
let standingsGroupsData = [];

async function getStandings() {
  try {
    console.log('🔄 Iniciando busca de standings...');
    
    // Aguarda elementos estarem disponíveis
    await waitForElement('#group-select', 5000);
    await waitForElement('#standings-groups', 5000);
    
    const response = await fetch(STANDINGS_API_URL, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.response && data.response[0] && data.response[0].league.standings) {
        standingsGroupsData = data.response[0].league.standings;
        renderGroupSelect(standingsGroupsData);
        renderStandingsGroup(0);
        console.log('✅ Standings carregados com sucesso');
      }
    } else {
      throw new Error(`Erro na API: ${response.status}`);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar standings:', error.message);
    
    // Fallback com dados mockados
    standingsGroupsData = [
      [
        { team: { name: 'Manchester City', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png' }, points: 9, rank: 1, all: { played: 3, win: 3, draw: 0, lose: 0, goals: { for: 8, against: 2 } }, goalsDiff: 6 },
        { team: { name: 'Juventus', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png' }, points: 6, rank: 2, all: { played: 3, win: 2, draw: 0, lose: 1, goals: { for: 5, against: 3 } }, goalsDiff: 2 },
        { team: { name: 'Wydad AC', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Wydad_AC_logo.svg/1200px-Wydad_AC_logo.svg.png' }, points: 3, rank: 3, all: { played: 3, win: 1, draw: 0, lose: 2, goals: { for: 3, against: 5 } }, goalsDiff: -2 },
        { team: { name: 'Al Ain FC', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Al_Ain_FC_logo.svg/1200px-Al_Ain_FC_logo.svg.png' }, points: 0, rank: 4, all: { played: 3, win: 0, draw: 0, lose: 3, goals: { for: 1, against: 7 } }, goalsDiff: -6 }
      ],
      [
        { team: { name: 'Real Madrid', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png' }, points: 9, rank: 1, all: { played: 3, win: 3, draw: 0, lose: 0, goals: { for: 7, against: 1 } }, goalsDiff: 6 },
        { team: { name: 'Borussia Dortmund', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Borussia-Dortmund-Logo.png' }, points: 6, rank: 2, all: { played: 3, win: 2, draw: 0, lose: 1, goals: { for: 4, against: 3 } }, goalsDiff: 1 },
        { team: { name: 'Pachuca', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Pachuca_logo.svg/1200px-Pachuca_logo.svg.png' }, points: 3, rank: 3, all: { played: 3, win: 1, draw: 0, lose: 2, goals: { for: 2, against: 4 } }, goalsDiff: -2 },
        { team: { name: 'Al Hilal', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Al_Hilal_FC_logo.svg/1200px-Al_Hilal_FC_logo.svg.png' }, points: 0, rank: 4, all: { played: 3, win: 0, draw: 0, lose: 3, goals: { for: 1, against: 6 } }, goalsDiff: -5 }
      ]
    ];
    
    try {
      renderGroupSelect(standingsGroupsData);
      renderStandingsGroup(0);
      
      const container = document.getElementById('standings-groups');
      if (container) {
        container.insertAdjacentHTML('afterbegin', '<p class="text-yellow-600 mb-4">⚠️ Dados de demonstração (API indisponível)</p>');
      }
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError);
    }
  }
}

function renderGroupSelect(groups) {
  const select = document.getElementById('group-select');
  if (!select) {
    console.error('Element with id "group-select" not found');
    return;
  }
  
  select.innerHTML = '';
  if (!groups || !Array.isArray(groups)) {
    select.innerHTML = '<option value="-1">Nenhum grupo disponível</option>';
    return;
  }
  
  groups.forEach((groupArr, idx) => {
    if (!groupArr || !groupArr.length) return;
    // Traduz 'Group' para 'Grupo' caso esteja em inglês
    const groupLetter = groupArr[0].group ? groupArr[0].group.replace('Group', 'Grupo') : `Grupo ${String.fromCharCode(65 + idx)}`;
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = groupLetter;
    select.appendChild(option);
  });
  
  select.onchange = function () {
    renderStandingsGroup(Number(this.value));
  };
}

function renderStandingsGroup(idx) {
  const container = document.getElementById('standings-groups');
  if (!container) {
    console.error('Element with id "standings-groups" not found');
    return;
  }
  
  container.innerHTML = '';
  
  if (!standingsGroupsData || !Array.isArray(standingsGroupsData) || 
      !standingsGroupsData[idx] || !standingsGroupsData[idx].length) {
    container.innerHTML = '<p class="text-gray-500 p-4">Nenhum dado disponível para este grupo.</p>';
    return;
  }
  
  const groupArr = standingsGroupsData[idx];
  // Traduz 'Group' para 'Grupo' caso esteja em inglês
  const groupLetter = groupArr[0].group ? groupArr[0].group.replace('Group', 'Grupo') : `Grupo ${String.fromCharCode(65 + idx)}`;
  let table = `<div class='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow mt-4'>
    <h3 class='text-lg font-bold text-green-700 mb-2 px-4 pt-4'>${groupLetter}</h3>
    <table class='min-w-[600px] w-full bg-white rounded-lg'>
      <thead class='bg-gradient-to-r from-gray-50 to-gray-100'>
        <tr>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>Pos</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider text-left'>Time</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>Pts</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>J</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>V</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>E</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>D</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>GP</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>GC</th>
          <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>SG</th>
        </tr>
      </thead>
      <tbody class='bg-white divide-y divide-gray-200'>`;
  
  groupArr.forEach(team => {
    table += `<tr class='hover:bg-green-50 transition'>
      <td class='px-2 py-1 text-center font-semibold'>${team.rank}</td>
      <td class='px-2 py-1 flex items-center gap-2'><img src='${team.team.logo}' alt='${team.team.name}' class='w-6 h-6 inline-block rounded-full border' onerror="this.src='https://via.placeholder.com/24x24/cccccc/666666?text=?'" />${team.team.name}</td>
      <td class='px-2 py-1 text-center font-bold text-green-700'>${team.points}</td>
      <td class='px-2 py-1 text-center'>${team.all.played}</td>
      <td class='px-2 py-1 text-center'>${team.all.win}</td>
      <td class='px-2 py-1 text-center'>${team.all.draw}</td>
      <td class='px-2 py-1 text-center'>${team.all.lose}</td>
      <td class='px-2 py-1 text-center'>${team.all.goals.for}</td>
      <td class='px-2 py-1 text-center'>${team.all.goals.against}</td>
      <td class='px-2 py-1 text-center'>${team.goalsDiff}</td>
    </tr>`;
  });
  table += '</tbody></table></div>';
  container.insertAdjacentHTML('beforeend', table);
}

// Função para buscar as partidas das oitavas de final
async function fetchKnockoutFixtures() {
  try {
    console.log('🔄 Iniciando busca de partidas das oitavas de final...');
    
    const response = await fetch(FIXTURES_API_URL, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.response && data.response.length > 0) {
        console.log('✅ Partidas das oitavas carregadas com sucesso:', data.response.length, 'jogos');
        return data.response;
      } else {
        throw new Error('Dados de partidas indisponíveis');
      }
    } else {
      throw new Error(`Erro na API: ${response.status}`);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar partidas das oitavas:', error.message);
    
    // Fallback com dados mockados
    return [
      {
        fixture: { id: 1001, date: "2025-06-30T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
          away: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1002, date: "2025-07-01T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
          away: { id: 165, name: "Borussia Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1003, date: "2025-07-02T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
          away: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1004, date: "2025-07-03T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
          away: { id: 85, name: "Paris Saint Germain", logo: "https://media.api-sports.io/football/teams/85.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1005, date: "2025-07-04T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
          away: { id: 505, name: "Inter", logo: "https://media.api-sports.io/football/teams/505.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1006, date: "2025-07-05T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
          away: { id: 499, name: "Napoli", logo: "https://media.api-sports.io/football/teams/499.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1007, date: "2025-07-06T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
          away: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1008, date: "2025-07-07T20:00:00+00:00", status: { short: "NS" } },
        league: { name: "Club World Cup" },
        teams: {
          home: { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" },
          away: { id: 530, name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" }
        },
        goals: { home: null, away: null }
      }
    ];
  }
}

// Função para renderizar as partidas das oitavas de final
async function renderKnockoutFixtures() {
  try {
    const fixturesContainer = document.getElementById('knockout-fixtures');
    if (!fixturesContainer) {
      console.error('❌ Container de partidas das oitavas não encontrado');
      return;
    }
    
    // Busca os dados da API
    const fixtures = await fetchKnockoutFixtures();
    
    // Limpa o container
    fixturesContainer.innerHTML = '';
    
    if (fixtures.length === 0) {
      fixturesContainer.innerHTML = `
        <div class="w-full text-center py-8">
          <p class="text-gray-600">Nenhuma partida das oitavas de final disponível ainda.</p>
        </div>
      `;
      return;
    }
    
    // Renderiza cada partida
    fixtures.forEach((match, index) => {
      const matchDate = new Date(match.fixture.date);
      const formattedDate = matchDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = matchDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const homeGoals = match.goals.home !== null ? match.goals.home : '-';
      const awayGoals = match.goals.away !== null ? match.goals.away : '-';
      const matchStatus = match.fixture.status.short;
      
      // Status de jogo melhorado
      let statusLabel;
      if (matchStatus === 'NS') {
        statusLabel = 'A REALIZAR';
      } else if (matchStatus === 'FT') {
        statusLabel = 'ENCERRADO';
      } else if (matchStatus === 'LIVE') {
        statusLabel = 'AO VIVO';
      } else if (matchStatus === 'HT') {
        statusLabel = 'INTERVALO';
      } else if (matchStatus === 'PST') {
        statusLabel = 'ADIADO';
      } else if (matchStatus === 'CANC') {
        statusLabel = 'CANCELADO';
      } else if (matchStatus === 'SUSP') {
        statusLabel = 'SUSPENSO';
      } else if (matchStatus === 'ABD') {
        statusLabel = 'ABANDONADO';
      } else if (matchStatus === 'TBD') {
        statusLabel = 'A DEFINIR';
      } else if (matchStatus === 'SCHEDULED') {
        statusLabel = 'AGENDADO';
      } else {
        // Mostra status genérico para outros valores
        statusLabel = match.fixture.status.long ? match.fixture.status.long.toUpperCase() : 'AGENDADO';
      }
      
      const statusColor = matchStatus === 'NS' || matchStatus === 'TBD' || matchStatus === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 
                         matchStatus === 'FT' || matchStatus === 'CANC' || matchStatus === 'ABD' ? 'bg-gray-100 text-gray-800' : 
                         matchStatus === 'LIVE' || matchStatus === 'HT' ? 'bg-red-100 text-red-800' : 
                         matchStatus === 'PST' || matchStatus === 'SUSP' ? 'bg-yellow-100 text-yellow-800' :
                         'bg-green-100 text-green-800';
      
      fixturesContainer.insertAdjacentHTML('beforeend', `
        <div class="w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <div class="px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Oitavas de Final #${index + 1}</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                ${statusLabel}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">${formattedDate} às ${formattedTime}</div>
          </div>
          
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center w-5/12 justify-end">
                <div class="text-right mr-3">
                  <div class="font-semibold text-sm sm:text-base break-words sm:whitespace-nowrap max-w-[120px] sm:max-w-full">${match.teams.home.name}</div>
                </div>
                <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 sm:w-10 sm:h-10 object-contain" onerror="this.src='https://via.placeholder.com/40x40/cccccc/666666?text=?'">
              </div>
              
              <div class="flex items-center justify-center w-2/12">
                <div class="flex items-center justify-center gap-1 sm:gap-2">
                  <span class="font-bold text-lg sm:text-xl ${matchStatus === 'NS' ? 'text-gray-300' : 'text-gray-800'}">${homeGoals}</span>
                  <span class="font-bold text-lg sm:text-xl text-gray-400">x</span>
                  <span class="font-bold text-lg sm:text-xl ${matchStatus === 'NS' ? 'text-gray-300' : 'text-gray-800'}">${awayGoals}</span>
                </div>
              </div>
              
              <div class="flex items-center w-5/12">
                <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-8 h-8 sm:w-10 sm:h-10 object-contain" onerror="this.src='https://via.placeholder.com/40x40/cccccc/666666?text=?'">
                <div class="ml-3">
                  <div class="font-semibold text-sm sm:text-base break-words sm:whitespace-nowrap max-w-[120px] sm:max-w-full">${match.teams.away.name}</div>
                </div>
              </div>
            </div>
            
            <!-- Link para apostar nessa partida -->
            <div class="mt-3 flex justify-center">
              <a href="#" class="inline-flex items-center justify-center px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-md hover:bg-amber-600 transition-colors duration-300 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Apostar neste jogo
              </a>
            </div>
          </div>
        </div>
      `);
    });
    
    console.log('✅ Partidas das oitavas renderizadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao renderizar partidas das oitavas:', error);
    
    const fixturesContainer = document.getElementById('knockout-fixtures');
    if (fixturesContainer) {
      fixturesContainer.innerHTML = `
        <div class="w-full text-center py-8 bg-red-50 rounded-lg border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p class="text-red-600 font-medium">Erro ao carregar as partidas das oitavas de final.</p>
          <p class="text-red-500 text-sm mt-1">Tente novamente mais tarde.</p>
        </div>
      `;
    }
  }
}

// Função para alternar entre fases (grupos e oitavas)
function togglePhase() {
  const groupContent = document.getElementById('group-phase-content');
  const knockoutContent = document.getElementById('knockout-phase-content');
  const phaseTitle = document.getElementById('phase-title');
  const phaseDescription = document.getElementById('phase-description');
  const phaseInstruction = document.getElementById('phase-instruction');
  
  if (currentPhase === 'groups') {
    // Muda para oitavas
    currentPhase = 'knockout';
    
    groupContent.classList.add('hidden');
    knockoutContent.classList.remove('hidden');
    
    phaseTitle.textContent = 'OITAVAS DE FINAL';
    phaseDescription.textContent = 'Os 16 melhores times do torneio se enfrentam em partidas eliminatórias.';
    phaseInstruction.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <p style="padding-left: 0.5rem;">Veja os confrontos das oitavas de final</p>
    `;
    
    // Carrega os dados das oitavas se ainda não foram carregados
    renderKnockoutFixtures();
    
  } else {
    // Volta para grupos
    currentPhase = 'groups';
    
    groupContent.classList.remove('hidden');
    knockoutContent.classList.add('hidden');
    
    phaseTitle.textContent = 'FASE DE GRUPOS';
    phaseDescription.textContent = '32 times divididos em 8 grupos de 4. Os dois melhores de cada grupo avançam para a próxima fase.';
    phaseInstruction.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.2162 13.1769C18.9234 13.1683 18.7137 12.9422 18.7055 12.6411C18.6134 8.99971 16.7384 6.30436 13.8923 5.24971L11.9423 10.6069C11.9255 10.6486 11.9337 10.6822 11.9755 10.699C12.0091 10.7158 12.0341 10.699 12.0595 10.674L13.047 9.60257C13.6916 8.90757 14.512 8.85757 15.148 9.39329C15.868 10.004 15.8766 10.9165 15.173 11.779L12.3691 15.169C10.2512 17.7304 7.76552 18.5254 4.98624 17.5126C1.66302 16.3072 0.248381 13.2604 1.58802 9.57721L2.21552 7.8615C2.86838 6.04507 4.11552 5.30007 5.58052 5.81079C5.9741 5.30007 6.57695 5.12436 7.22945 5.35864C7.46411 5.44836 7.68413 5.57246 7.88231 5.72686C8.30945 5.17436 8.97052 4.97329 9.65731 5.21614C9.84458 5.28786 10.0218 5.38354 10.1845 5.50079L11.1387 2.88936C11.4984 1.89293 12.4027 1.47471 13.3316 1.80936C14.2691 2.15257 14.6877 3.04864 14.328 4.04436L14.2609 4.22864C17.5002 5.44221 19.752 8.56436 19.752 12.6244C19.752 12.9254 19.5009 13.1851 19.2162 13.1769ZM5.34624 16.4161C7.5391 17.2197 9.59838 16.8094 11.532 14.474L14.3362 11.1008C14.6373 10.7494 14.6373 10.4061 14.3695 10.1715C14.1184 9.94579 13.7752 10.0211 13.4991 10.3054L11.5655 12.3061C11.2391 12.6411 10.9545 12.6744 10.678 12.574C10.3516 12.4569 10.2095 12.1054 10.3434 11.7454L13.3066 3.59257C13.432 3.25757 13.2816 2.93971 12.9634 2.82221C12.637 2.70507 12.3355 2.86436 12.2098 3.199L10.092 9.01686C9.99195 9.29293 9.68195 9.41829 9.40588 9.31793C9.13802 9.21757 8.99588 8.92436 9.09624 8.6565L9.85802 6.55579C9.74052 6.44686 9.5816 6.33793 9.42231 6.27936C9.02945 6.13721 8.70267 6.31293 8.55195 6.72293L7.88231 8.55614C7.78231 8.84079 7.47231 8.94971 7.20445 8.849C6.94481 8.75686 6.77767 8.48114 6.8866 8.18793L7.43052 6.70614C7.30664 6.58219 7.1584 6.48527 6.99517 6.4215C6.60159 6.27936 6.27517 6.45507 6.12445 6.86543L5.68088 8.08757C5.57231 8.38043 5.26231 8.48936 4.99445 8.38864C4.93 8.36636 4.87059 8.33153 4.81967 8.28617C4.76875 8.24081 4.72732 8.18581 4.69777 8.12434C4.66821 8.06288 4.65113 7.99618 4.64749 7.92807C4.64386 7.85997 4.65375 7.79183 4.6766 7.72757L5.01124 6.82329C4.30838 6.57221 3.64695 7.1415 3.19517 8.39721L2.66767 9.82864C1.52088 12.9926 2.56731 15.4033 5.34624 16.4161Z" fill="black" />
      </svg>
      <p style="padding-left: 0.5rem;">Toque e selecione um grupo</p>
    `;
  }
}

// Função para renderizar ranking completo dos artilheiros em tabela
async function renderRankingArtilheiros() {
  try {
    const rankingDiv = await waitForElement('#ranking-artilheiros', 5000);
    
    // Busca dados da API
    const artilheiros = await fetchArtilheiros();
    
    // Ordena por gols (decrescente)
    const rankingCompleto = artilheiros
      .sort((a, b) => parseInt(b['jogador-gols']) - parseInt(a['jogador-gols']));
    
    rankingDiv.innerHTML = `
      <div class='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow mt-4'>
        <h3 class='text-lg font-bold text-amber-600 mb-2 px-4 pt-4'>🏆 Ranking de Artilheiros - Copa do Mundo de Clubes</h3>
        <table class='min-w-[600px] w-full bg-white rounded-lg'>
          <thead class='bg-gradient-to-r from-amber-50 to-amber-100'>
            <tr>
              <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>Pos</th>
              <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider text-left'>Jogador</th>
              <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider text-left'>Posição</th>
              <th class='px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider'>Gols</th>
            </tr>
          </thead>
          <tbody class='bg-white divide-y divide-gray-200'>
            ${rankingCompleto.map((artilheiro, idx) => {
              const gols = parseInt(artilheiro['jogador-gols']) || 0;
              const posicao = artilheiro['jogador-posicao'] || 'N/A';
              
              return `                <tr class='hover:bg-amber-50 transition ${idx < 3 ? 'bg-amber-25' : ''}'>
                  <td class='px-2 sm:px-3 py-1 sm:py-2 text-center font-bold ${idx === 0 ? 'text-amber-600' : idx < 3 ? 'text-amber-500' : 'text-gray-700'}'>${idx + 1}</td><td class='px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-2 sm:gap-3'>
                    <img src='${artilheiro['jogador-foto']}' alt='${artilheiro['jogador-nome']}' class='w-6 h-6 sm:w-8 sm:h-8 rounded-full border object-cover bg-white' onerror="this.src='https://via.placeholder.com/32x32/cccccc/666666?text=?'" />
                    <div class='flex flex-col'>
                      <span class='font-semibold text-gray-900 text-sm sm:text-base'>${artilheiro['jogador-nome']}</span>
                      <div class='flex items-center gap-1'>
                        <img src='${artilheiro['jogador-escudo']}' alt='Escudo' class='w-3 h-3 sm:w-4 sm:h-4 rounded object-cover' onerror="this.src='https://via.placeholder.com/16x16/cccccc/666666?text=?'" />
                        <span class='text-xs text-gray-500'>Clube</span>
                      </div>
                    </div>
                  </td>                  <td class='px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-600'>${posicao}</td>
                  <td class='px-2 sm:px-3 py-1 sm:py-2 text-center'>
                    <span class='inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${idx === 0 ? 'bg-amber-100 text-amber-800' : idx < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}'>
                      ${gols} gol${gols !== 1 ? 's' : ''}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    console.log('✅ Ranking de artilheiros renderizado:', rankingCompleto.length, 'jogadores');
  } catch (error) {
    console.warn('⚠️ Container de ranking de artilheiros não encontrado:', error.message);
  }
}

// Função para renderizar o ranking completo na seção Topscore rankings
async function renderTopscoreRankings() {
  try {
    const rankingContainer = await waitForElement('#topscore-rankings', 5000);
    
    // Busca dados da API
    const artilheiros = await fetchArtilheiros();
    
    // Ordena por gols (decrescente) e pega os top 15
    const topArtilheiros = artilheiros
      .sort((a, b) => parseInt(b['jogador-gols']) - parseInt(a['jogador-gols']))
      .slice(0, 15);      // Cria o cabeçalho
    const headerHTML = `
      <div class="w-full max-w-4xl flex flex-col justify-start items-start gap-1 sm:gap-2">
        <div class="w-full h-8 sm:h-10 py-2 sm:py-2.5 border-t border-b border-white inline-flex justify-start items-center gap-2">
          <div class="flex-1 justify-center text-white text-sm sm:text-base font-normal font-['Inter'] uppercase leading-tight">ranking</div>
          <div class="text-right justify-center text-white text-sm sm:text-base font-normal font-['Inter'] uppercase leading-tight">gols</div>
        </div>
      </div>
    `;
      // Cria o conteúdo da lista
    const playersHTML = topArtilheiros.map((artilheiro, idx) => {
      const gols = parseInt(artilheiro['jogador-gols']) || 0;
      const posicao = artilheiro['jogador-posicao'] || 'N/A';
      const nomeCompleto = artilheiro['jogador-nome'] || 'Nome não disponível';
      const isTop3 = idx < 3;
        return `        <div class="w-full py-2 sm:py-3.5 border-b border-white inline-flex justify-start items-center gap-2 sm:gap-4 hover:bg-white/5 transition-colors duration-200">
          <div class="w-6 sm:w-8 h-7 justify-center ${isTop3 ? 'text-amber-400' : 'text-white/50'} text-2xl sm:text-3xl font-normal font-['Open_Sans']">${idx + 1}</div>
          <div class="flex justify-start items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
            <img class="w-10 h-10 sm:w-12 sm:h-12 relative rounded-[80px] ${isTop3 ? 'border-2 border-amber-400' : 'border border-white/20'} object-cover bg-white" 
                 src="${artilheiro['jogador-foto']}" 
                 alt="${nomeCompleto}"
                 onerror="this.src='https://via.placeholder.com/48x48/374151/9CA3AF?text=${encodeURIComponent(nomeCompleto.charAt(0))}'" />
            <img class="w-5 h-5 sm:w-6 sm:h-6 relative object-cover rounded" 
                 src="${artilheiro['jogador-escudo']}" 
                 alt="Escudo do time"
                 onerror="this.src='https://via.placeholder.com/24x24/374151/9CA3AF?text=?'" />
          </div>
          <div class="flex-1 min-w-0 inline-flex flex-col justify-start items-start">
            <div class="w-full justify-start text-white text-lg sm:text-xl font-normal font-['Inter'] overflow-hidden whitespace-nowrap text-ellipsis">${nomeCompleto}</div>
            <div class="w-full justify-start text-white/50 text-[9px] sm:text-[10px] font-bold font-['Inter'] uppercase overflow-hidden whitespace-nowrap text-ellipsis">${posicao}</div>
          </div>
          <div class="w-12 sm:w-16 text-right justify-center ${isTop3 ? 'text-amber-400' : 'text-white'} text-xl sm:text-2xl font-bold font-['Inter'] leading-relaxed">${gols}</div>
        </div>
      `;
    }).join('');    // Monta o HTML completo
    const containerHTML = `
      ${headerHTML}
      <div class="w-full max-w-4xl flex-1 border-b border-white flex flex-col justify-start items-start overflow-y-auto max-h-[300px] sm:max-h-[400px] scrollbar-thin">
        ${playersHTML}
      </div>
    `;
    
    rankingContainer.innerHTML = containerHTML;
    
    console.log('✅ Topscore rankings renderizado:', topArtilheiros.length, 'jogadores');
  } catch (error) {
    console.warn('⚠️ Container de topscore rankings não encontrado:', error.message);
    
    // Se não encontrar o container, tenta criar uma versão simplificada
    try {
      const fallbackContainer = document.createElement('div');
      fallbackContainer.id = 'topscore-rankings-fallback';
      fallbackContainer.className = 'p-4 text-white bg-red-900/20 rounded mx-4 my-2';
      fallbackContainer.innerHTML = '<p>⚠️ Seção de artilheiros não encontrada no HTML. Verifique se o elemento #topscore-rankings existe.</p>';
      
      // Tenta inserir próximo ao elemento artilheiros-copa se existir
      const artilheirosContainer = document.getElementById('artilheiros-copa');
      if (artilheirosContainer && artilheirosContainer.parentElement) {
        artilheirosContainer.parentElement.appendChild(fallbackContainer);
      } else {
        document.body.appendChild(fallbackContainer);
      }
    } catch (fallbackError) {
      console.error('❌ Erro no fallback do topscore:', fallbackError);
    }
  }
}

// Inicialização principal - Aguarda DOM ou executa imediatamente se já carregado
async function initializePage() {
  // Configura dados globais primeiro
  await setupArtilheirosGlobal();
  
  // Configura navegação entre fases
  const prevPhaseBtn = document.getElementById('prev-phase');
  const nextPhaseBtn = document.getElementById('next-phase');
  
  if (prevPhaseBtn && nextPhaseBtn) {
    prevPhaseBtn.addEventListener('click', () => {
      if (currentPhase === 'knockout') {
        togglePhase();
      }
    });
    
    nextPhaseBtn.addEventListener('click', () => {
      if (currentPhase === 'groups') {
        togglePhase();
      }
    });
  }
  
  // Depois renderiza os componentes
  getStandings();
  renderArtilheiros();
  renderRankingArtilheiros();
  renderTopscoreRankings();
}

// Executa quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  // DOM já carregado, executa imediatamente
  initializePage();
}

// Drag-to-scroll para odds turbinadas
(function () {
  const oddsScroll = document.querySelector('.odds-scroll');
  let isDown = false;
  let startX;
  let scrollLeft;
  if (oddsScroll) {
    oddsScroll.addEventListener('mousedown', (e) => {
      isDown = true;
      oddsScroll.classList.add('active');
      startX = e.pageX - oddsScroll.offsetLeft;
      scrollLeft = oddsScroll.scrollLeft;
    });
    oddsScroll.addEventListener('mouseleave', () => {
      isDown = false;
      oddsScroll.classList.remove('active');
    });
    oddsScroll.addEventListener('mouseup', () => {
      isDown = false;
      oddsScroll.classList.remove('active');
    });
    oddsScroll.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - oddsScroll.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll-fast
      oddsScroll.scrollLeft = scrollLeft - walk;
    });
    // Touch support
    oddsScroll.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - oddsScroll.offsetLeft;
      scrollLeft = oddsScroll.scrollLeft;
    });
    oddsScroll.addEventListener('touchend', () => {
      isDown = false;
    });
    oddsScroll.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - oddsScroll.offsetLeft;
      const walk = (x - startX) * 1.5;
      oddsScroll.scrollLeft = scrollLeft - walk;
    });
  }
})();

// Betslip remover
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const containerRight = document.querySelector(".view-widget-container-right");
    const betslipDesktop = document.querySelector(".betslip-desktop");
    if (containerRight && betslipDesktop) {
      document.body.appendChild(betslipDesktop);
      containerRight.style.display = "none";
      betslipDesktop.style.position = "fixed";
      betslipDesktop.style.bottom = "0";
      betslipDesktop.style.right = "0";
      betslipDesktop.style.zIndex = "9999";
      betslipDesktop.style.maxHeight = "90vh";
      betslipDesktop.style.overflowY = "auto";
      betslipDesktop.style.display = "block";
      betslipDesktop.style.background = "white";
      betslipDesktop.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
      observer.disconnect();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
