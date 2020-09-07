const axios = require("axios");
const api_url = "https://api.spoonacular.com/recipes";
const api_key = "apiKey=" + process.env.spooncular_apiKey; //"apiKey=60ea7cfda06c43119ab23b07a0f6a6f2";

function getQueryParams(queryParams, searchParams) {
  const params = ["diet", "cuisine", "intolerance"];
  params.forEach((param) => {
    if (queryParams[param]) searchParams[param] = queryParams[param];
  });
}
async function randomRecipes(searchParams) {
  let searchRes = await axios.get(`${api_url}/random?${api_key}`, {
    params: searchParams,
  });
  let arrayRecipes = [];
  arrayRecipes = searchRes.data.recipes;
  let imageMissing = false;
  arrayRecipes.forEach((recipe) => {
    if (!recipe.image) {
      imageMissing = true;
    }
  });
  if (imageMissing) {
    searchRes = await axios.get(`${api_url}/random?${api_key}`, {
      params: searchParams,
    });
    arrayRecipes = searchRes.data.recipes;
  }
  return releventRecipeData(arrayRecipes);
}

function releventRecipeData(recipes) {
  return recipes.map(function (data) {
    const {
      id,
      title,
      image,
      readyInMinutes,
      aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
    } = data;

    return {
      id: id,
      name: title,
      image: image,
      totalTime: readyInMinutes,
      likesAmount: aggregateLikes,
      vegan: vegan,
      vegetarian: vegetarian,
      glutenFree: glutenFree,
    };
  });
}

async function searchRecipes(searchParams) {
  searchParams.cuisine = searchParams.cuisine.toString();
  searchParams.diet = searchParams.diet.toString();
  searchParams.intolerance = searchParams.intolerance.toString();

  let searchRes = await axios.get(`${api_url}/search?${api_key}`, {
    params: searchParams,
  });

  const recipesIDs = getIDs(searchRes);
  console.log(recipesIDs);

  let recipesInfo = await getRecipesInfo(recipesIDs);
  console.log(recipesInfo);
  return recipesInfo;
}

function getIDs(searchRes) {
  let recipes = searchRes.data.results;
  let recipesIDs = [];
  recipes.map((recipe) => {
    console.log(recipe.title);
    recipesIDs.push(recipe.id);
  });
  return recipesIDs;
}

async function getRecipesInfo(recipes_ids) {
  let promises = [];
  recipes_ids.map((id) =>
    promises.push(axios.get(`${api_url}/${id}/information?${api_key}`))
  );
  let promises_res = await Promise.all(promises);
  return releventRecipeDataPromise(promises_res);
}

function releventRecipeDataPromise(promises_res_recipes) {
  return promises_res_recipes.map((recipe_info) => {
    const {
      id,
      title,
      image,
      readyInMinutes,
      aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
    } = recipe_info.data;

    return {
      id: id,
      name: title,
      image: image,
      totalTime: readyInMinutes,
      likesAmount: aggregateLikes,
      vegan: vegan,
      vegetarian: vegetarian,
      glutenFree: glutenFree,
    };
  });
}

async function getRecipeInfo(id) {
  let Res = await axios.get(`${api_url}/${id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
  let arrayRecipes = [];
  arrayRecipes[0] = Res.data;
  return releventRecipeFullData(arrayRecipes);
}

function releventRecipeFullData(recipes) {
  return recipes.map(function (data) {
    const {
      id,
      title,
      image,
      readyInMinutes,
      aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
      extendedIngredients,
      //summary,
      servings,
      analyzedInstructions,
      instructions,
    } = data;

    return {
      id: id,
      name: title,
      image: image,
      totalTime: readyInMinutes,
      likesAmount: aggregateLikes,
      vegan: vegan,
      vegetarian: vegetarian,
      glutenFree: glutenFree,
      // ingredients: extendedIngredients,
      // details: summary,
      dishAmount: servings,
      analyzedInstructions: analyzedInstructions,
      instructions: instructions,
      extendedIngredients: extendedIngredients,
    };
  });
}

exports.getQueryParams = getQueryParams;
exports.searchRecipes = searchRecipes;
exports.randomRecipes = randomRecipes;
exports.getRecipeInfo = getRecipeInfo;
exports.getRecipesInfo = getRecipesInfo;
