import MealPlanSearch from './meal-plan-search.js';

const createListItemFromRecipeUri = (templateEngine, recipeUri) => {
   const listItem = templateEngine.create('recipeReference');
   const reference = listItem.getElementsByTagName('span')[0];
   const removeButton = listItem.getElementsByTagName('button')[0];

   reference.textContent = recipeUri;

   removeButton.addEventListener('click', () =>
      listItem.parentNode.removeChild(listItem));

   return listItem;
};

const getRecipeUriFromListItem = listItem =>
   listItem.getElementsByTagName('span')[0].textContent;

const containerSymbol = Symbol('container');
const templateEngineSymbol = Symbol('templateEngine');

export default class {
   constructor(templateEngine, mealPlanApi, aggregatorId) {
      this[containerSymbol] = templateEngine.create('recipeAggregator');
      this[templateEngineSymbol] = templateEngine;

      const dataList = this.element().getElementsByTagName('datalist')[0];
      const recipeInput = this.element().getElementsByTagName('input')[0];
      const addRecipeButton =
         this.element().getElementsByClassName('addButton')[0];

      dataList.id = aggregatorId;
      recipeInput.setAttribute('list', dataList.id);

      const updateRecipeDataList = recipes => {
         dataList.textContent = '';

         recipes.forEach(recipe => {
            const option =
               this[containerSymbol].ownerDocument.createElement('option');
            option.id = recipe.id;
            option.value = recipe.title;
            dataList.appendChild(option);
         });
      };

      const mealPlanSearch = new MealPlanSearch(
         recipeInput,
         mealPlanApi.Recipe.getMany,
         updateRecipeDataList
      );

      addRecipeButton.addEventListener('click', () => {
         if (recipeInput.checkValidity()) {
            const title = recipeInput.value.trim();
            const option = Array.from(dataList.options)
               .find(option => option.value === title);
            if (option) {
               const recipeUri = option.id;

               const recipeList = this.element().getElementsByTagName('ul')[0];
               recipeList.appendChild(
                  createListItemFromRecipeUri(
                     this[templateEngineSymbol],
                     recipeUri));

               recipeInput.value = '';
               recipeInput.focus();
            }
         }
      });
   }

   element() {
      return this[containerSymbol];
   }

   getRecipeUris() {
      return Array.from(this.element().getElementsByTagName('li'))
         .map(getRecipeUriFromListItem);
   }

   setRecipeUris(recipeUris) {
      const recipeList = this.element().getElementsByTagName('ul')[0];
      recipeList.textContent = '';

      recipeUris.forEach(recipeUri =>
         recipeList.appendChild(
            createListItemFromRecipeUri(
               this[templateEngineSymbol],
               recipeUri)));
   }
}
