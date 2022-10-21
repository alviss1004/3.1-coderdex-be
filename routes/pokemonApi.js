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

    let offset = limit * (page - 1);

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    let { data } = db;
    totalPokemons = data.length;
    data = data.slice(offset, offset + limit);

    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? {
              data: result.filter(
                (pokemon) => pokemon[condition] === filterQuery[condition]
              ),
              totalPokemons: data.length,
            }
          : {
              data: data.filter(
                (pokemon) => pokemon[condition] === filterQuery[condition]
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
    result =
      pokemonId == 1
        ? [data[data.length - 1], data[0], data[1]]
        : pokemonId == 721
        ? [data[719], data[720], data[0]]
        : data.slice(pokemonId - 2, pokemonId + 1);
    const currentPokemons = {
      data: {
        previousPokemon: result[0],
        pokemon: result[1],
        nextPokemon: result[2],
      },
    };

    res.status(200).send(currentPokemons);
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

    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
