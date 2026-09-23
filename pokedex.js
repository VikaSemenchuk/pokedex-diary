// const body = document.querySelector("body");

// const getPokemon = async (url) => {
//   const res = await fetch(url);
//   const data = await res.json();
//     console.log(data);
    
    

//   const pokSprite = data.sprites;
//   console.log(pokSprite);

//   const dataImgDreamWorld = pokSprite.other.dream_world.front_default;
//   const dataImgOfficialArt = pokSprite.other["official-artwork"].front_default;

//   console.log("DreamWorld", dataImgDreamWorld);

//   const dataImgFrontDefault = pokSprite.front_default;
//   console.log("FrontDefault", dataImgFrontDefault);
//   const dataImgBackDefault = pokSprite.back_default;
//   console.log("backDefault", dataImgBackDefault);
//   const dataImgFrontShiny = pokSprite.front_shiny;
//   console.log("dataImgFrontShiny", dataImgFrontShiny);

//   const imageFrontDefault = document.createElement("img");
//   imageFrontDefault.setAttribute("src", dataImgFrontDefault);
//   const imageBackDefault = document.createElement("img");
//   imageBackDefault.setAttribute("src", dataImgBackDefault);
//   const imageFrontShiny = document.createElement("img");
//   imageFrontShiny.setAttribute("src", dataImgFrontShiny);
//   const imageDreamWorld = document.createElement("img");
//   imageDreamWorld.setAttribute("src", dataImgDreamWorld);
//   const imageOfficialArt = document.createElement("img");
//   imageOfficialArt.setAttribute("src", dataImgOfficialArt);
//   //versions.generation-i

//   body.append(
//     imageFrontDefault,
//     imageBackDefault,
//     imageFrontShiny,
//     imageDreamWorld,
//     imageOfficialArt,
//   );
// };

// getPokemon("https://pokeapi.co/api/v2/pokemon/1");
