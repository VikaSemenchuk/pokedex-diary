// ADD TRANSLATE FOR TYPES!!!!!
import  "./back-to-top.js";

const myPokemonsList = document.getElementById("pokedex-list");
const template = document.querySelector("#card-template");

const STORAGE_KEY = "pokedex";
const STAT_MAX = 150;
const STATS = [
  { key: "hp", label: "KP", title: "Kraftpunkte" },
  { key: "attack", label: "ANG", title: "Angriff" },
  { key: "defense", label: "VER", title: "Verteidigung" },
  { key: "speed", label: "INIT", title: "Initiative" },
];

const EMPTY_MESSAGES = {
  all: "Noch keine Pokémon gefangen.",
  notes: "Keine Pokémon mit Notizen gefunden.",
  favs: "Noch keine Favoriten markiert.",
};

function updateEmptyState(visibleCount) {
  const emptyState = document.getElementById("empty-state");
  const emptyStateText = document.getElementById("empty-state-text");
  if (!emptyState || !emptyStateText) return;

  emptyState.hidden = visibleCount !== 0;
  emptyStateText.textContent = EMPTY_MESSAGES[currentFilter];
}

const myPokemons = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// "all" | "notes" | "favs"
let currentFilter = "all";

function getStat(pokemon, statName) {
  return (
    pokemon.stats.find((stat) => stat.stat.name === statName)?.base_stat ?? 0
  );
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(myPokemons));

  updateCounters();
}

function updateCounters() {
  const total = myPokemons.length;
  const notesCount = myPokemons.filter(
    (pokemon) => pokemon.comment && pokemon.comment.trim() !== "",
  ).length;

  const caughtStat = document.getElementById("stat-caught-count");
  if (caughtStat) caughtStat.textContent = total;

  const notesStat = document.getElementById("stat-notes-count");
  if (notesStat) {
    notesStat.textContent = `${notesCount} ${
      notesCount === 1 ? "Notiz" : "Notizen"
    }`;
  }
}

function applyFilter() {
  const cards = myPokemonsList.querySelectorAll(".card");
    let visibleCount = 0;
    
  cards.forEach((card) => {
    let visible = true;

    if (currentFilter === "notes") {
      visible = card.dataset.hasNote === "true";
    } else if (currentFilter === "favs") {
      visible = card.dataset.favorite === "true";
    }

      card.hidden = !visible;
        if (visible) visibleCount += 1;
  });
      updateEmptyState(visibleCount);
}

const ACTIVE_TAB_CLASSES = ["bg-accent", "text-text-secondary", "shadow-sm"];
const INACTIVE_TAB_CLASSES = ["text-text-primary", "hover:bg-bg-secondary"];

function setActiveTab(activeButton) {
  const allTabs = document.querySelectorAll("#filter-tabs button[data-filter]");

  allTabs.forEach((btn) => {
    const isActive = btn === activeButton;

    ACTIVE_TAB_CLASSES.forEach((cls) => btn.classList.toggle(cls, isActive));
    INACTIVE_TAB_CLASSES.forEach((cls) => btn.classList.toggle(cls, !isActive));
  });
}

const filterTabs = document.getElementById("filter-tabs");

filterTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  setActiveTab(button);
  applyFilter();
});

function setupCardControls(card, pokemon) {
  const favoriteBtn = card.querySelector(".pokemon-favorite");
  const updateBtn = card.querySelector(".btn-update");
  const deleteBtn = card.querySelector(".btn-delete");
  const saveBtn = card.querySelector(".btn-save");
  const form = card.querySelector(".card-comment");
  const textarea = form.querySelector('textarea[name="comment"]');

  favoriteBtn.addEventListener("click", () => {
    pokemon.favorite = !pokemon.favorite;

    favoriteBtn.setAttribute("aria-pressed", String(pokemon.favorite));
    card.dataset.favorite = String(pokemon.favorite);

    const icon = favoriteBtn.querySelector("img");
    icon.src = pokemon.favorite
      ? "./icons/icon-star-filled.svg"
      : "./icons/icon-star-outline.svg";

    saveToStorage();
    applyFilter();
  });

  updateBtn.addEventListener("click", () => {
    textarea.readOnly = false;
    textarea.focus();

    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    saveBtn.hidden = false;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    pokemon.comment = textarea.value.trim();
    card.dataset.hasNote = String(pokemon.comment !== "");
    saveToStorage();

    applyFilter();

    textarea.readOnly = true;
    saveBtn.hidden = true;
  });

  deleteBtn.addEventListener("click", () => {
    const confirmed = confirm(
      `${pokemon.name.toUpperCase()} aus dem Pokédex löschen?`,
    );
    if (!confirmed) return;

    const index = myPokemons.findIndex((p) => p.id === pokemon.id);
    if (index !== -1) {
      myPokemons.splice(index, 1);
      saveToStorage();
    }

    card.remove();
  });
}

function renderCard(pokemon) {
  const card = template.content.firstElementChild.cloneNode(true);

  const pokNumber = pokemon.id;
  const pokName = pokemon.name;
  const pokImg = pokemon.sprite;
  const pokBaseIndex = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const pokTypes = pokemon.types.map((type) => type.type.name);

  card.querySelector(".pokemon-number").textContent = `#${pokNumber}`;
  card.querySelector(".pokemon-name").textContent = pokName.toUpperCase();
  card.querySelector(".pokemon-img").src = pokImg;

  const typeList = card.querySelector(".type-list");
  ///
  const pokType = pokemon.types.map((type) => {
    const item = typeList.querySelector(".type-chip").cloneNode(true);
    item.querySelector(".type-name").textContent = type.type.name;
    const primaryType = pokemon.types.find((t) => t.slot === 1).type.name;
    
    item.classList.add(`bg-type-${type.type.name.toLowerCase()}`);
    card.classList.add(`type-${primaryType.toLowerCase()}-gradient`);
    card.querySelector(".card-comment").classList.add(`shadow-type-${primaryType.toLowerCase()}`);

    return item;
  });
  ////
  typeList.replaceChildren(...pokType);

  card.querySelector(".base-total").textContent = pokBaseIndex;

  function getStatColorClass(value) {
    if (value < 50) return "bg-stat-low";
    if (value < 100) return "bg-stat-medium";
    return "bg-stat-high";
  }

  const statsGrid = card.querySelector(".stats-grid");
  const statTemplate = statsGrid.querySelector(".stat-item");

  const statItems = STATS.map(({ key, label, title }) => {
    const item = statTemplate.cloneNode(true);
    const value = getStat(pokemon, key);

    const name = item.querySelector(".stat-name");
    name.textContent = label;
    name.title = title;

    item.querySelector(".stat-value").textContent = value;

    const fill = item.querySelector(".stat-fill");
    fill.style.width = `${Math.min((value / STAT_MAX) * 100, 100)}%`;
    fill.classList.add(getStatColorClass(value));

    return item;
  });

  statsGrid.replaceChildren(...statItems);

  const textarea = card.querySelector('textarea[name="comment"]');
  textarea.value = pokemon.comment ?? "";
  card.dataset.hasNote = String(Boolean(pokemon.comment?.trim()));

  const favoriteBtn = card.querySelector(".pokemon-favorite");
  favoriteBtn.setAttribute("aria-pressed", String(Boolean(pokemon.favorite)));
  favoriteBtn.querySelector("img").src = pokemon.favorite
    ? "./icons/icon-star-filled.svg"
    : "./icons/icon-star-outline.svg";
  card.dataset.favorite = String(Boolean(pokemon.favorite));

  setupCardControls(card, pokemon);

  return card;
}

const fragment = document.createDocumentFragment();

myPokemons.forEach((pokemon) => fragment.append(renderCard(pokemon)));
myPokemonsList.append(fragment);

updateCounters();
applyFilter();


