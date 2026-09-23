import { elContainer, processPokeList, stopLazyLoad, resetLazyList } from './poke-list.js';

let allPokemonNames = [];

async function loadAllPokemonNames() {
    const baseURL = 'https://pokeapi.co/api/v2/pokemon';
    try {
        const response = await fetch(`${baseURL}?limit=100000&offset=0`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        allPokemonNames = data.results;
    } catch (error) {
        console.error("Can't load pokemon names list:", error);
    }
}

async function pokeSearch(query) {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === '') {
        resetLazyList();
        return;
    }

    stopLazyLoad();

    const matches = allPokemonNames.filter(item => {
        const idFromUrl = item.url.split('/').filter(Boolean).pop();
        return item.name.includes(normalizedQuery) || idFromUrl === normalizedQuery;
    });

    elContainer.innerHTML = '';

    if (matches.length === 0) {
        elContainer.innerHTML = '<p class="col-span-3 text-center text-gray-400">Nichts gefunden</p>';
        return;
    }

    await processPokeList(matches.slice(0, 30));
}

function debounce(fn, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

const debouncedSearch = debounce(pokeSearch, 300);

const searchInput = document.querySelector('#search-input');
searchInput.addEventListener('input', () => debouncedSearch(searchInput.value));

loadAllPokemonNames();