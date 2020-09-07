var express = require("express");
var router = express.Router();
const axios = require("axios");
const search_logic = require("./search_logic");
const users_logic = require("../users/users_logic");

router.use((req, res, next) => {
  console.log("Recipes route");
  next();
});

router.get("/randomRecpies", async (req, res) => {
  let number = 3;
  searchParams = {};
  searchParams.number = number;
  searchParams.instructionsRequired = true;
  let recipes = await search_logic.randomRecipes(searchParams);
  if (req.session && req.session.user_id) {
    const user_id = req.session.user_id;
    const user = await users_logic.DBreturnUserByID(user_id);
    if (user) {
      recipes = await users_logic.addFavoriteAndWatched(recipes, user_id);
    }
  }
  res.status(200).send(recipes);
});

router.post("/search/query/:name/amount/:amount", async (req, res, next) => {
  const { name, amount } = req.params;
  console.log(req);
  // search params to send in query to the API
  searchParams = {};
  searchParams.query = name;
  searchParams.number = amount;
  searchParams.instructionsRequired = true;
  try {
    search_logic.getQueryParams(req.body, searchParams);
    console.log(searchParams);

    let recipes = await search_logic.searchRecipes(searchParams);
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      const user = await users_logic.DBreturnUserByID(user_id);
      if (user) {
        recipes = await users_logic.addFavoriteAndWatched(recipes, user_id);
      }
    }
    res.status(200).send(recipes);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/Information/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    let recipe = await search_logic.getRecipeInfo(id);
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      const user = await users_logic.DBreturnUserByID(user_id);
      if (user) {
        recipe = await users_logic.addFavoriteAndWatched(recipe, user_id);
      }
    }
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
