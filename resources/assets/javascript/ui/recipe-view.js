import IngredientsView from './ingredients-view.js';
import IngredientsEditor from './ingredients-editor.js';
import TagsEditor from './tags-editor.js';

const makeDisplayView = 
   (templateEngine,
      mealPlanApi,
      recipe,
      isPartOfPlan = false,
      editRecipeCallback) => {
      const view = templateEngine.create('displayRecipe');

      const instructions = view.getElementsByTagName('p')[0];
      const editButton = view.getElementsByTagName('button')[0];
      const ingredientsView = new IngredientsView(
         templateEngine,
         mealPlanApi,
         !isPartOfPlan);

      view.getElementsByTagName('header')[0].textContent = recipe.title;

      instructions.innerHTML = recipe.instructionsHtml;

      ingredientsView.addIngredients(recipe.ingredients);
      view.insertBefore(ingredientsView.element(), instructions);

      if (recipe.tags) {
         const tags = view.getElementsByClassName('tags')[0];

         recipe.tags.forEach(tag => {
            const listItem = view.ownerDocument.createElement('li');
            listItem.textContent = tag;
            tags.appendChild(listItem);
         });
      }

      if (isPartOfPlan) {
         view.removeChild(editButton);
      } else {
         mealPlanApi.currentSession.me()
            .then(
               me => {
                  if (me.id === recipe.createdBy) {
                     editButton.addEventListener('click', () =>
                        editRecipeCallback(recipe)
                     );
                  } else {
                     editButton.parentNode.removeChild(editButton);
                  }
               }
            )
            .catch(() => editButton.parentNode.removeChild(editButton));
      }

      return view;
   };

const makeEditView =
   (templateEngine, mealPlanApi, recipe, recipeEditedCallback) => {
      const view = templateEngine.create('editRecipe');

      const titleInput = view.getElementsByTagName('input')[0];
      const instructions = view.getElementsByTagName('textarea')[0];
      const submitButton = view.getElementsByTagName('button')[0];
      const form = submitButton.form;
      const ingredientsEditor = new IngredientsEditor(templateEngine);
      const tagsEditor = new TagsEditor(templateEngine);
      const getRecipe = () => {
            const title = titleInput.value.trim();
            const ingredients = ingredientsEditor.getIngredients();
            const instructionsText = instructions.value.trim();
            const tags = tagsEditor.getTags();

            return new mealPlanApi.Recipe(
               title,
               ingredients,
               instructionsText,
               tags
            );
         };

      form.insertBefore(ingredientsEditor.element(), instructions.parentNode);
      form.insertBefore(tagsEditor.element(), submitButton);

      if (recipe) {
         titleInput.value = recipe.title;
         instructions.textContent = recipe.instructions;
         ingredientsEditor.setIngredients(recipe.ingredients);

         if (recipe.tags) {
            tagsEditor.setTags(recipe.tags);
         }

         submitButton.textContent = 'Update';

         submitButton.addEventListener('click', () => {
            if (submitButton.form.checkValidity()) {
               let updatedRecipe = getRecipe();
               updatedRecipe.id = recipe.id;
               recipeEditedCallback(updatedRecipe);
            }
         });
      } else {
         submitButton.textContent = 'Create';

         submitButton.addEventListener('click', () => {
            if (submitButton.form.checkValidity()) {
               recipeEditedCallback(getRecipe());
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
      recipe,
      isPartOfPlan = false,
      editMode = false,
      updateRecipeCallback) {
      const replaceView = (view) => {
         if (this.view && this.view.parentNode) {
            const parentNode = this.view.parentNode;
            parentNode.removeChild(this.view);
            parentNode.appendChild(view);
         }

         this.view = view;
      };

      let displayRecipe;
      let editRecipe;

      displayRecipe = (recipeToDisplay) => {
         replaceView(
            makeDisplayView(
               templateEngine,
               mealPlanApi,
               recipeToDisplay,
               isPartOfPlan,
               editRecipe));
      };

      editRecipe = (recipeToEdit) => {
         replaceView(
            makeEditView(
               templateEngine,
               mealPlanApi,
               recipeToEdit,
               (updatedRecipe) => {
                  displayRecipe(updatedRecipe);
                  updateRecipeCallback(updatedRecipe);
               }));
      }

      if (editMode) {
         editRecipe(recipe);
      } else {
         displayRecipe(recipe);
      }
   }
}
