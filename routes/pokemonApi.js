const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const router = express.Router();

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flyingText",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];

router.get("/", (req, res, next) => {
  const allowedFilter = ["type", "search", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    var index = filterKeys.indexOf("search");
    if (index !== -1) {
      filterKeys[index] = "name";
    }
    filterQuery["name"] = filterQuery["search"];
    delete filterQuery["search"];

    var index = filterKeys.indexOf("type");
    if (index !== -1) {
      filterKeys[index] = "types";
    }
    filterQuery["types"] = filterQuery["type"];
    delete filterQuery["type"];

    let offset = limit * (page - 1);

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    let { data } = db;
    totalPokemons = data.length;

    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = {
          data: data.filter((pokemon) =>
            pokemon[condition].includes(filterQuery[condition])
          ),
          totalPokemons: data.length,
        };
      });
    } else {
      result = {
        data: data,
        totalPokemons: data.length,
      };
    }

    data = result.data.slice(offset, offset + limit);
    result = {
      data: data,
      totalPokemons: data.length,
    };
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  let { params } = req;
  const pokemonId = params.id;

  try {
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    let result = [];
    const pokemonIds = data.map((pokemon) => pokemon.id);

    res.status(200).send(pokemonIds.indexOf(5));

    // result =
    //   pokemonId == 1
    //     ? [data[data.length - 1], data[0], data[1]]
    //     : pokemonId == data[data.length - 1].id
    //     ? [data[data.length - 2], data[data.length - 1], data[0]]
    //     : [data[pokemonId - 2], data[pokemonId - 1], data[pokemonId]];
    // const currentPokemons = {
    //   data: {
    //     previousPokemon: result[0],
    //     pokemon: result[1],
    //     nextPokemon: result[2],
    //   },
    // };
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const { name, id, types, url } = req.body;

    if (!name || !id || !types || !url) {
      const exception = new Error(`Missing required data`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      const exception = new Error(`No more than 2 types`);
      exception.statusCode = 401;
      throw exception;
    }
    if (!pokemonTypes.some((r) => types.indexOf(r) >= 0)) {
      const exception = new Error(`Pokémon's type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    const pokemonNames = data.map((pokemon) => pokemon.name);
    const pokemonIds = data.map((pokemon) => pokemon.id);

    if (pokemonNames.includes(name) || pokemonIds.includes(id)) {
      const exception = new Error(`The Pokémon already exists`);
      exception.statusCode = 401;
      throw exception;
    }

    const newPokemon = {
      name,
      id,
      types,
      url,
    };

    data.push(newPokemon);
    db.data = data;
    db = JSON.stringify(db);
    fs.writeFileSync("pokemons.json", db);

    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
