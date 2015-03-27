import IngredientsView from './ingredients-view.js';
import RecipeView from './recipe-view.js';
import RecipeAggregator from './recipe-aggregator.js';

const getAllRecipesInPlan = (mealPlanApi, plan) => {
   const promises = plan.recipes.map(recipeUri =>
      mealPlanApi.Recipe.getById(recipeUri)
   );

   return Promise.all(promises);
};

const makeDisplayView =
   (templateEngine, mealPlanApi, plan, editPlanCallback) => {
      const view = templateEngine.create('displayPlan');

      const recipeTitles = view.getElementsByClassName('recipeTitles')[0];
      const tags = view.getElementsByClassName('tags')[0];
      const editButton = view.getElementsByTagName('button')[0];
      const ingredientsView = new IngredientsView(
            templateEngine,
            mealPlanApi,
            true);

      view.getElementsByTagName('header')[0].textContent = plan.title;
      view.insertBefore(ingredientsView.element(), tags);

      getAllRecipesInPlan(mealPlanApi, plan)
         .then(recipes => {
            recipes.forEach(recipe => {
               const listItem = view.ownerDocument.createElement('li');
               const recipeView = new RecipeView(
                  templateEngine,
                  mealPlanApi,
                  recipe,
                  true,
                  false);

               listItem.textContent = recipe.title;
               recipeTitles.appendChild(listItem);
               view.insertBefore(recipeView.view, tags);
               ingredientsView.addIngredients(recipe.ingredients);
            });
         });

      if (plan.tags) {
         plan.tags.forEach(tag => {
            const listItem = view.ownerDocument.createElement('li');
            listItem.textContent = tag;
            tags.appendChild(listItem);
         });
      }

      mealPlanApi.currentSession.me()
         .then(me => {
            if (me.id === plan.createdBy) {
               editButton.addEventListener('click', () =>
                  editPlanCallback(plan)
               );
            } else {
               editButton.parentNode.removeChild(editButton);
            }
         })
         .catch(() => editButton.parentNode.removeChild(editButton));

      return view;
   };

const makeEditView =
   (templateEngine, mealPlanApi, plan, planEditedCallback) => {
      const view = templateEngine.create('editPlan');

      const titleInput = view.getElementsByTagName('input')[0];
      const submitButton = view.getElementsByTagName('button')[0];
      const form = submitButton.form;
      const recipeAggregator = new RecipeAggregator(
            templateEngine,
            mealPlanApi,
            'aggregator');
      const getPlan = () => {
         const title = titleInput.value.trim();
         const recipeUris = recipeAggregator.getRecipeUris();

         return new mealPlanApi.Plan(title, recipeUris);
      };

      form.insertBefore(recipeAggregator.element(), submitButton);
      if (plan) {
         titleInput.value = plan.title;
         recipeAggregator.setRecipeUris(plan.recipes);

         submitButton.textContent = 'Update';

         submitButton.addEventListener('click', () => {
            if (submitButton.form.checkValidity()) {
               let updatedPlan = getPlan();
               updatedPlan.id = plan.id;

               planEditedCallback(updatedPlan);
            }
         });
      } else {
         submitButton.textContent = 'Create';

         submitButton.addEventListener('click', () => {
            if (submitButton.form.checkValidity()) {
               planEditedCallback(getPlan());
            }
         });
      }

      form.addEventListener('submit', event => event.preventDefault());

      titleInput.focus();

      return view;
   };

export default class {
   constructor(
      templateEngine,
      mealPlanApi,
      plan,
      editMode = false,
      updatePlanCallback) {
      const replaceView = (view) => {
         if (this.view && this.view.parentNode) {
            const parentNode = this.view.parentNode;
            parentNode.removeChild(this.view);
            parentNode.appendChild(view);
         }

         this.view = view;
      };

      let displayPlan;
      let editPlan;

      displayPlan = (planToDisplay) => {
         replaceView(
            makeDisplayView(
               templateEngine,
               mealPlanApi,
               planToDisplay,
               editPlan));
      };

      editPlan = (planToEdit) => {
         replaceView(
            makeEditView(
               templateEngine,
               mealPlanApi,
               planToEdit,
               (updatedPlan) => {
                  displayPlan(updatedPlan);
                  updatePlanCallback(updatedPlan);
               }));
      };

      if (editMode) {
         editPlan(plan);
      } else {
         displayPlan(plan);
      }
   }
}
