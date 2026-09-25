const STORAGE_KEY = "pokedex";
const FAVORITES_KEY = "pokedex-favorites";

const ICON_STAR_OUTLINE = "./icons/icon-star-outline.svg";
const ICON_STAR_FILLED = "./icons/icon-star-filled.svg";


export function getCaughtCount() {
  const pokedex = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return pokedex.length;
}

export function updateCatchCounter() {
  const count = getCaughtCount();
  document.querySelectorAll(".pokemon-caught-count").forEach((el) => {
    el.textContent = count;
  });
}

function getFavoriteIds() {
  const raw = localStorage.getItem(FAVORITES_KEY);

  if (raw !== null) {
    return JSON.parse(raw);
  }

  const pokedex = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const migrated = pokedex.filter((p) => p.favorite).map((p) => p.id);
  saveFavoriteIds(migrated);

  return migrated;
}

function saveFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function isFavorite(pokemonId) {
  return getFavoriteIds().includes(pokemonId);
}

export function toggleFavorite(pokemonId) {
  const ids = getFavoriteIds();
  const index = ids.indexOf(pokemonId);

  if (index === -1) {
    ids.push(pokemonId);
  } else {
    ids.splice(index, 1);
  }

  saveFavoriteIds(ids);

  return index === -1; 
}

export function setStarIcon(imgEl, isFav) {
  if (!imgEl) return;
  imgEl.src = isFav ? ICON_STAR_FILLED : ICON_STAR_OUTLINE;
}
