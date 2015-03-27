const createListItemFromIngredient =
   (templateEngine, ingredient, canEditShoppingList) => {
      let listItem = templateEngine.create('ingredientItem');
      let description = listItem.getElementsByTagName('span')[0];
      let shoppable = listItem.getElementsByTagName('input')[0];

      description.textContent = ingredient.description;

      if (canEditShoppingList) {
         shoppable.checked = ingredient.shoppable;
      } else {
         shoppable.parentNode.removeChild(shoppable);
      }

      return listItem;
   }; 

const addIngredientsToList =
   (templateEngine, list, ingredients, canEditShoppingList) => {
      ingredients
         .map(ingredient =>
            createListItemFromIngredient(
               templateEngine,
               ingredient,
               canEditShoppingList))
         .forEach(list.appendChild.bind(list));
   };

const containerSymbol = Symbol('container');
const templateEngineSymbol = Symbol('templateEngine');

export default class {
   constructor(templateEngine, mealPlanApi, canEditShoppingList) {
      this[templateEngineSymbol] = templateEngine;
      this[containerSymbol] = templateEngine.create('ingredientsView');

      let shoppingListButton = this.element().getElementsByTagName('button')[0];

      this.canEditShoppingList = canEditShoppingList;

      if (canEditShoppingList) {
         shoppingListButton.addEventListener(
            'click',
            () => {
               let ingredientsList =
                  this.element().getElementsByTagName('ul')[0];

               const addedIngredients =
                  Array.from(ingredientsList.querySelectorAll('input:checked + span'))
                  .map(childNode => childNode.textContent);

               mealPlanApi.currentSession.shoppingList()
                  .then(shoppingList => {
                     shoppingList.items =
                        shoppingList.items.concat(addedIngredients);
                     shoppingList.save().
                        catch(err => {
                          throw err;
                        });
                  });
            }
         );
      } else {
         this.element().removeChild(shoppingListButton);
      }
   }

   element() {
      return this[containerSymbol];
   }

   addIngredients(ingredients) {
      const ingredientsList = this.element().getElementsByTagName('ul')[0];
      addIngredientsToList(
         this[templateEngineSymbol],
         ingredientsList,
         ingredients,
         this.canEditShoppingList
      );
   }
}
