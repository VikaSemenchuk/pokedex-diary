export const elContainer = document.querySelector('#pokemon-list');
export const scrollTrigger = document.querySelector('#pokemon-scroll-trigger');

const limit = 40;

let currentOffset = 0;
let isLoading = false;


export const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            await loadNextBatch();
        }
    }, {
        rootMargin: '200px'
});

async function pokeListLoad(limit, offset) {
    const baseURL = 'https://pokeapi.co/api/v2/pokemon';

    try {
        const response = await fetch(`${baseURL}?limit=${limit}&offset=${offset}`)

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Can't load data:", error);
    }    
}

async function pokeLoad(itemName) {
    const baseURL = 'https://pokeapi.co/api/v2/pokemon';

    try {
        const response = await fetch(`${baseURL}/${itemName}`)

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Can't load data:", error);
    }
}

export async function processPokeList(pokeList) {
    for (const pokeItem of pokeList) {
        const pokeData = await pokeLoad(pokeItem.name);

        const pokeId              = pokeData.id;
        const pokeImg             = pokeData.sprites.other['official-artwork'].front_default;
        const pokeName            = pokeData.name;
        const pokeBaseExperience  = pokeData.base_experience;
        const pokeWeight          = pokeData.weight / 10;
        const pokeHeight          = pokeData.height / 10;
        const primaryType         = pokeData.types.find(t => t.slot === 1).type.name; 

        const pokeTypes           = pokeData.types.map(item => item.type.name);
        const typesBadges         = pokeTypes.map(type => { return `<span class="badge-${type}">${type}</span>`; }).join(' ');

        const el = document.createElement('div');
        el.classList.add(`type-${primaryType}`);
        el.dataset.name = pokeName;
        el.dataset.id = pokeId;
        el.dataset.types = pokeTypes.join(' '); 
        el.innerHTML = `
            <div class="params"><span class="id"># ${pokeId}</span> <span class="fav"><img src="./icons/icon-star-outline.svg" alt=""></span></div>
            <div class="img"><img src="${pokeImg}" alt=""></div>
            <div class="title">${pokeName}</div>
            <div class="bages">${typesBadges}</div>
            <div class="descr">${pokeBaseExperience} xp, ${pokeWeight} kg, ${pokeHeight} m</div>
            <div class="actions"><button>In die Pokebox</button></div>

        `;
        elContainer.appendChild(el);
    }
}

async function loadNextBatch() {
    isLoading = true;
    
    const pokeList = await pokeListLoad(limit, currentOffset);
    
    if (pokeList && pokeList.results && pokeList.results.length > 0) {
        console.log('Load next batch: ' + currentOffset + ' - ' + (currentOffset+limit));
        await processPokeList(pokeList.results);
        currentOffset += limit;
    } else {
        observer.unobserve(scrollTrigger);
    }
    
    isLoading = false;
}

export function stopLazyLoad() {
    observer.unobserve(scrollTrigger);
}

export function startLazyLoad() {
    observer.observe(scrollTrigger);
}

export function resetLazyList() {
    elContainer.innerHTML = '';
    currentOffset = 0;
    startLazyLoad();
    loadNextBatch();
}

startLazyLoad();