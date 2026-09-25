// ADD TRANSLATE FOR TYPES!!!!!
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

const myPokemons = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function getStat(pokemon, statName) {
  return (
    pokemon.stats.find((stat) => stat.stat.name === statName)?.base_stat ?? 0
  );
}

function renderCard(pokemon) {
  const card = template.content.firstElementChild.cloneNode(true);

  const pokNumber = pokemon.id;
  const pokName = pokemon.name;
  const pokImg = pokemon.sprite;
    const pokBaseIndex = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
    
    
//   const pokTypes = pokemon.types.map((type) => type.type.name);

  // console.log(pokBaseIndex);
    // console.log(getStat)
    
//   const pokKP = getStat(pokemon, "hp"); // hp
//   const pokANG = getStat(pokemon, "attack"); // attack
//   const pokVER = getStat(pokemon, "defense"); // defense
//   const pokINIT = getStat(pokemon, "speed"); // speed

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

  return card;
}

const fragment = document.createDocumentFragment();

myPokemons.forEach((pokemon) => fragment.append(renderCard(pokemon)));
myPokemonsList.append(fragment);
