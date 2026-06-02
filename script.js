const buildingButtons = document.querySelectorAll('.building-btn');
const cityGrid = document.getElementById('city-grid');
const resetBtn = document.getElementById('reset-btn');
const actionMessage = document.getElementById('action-message');
const footerYear = document.getElementById('footer-year');

const stats = {
  population: 0,
  economy: 0,
  happiness: 0,
  pollution: 0,
  education: 0,
  safety: 0,
};

const summary = {
  totalBuildings: 0,
  counts: {
    house: 0,
    office: 0,
    park: 0,
    factory: 0,
    school: 0,
    police: 0,
  },
};

const buildingInfo = {
  house: { label: 'House', icon: '🏠', effects: { population: 100, happiness: 5 } },
  office: { label: 'Office', icon: '🏢', effects: { economy: 15, population: 20 } },
  park: { label: 'Park', icon: '🌳', effects: { happiness: 20, pollution: -5 } },
  factory: { label: 'Factory', icon: '🏭', effects: { economy: 25, pollution: 15, happiness: -5 } },
  school: { label: 'School', icon: '🏫', effects: { education: 15, happiness: 5 } },
  police: { label: 'Police Station', icon: '🚓', effects: { safety: 15, happiness: 5 } },
};

let selectedBuilding = null;
const statElements = {
  population: document.getElementById('stat-population'),
  economy: document.getElementById('stat-economy'),
  happiness: document.getElementById('stat-happiness'),
  pollution: document.getElementById('stat-pollution'),
  education: document.getElementById('stat-education'),
  safety: document.getElementById('stat-safety'),
};
const summaryElements = {
  totalBuildings: document.getElementById('summary-buildings'),
  common: document.getElementById('summary-common'),
  rating: document.getElementById('summary-rating'),
};

function initGrid() {
  cityGrid.innerHTML = '';
  for (let i = 0; i < 64; i += 1) {
    const tile = document.createElement('button');
    tile.className = 'city-tile';
    tile.type = 'button';
    tile.dataset.index = i;
    tile.addEventListener('click', () => handleTileClick(tile));
    cityGrid.appendChild(tile);
  }
}

function handleTileClick(tile) {
  if (!selectedBuilding) {
    showMessage('Select a building first.', true);
    return;
  }

  if (tile.classList.contains('placed')) {
    showMessage('This tile already has a building.', true);
    return;
  }

  const building = buildingInfo[selectedBuilding];
  tile.textContent = building.icon;
  tile.classList.add('placed');
  tile.dataset.building = selectedBuilding;
  tile.classList.add('tile-placed');
  updateStats(building.effects);
  summary.totalBuildings += 1;
  summary.counts[selectedBuilding] += 1;
  updateSummary();
  showMessage(`${building.label} placed!`, false);
}

function updateStats(effects) {
  Object.entries(effects).forEach(([key, value]) => {
    stats[key] = Math.max(0, stats[key] + value);
  });
  refreshStatNumbers();
  updateRating();
}

function refreshStatNumbers() {
  Object.entries(statElements).forEach(([key, element]) => {
    element.textContent = stats[key];
    element.classList.add('stat-update');
    setTimeout(() => element.classList.remove('stat-update'), 300);
  });
}

function updateSummary() {
  summaryElements.totalBuildings.textContent = summary.totalBuildings;
  summaryElements.common.textContent = getMostCommonBuilding();
  summaryElements.rating.textContent = getRatingText();
}

function getMostCommonBuilding() {
  const entries = Object.entries(summary.counts);
  const maxCount = Math.max(...entries.map(([, count]) => count));
  if (maxCount === 0) return 'None';
  const [key] = entries.find(([, count]) => count === maxCount);
  return buildingInfo[key].label;
}

function getRatingText() {
  const score = calculateCityScore();
  if (score >= 85) return '⭐⭐⭐⭐⭐ Excellent City';
  if (score >= 70) return '⭐⭐⭐⭐ Growing Metropolis';
  if (score >= 55) return '⭐⭐⭐ Developing Town';
  if (score >= 40) return '⭐⭐ Struggling Settlement';
  return '⭐ Needs Improvement';
}

function calculateCityScore() {
  const normalized = {
    population: Math.min(stats.population / 10, 100),
    economy: Math.min(stats.economy * 2, 100),
    happiness: Math.min(stats.happiness * 4, 100),
    pollution: Math.max(0, 100 - stats.pollution * 2),
    education: Math.min(stats.education * 3, 100),
    safety: Math.min(stats.safety * 3, 100),
  };
  const total = normalized.population * 0.18
    + normalized.economy * 0.18
    + normalized.happiness * 0.2
    + normalized.pollution * 0.16
    + normalized.education * 0.14
    + normalized.safety * 0.14;
  return Math.round(total);
}

function updateRating() {
  summaryElements.rating.textContent = getRatingText();
}

function resetCity() {
  Object.keys(stats).forEach((key) => {
    stats[key] = 0;
  });
  summary.totalBuildings = 0;
  Object.keys(summary.counts).forEach((key) => {
    summary.counts[key] = 0;
  });
  selectedBuilding = null;
  buildingButtons.forEach((button) => button.classList.remove('selected'));
  initGrid();
  refreshStatNumbers();
  updateSummary();
  showMessage('City reset. Start building again!', false);
}

function showMessage(text, isError) {
  actionMessage.textContent = text;
  actionMessage.style.color = isError ? '#d14a4a' : '#4a7a4f';
}

function handleBuildingSelection() {
  buildingButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedBuilding = button.dataset.type;
      buildingButtons.forEach((btn) => btn.classList.remove('selected'));
      button.classList.add('selected');
      showMessage(`Selected ${buildingInfo[selectedBuilding].label}.`, false);
    });
  });
}

function initializeTooltips() {
  buildingButtons.forEach((button) => {
    const tooltipText = button.dataset.tooltip;
    button.addEventListener('mouseenter', () => {
      button.setAttribute('aria-label', tooltipText);
    });
  });
}

function init() {
  footerYear.textContent = new Date().getFullYear();
  initGrid();
  handleBuildingSelection();
  initializeTooltips();
  resetBtn.addEventListener('click', resetCity);
  refreshStatNumbers();
  updateSummary();
  const links = document.querySelectorAll('.nav-links a');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

init();
