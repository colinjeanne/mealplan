/**
 * @overview Retrieves and saves data using the Meal Plan application
 * programming interface
 *
 * @author Colin Jeanne <colinjeanne@hotmail.com>
 *
 * @module MealPlanApi
 */

/**
 * Shorthand to know if a type if a boolean
 *
 * @function
 * 
 * @param  {Object} u The object to type check
 * 
 * @return {boolean}   Whether the object is a boolean
 */
const isBoolean = b => typeof b === 'boolean';

/**
 * Shorthand to know if a type if a string
 *
 * @function
 * 
 * @param  {Object} u The object to type check
 * 
 * @return {boolean}   Whether the object is a string
 */
const isString = s => typeof s === 'string';

/**
 * Retrieves the set of headers sent on each request
 *
 * @function
 * 
 * @return {Object.<string, string>} An object representing HTTP headers as a
 * key-value pair
 */
const getStandardHeaders = () => {
   return { Accept: 'application/json' };
};

/**
 * Retrieves the set of headers sent when the request contains a message body
 *
 * @function
 * 
 * @return {Object.<string, string>} An object representing HTTP headers as a
 * key-value pair
 */
const getContentTypeHeaders = () => {
   return { 'Content-Type': 'application/json' };
};

/**
 * Retrieves the set of headers sent for requests that require authorization
 *
 * @function
 * 
 * @return {Object.<string, string>} An object representing HTTP headers as a
 * key-value pair
 */
const getAuthorizationHeaders = currentIdToken => {
   return { Authorization: 'google-id-token ' + currentIdToken };
};

/**
 * The current Id token used to authorize the user
 * 
 * @global
 */
let currentIdToken;

/**
 * A function implementing the Fetch Standard (https://fetch.spec.whatwg.org/)
 *
 * @function
 */
let fetch;

/**
 * The current authorization session
 *
 * @global
 */
export let currentSession;

/**
 * Retrieves a new Id token in the case a fetch fails as unauthorized so that
 * the fetch can be transparently retried
 * 
 * @param  {Response} response A response returned by a fetch promise
 */
const checkAuthorizationFailed = response => {
   if (response.status === 401) {
      currentIdToken = currentSession.idTokenCallback();
      throw new Error('Unauthorized');
   }

   return response;
};

/**
 * Wraps requests that require authorization so that they may be transparently
 * retried in case of an authorization failure
 * 
 * @param  {string}  uri     The URI of the request
 * @param  {Object=} options Options to forward to fetch
 * @return {Promise}         A fetch promise
 */
let authorizedFetch = (uri, options = {method: 'get', headers: {}}) => {
   options.headers = Object.assign(options.headers || {},
      getStandardHeaders(),
      getAuthorizationHeaders(currentIdToken),
      (options.body) ? getContentTypeHeaders() : {});

   return fetch(uri, options)
   .then(checkAuthorizationFailed);
};

/**
 * @classdesc The current user's shopping list
 */
class ShoppingList {
   /**
    * Constructs the ShoppingList given an array of shopping list items
    * 
    * @param  {string[]} items An array of individual shopping list items
    * (strings)
    * 
    * @return {ShoppingList}
    */
   constructor(items = []) {
      this.items = items;
   }

   /**
    * Saves the shopping list
    * 
    * @return {Promise} A promise that resolves once the save has completed
    */
   save() {
      return authorizedFetch('/me/shoppingList', {
         method: 'put',
         body: JSON.stringify(this.items)
      })
      .then(response => response.json());
   }
}

/**
 * @classdesc A user
 */
class User {
   /**
    * Constructs the user from a user Id
    * 
    * @param  {string} id The Id of the user. A user Id is a URI to the user.
    * 
    * @return {User}
    */
   constructor(id) {
      this.id = id;
   }
}

/**
 * A callback that is invoked when a new Id token is required
 *
 * @callback Session~idTokenCallback
 *
 * @return {string} A new Id token which is used to authorize the user
 */

/**
 * @classdesc A session for which a user is authorized to access read and update
 * their data
 */
class Session {
   /**
    * Begins a session
    * 
    * @param  {Session~idTokenCallback} idTokenCallback The method which is
    * called when a new Id token is required.
    * 
    * @return {Session} A new session for a user
    */
   constructor(idTokenCallback) {
      this.idTokenCallback = idTokenCallback;
   }

   /**
    * The current user
    * 
    * @return {Promise} A promise which resolves to the current {User}
    */
   me() {
      return authorizedFetch('/me')
      .then(response => response.json())
      .then(currentUser => new User(currentUser.id));
   }

   /**
    * The current user's shopping list
    * 
    * @return {Promise} A promise which resolves to the current user's
    * {ShoppingList}
    */
   shoppingList() {
      return authorizedFetch('/me/shoppingList')
      .then(response => response.json())
      .then(shoppingList => new ShoppingList(shoppingList));
   }
}

currentSession = new Session(() => {});

/**
 * Instantiates a new session
 * 
 * @param  {Session~idTokenCallback} idTokenCallback The method which is called
 * when a new Id token is required
 * 
 * @return {Session} A new session for a user
 */
export const startSession = idTokenCallback => {
   currentSession = new Session(idTokenCallback);
   currentIdToken = idTokenCallback();
};

/**
 * Initializes the value of the fetch function. This is necessary until Fetch is
 * implemented as a module.
 * 
 * @param  {Function} fetchFunction A function implementing the Fetch Standard
 * (https://fetch.spec.whatwg.org/)
 */
export const initializeFetch = fetchFunction => fetch = fetchFunction;

/**
 * @classdesc An individual ingredient
 */
export class Ingredient {
   /**
    * Constructs a new ingredient
    * 
    * @param  {string}  description The freeform description of the ingredient
    * @param  {boolean=} shoppable Whether the ingredient will be added, by
    * default, to a shopping list when adding a recipe's ingredients to a
    * shopping list. Ingredients which may already be owned in bulk and are
    * common to many recipes, such as salt, should not be added to a shopping
    * list by default.
    * 
    * @return {Ingredient}
    */
   constructor(description, shoppable = true) {
      if (!isString(description)) {
         throw new TypeError('expected string');
      }

      if (!isBoolean(shoppable)) {
         throw new TypeError('expected boolean');
      }

      this.description = description;
      this.shoppable = shoppable;
   }
}

/**
 * A JSON representation of an {Ingredient}, as returned from the server
 * 
 * @typedef IngredientJson
 * @type {Object}
 * @property {string}   description -  The freeform description of the
 * ingredient
 * @property {boolean}  shoppable   -  Whether the ingredient is included in the
 * default shopping list
 */

/**
 * Constructs an {Ingredient} from an {IngredientJson}. This is used to ensure
 * ingredient objects returned from the service can be used as an {Ingredient}
 * rather than only as a simple {IngredientJson}.
 *
 * @function
 * 
 * @param  {IngredientJson} i The ingredient object
 * @return {Ingredient}       The {Ingredient}
 */
const makeIngredient = i => new Ingredient(i.description, i.shoppable);

/**
 * Shorthand to know if a type is an {Ingredient}
 *
 * @function
 * 
 * @param  {Object} i The object to type check
 * 
 * @return {boolean} Whether the object is an {Ingredient}
 */
const isIngredient = i => i instanceof Ingredient;

/**
 * A set of search criteria for {Plan} or {Recipe}
 *
 * @typedef SearchCriteria
 * @type {Object}
 * @property {string} title - A substring of the title
 * @property {string} tag -   An exact tag
 */

/**
 * A set of tags for a {Plan} or {Recipe}
 *
 * @typedef TagList
 * @type {Object}
 * @property {string} tag -      The tag
 * @property {number} tagCount - The number of objects with this tag
 */

/**
 * A JSON representation of a {Recipe}, as returned from the server
 * 
 * @typedef RecipeJson
 * @type {Object}
 * @property {string}         id -               The Id, a URI to the recipe
 * @property {Ingredient[]}   ingredients -      The set of ingredients
 * @property {string}         instructions -     The Markdown-formatted
 * instructions
 * @property {string}         instructionsHtml - The HTML-formatted instructions
 * @property {string[]}       tags -             The associated set of tags
 * @property {string}         title -            The title
 */

/**
 * Constructs a {Recipe} from a {RecipeJson}. This is used to ensure recipe
 * objects returned from the service can be used as a {Recipe} rather than only
 * as a simple {RecipeJson}.
 *
 * @function
 * 
 * @param  {RecipeJson} r The recipe object
 * @return {Recipe}       The {Recipe}
 */
const makeRecipe = r => {
   let ingredients = r.ingredients.map(makeIngredient);
   let recipe = new Recipe(r.title, ingredients, r.instructions, r.tags);
   Object.assign(recipe, r);

   return recipe;
};

/**
 * @classdesc A recipe
 */
export class Recipe {
   /**
    * Constructs a recipe
    * 
    * @param  {string}        title        The title
    * @param  {Ingredient[]}  ingredients  The ingredients
    * @param  {string}        instructions The Markdown-formatted instructions
    * @param  {string[]=}     tags         The associated set of tags
    * 
    * @return {Recipe}
    */
   constructor(title, ingredients, instructions, tags = []) {
      if (!isString(title)) {
         throw new TypeError('expected string');
      }

      if (!Array.isArray(ingredients) || (ingredients.length === 0)) {
         throw new TypeError('expected non-empty array');
      }

      if (!ingredients.every(isIngredient)) {
         throw new TypeError('expected array of Ingredient');
      }

      if (!isString(instructions)) {
         throw new TypeError('expected string');
      }

      if (!Array.isArray(tags)) {
         throw new TypeError('expected array');
      }

      if (!tags.every(isString)) {
         throw new TypeError('expected array of strings');
      }

      this.title = title;
      this.ingredients = ingredients;
      this.instructions = instructions;
      this.tags = tags;
   }

   /**
    * Saves the recipe
    * 
    * @return {Promise} A promise that resolves once the save has completed
    */
   save() {
      let method = (this.id) ? 'put' : 'post';
      let uri = (this.id) ? this.id : '/recipe';

      return authorizedFetch(uri, {
         method: method,
         body: JSON.stringify(this)
      })
      .then(response => response.json());
   }

   /**
    * Retrieves many recipes given some search criteria
    * 
    * @param  {SearchCriteria=} options The search criteria
    * 
    * @return {Promise} A promise that resolves once the search has completed
    * and which resolves to {Recipe[]}
    */
   static getMany(options = {}) {
      let uri = '/recipe';
      if (options.hasOwnProperty('title')) {
         uri += '?title=' + encodeURIComponent(options.title);
      } else if (options.hasOwnProperty('tag')) {
         uri += '?tag=';
         if (options.tag) {
            uri += encodeURIComponent(options.tag);
         }
      }

      return fetch(uri, {
         headers: getStandardHeaders()
      })
      .then(response => response.json())
      .then(recipes => recipes.map(makeRecipe));
   }

   /**
    * Retrieves a single recipe by its Id
    * 
    * @param  {string} id The Id of the recipe. A recipe Id is a URI to that
    * recipe.
    * 
    * @return {Promise} A promise that resolves to the {Recipe}
    */
   static getById(id) {
      return fetch(id, {
         headers: getStandardHeaders()
      })
      .then(response => response.json())
      .then(makeRecipe);
   }

   /**
    * Retrieves the set of tags that apply to all recipes
    * 
    * @return {TagList}
    */
   static tags() {
      return fetch('/recipe/tags', {
         headers: getStandardHeaders()
      })
      .then(response => response.json());
   }
}

/**
 * A JSON representation of a {Plan}, as returned from the server
 * 
 * @typedef PlanJson
 * @type {Object}
 * @property {string}   id -        The Id, a URI to the plan
 * @property {string[]} recipes -   The set of associated recipe Ids
 * @property {string[]} tags -      The associated set of tags, inherited from
 * the associated recipes
 * @property {string}   title -     The title
 */

/**
 * Constructs a {Plan} from a {PlanJson}. This is used to ensure plan objects
 * returned from the service can be used as a {Plan} rather than only as a 
 * simple {PlanJson}.
 *
 * @function
 * 
 * @param  {PlanJson} p The plan object
 * @return {Plan}       The {Plan}
 */
const makePlan = p => {
   let plan = new Plan(p.title, p.recipes);
   Object.assign(plan, p);

   return plan;
};

/**
 * @classdesc A meal plan
 */
export class Plan {
   /**
    * Constructs a meal plan
    * 
    * @param  {string}   title   The title
    * @param  {string[]} recipes The set of associated recipe Ids
    * 
    * @return {Plan}
    */
   constructor(title, recipes) {
      if (!isString(title)) {
         throw new TypeError('expected string');
      }

      if (!Array.isArray(recipes) || (recipes.length === 0)) {
         throw new TypeError('expected non-empty array');
      }

      if (!recipes.every(isString)) {
         throw new TypeError('expected string');
      }

      this.title = title;
      this.recipes = recipes;
   }

   /**
    * Saves the plan
    * 
    * @return {Promise} A promise that resolves once the save has completed
    */
   save() {
      let method = (this.id) ? 'put' : 'post';
      let uri = (this.id) ? this.id : '/plan';

      return authorizedFetch(uri, {
         method: method,
         body: JSON.stringify(this)
      })
      .then(response => response.json());
   }

   /**
    * Retrieves many plans given some search criteria
    * 
    * @param  {SearchCriteria=} options The search criteria
    * 
    * @return {Promise} A promise that resolves once the search has completed
    * and which resolves to {Plan[]}
    */
   static getMany(options = {}) {
      let uri = '/plan';
      if (options.hasOwnProperty('title')) {
         uri += '?title=' + encodeURIComponent(options.title);
      } else if (options.hasOwnProperty('tag')) {
         uri += '?tag=';
         if (options.tag) {
            uri += encodeURIComponent(options.tag);
         }
      }

      return fetch(uri, {
         headers: getStandardHeaders()
      })
      .then(response => response.json())
      .then(plans => plans.map(makePlan));
   }

   /**
    * Retrieves a single plan by its Id
    * 
    * @param  {string} id The Id of the plan. A plan Id is a URI to that plan.
    * 
    * @return {Promise} A promise that resolves to the {Plan}
    */
   static getById(id) {
      return fetch(id, {
         headers: getStandardHeaders()
      })
      .then(response => response.json())
      .then(makePlan);
   }

   /**
    * Retrieves the set of tags that apply to all recipes
    * 
    * @return {TagList}
    */
   static tags() {
      return fetch('/plan/tags', {
         headers: getStandardHeaders()
      }).then(response => response.json());
   }
}
