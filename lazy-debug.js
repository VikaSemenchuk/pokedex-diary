const elContainer = document.querySelector('#pokelist');
const elDebug = document.querySelector('#debug');
const scrollTrigger = document.querySelector('#scroll-trigger');

const limit = 30;

let currentOffset = 0;
let isLoading = false;


const observer = new IntersectionObserver(async (entries) => {
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

async function processPokeList(pokeList) {
    for (const pokeItem of pokeList) {
        const pokeData = await pokeLoad(pokeItem.name);

        // const pokeImg             = pokeData.sprites.other.home.front_default;
        const pokeImg             = pokeData.sprites.other['official-artwork'].front_default;
        const pokeName            = pokeData.name;
        const pokeBaseExperience  = pokeData.base_experience;
        const pokeWeight          = pokeData.weight;
        const pokeHeight          = pokeData.height;
        const primaryType         = pokeData.types.find(t => t.slot === 1).type.name; 

        const pokeTypes           = pokeData.types.map(item => item.type.name);
        const typesBadges         = pokeTypes.map(type => { return `<span class="badge-${type}">${type}</span>`; }).join(' ');

        const el = document.createElement('div');
        el.classList.add(`type-${primaryType}`);
        el.innerHTML = `
            <div class="img"><img src="${pokeImg}" alt=""></div>
            <div class="title">${pokeName}</div>
            <div class="descr">${pokeBaseExperience} xp, ${pokeWeight} kg, ${pokeHeight} m</div>
            <div class="bages">${typesBadges}</div>
        `;
        elContainer.appendChild(el);

        // elDebug.textContent = JSON.stringify(pokeData, null, 2);
        // console.log(pokeData.name);
    }
}

// async function init() {
//     const pokeList = await pokeListLoad(limit, currentOffset);

//     if (pokeList && pokeList.results) {
//         processPokeList(pokeList.results);
//     }
// };

// init();

async function loadNextBatch() {
    isLoading = true;
    
    const pokeList = await pokeListLoad(limit, currentOffset);
    
    if (pokeList && pokeList.results && pokeList.results.length > 0) {
        console.log('Load next batch: ' + currentOffset + ' - ' + (currentOffset+limit));
        processPokeList(pokeList.results);
        currentOffset += limit;
    } else {
        observer.unobserve(document.querySelector('#scroll-trigger'));
    }
    
    isLoading = false;
}

observer.observe(scrollTrigger);
