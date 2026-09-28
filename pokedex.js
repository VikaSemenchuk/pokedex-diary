// ADD TRANSLATE FOR TYPES!!!!!
import "./back-to-top.js";
import {
  isFavorite,
  toggleFavorite,
  setStarIcon,
  updateCatchCounter,
} from "./card-functions.js";

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

  updateCatchCounter();
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

const ACTIVE_TAB_CLASS = "filter-tab-active";
const INACTIVE_TAB_CLASS = "filter-tab-inactive";

function setActiveTab(activeButton) {
  const allTabs = document.querySelectorAll("#filter-tabs button[data-filter]");

  allTabs.forEach((btn) => {
    const isActive = btn === activeButton;

    btn.classList.toggle(ACTIVE_TAB_CLASS, isActive);
    btn.classList.toggle(INACTIVE_TAB_CLASS, !isActive);
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

const COMMENT_VIEW_CLASS = "comment-field-view";
const COMMENT_EDIT_CLASS = "comment-field-edit";

function setupCardControls(card, pokemon) {
  const favoriteBtn = card.querySelector(".pokemon-favorite");
  const updateBtn = card.querySelector(".btn-update");
  const deleteBtn = card.querySelector(".btn-delete");
  const saveBtn = card.querySelector(".btn-save");
  const commentBox = card.querySelector(".card-comment");
  const textarea = commentBox.querySelector('textarea[name="comment"]');

  favoriteBtn.addEventListener("click", () => {
    const isFav = toggleFavorite(pokemon.id);

    favoriteBtn.setAttribute("aria-pressed", String(isFav));
    card.dataset.favorite = String(isFav);
    setStarIcon(favoriteBtn.querySelector("img"), isFav);

    applyFilter();
  });

  function isEditing() {
    return card.classList.contains("is-editing");
  }

  function enterEditMode() {
    if (isEditing()) return;

    card.classList.add("is-editing");

    textarea.readOnly = false;
    textarea.classList.remove(COMMENT_VIEW_CLASS);
    textarea.classList.add(COMMENT_EDIT_CLASS);

    saveBtn.hidden = false;
    deleteBtn.hidden = true;

    updateBtn.classList.add("rotate-45", "bg-accent/10");
    updateBtn.setAttribute("aria-label", "Bearbeiten abbrechen");
    updateBtn.title = "Bearbeiten abbrechen";

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  function exitEditMode() {
    card.classList.remove("is-editing");

    textarea.readOnly = true;
    textarea.classList.remove(COMMENT_EDIT_CLASS);
    textarea.classList.add(COMMENT_VIEW_CLASS);

    saveBtn.hidden = true;
    deleteBtn.hidden = false;

    updateBtn.classList.remove("rotate-45", "bg-accent/10");
    updateBtn.setAttribute("aria-label", "Notiz bearbeiten");
    updateBtn.title = "Notiz bearbeiten";
  }

  function saveComment() {
    pokemon.comment = textarea.value.trim();
    textarea.value = pokemon.comment;
    card.dataset.hasNote = String(pokemon.comment !== "");
    saveToStorage();
    applyFilter();
    exitEditMode();
  }

  function cancelEdit() {
    textarea.value = pokemon.comment ?? "";
    exitEditMode();
  }

  textarea.addEventListener("focus", enterEditMode);

  updateBtn.addEventListener("click", () => {
    if (isEditing()) {
      cancelEdit();
    } else {
      enterEditMode();
    }
  });

  saveBtn.addEventListener("click", saveComment);

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
      textarea.blur();
    }
  });

  commentBox.addEventListener("focusout", (event) => {
    if (!isEditing()) return;

    const next = event.relatedTarget;
    const staysInternal =
      next &&
      (commentBox.contains(next) || next === saveBtn || next === updateBtn);

    if (!staysInternal) saveComment();
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
    card
      .querySelector(".card-comment")
      .classList.add(`shadow-type-${primaryType.toLowerCase()}`);

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

  const commentBox = card.querySelector(".card-comment");
  commentBox.querySelector('textarea[name="comment"]').value =
    pokemon.comment ?? "";
  card.dataset.hasNote = String(Boolean(pokemon.comment?.trim()));

  const favoriteBtn = card.querySelector(".pokemon-favorite");
  const isFav = isFavorite(pokemon.id);
  favoriteBtn.setAttribute("aria-pressed", String(isFav));
  setStarIcon(favoriteBtn.querySelector("img"), isFav);
  card.dataset.favorite = String(isFav);

  setupCardControls(card, pokemon);

  return card;
}

const fragment = document.createDocumentFragment();

myPokemons.forEach((pokemon) => fragment.append(renderCard(pokemon)));
myPokemonsList.append(fragment);

updateCounters();
applyFilter();
