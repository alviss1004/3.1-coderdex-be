const fs = require("fs");
const csv = require("csvtojson");

const createPokemons = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  console.log(newData);
  newData = newData.map((e, index) => {
    if (index < 722)
      return {
        id: index + 1,
        name: e.Name,
        types: e.Type2
          ? [e.Type1.toLowerCase(), e.Type2.toLowerCase()]
          : [e.Type1.toLowerCase()],
        url: `http://localhost:5000/images/${index + 1}.png`,
      };
  });
  newData = newData.slice(0, 721);
  newData = { data: newData, totalPokemons: newData.length };

  fs.writeFileSync("pokemons.json", JSON.stringify(newData));
};

createPokemons();
