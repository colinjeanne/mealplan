(function (global) {
   'use strict';

   function isUndefined(u) {
      return u === undefined;
   }

   function isBoolean(b) {
      return typeof b === 'boolean';
   }

   function isString(s) {
      return typeof s === 'string';
   }

   function isArray(a) {
      return Array.isArray(a);
   }

   var currentIdToken,
      me = null;

   function setIdToken(idToken) {
      currentIdToken = idToken;
   }

   function request(method, url, authorize, data) {
      return new Promise(function (resolve, reject) {
         var xhr = new XMLHttpRequest();

         xhr.open(method, url, true);
         xhr.setRequestHeader('Accept', 'application/json');

         if (authorize) {
            xhr.setRequestHeader(
               'Authorization',
               'google-id-token ' + currentIdToken
            );
         }

         xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
               if (((xhr.status >= 200) && (xhr.status < 300)) ||
                     (xhr.status === 304)) {
                  resolve(JSON.parse(xhr.responseText));
               } else {
                  reject(xhr);
               }
            }
         });

         if (!isUndefined(data)) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
         } else {
            xhr.send();
         }
      });
   }

   function getMe() {
      var result;
      if (me) {
         result = new Promise(function (resolve) {
            resolve(me);
         });
      } else {
         result = request('GET', '/me', true).then(function (currentUser) {
            me = currentUser;
         });
      }

      return result;
   }

   function getMyShoppingList() {
      return request('GET', '/me/shoppingList', true);
   }

   function updateMyShoppingList(shoppingList) {
      return request('PUT', '/me/shoppingList', true, shoppingList);
   }

   function getPlans(options) {
      options = options || {};

      var uri = '/plan';
      if (options.hasOwnProperty('title')) {
         uri += '?title=' + encodeURIComponent(options.title);
      } else if (options.hasOwnProperty('tag')) {
         uri += '?tag=';
         if (options.tag) {
            uri += encodeURIComponent(options.tag);
         }
      }

      return request('GET', uri, false);
   }

   function getPlanTags() {
      return request('GET', '/plan/tags', false);
   }

   function getPlan(id) {
      return request('GET', id, false);
   }

   function createPlan(plan) {
      return request('POST', '/plan', true, plan);
   }

   function updatePlan(id, plan) {
      return request('PUT', id, true, plan);
   }

   function getRecipes(options) {
      options = options || {};

      var uri = '/recipe';
      if (options.hasOwnProperty('title')) {
         uri += '?title=' + encodeURIComponent(options.title);
      } else if (options.hasOwnProperty('tag')) {
         uri += '?tag=';
         if (options.tag) {
            uri += encodeURIComponent(options.tag);
         }
      }

      return request('GET', uri, false);
   }

   function getRecipeTags() {
      return request('GET', '/recipe/tags', false);
   }

   function getRecipe(id) {
      return request('GET', id, false);
   }

   function createRecipe(recipe) {
      return request('POST', '/recipe', true, recipe);
   }

   function updateRecipe(id, recipe) {
      return request('PUT', id, true, recipe);
   }

   function Ingredient(description, shoppable) {
      if (isUndefined(shoppable)) {
         shoppable = true;
      }

      if (!isString(description)) {
         throw new TypeError('expected string');
      }

      if (!isBoolean(shoppable)) {
         throw new TypeError('expected boolean');
      }

      this.description = description;
      this.shoppable = shoppable;
   }

   function Recipe(title, ingredients, instructions, tags) {
      tags = tags || [];

      if (!isString(title)) {
         throw new TypeError('expected string');
      }

      if (!isArray(ingredients)) {
         throw new TypeError('expected array');
      }

      ingredients.forEach(function (ingredient) {
         if (!isString(ingredient.description)) {
            throw new TypeError('expected string');
         }

         if (!isBoolean(ingredient.shoppable)) {
            throw new TypeError('expected boolean');
         }
      });

      if (!isString(instructions)) {
         throw new TypeError('expected string');
      }

      if (!isArray(tags)) {
         throw new TypeError('expected array');
      }

      if (!tags.every(isString)) {
         throw new TypeError('expected string');
      }

      this.title = title;
      this.ingredients = ingredients;
      this.instructions = instructions;
      this.tags = tags;
   }

   function Plan(title, recipes) {
      if (!isString(title)) {
         throw new TypeError('expected string');
      }

      if (!isArray(recipes)) {
         throw new TypeError('expected array');
      }

      if (!recipes.every(isString)) {
         throw new TypeError('expected string');
      }

      this.title = title;
      this.recipes = recipes;
   }

   global.mealPlanApi = {
      setIdToken: setIdToken,
      getMe: getMe,
      getMyShoppingList: getMyShoppingList,
      updateMyShoppingList: updateMyShoppingList,
      getPlans: getPlans,
      getPlanTags: getPlanTags,
      getPlan: getPlan,
      createPlan: createPlan,
      updatePlan: updatePlan,
      getRecipes: getRecipes,
      getRecipeTags: getRecipeTags,
      getRecipe: getRecipe,
      createRecipe: createRecipe,
      updateRecipe: updateRecipe,
      Ingredient: Ingredient,
      Recipe: Recipe,
      Plan: Plan
   };
}(this));
