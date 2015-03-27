import { Ingredient } from './../api/api.js';

const cannonicalizeLineBreaks = s => s.trim().replace(/(\r\n)|(\r)/m, '\n');

const createListItemFromIngredient = (templateEngine, ingredient) => {
   const listItem = templateEngine.create('editableIngredient');
   const description = listItem.getElementsByClassName('description')[0];
   const shoppable = listItem.getElementsByClassName('shoppable')[0];
   const removeButton = listItem.getElementsByTagName('button')[0];

   description.value = ingredient.description;
   shoppable.checked = ingredient.shoppable;

   removeButton.addEventListener('click', () =>
      listItem.parentNode.removeChild(listItem));

   return listItem;
};

const getIngredientFromListItem = listItem => {
   const description = listItem.getElementsByClassName('description')[0];
   const shoppable = listItem.getElementsByClassName('shoppable')[0];

   return new Ingredient(description.value, shoppable.checked);
};

const addIngredientsToList = (templateEngine, list, ingredients) =>
   ingredients
      .map(ingredient =>
         createListItemFromIngredient(templateEngine, ingredient))
      .forEach(list.appendChild.bind(list));

const calculateIngredients = rawIngredients =>
   cannonicalizeLineBreaks(rawIngredients)
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length !== 0)
      .map(ingredientDescription => new Ingredient(ingredientDescription));

const containerSymbol = Symbol('container');
const templateEngineSymbol = Symbol('templateEngine');

export default class {
   constructor(templateEngine) {
      this[containerSymbol] = templateEngine.create('ingredientsEditor');
      this[templateEngineSymbol] = templateEngine;

      const ingredientsList = this.element().getElementsByTagName('ul')[0];
      const rawIngredients = this.element().getElementsByTagName('textarea')[0];

      const addIngredientsFromEvent = event => {
         const value = event.target.value;
         event.target.value = '';

         const ingredients = calculateIngredients(value);

         addIngredientsToList(
            this[templateEngineSymbol],
            ingredientsList,
            ingredients);
      };

      rawIngredients.addEventListener(
         'keyup',
         event => {
            if (event.key === 'Enter') {
               addIngredientsFromEvent(event);
            }
         }
      );

      rawIngredients.addEventListener(
         'change',
         addIngredientsFromEvent
      );
   }

   element() {
      return this[containerSymbol];
   }

   getIngredients() {
      return Array.from(this.element().getElementsByTagName('li'))
         .map(getIngredientFromListItem);
   }

   setIngredients(ingredients) {
      const ingredientsList = this.element().getElementsByTagName('ul')[0];
      ingredientsList.textContent = '';

      addIngredientsToList(
         this[templateEngineSymbol],
         ingredientsList,
         ingredients);
   }
}
