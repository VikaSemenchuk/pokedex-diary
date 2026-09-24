import {
  elContainer,
  processPokeList,
  stopLazyLoad,
  resetLazyList,
} from './poke-list.js'

const filterContainer = document.querySelector('#type-filter')

let requestId = 0

async function fetchPokemonByType(type) {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  const data = await res.json()
  return data.pokemon.map((entry) => ({ name: entry.pokemon.name }))
}

async function applyTypeFilter(filter) {
  const currentRequestId = ++requestId

  if (filter === 'all') {
    stopLazyLoad()
    resetLazyList()
    return
  }

  stopLazyLoad()
  elContainer.innerHTML = '<p>Lade...</p>'

  try {
    const list = await fetchPokemonByType(filter)

    if (currentRequestId !== requestId) return

    elContainer.innerHTML = ''

    if (list.length === 0) {
      elContainer.innerHTML = '<p>Keine Pokémon gefunden.</p>'
      return
    }

    await processPokeList(list)
  } catch (err) {
    if (currentRequestId !== requestId) return
    elContainer.innerHTML = '<p>Fehler beim Laden.</p>'
    console.error(err)
  }
}

function handleFilterClick(event) {
  const btn = event.target.closest('button')
  if (!btn) return

  filterContainer
    .querySelectorAll('button')
    .forEach((b) => b.classList.remove('active'))
  btn.classList.add('active')

  applyTypeFilter(btn.dataset.filter)
}

filterContainer.addEventListener('click', handleFilterClick)



const typeFilter = document.querySelector('#type-filter');

if (typeFilter) {
    typeFilter.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('button');
        if (!clickedButton) return;

        const buttons = typeFilter.querySelectorAll('button');

        buttons.forEach(btn => {
            btn.classList.remove('bg-accent', 'text-white', 'active');
            btn.classList.add('bg-[#E2E7FF]', 'text-black');
        });

        clickedButton.classList.remove('bg-[#E2E7FF]','text-black',);
        clickedButton.classList.add('bg-accent', 'text-white', 'active');

        const selectedType = clickedButton.getAttribute('data-filter');
        
    });
}