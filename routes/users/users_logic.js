const DButils = require("../../modules/DButils");
let counter = 0;
let index = 0;
const search_logic = require("../recipes/search_logic");

async function DBreturnUserByID(user_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE user_id = '${user_id}'`
    );

    if (ans.length == 0) {
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
  return ans;
}

async function DBcontains(username) {
  try {
    const ans = await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    );

    if (ans.length == 0) {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
}

async function DBreturnUser(username) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    );

    if (ans.length == 0) {
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
  return ans;
}

async function createNewUser(user) {
  let ans = null;
  try {
    ans = await DButils.execQuery(`SELECT MAX(user_id) as user_id FROM users`);

    if (ans.length == 0) {
      counter = 0;
    } else {
      counter = ans[0].user_id;
    }
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }

  counter++;
  try {
    const ans2 = await DButils.execQuery(
      `INSERT INTO users (
                user_id,
                username,
                password,
                firstName,
                lastName,
                country,
                email,
                image
            )
            VALUES
                (
                    '${counter}',
                    '${user.username}',
                    '${user.password}',
                    '${user.firstName}',
                    '${user.lastName}',
                    '${user.country}',
                    '${user.email}',
                    '${user.image}'
                );`
    );
  } catch (err) {
    throw { status: 401, message: "bla" };
  }
}

async function addFavoriteAndWatched(recipes, user_id) {
  let promises = [];
  promises.push(
    DButils.execQuery(
      `SELECT recipe_id FROM dbo.favorites WHERE user_id = '${user_id}'`
    )
  );
  promises.push(
    DButils.execQuery(
      `SELECT recipe_id FROM dbo.recipesWatched WHERE user_id = '${user_id}'`
    )
  );
  let promises_res = await Promise.all(promises);
  let favorites = promises_res[0];
  let watched = promises_res[1];
  recipes.map(function (recipe) {
    recipe.favorite = false;
    favorites.forEach((objF) => {
      if (objF.recipe_id == recipe.id) {
        recipe.favorite = true;
      }
    });

    recipe.watched = false;
    watched.forEach((objF) => {
      if (objF.recipe_id == recipe.id) {
        recipe.watched = true;
      }
    });
  });
  return recipes;
}
// for each id return if it was watched or favorite (key- id, value- watched,favorite(boolean) )
async function getInfoRecipesFromUser(user_id, recipes_ids) {
  recipes_ids = releventRecipesUserData(recipes_ids);
  let promises = [];
  promises.push(
    DButils.execQuery(
      `SELECT * FROM dbo.favorites WHERE user_id = '${user_id}'`
    )
  );
  promises.push(
    DButils.execQuery(
      `SELECT * FROM dbo.recipesWatched WHERE user_id = '${user_id}'`
    )
  );
  let recipes = {};
  recipes_ids.map(function (obj) {
    recipes[obj.id] = {
      watched: false,
      favorite: false,
    };
  });
  let promises_res = await Promise.all(promises);
  let favorites = promises_res[0];

  let watched = promises_res[1];
  recipes_ids.map(function (obj) {
    favorites.map(function (objF) {
      if (objF.recipe_id == obj.id) {
        recipes[obj.id].favorite = true;
      }
    });
    watched.map(function (objW) {
      if (objW.recipe_id == obj.id) {
        recipes[obj.id].watched = true;
      }
    });
  });
  return recipes;
}

function releventRecipesUserData(recipes_ids) {
  return recipes_ids.map((id) => {
    return {
      id: id,
      watched: false,
      favorite: false,
    };
  });
}

async function addRecipeToWatched(user_id, recipe_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT MAX(indexCount) as max_index FROM recipesWatched`
    );

    if (ans.length == 0) {
      index = 0;
    } else {
      index = ans[0].max_index;
    }
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }

  index++;
  try {
    const ans2 = await DButils.execQuery(
      `INSERT INTO recipesWatched (
                indexCount,
                user_id,
                recipe_id
            )
            VALUES
                (
                    '${index}',
                    '${user_id}',
                    '${recipe_id}'
                );`
    );
  } catch (err) {
    throw { status: 401, message: "bla" };
  }
}

async function getLastWatchedRecipesFromUser(user_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT DISTINCT TOP 3 recipe_id, MAX(indexCount)
            FROM dbo.recipesWatched 
            WHERE user_id = '${user_id}'
            GROUP BY recipe_id
            ORDER BY MAX(indexCount) DESC, recipe_id`
    );
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }
  let ids = [];
  ans.map(function (obj) {
    ids.push(obj.recipe_id);
  });
  ans = null;
  ans = await search_logic.getRecipesInfo(ids);
  return ans;
}

async function addRecipeToFavorites(user_id, recipe_id) {
  try {
    const ans2 = await DButils.execQuery(
      `INSERT INTO favorites (
                user_id,
                recipe_id
            )
            VALUES
                (
                    '${user_id}',
                    '${recipe_id}'
                );`
    );
  } catch (err) {
    throw { status: 401, message: "bla" };
  }
}

async function getFavoritesRecipesFromUser(user_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT DISTINCT recipe_id
            FROM favorites
            WHERE user_id = '${user_id}'`
    );
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }
  let ids = [];
  ans.map(function (obj) {
    ids.push(obj.recipe_id);
  });
  ans = null;
  ans = await search_logic.getRecipesInfo(ids);
  return ans;
}

async function getFamilyRecipesFromUser(user_id) {
  //
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT * FROM familyRecipes
            WHERE user_id = '${user_id}'`
    );
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }
  return ans;
}

async function getMyRecipesFromUser(user_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT *  FROM myRecipes
            WHERE user_id = '${user_id}'`
    );
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }
  return ans;
}

async function getMyRecipesPreviewFromUser(user_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT *  FROM myRecipes
            WHERE user_id = '${user_id}'`
    );
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }
  return ans;
}

async function getMyRecipeFromUserByID(user_id, recipe_id) {
  let ans = null;
  try {
    ans = await DButils.execQuery(
      `SELECT *  FROM myRecipes
            WHERE user_id = '${user_id}' and recipe_id = '${recipe_id}'`
    );
  } catch (err) {
    throw { status: 500, message: "something wrong" };
  }
  return ans;
}

exports.getMyRecipeFromUserByID = getMyRecipeFromUserByID;
exports.getMyRecipesPreviewFromUser = getMyRecipesPreviewFromUser;
exports.getMyRecipesFromUser = getMyRecipesFromUser;
exports.DBcontains = DBcontains;
exports.createNewUser = createNewUser;
exports.DBreturnUser = DBreturnUser;
exports.DBreturnUserByID = DBreturnUserByID;
exports.getInfoRecipesFromUser = getInfoRecipesFromUser;
exports.addRecipeToWatched = addRecipeToWatched;
exports.getLastWatchedRecipesFromUser = getLastWatchedRecipesFromUser;
exports.addRecipeToFavorites = addRecipeToFavorites;
exports.getFavoritesRecipesFromUser = getFavoritesRecipesFromUser;
exports.getFamilyRecipesFromUser = getFamilyRecipesFromUser;
exports.addFavoriteAndWatched = addFavoriteAndWatched;
