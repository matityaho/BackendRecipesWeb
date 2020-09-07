var express = require("express");
var router = express.Router();
const users_logic = require("./users_logic");

//authentication to all incoming requests
router.use(async function (req, res, next) {
  console.log("Users route");
  if (req.session && req.session.user_id) {
    const user_id = req.session.user_id;
    const user = await users_logic.DBreturnUserByID(user_id);
    if (user) {
      req.user = user;
      next();
    }
  } else {
    res.sendStatus(401); //Unauthorized
  }
});

router.get("/addRecipeToWatched/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const ans = await users_logic.addRecipeToWatched(user[0].user_id, id);
  res.status(200).send({ message: "recipe added successfully", success: true });
});

router.get("/lastWatched", async (req, res) => {
  const user = req.user;
  const userDataRecipes = await users_logic.getLastWatchedRecipesFromUser(
    user[0].user_id
  );
  const recipes = await users_logic.addFavoriteAndWatched(
    userDataRecipes,
    user[0].user_id
  );
  res.status(200).send(recipes);
});

router.get("/addRecipeToFavorites/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const ans = await users_logic.addRecipeToFavorites(user[0].user_id, id);
  res
    .status(200)
    .status(200)
    .send({ message: "recipe added successfully", success: true });
});

router.get("/favorites", async (req, res) => {
  const user = req.user;
  const userDataRecipes = await users_logic.getFavoritesRecipesFromUser(
    user[0].user_id
  );
  const recipes = await users_logic.addFavoriteAndWatched(
    userDataRecipes,
    user[0].user_id
  );
  res.status(200).status(200).send(recipes);
});

router.get("/FamilyRecipes", async (req, res) => {
  const user = req.user;
  const userDataRecipes = await users_logic.getFamilyRecipesFromUser(
    user[0].user_id
  );
  res.status(200).send(userDataRecipes);
});

router.get("/myRecipesPreview", async (req, res) => {
  const user = req.user;
  const userDataRecipes = await users_logic.getMyRecipesPreviewFromUser(
    user[0].user_id
  );
  console.log(userDataRecipes);
  res.status(200).send(userDataRecipes);
});
//gets the all data of a recipe in my recipes
router.get("/MyRecipesInfo/:id", async (req, res) => {
  const { recipeId } = req.params;
  const user = req.user;
  const userDataRecipes = await users_logic.getMyRecipeFromUserByID(
    user[0].user_id,
    recipeId
  );
  console.log(userDataRecipes);
  res.status(200).send(userDataRecipes);
});

module.exports = router;
