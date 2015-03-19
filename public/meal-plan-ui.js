(function (global) {
   'use strict';

   function isString(s) {
      return typeof s === 'string';
   }

   function isFunction(f) {
      return typeof f === 'function';
   }

   function Event(type) {
      type.toLowerCase();

      this.type = type;
      this.defaultPrevented = false;
   }

   Event.prototype.preventDefault = function () {
      this.defaultPrevented = true;
   };

   function EventTarget() {
      this.eventListeners = new Map();
   }

   EventTarget.prototype.addEventListener = function (type, listener) {
      if (!isString(type)) {
         throw new TypeError('expected string');
      }

      if (!isFunction(listener)) {
         throw new TypeError('expected function');
      }

      type.toLowerCase();

      if (!this.eventListeners.has(type)) {
         this.eventListeners.set(type, new Set());
      }

      this.eventListeners.get(type).add(listener);
   };

   EventTarget.prototype.removeEventListener = function (type, listener) {
      if (!isString(type)) {
         throw new TypeError('expected string');
      }

      if (!isFunction(listener)) {
         throw new TypeError('expected function');
      }

      type.toLowerCase();

      if (this.eventListeners.has(type)) {
         var listeners = this.eventListeners.get(type);
         listeners.delete(listener);
         if (listeners.size === 0) {
            this.eventListeners.delete(type);
         }
      }
   };

   EventTarget.prototype.dispatchEvent = function (event) {
      if (!event.type) {
         throw new TypeError('expected event');
      }

      if (!isString(event.type)) {
         throw new TypeError('expected event');
      }

      event.type.toLowerCase();

      if (this.eventListeners.has(event.type)) {
         var listeners = this.eventListeners.get(event.type);
         listeners.forEach(function (listener) {
            if (!event.defaultPrevented) {
               listener.call(global, event);
            }
         });
      }

      return !event.defaultPrevented;
   };

   global.mealPlanEvents = {
      Event: Event,
      EventTarget: EventTarget
   };
}(this));

(function (global, document) {
   'use strict';

   var templates = [];

   function findTemplate(name) {
      var template = Array.from(templates).find(function (template) {
         return template.dataset.templateName === name;
      });

      if (template) {
         return template;
      }

      throw new Error('Template not found');
   }

   function createTemplate(name) {
      var template = findTemplate(name),
         clone = template.cloneNode(true);
      clone.removeAttribute('data-template-name');
      Array.from(clone.querySelectorAll('*[data-template-name]'))
         .forEach(function (innerTemplate) {
            innerTemplate.parentNode.removeChild(innerTemplate);
         });

      return clone;
   }

   document.addEventListener('DOMContentLoaded', function () {
      templates = document.querySelectorAll('*[data-template-name]');
   });

   global.mealPlanTemplate = {
      createTemplate: createTemplate
   };
}(this, document));

(function (global) {
   'use strict';

   function createListItemFromIngredient(ingredient, canEditShoppingList) {
      var listItem = global.mealPlanTemplate.createTemplate('ingredientItem'),
         description = listItem.getElementsByTagName('span')[0],
         shoppable = listItem.getElementsByTagName('input')[0];

      description.textContent = ingredient.description;

      if (canEditShoppingList) {
         shoppable.checked = ingredient.shoppable;
      } else {
         shoppable.parentNode.removeChild(shoppable);
      }

      return listItem;
   }

   function addIngredientsToList(list, ingredients, canEditShoppingList) {
      ingredients
         .map(function (ingredient) {
            return createListItemFromIngredient(ingredient, canEditShoppingList);
         })
         .forEach(list.appendChild.bind(list));
   }

   function IngredientsView(canEditShoppingList) {
      var container = global.mealPlanTemplate.createTemplate('ingredientsView'),
         ingredientsList = container.getElementsByTagName('ul')[0],
         shoppingListButton = container.getElementsByTagName('button')[0];

      this.canEditShoppingList = canEditShoppingList;
      this.getElement = function () {
         return container;
      };

      if (canEditShoppingList) {
         shoppingListButton.addEventListener(
            'click',
            function () {
               var addedIngredients =
                  Array.from(ingredientsList.querySelectorAll('input:checked + span'))
                  .map(function (childNode) {
                     return childNode.textContent;
                  });

               global.mealPlanApi.getMyShoppingList().then(function (shoppingList) {
                  var updatedShoppingList = shoppingList.concat(addedIngredients);
                  global.mealPlanApi.updateMyShoppingList(updatedShoppingList).
                     catch(function (xhr) {
                        global.alert(xhr);
                     });
               });
            }
         );
      } else {
         container.removeChild(shoppingListButton);
      }
   }

   IngredientsView.prototype.addIngredients = function (ingredients) {
      var ingredientsList = this.getElement().getElementsByTagName('ul')[0];
      addIngredientsToList(
         ingredientsList,
         ingredients,
         this.canEditShoppingList
      );
   };

   global.IngredientsView = IngredientsView;
}(this));

(function (global) {
   'use strict';

   function cannonicalizeLineBreaks(s) {
      return s.trim().replace(/(\r\n)|(\r)/m, '\n');
   }

   function createListItemFromIngredient(ingredient) {
      var listItem = global.mealPlanTemplate.createTemplate('editableIngredient'),
         description = listItem.getElementsByClassName('description')[0],
         shoppable = listItem.getElementsByClassName('shoppable')[0],
         removeButton = listItem.getElementsByTagName('button')[0];

      description.value = ingredient.description;
      shoppable.checked = ingredient.shoppable;

      removeButton.addEventListener('click', function () {
         listItem.parentNode.removeChild(listItem);
      });

      return listItem;
   }

   function getIngredientFromListItem(listItem) {
      var description = listItem.getElementsByClassName('description')[0],
         shoppable = listItem.getElementsByClassName('shoppable')[0];

      return new global.mealPlanApi.Ingredient(
         description.value,
         shoppable.checked
      );
   }

   function addIngredientsToList(list, ingredients) {
      ingredients
         .map(createListItemFromIngredient)
         .forEach(list.appendChild.bind(list));
   }

   function calculateIngredients(rawIngredients) {
      var cannonical = cannonicalizeLineBreaks(rawIngredients);
      return cannonical
         .split('\n')
         .map(function (line) {
            return line.trim();
         })
         .filter(function (line) {
            return line.length !== 0;
         }).map(function (ingredientDescription) {
            return new global.mealPlanApi.Ingredient(
               ingredientDescription,
               true
            );
         });
   }

   function IngredientsEditor() {
      var container = global.mealPlanTemplate.createTemplate('ingredientsEditor'),
         ingredientsList = container.getElementsByTagName('ul')[0],
         rawIngredients = container.getElementsByTagName('textarea')[0];

      this.getElement = function () {
         return container;
      };

      rawIngredients.addEventListener(
         'keyup',
         function (event) {
            if (event.key === 'Enter') {
               var value = event.target.value,
                  ingredients;

               event.target.value = '';
               ingredients = calculateIngredients(value);
               addIngredientsToList(ingredientsList, ingredients);
            }
         }
      );

      rawIngredients.addEventListener(
         'change',
         function (event) {
            var value = event.target.value,
               ingredients;

            event.target.value = '';
            ingredients = calculateIngredients(value);
            addIngredientsToList(ingredientsList, ingredients);
         }
      );
   }

   IngredientsEditor.prototype.getIngredients = function () {
      return Array.from(this.getElement().getElementsByTagName('li'))
         .map(getIngredientFromListItem);
   };

   IngredientsEditor.prototype.setIngredients = function (ingredients) {
      var ingredientsList = this.getElement().getElementsByTagName('ul')[0];
      Array.from(ingredientsList.childNodes).forEach(function (childNode) {
         ingredientsList.removeChild(childNode);
      });

      addIngredientsToList(ingredientsList, ingredients);
   };

   global.IngredientsEditor = IngredientsEditor;
}(this));

(function (global) {
   'use strict';

   function inputHandler(mealPlanSearch) {
      return function (event) {
         var searchTerm = event.target.value.trim(),
            searchOptions = {
               title: searchTerm,
               tag: searchTerm
            };

         mealPlanSearch.dataSource(searchOptions)
            .then(mealPlanSearch.resultsHandler);
      };
   }

   function MealPlanSearch(searchInput, dataSource, resultsHandler) {
      this.dataSource = dataSource;
      this.resultsHandler = resultsHandler;

      this.clear = function () {
         searchInput.value = '';
      };

      searchInput.addEventListener('input', inputHandler(this));
   }

   global.MealPlanSearch = MealPlanSearch;
}(this));

(function (global) {
   'use strict';

   function createListItemFromTag(tag) {
      var listItem = global.mealPlanTemplate.createTemplate('editableTag'),
         name = listItem.getElementsByTagName('span')[0],
         removeButton = listItem.getElementsByTagName('button')[0];

      name.textContent = tag;

      removeButton.addEventListener('click', function () {
         listItem.parentNode.removeChild(listItem);
      });

      return listItem;
   }

   function getTagFromListItem(listItem) {
      var name = listItem.getElementsByTagName('span')[0];
      return name.textContent;
   }

   function TagsEditor() {
      var container = global.mealPlanTemplate.createTemplate('tagsEditor'),
         tagsList = container.getElementsByTagName('ul')[0],
         tagInput = container.getElementsByTagName('input')[0],
         addTagButton = container.getElementsByClassName('addButton')[0];

      this.getElement = function () {
         return container;
      };

      addTagButton.addEventListener('click', function () {
         var tag = tagInput.value.trim();
         tagsList.appendChild(createListItemFromTag(tag));

         tagInput.value = '';
         tagInput.focus();
      });
   }

   TagsEditor.prototype.getTags = function () {
      return Array.from(this.getElement().getElementsByTagName('li'))
         .map(getTagFromListItem);
   };

   TagsEditor.prototype.setTags = function (tags) {
      var tagsList = this.getElement().getElementsByTagName('ul')[0];
      Array.from(tagsList.childNodes).forEach(function (childNode) {
         tagsList.removeChild(childNode);
      });

      tags.forEach(function (tag) {
         tagsList.appendChild(createListItemFromTag(tag));
      });
   };

   global.TagsEditor = TagsEditor;
}(this));

(function (global, document) {
   'use strict';

   function createListItemFromRecipeUri(recipeUri) {
      var listItem = global.mealPlanTemplate.createTemplate('recipeReference'),
         reference = listItem.getElementsByTagName('span')[0],
         removeButton = listItem.getElementsByTagName('button')[0];

      reference.textContent = recipeUri;

      removeButton.addEventListener('click', function () {
         listItem.parentNode.removeChild(listItem);
      });

      return listItem;
   }

   function getRecipeUriFromListItem(listItem) {
      var reference = listItem.getElementsByTagName('span')[0];
      return reference.textContent;
   }

   function RecipeAggregator(aggregatorId) {
      var container = global.mealPlanTemplate.createTemplate('recipeAggregator'),
         recipeList = container.getElementsByTagName('ul')[0],
         dataList = container.getElementsByTagName('datalist')[0],
         recipeInput = container.getElementsByTagName('input')[0],
         addRecipeButton = container.getElementsByClassName('addButton')[0],
         mealPlanSearch;

      dataList.id = aggregatorId;
      recipeInput.setAttribute('list', dataList.id);

      function updateRecipeDataList(recipes) {
         dataList.textContent = '';

         recipes.forEach(function (recipe) {
            var option = document.createElement('option');
            option.id = recipe.id;
            option.value = recipe.title;
            dataList.appendChild(option);
         });
      }

      mealPlanSearch = new global.MealPlanSearch(
         recipeInput,
         global.mealPlanApi.getRecipes,
         updateRecipeDataList
      );

      this.getElement = function () {
         return container;
      };

      addRecipeButton.addEventListener('click', function () {
         if (recipeInput.checkValidity()) {
            var title = recipeInput.value.trim(),
               recipeUri = Array.from(dataList.options)
                  .find(function (option) {
                     return option.value === title;
                  }).id;

            recipeList.appendChild(createListItemFromRecipeUri(recipeUri));

            recipeInput.value = '';
            recipeInput.focus();
         }
      });
   }

   RecipeAggregator.prototype.getRecipeUris = function () {
      return Array.from(this.getElement().getElementsByTagName('li'))
         .map(getRecipeUriFromListItem);
   };

   RecipeAggregator.prototype.setRecipeUris = function (recipeUris) {
      var recipeList = this.getElement().getElementsByTagName('ul')[0];
      recipeList.textContent = '';

      recipeUris.forEach(function (recipeUri) {
         recipeList.appendChild(createListItemFromRecipeUri(recipeUri));
      });
   };

   global.RecipeAggregator = RecipeAggregator;
}(this, document));

(function (global) {
   'use strict';

   function isMobile(toggleElement) {
      return toggleElement.style.display !== 'none';
   }

   function MenuToggle(toggleElement) {
      this.toggleElement = toggleElement;
      this.menus = [];

      this.toggleElement.addEventListener('click', this.toggleMenus.bind(this));
   }

   MenuToggle.prototype.toggleMenus = function () {
      this.menus.forEach(function (menuElement) {
         menuElement.classList.toggle('hiddenMenu');
      });
   };

   MenuToggle.prototype.hideMenus = function () {
      if (isMobile(this.toggleElement)) {
         this.menus.forEach(function (menuElement) {
            menuElement.classList.add('hiddenMenu');
         });
      }
   };

   MenuToggle.prototype.registerMenu = function (menuElement) {
      this.menus.push(menuElement);
   };

   global.MenuToggle = MenuToggle;
}(this));

(function (global) {
   'use strict';

   function raiseEvent(tabsObject, tab) {
      var knownTab = tabsObject.tabs.find(function (knownTab) {
         return knownTab.tab === tab;
      });

      if (knownTab) {
         knownTab.handler.call();
      }
   }

   function Tabs(container, existingTabs) {
      this.container = container;
      this.tabs = existingTabs || [];

      var handledChanged = function (event) {
         raiseEvent(this, event.target.id);
      };

      this.container.addEventListener('change', handledChanged.bind(this));

      // Raise the event for the currently selected tab
      raiseEvent(this, this.getToggledTab());
   }

   Tabs.prototype.getToggledTab = function () {
      var toggledTab = this.container.querySelector('input:checked');
      if (toggledTab) {
         return toggledTab.id;
      }

      return null;
   };

   Tabs.prototype.registerTab = function (tab, handler) {
      var knownTab = this.tabs.find(function (knownTab) {
         return knownTab.tab === tab;
      });

      if (!knownTab) {
         this.tabs.push({
            tab: tab,
            handler: handler
         });
      }
   };

   global.Tabs = Tabs;
}(this));

(function (global) {
   'use strict';

   function createListItem(listing) {
      var listItem = document.createElement('li');
      listItem.textContent = listing.title;

      listItem.addEventListener('click', function () {
         if (listing.handler) {
            listing.handler.call(null, listing.data);
         }
      });

      return listItem;
   }

   function Listings(container) {
      this.container = container;
   }

   Listings.prototype.setListings = function (listings) {
      if (!Array.isArray(listings)) {
         throw new TypeError('expected array');
      }

      var listItems = listings.map(createListItem);

      this.clear();

      listItems.forEach(function (listItem) {
         this.container.appendChild(listItem);
      }, this);
   };

   Listings.prototype.clear = function () {
      this.container.textContent = '';
   };

   global.Listings = Listings;
}(this));

(function (global, document) {
   'use strict';

   function RecipeView(recipe, isPartOfPlan) {
      global.mealPlanEvents.EventTarget.call(this);

      this.view = global.mealPlanTemplate.createTemplate('displayRecipe');

      var instructions = this.view.getElementsByTagName('p')[0],
         editButton = this.view.getElementsByTagName('button')[0],
         ingredientsView = new global.IngredientsView(!isPartOfPlan),
         tags;

      this.view.getElementsByTagName('header')[0].textContent = recipe.title;

      instructions.innerHTML = recipe.instructionsHtml;

      ingredientsView.addIngredients(recipe.ingredients);
      this.view.insertBefore(ingredientsView.getElement(), instructions);

      if (recipe.tags) {
         tags = this.view.getElementsByClassName('tags')[0];

         recipe.tags.forEach(function (tag) {
            var listItem = document.createElement('li');
            listItem.textContent = tag;
            tags.appendChild(listItem);
         });
      }

      if (isPartOfPlan) {
         this.view.removeChild(editButton);
      } else {
         global.mealPlanApi.getMe().then(
            (function (me) {
               if (me.id === recipe.createdBy) {
                  editButton.addEventListener('click', (function () {
                     var event = new global.mealPlanEvents.Event('editRecipe');
                     event.recipe = recipe;
                     this.dispatchEvent(event);
                  }).bind(this));
               } else {
                  editButton.parentNode.removeChild(editButton);
               }
            }).bind(this),
            function (xhr) {
               editButton.parentNode.removeChild(editButton);
            }
         );
      }
   }

   RecipeView.prototype = Object.create(
      global.mealPlanEvents.EventTarget.prototype
   );
   RecipeView.prototype.constructor = RecipeView;

   global.RecipeView = RecipeView;
}(this, document));

(function (global) {
   'use strict';

   function RecipeEditView(recipe) {
      global.mealPlanEvents.EventTarget.call(this);

      this.view = global.mealPlanTemplate.createTemplate('editRecipe');

      var titleInput = this.view.getElementsByTagName('input')[0],
         instructions = this.view.getElementsByTagName('textarea')[0],
         submitButton = this.view.getElementsByTagName('button')[0],
         form = submitButton.form,
         ingredientsEditor = new global.IngredientsEditor(),
         tagsEditor = new global.TagsEditor(),
         getRecipe = function () {
            var title = titleInput.value.trim(),
               ingredients = ingredientsEditor.getIngredients(),
               instructionsText = instructions.value.trim(),
               tags = tagsEditor.getTags();

            return new global.mealPlanApi.Recipe(
               title,
               ingredients,
               instructionsText,
               tags
            );
         };

      form.insertBefore(ingredientsEditor.getElement(), instructions.parentNode);
      form.insertBefore(tagsEditor.getElement(), submitButton);

      if (recipe) {
         titleInput.value = recipe.title;
         instructions.textContent = recipe.instructions;
         ingredientsEditor.setIngredients(recipe.ingredients);

         if (recipe.tags) {
            tagsEditor.setTags(recipe.tags);
         }

         submitButton.textContent = 'Update';

         submitButton.addEventListener('click', (function () {
            if (submitButton.form.checkValidity()) {
               var event = new global.mealPlanEvents.Event('updateRecipe');
               event.recipe = getRecipe();
               event.recipe.id = recipe.id;

               this.dispatchEvent(event);
            }
         }).bind(this));
      } else {
         submitButton.textContent = 'Create';

         submitButton.addEventListener('click', (function () {
            if (submitButton.form.checkValidity()) {
               var event = new global.mealPlanEvents.Event('createRecipe');
               event.recipe = getRecipe();

               this.dispatchEvent(event);
            }
         }).bind(this));
      }

      form.addEventListener('submit', function (e) {
         e.preventDefault();
      });

      titleInput.focus();
   }

   RecipeEditView.prototype = Object.create(
      global.mealPlanEvents.EventTarget.prototype
   );
   RecipeEditView.prototype.constructor = RecipeEditView;

   global.RecipeEditView = RecipeEditView;
}(this));

(function (global, document) {
   'use strict';

   function getAllRecipesInPlan(plan) {
      var promises = plan.recipes.map(function (recipeUri) {
         return global.mealPlanApi.getRecipe(recipeUri);
      });

      return Promise.all(promises);
   }

   function PlanView(plan) {
      global.mealPlanEvents.EventTarget.call(this);

      this.view = global.mealPlanTemplate.createTemplate('displayPlan');
      var recipeTitles = this.view.getElementsByClassName('recipeTitles')[0],
         tags = this.view.getElementsByClassName('tags')[0],
         editButton = this.view.getElementsByTagName('button')[0],
         ingredientsView = new global.IngredientsView(true);

      this.view.getElementsByTagName('header')[0].textContent = plan.title;
      this.view.insertBefore(ingredientsView.getElement(), tags);

      getAllRecipesInPlan(plan).then((function (recipes) {
         recipes.forEach(function (recipe) {
            var listItem = document.createElement('li'),
               recipeView = new global.RecipeView(recipe, true);

            listItem.textContent = recipe.title;
            recipeTitles.appendChild(listItem);
            this.view.insertBefore(recipeView.view, tags);
            ingredientsView.addIngredients(recipe.ingredients);
         }, this);
      }).bind(this));

      if (plan.tags) {
         plan.tags.forEach(function (tag) {
            var listItem = document.createElement('li');
            listItem.textContent = tag;
            tags.appendChild(listItem);
         });
      }

      global.mealPlanApi.getMe().then(
         (function (me) {
            if (me.id === plan.createdBy) {
               editButton.addEventListener('click', (function () {
                  var event = new global.mealPlanEvents.Event('editPlan');
                  event.plan = plan;
                  this.dispatchEvent(event);
               }).bind(this));
            } else {
               editButton.parentNode.removeChild(editButton);
            }
         }).bind(this),
         function (xhr) {
            editButton.parentNode.removeChild(editButton);
         }
      );
   }

   PlanView.prototype = Object.create(
      global.mealPlanEvents.EventTarget.prototype
   );
   PlanView.prototype.constructor = PlanView;

   global.PlanView = PlanView;
}(this, document));

(function (global) {
   'use strict';

   function PlanEditView(plan) {
      global.mealPlanEvents.EventTarget.call(this);

      this.view = global.mealPlanTemplate.createTemplate('editPlan');

      var titleInput = this.view.getElementsByTagName('input')[0],
         submitButton = this.view.getElementsByTagName('button')[0],
         form = submitButton.form,
         recipeAggregator = new global.RecipeAggregator('aggregator'),
         getPlan = function () {
            var title = titleInput.value.trim(),
               recipeUris = recipeAggregator.getRecipeUris();

            return new global.mealPlanApi.Plan(
               title,
               recipeUris
            );
         };

      form.insertBefore(recipeAggregator.getElement(), submitButton);
      if (plan) {
         titleInput.value = plan.title;
         recipeAggregator.setRecipeUris(plan.recipes);

         submitButton.textContent = 'Update';

         submitButton.addEventListener('click', (function () {
            if (submitButton.form.checkValidity()) {
               var event = new global.mealPlanEvents.Event('updatePlan');
               event.plan = getPlan();
               event.plan.id = plan.id;

               this.dispatchEvent(event);
            }
         }).bind(this));
      } else {
         submitButton.textContent = 'Create';

         submitButton.addEventListener('click', (function () {
            if (submitButton.form.checkValidity()) {
               var event = new global.mealPlanEvents.Event('createPlan');
               event.plan = getPlan();

               this.dispatchEvent(event);
            }
         }).bind(this));
      }

      form.addEventListener('submit', function (e) {
         e.preventDefault();
      });

      titleInput.focus();
   }

   PlanEditView.prototype = Object.create(
      global.mealPlanEvents.EventTarget.prototype
   );
   PlanEditView.prototype.constructor = PlanEditView;

   global.PlanEditView = PlanEditView;
}(this));

(function (global) {
   'use strict';

   function createShoppingListListItem(shoppingList, shoppingListItem) {
      var listItem = global.mealPlanTemplate.createTemplate('shoppingListItem'),
         item = listItem.getElementsByTagName('span')[0],
         removeButton = listItem.getElementsByTagName('button')[0];

      item.textContent = shoppingListItem;

      removeButton.addEventListener('click', function () {
         var index = shoppingList.indexOf(shoppingListItem);
         shoppingList.splice(index, 1);
         removeButton.disabled = true;

         global.mealPlanApi.updateMyShoppingList(shoppingList).then(
            function () {
               listItem.parentNode.removeChild(listItem);
            },
            function (xhr) {
               alert(xhr);
               removeButton.disabled = false;
            }
         );
      });

      return listItem;
   }

   function ShoppingListView(shoppingList) {
      this.view = global.mealPlanTemplate.createTemplate('displayShoppingList');

      var list = this.view.getElementsByTagName('ul')[0],
         itemInput = this.view.getElementsByTagName('input')[0],
         addItemButton =
            this.view.getElementsByClassName('addToShoppingList')[0],
         clearShoppingListButton =
            this.view.getElementsByClassName('clearShoppingList')[0];

      shoppingList.forEach(function (shoppingListItem) {
         var listItem = createShoppingListListItem(
            shoppingList,
            shoppingListItem
         );

         list.appendChild(listItem);
      });

      addItemButton.addEventListener('click', function () {
         var item = itemInput.value.trim();
         if (item !== '') {
            itemInput.value = '';
            shoppingList.push(item);

            global.mealPlanApi.updateMyShoppingList(shoppingList).then(
               function () {
                  list.appendChild(createShoppingListListItem(
                     shoppingList,
                     item
                  ));
               },
               function (xhr) {
                  alert(xhr);
               }
            );
         }
      });

      clearShoppingListButton.addEventListener('click', function () {
         global.mealPlanApi.updateMyShoppingList([]).then(
            function () {
               list.textContent = '';
            },
            function (xhr) {
               alert(xhr);
            }
         );
      });
   }

   global.ShoppingListView = ShoppingListView;
}(this));

(function (global, document) {
   'use strict';

   document.addEventListener('DOMContentLoaded', function () {
      var tabs,
         existingTabs,
         search = new global.MealPlanSearch(
            document.getElementById('search'),
            global.mealPlanApi.getRecipes
         ),
         listings = new global.Listings(document.getElementById('listingRoot')),
         addItem = document.getElementById('addItem'),
         menuToggle = new global.MenuToggle(document.getElementById('menuIcon'));

      function setContent(content) {
         var contentNode = document.getElementById('content');
         contentNode.textContent = '';

         menuToggle.hideMenus();

         contentNode.appendChild(content);
      }

      function createTagListings(tags, handler) {
         var tagListings = tags.map(function (tag) {
            var tagName = tag.tag || '<untagged>';
            return {
               title: tagName + ' (' + tag.tagCount + ')',
               data: tag.tag,
               handler: handler
            };
         }).sort(function (a, b) {
            var result = 0;
            if (!b.data || (a.data < b.data)) {
               result = -1;
            } else if (!a.data || (a.data > b.data)) {
               result = 1;
            }

            return result;
         });

         listings.setListings(tagListings);
      }

      function displayRecipe(recipe) {
         var recipeView = new global.RecipeView(recipe, false);

         recipeView.addEventListener('editRecipe', function (event) {
            editRecipe(event.recipe);
         });

         setContent(recipeView.view);
      }

      function returnToRecipeView(recipe) {
         displayRecipe(recipe);
         showRecipeTags();
      }

      function displayPlan(plan) {
         var planView = new global.PlanView(plan);

         planView.addEventListener('editPlan', function (event) {
            editPlan(event.plan);
         });

         setContent(planView.view);
      }

      function returnToPlanView(plan) {
         displayPlan(plan);
         showPlanTags();
      }

      function displayShoppingList(shoppingList) {
         var shoppingListView = new global.ShoppingListView(shoppingList);
         setContent(shoppingListView.view);
      }

      function showShoppingList() {
         search.clear();
         listings.clear();
         global.mealPlanApi.getMyShoppingList().then(
            displayShoppingList
         );
      }

      function editPlan(plan) {
         var planEditView = new global.PlanEditView(plan);

         planEditView.addEventListener('createPlan', function (event) {
            global.mealPlanApi.createPlan(event.plan)
               .then(
                  returnToPlanView,
                  function (e) {
                     alert(e);
                  }
               );
         });

         planEditView.addEventListener('updatePlan', function (event) {
            global.mealPlanApi.updatePlan(event.plan.id, event.plan)
               .then(
                  returnToPlanView,
                  function (e) {
                     alert(e);
                  }
               );
         });

         setContent(planEditView.view);
      }

      function editRecipe(recipe) {
         var recipeEditView = new global.RecipeEditView(recipe);

         recipeEditView.addEventListener('createRecipe', function (event) {
            global.mealPlanApi.createRecipe(event.recipe)
               .then(
                  returnToRecipeView,
                  function (e) {
                     alert(e);
                  }
               );
         });

         recipeEditView.addEventListener('updateRecipe', function (event) {
            global.mealPlanApi.updateRecipe(event.recipe.id, event.recipe)
               .then(
                  returnToRecipeView,
                  function (e) {
                     alert(e);
                  }
               );
         });

         setContent(recipeEditView.view);
      }

      function setPlanListings(plans) {
         var planListings = plans.map(function (plan) {
            return {
               title: plan.title,
               data: plan,
               handler: displayPlan
            };
         }).sort(function (a, b) {
            var result = 0;
            if (a.title < b.title) {
               result = -1;
            } else if (a.title > b.title) {
               result = 1;
            }

            return result;
         });

         listings.setListings(planListings);
      }

      function showPlanListings(options) {
         global.mealPlanApi.getPlans(options).then(setPlanListings);
      }

      function setRecipeListings(recipes) {
         var recipeListings = recipes.map(function (recipe) {
            return {
               title: recipe.title,
               data: recipe,
               handler: displayRecipe
            };
         }).sort(function (a, b) {
            var result = 0;
            if (a.title < b.title) {
               result = -1;
            } else if (a.title > b.title) {
               result = 1;
            }

            return result;
         });

         listings.setListings(recipeListings);
      }

      function showRecipeListings(options) {
         global.mealPlanApi.getRecipes(options).then(setRecipeListings);
      }

      function handlePlanTagSelected(tag) {
         showPlanListings({tag: tag});
      }

      function handleRecipeTagSelected(tag) {
         showRecipeListings({tag: tag});
      }

      function showPlanTags() {
         search.clear();
         global.mealPlanApi.getPlanTags().then(
            function (tags) {
               createTagListings(tags, handlePlanTagSelected);
            }
         );
      }

      function showRecipeTags() {
         search.clear();
         global.mealPlanApi.getRecipeTags().then(
            function (tags) {
               createTagListings(tags, handleRecipeTagSelected);
            }
         );
      }

      function handlePlansTab() {
         showPlanTags();
         search.dataSource = global.mealPlanApi.getPlans;
         search.resultsHandler = setPlanListings;

         addItem.removeEventListener('click', function () {
            editRecipe();
         });
         addItem.addEventListener('click', function () {
            editPlan();
         });
      }

      function handleRecipesTab() {
         showRecipeTags();
         search.dataSource = global.mealPlanApi.getRecipes;
         search.resultsHandler = setRecipeListings;

         addItem.removeEventListener('click', function () {
            editPlan();
         });
         addItem.addEventListener('click', function () {
            editRecipe();
         });
      }

      function handleShoppingListTab() {
         showShoppingList();
      }

      existingTabs = [
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

      tabs = new global.Tabs(
         document.getElementById('mainNavigation'),
         existingTabs
      );

      menuToggle.registerMenu(tabs.container);
      menuToggle.registerMenu(document.getElementById('listing'));
   });
}(this, document));

function signinCallback(authResult) {
   'use strict';

   if (authResult.status.signed_in) {
      console.log('Setting Id token');
      mealPlanApi.setIdToken(authResult.id_token);

      console.log('Getting me');
      mealPlanApi.getMe().then(
         function (me) {
            console.log('Got me: ' + me);
         },
         function (xhr) {
            console.log('Got error: ' + xhr.responseText);
         }
      );

      gapi.client.load('oauth2', 'v2').then(
         function () {
            gapi.client.oauth2.userinfo.get({'fields': 'name'}).then(
               function (response) {
                  document.getElementById('signInButton').setAttribute('style', 'display: none');
                  document.getElementById('currentUser').innerHTML = 'Welcome ' + response.result.name;
               },
               function (reason) {
                  console.log('Error: ' + reason.result.error.message);
               }
            );
         }
      );
   } else {
      console.log('Sign-in state: ' + authResult.error);
   }
}
