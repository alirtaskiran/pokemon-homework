const baseURL = "https://pokeapi.co/api/v2";
const imageBaseUrl = "https://img.pokemondb.net/artwork";
const listLimit = 30;

async function getTypes() {
  if(localStorage.getItem("types"))
    return JSON.parse(localStorage.getItem("types"));

  const response = await fetch(`${baseURL}/type`);
  const data = await response.json();
  const results = data.results;
  localStorage.setItem("types", JSON.stringify(results));
  return results;
}

async function getPokemons() {
  if(localStorage.getItem("pokemons"))
    return JSON.parse(localStorage.getItem("pokemons")); 

  const response = await fetch(`${baseURL}/pokemon?offset=0&limit=10000`);
  const data = await response.json();
  let results = data.results;

  results = await Promise.all(results.map(async pokemon => {
    const name = pokemon.name;
    const details = await getPokemonByName(name);
    pokemon.types = details.types.map(type => type.type.name);
    return pokemon;
  }));

  localStorage.setItem("pokemons", JSON.stringify(results));
  return results;
}

async function getPokemonByName(name) {
  const response = await fetch(`${baseURL}/pokemon/${name}`);
  const data = await response.json();
  return data;
}

function createBox(name, types) {
  const gridElement = document.getElementById("grid");

  const boxElement = document.createElement("div");
  boxElement.classList.add("box");

  const imgElement = document.createElement("img");
  imgElement.src = `${imageBaseUrl}/${name}.jpg`;
  imgElement.alt = name;
  boxElement.appendChild(imgElement);

  const nameElement = document.createElement("p");
  nameElement.classList.add("name");
  nameElement.textContent = name;
  boxElement.appendChild(nameElement);

  const typesElement = document.createElement("p");
  typesElement.classList.add("types");
  typesElement.textContent = "[Types]";
  boxElement.appendChild(typesElement);
  
  const ulElement = document.createElement("ul");
  types.forEach(type => {
    const liElement = document.createElement("li");
    liElement.textContent = type;
    ulElement.appendChild(liElement);
  });
  boxElement.appendChild(ulElement);

  gridElement.appendChild(boxElement);
}

async function listPokemons(nameFilter, typeFilter) {

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  const pokemons = await getPokemons();

  // Filtre
  let filteredPokemons = pokemons;
  if(nameFilter) {
    filteredPokemons = pokemons.filter(pokemon => pokemon.name.includes(nameFilter));
  }
  if(typeFilter) {
    filteredPokemons = filteredPokemons.filter(pokemon => pokemon.types.includes(typeFilter));
  }
  if(filteredPokemons.length > listLimit) {
    filteredPokemons = filteredPokemons.slice(0,listLimit);
  }

  // Box oluşturma
  filteredPokemons.forEach(async pokemon => {
    const name = pokemon.name;
    const types = pokemon.types;
    createBox(name, types);
  });

}

document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOMContentLoaded');
  await getTypes();
  await getPokemons();
  
  const nameFilterInput = document.getElementById("nameFilterInput");
  const typeFilterInput = document.getElementById("typeFilterInput");
  
  nameFilterInput.addEventListener("input", () => {
    listPokemons(nameFilterInput.value, typeFilterInput.value);
  });
  typeFilterInput.addEventListener("input", () => {
    listPokemons(nameFilterInput.value, typeFilterInput.value);
  });
  listPokemons();

});
