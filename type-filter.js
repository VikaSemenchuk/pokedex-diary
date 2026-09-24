import {
  elContainer,
  processPokeList,
  stopLazyLoad,
  resetLazyList,
} from './poke-list.js'

const filterContainer = document.querySelector('#type-filter')
let requestId = 0

async function fetchPokemonByType(type) {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`)

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }

  const data = await response.json()
  return new Set(data.pokemon.map(({ pokemon }) => pokemon.name))
}

async function fetchPokemonDetails(name) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }

  return response.json()
}

async function applyTypeFilter(types) {
  const currentRequestId = ++requestId

  if (types.length === 0) {
    stopLazyLoad()
    resetLazyList()
    return
  }

  stopLazyLoad()
  elContainer.innerHTML = '<p>Lade...</p>'

  try {
    const typeSets = await Promise.all(types.map(fetchPokemonByType))

    if (currentRequestId !== requestId) return

    const [firstSet, ...otherSets] = typeSets

    let names = [...firstSet].filter((name) =>
      otherSets.every((set) => set.has(name)),
    )

    if (types.length === 1) {
      const details = await Promise.all(names.map(fetchPokemonDetails))

      if (currentRequestId !== requestId) return

      names = details
        .filter((pokemon) => pokemon.types.length === 1)
        .map((pokemon) => pokemon.name)
    }

    if (currentRequestId !== requestId) return

    elContainer.innerHTML = ''

    if (names.length === 0) {
      elContainer.innerHTML = '<p>Keine Pokémon gefunden.</p>'
      return
    }

    await processPokeList(names.map((name) => ({ name })))
  } catch (error) {
    if (currentRequestId !== requestId) return

    elContainer.innerHTML = '<p>Fehler beim Laden.</p>'
    console.error(error)
  }
}

function setButtonActive(button, active) {
  button.classList.toggle('active', active)
  button.classList.toggle('bg-accent', active)
  button.classList.toggle('text-white', active)
  button.classList.toggle('bg-[#E2E7FF]', !active)
  button.classList.toggle('text-black', !active)
}

filterContainer?.addEventListener('click', (event) => {
  const button = event.target.closest('button')
  if (!button || !filterContainer.contains(button)) return

  const allButton = filterContainer.querySelector('[data-filter="all"]')

  if (button.dataset.filter === 'all') {
    filterContainer.querySelectorAll('button').forEach((item) => {
      setButtonActive(item, item === button)
    })

    applyTypeFilter([])
    return
  }

  const activeTypes = [
    ...filterContainer.querySelectorAll('button.active'),
  ].filter((item) => item.dataset.filter !== 'all')

  const wasActive = button.classList.contains('active')

  if (wasActive) {
    setButtonActive(button, false)
  } else {
    if (activeTypes.length >= 2) {
      activeTypes.forEach((item) => setButtonActive(item, false))
    }

    setButtonActive(button, true)
  }

  if (allButton) {
    setButtonActive(allButton, false)
  }

  const selectedTypes = [
    ...filterContainer.querySelectorAll('button.active'),
  ]
    .map((item) => item.dataset.filter)
    .filter((type) => type && type !== 'all')

  applyTypeFilter(selectedTypes)
})