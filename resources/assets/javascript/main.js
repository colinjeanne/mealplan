import * as mealPlanApi from './api/api.js';
import Template from './ui/template.js';
import MealPlanSearch from './ui/meal-plan-search.js';
import MenuToggle from './ui/menu-toggle.js';
import Tabs from './ui/tabs.js';
import Listings from './ui/listings.js';
import ShoppingListView from './ui/shopping-list-view.js';
import RecipeView from './ui/recipe-view.js';
import PlanView from './ui/plan-view.js';
import ContentList from './ui/content-list.js';
import IdeasView from './ui/ideas-view.js';

mealPlanApi.initializeFetch(fetch);

document.addEventListener('DOMContentLoaded', () => {
   const templateEngine = new Template(document);
   const search = new MealPlanSearch(
      document.getElementById('search'),
      mealPlanApi.Recipe.getMany
   );
   const listings = new Listings(document.getElementById('listingRoot'));
   const menuToggle = new MenuToggle(document.getElementById('menuIcon'));

   const setContent = content => {
      const contentNode = document.getElementById('content');
      contentNode.textContent = '';
      contentNode.appendChild(content);
   };

   const addNewItemListing = (listings, addNewItemHandler) =>
      [{
         title: '+ New',
         data: null,
         handler: addNewItemHandler
      }]
      .concat(listings);

   const createTagListings = (tags, handler) =>
      tags.map(tag => {
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

   const displayShoppingList = shoppingList => {
      const shoppingListView = new ShoppingListView(
         templateEngine,
         shoppingList);

      menuToggle.hide();

      setContent(shoppingListView.view);
   };

   const showShoppingList = () => {
      search.clear();
      listings.clear();
      mealPlanApi.currentSession.shoppingList().then(
         displayShoppingList
      );
   };

   const handleShoppingListTab = () => showShoppingList();

   const sortByTitle = (a, b) => {
      let result = 0;
      if (a.title < b.title) {
         result = -1;
      } else if (a.title > b.title) {
         result = 1;
      }

      return result;
   };

   const displayContentList = (items, mapFn) => {
      const contentList = new ContentList(templateEngine, items.map(mapFn));
      
      setContent(contentList.element());
   };

   const planUpdatedCallback = plan => {
      let updatedPlan;
      return plan.save()
         .then(savedPlan => updatedPlan = savedPlan)
         .then(showPlanTags)
         .catch(err => alert(err))
         .then(() => updatedPlan);
   };
   
   const displayPlan = (plan, editMode = false) => {
      const planView = new PlanView(
         templateEngine,
         mealPlanApi,
         plan,
         editMode,
         planUpdatedCallback);

      menuToggle.hide();

      setContent(planView.view);
   };

   const planDetail = plan => '';

   const planItemDataMap = plan => {
      return {
         mainLine: plan.title,
         detail: planDetail(plan),
         data: plan,
         handler: displayPlan
      };
   };

   const displayPlanContentList = plans =>
      displayContentList(plans, planItemDataMap);

   const showPlanContentList = options =>
      mealPlanApi.Plan.getMany(options)
         .then(displayPlanContentList);

   const handlePlanTagSelected = tag => showPlanContentList({tag});

   const showPlanTags = () => {
      search.clear();
      mealPlanApi.Plan.tags().then(
         tags => listings.updateListings(
            addNewItemListing(
               createTagListings(tags, handlePlanTagSelected),
               () => displayPlan(null, true))
            )
      );
   };

   const handlePlansTab = () => {
      showPlanTags();
      search.dataSource = mealPlanApi.Plan.getMany;
      search.resultsHandler = displayPlanContentList;
   };

   const recipeUpdatedCallback = recipe => {
      let updatedRecipe;
      return recipe.save()
         .then(savedRecipe => updatedRecipe = savedRecipe)
         .then(showRecipeTags)
         .catch(err => alert(err))
         .then(() => updatedRecipe);
   };

   const displayRecipe = (recipe, editMode = false) => {
      const recipeView = new RecipeView(
         templateEngine,
         mealPlanApi,
         recipe,
         false,
         editMode,
         recipeUpdatedCallback);

      menuToggle.hide();

      setContent(recipeView.view);
   };

   const recipeDetail = recipe => {
      if (recipe.tags) {
         return recipe.tags.join(' ');
      }

      return '';
   };

   const recipeItemDataMap = recipe => {
      return {
         mainLine: recipe.title,
         detail: recipeDetail(recipe),
         data: recipe,
         handler: displayRecipe
      };
   };

   const displayRecipeContentList = recipes =>
      displayContentList(recipes, recipeItemDataMap);

   const showRecipeContentList = options =>
      mealPlanApi.Recipe.getMany(options)
         .then(displayRecipeContentList);

   const handleRecipeTagSelected = tag => showRecipeContentList({tag});

   const showRecipeTags = () => {
      search.clear();
      mealPlanApi.Recipe.tags().then(
         tags => listings.updateListings(
            addNewItemListing(
               createTagListings(tags, handleRecipeTagSelected),
               () => displayRecipe(null, true))
            )
      );
   };

   const handleRecipesTab = () => {
      showRecipeTags();
      search.dataSource = mealPlanApi.Recipe.getMany;
      search.resultsHandler = displayRecipeContentList;
   };

   const addIdea = () =>
      mealPlanApi.currentSession.ideas()
         .then(ideas => {
            const ideasView = new IdeasView(
               templateEngine,
               mealPlanApi,
               ideas,
               'addIdea');

            setContent(ideasView.view)
         });

   const handleIdeasTab = () => {
      search.clear();

      const ideaListingItems = [
         {
            title: 'Random 5',
            data: null,
            handler: () => displayIdeas('random')
         },
         {
            title: 'All',
            data: null,
            handler: () => displayIdeas('all')
         }
      ];
      
      listings.updateListings(
         addNewItemListing(
            ideaListingItems,
            addIdea));
      displayIdeas('random');
   };

   const displayIdeas = viewType =>
      mealPlanApi.currentSession.ideas()
         .then(ideas => {
            const ideasView = new IdeasView(
               templateEngine,
               mealPlanApi,
               ideas,
               viewType);

            setContent(ideasView.view);
         });

   const displaySousVide = () =>
      setContent(templateEngine.create('displaySousVide'));

   const handleSousVideTab = () => {
      search.clear();
      listings.clear();
      displaySousVide();
   };

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
         tab: 'sousVide',
         handler: handleSousVideTab
      }
   ];

   const tabs = new Tabs(
      document.getElementById('mainNavigation'),
      existingTabs
   );

   const userSignedIn = () => {
      tabs.add(
         templateEngine,
         {
            id: 'shoppingList',
            title: 'My Shopping List',
            handler: handleShoppingListTab
         });

      tabs.add(
         templateEngine,
         {
            id: 'ideas',
            title: 'My Ideas',
            handler: handleIdeasTab
         });
   };

   menuToggle.register(tabs.container);
   menuToggle.register(document.getElementById('listing'));

   const signinSucceeded = googleUser => {
      console.log('Setting Id token');
      const idToken = googleUser.getAuthResponse().id_token;
      mealPlanApi.startSession(() => idToken);

      console.log('Getting me');
      mealPlanApi.currentSession.me()
      .then(me => console.log('Got me: ' + me.id))
      .then(userSignedIn)
      .catch(err => console.log('Got error: ' + err.message));

      const profile = googleUser.getBasicProfile();
      document.getElementById('signInButton').setAttribute('style', 'display: none');
      document.getElementById('currentUser').textContent =
            'Welcome ' + profile.getName();
   };
   
   const signinFailed = error =>
      console.log('Sign-in failed: ' + error);

   window.signinSucceeded = signinSucceeded;
   window.signinFailed = signinFailed;
});
