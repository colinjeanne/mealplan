import * as mealPlanApi from './api/api.js';
import Template from './ui/template.js';
import MealPlanSearch from './ui/meal-plan-search.js';
import MenuToggle from './ui/menu-toggle.js';
import Tabs from './ui/tabs.js';
import Listings from './ui/listings.js';
import ShoppingListView from './ui/shopping-list-view.js';
import RecipeView from './ui/recipe-view.js';
import PlanView from './ui/plan-view.js';

mealPlanApi.initializeFetch(fetch);

const signinCallback = authResult => {
   if (authResult.status.signed_in) {
      console.log('Setting Id token');
      const idToken = authResult.id_token;
      mealPlanApi.startSession(() => idToken);

      console.log('Getting me');
      mealPlanApi.currentSession.me()
         .then(me => console.log('Got me: ' + me.id))
         .catch(err => console.log('Got error: ' + err.message));

      window.gapi.client.load('oauth2', 'v2')
         .then(() =>
            window.gapi.client.oauth2.userinfo.get({'fields': 'name'})
            .then(response => {
               document.getElementById('signInButton').setAttribute('style', 'display: none');
               document.getElementById('currentUser').innerHTML = 'Welcome ' + response.result.name;
            },
            reason =>
               console.log('Error: ' + reason.result.error.message)
            )
         );
   } else {
      console.log('Sign-in state: ' + authResult.error);
   }
};

window.signinCallback = signinCallback;

document.addEventListener('DOMContentLoaded', () => {
   const templateEngine = new Template(document);
   const search = new MealPlanSearch(
      document.getElementById('search'),
      mealPlanApi.Recipe.getMany
   );
   const listings = new Listings(document.getElementById('listingRoot'));
   const addItem = document.getElementById('addItem');
   const menuToggle = new MenuToggle(document.getElementById('menuIcon'));

   const setContent = content => {
      const contentNode = document.getElementById('content');
      contentNode.textContent = '';

      menuToggle.hide();

      contentNode.appendChild(content);
   };

   const createTagListings = (tags, handler) => {
      const tagListings = tags.map(tag => {
         const tagName = tag.tag || '<untagged>';
         return {
            title: `${tagName} (${tag.tagCount})`,
            data: tag.tag,
            handler: handler
         };
      }).sort((a, b) => {
         let result = 0;
         if (!b.data || (a.data < b.data)) {
            result = -1;
         } else if (!a.data || (a.data > b.data)) {
            result = 1;
         }

         return result;
      });

      listings.setListings(tagListings);
   };

   const recipeUpdatedCallback = recipe =>
      recipe.save()
         .then(showRecipeTags)
         .catch(err => alert(err));

   const planUpdatedCallback = plan =>
      plan.save()
         .then(showPlanTags)
         .catch(err => alert(err));

   const displayRecipe = (recipe, editMode = false) => {
      const recipeView = new RecipeView(
         templateEngine,
         mealPlanApi,
         recipe,
         false,
         editMode,
         recipeUpdatedCallback);

      setContent(recipeView.view);
   };

   const displayPlan = (plan, editMode = false) => {
      const planView = new PlanView(
         templateEngine,
         mealPlanApi,
         plan,
         editMode,
         planUpdatedCallback);

      setContent(planView.view);
   };

   const displayShoppingList = shoppingList => {
      const shoppingListView = new ShoppingListView(
         templateEngine,
         shoppingList);
      setContent(shoppingListView.view);
   };

   const showShoppingList = () => {
      search.clear();
      listings.clear();
      mealPlanApi.currentSession.shoppingList().then(
         displayShoppingList
      );
   };

   const setPlanListings = plans => {
      const planListings = plans.map(plan => {
         return {
            title: plan.title,
            data: plan,
            handler: displayPlan
         };
      }).sort((a, b) => {
         let result = 0;
         if (a.title < b.title) {
            result = -1;
         } else if (a.title > b.title) {
            result = 1;
         }

         return result;
      });

      listings.setListings(planListings);
   };

   const showPlanListings = options =>
      mealPlanApi.Plan.getMany(options).then(setPlanListings);

   const setRecipeListings = recipes => {
      const recipeListings = recipes.map(recipe => {
         return {
            title: recipe.title,
            data: recipe,
            handler: displayRecipe
         };
      }).sort((a, b) => {
         let result = 0;
         if (a.title < b.title) {
            result = -1;
         } else if (a.title > b.title) {
            result = 1;
         }

         return result;
      });

      listings.setListings(recipeListings);
   };

   const showRecipeListings = options =>
      mealPlanApi.Recipe.getMany(options).then(setRecipeListings);

   const handlePlanTagSelected = tag => showPlanListings({tag});

   const handleRecipeTagSelected = tag => showRecipeListings({tag});

   const showPlanTags = () => {
      search.clear();
      mealPlanApi.Plan.tags().then(
         tags => createTagListings(tags, handlePlanTagSelected)
      );
   };

   const showRecipeTags = () => {
      search.clear();
      mealPlanApi.Recipe.tags().then(
         tags => createTagListings(tags, handleRecipeTagSelected)
      );
   };

   const handlePlansTab = () => {
      showPlanTags();
      search.dataSource = mealPlanApi.Plan.getMany;
      search.resultsHandler = setPlanListings;

      addItem.removeEventListener('click', () =>
         displayRecipe(null, true)
      );
      addItem.addEventListener('click', () =>
         displayPlan(null, true)
      );
   };

   const handleRecipesTab = () => {
      showRecipeTags();
      search.dataSource = mealPlanApi.Recipe.getMany;
      search.resultsHandler = setRecipeListings;

      addItem.removeEventListener('click', () =>
         displayPlan(null, true)
      );
      addItem.addEventListener('click', () =>
         displayRecipe(null, true)
      );
   };

   const handleShoppingListTab = () => showShoppingList();

   const existingTabs = [
      {
         tab: 'plans',
         handler: handlePlansTab
      },
      {
         tab: 'recipes',
         handler: handleRecipesTab
      },
      {
         tab: 'shoppingList',
         handler: handleShoppingListTab
      }
   ];

   const tabs = new Tabs(
      document.getElementById('mainNavigation'),
      existingTabs
   );

   menuToggle.register(tabs.container);
   menuToggle.register(document.getElementById('listing'));
});
