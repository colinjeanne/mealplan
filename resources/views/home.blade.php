<!doctype html>
<html>
<head>
   <title>Kathy's Meal Plan Site</title>
   <link rel="stylesheet" href="style.css">
   <script src="es6-shim.js"></script>
   <script src="es6-symbol.js"></script>
   <script src="fetch.js"></script>
   <script src="main.js"></script>
   <script src="https://apis.google.com/js/platform.js" async defer></script>
   <meta charset="utf-8">
   <meta name="google-signin-client_id" content="{!! $clientId !!}">
   <meta name="authenticated" content="{!! $authenticated !!}">
   <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
   <header>
      <button type="button" id="menuIcon"><img src="menu.svg"></button>
      Kathy's Meal Plan Site
      <span id="userContainer">
         <span id="currentUser">{!! $givenName !!}</span>
         <a href="/oauth" id="mobileLogin">Login with Google</a>
         <span id="signInButton">
            <div
               class="g-signin2"
               data-onsuccess="signinSucceeded"
               data-onfailure="singinFailed"></div>
         </span>
      </span>
   </header>
   <nav id="mainNavigation">
      <ul>
         <li>
            <input type="radio" name="tab" id="plans" checked>
            <label for="plans">Meal Plans</label>
         </li><li>
            <input type="radio" name="tab" id="recipes">
            <label for="recipes">Recipes</label>
         </li><li>
            <input type="radio" name="tab" id="sousVide">
            <label for="sousVide">Sous Vide</label>
         </li><li data-template-name="mainNavigationTab">
            <input type="radio" name="tab">
            <label></label>
         </li></ul>
   </nav>
   <nav id="listing">
      <input type="search" id="search" placeholder="Search">
      <ul id="listingRoot">
      </ul>
   </nav>
   <section id="content"></section>
   <ol class="contentList" data-template-name="contentList">
      <li data-template-name="contentListItem">
         <span class="mainLine"></span>
         <span class="detail"></span>
      </li>
   </ol>
   <section data-template-name="ingredientsView">
      <ul class="ingredients">
         <li data-template-name="ingredientItem">
            <input type="checkbox" name="includeInShoppingList">
            <span></span>
         </li>
      </ul>
      <button type="button">Add to shopping list</button>
   </section>
   <section data-template-name="ingredientsEditor">
      <ul class="ingredients">
         <li data-template-name="editableIngredient">
            <label>
               In shopping list
               <input
                  type="checkbox"
                  name="includeInShoppingList"
                  class="shoppable">
            </label>
            <input spellcheck class="description">
            <button type="button">X</button>
         </li>
      </ul>
      <label>
         Ingredients
         <textarea class="rawIngredients" spellcheck autocomplete></textarea>
      </label>
   </section>
   <section data-template-name="tagsEditor">
      <ul class="tags">
         <li data-template-name="editableTag">
            <span></span>
            <button type="button">X</button>
         </li>
      </ul>
      <input spellcheck>
      <button type="button" class="addButton">Add Tag</button>
   </section>
   <section data-template-name="recipeAggregator">
      <ul class="recipeList">
         <li data-template-name="recipeReference">
            <span></span>
            <button type="button">X</button>
         </li>
      </ul>
      <input list="dummy">
      <datalist id="dummy"></datalist>
      <button type="button" class="addButton">Add Recipe</button>
   </section>
   <section data-template-name="displayRecipe" class="recipe">
      <button type="button">Back</button>
      <header></header>
      <p></p>
      <ul class="tags"></ul>
      <button type="button">Edit</button>
   </section>
   <section data-template-name="editRecipe" class="recipe">
      <button type="button">Back</button>
      <form>
         <header>
            <label>
               Title
               <input required spellcheck placeholder="Title">
            </label>
         </header>
         <label>
            Instructions
            <textarea required spellcheck placeholder="Instructions"></textarea>
         </label>
         <button type="submit"></button>
      </form>
   </section>
   <section data-template-name="displayPlan" class="plan">
      <button type="button">Back</button>
      <header></header>
      <section>
         <header>Recipes In This Plan</header>
         <ul class="recipeTitles"></ul>
      </section>
      <ul class="tags"></ul>
      <button type="button">Edit</button>
   </section>
   <section data-template-name="editPlan" class="plan">
      <button type="button">Back</button>
      <form>
         <header>
            <label>
               Title
               <input required spellcheck placeholder="Title">
            </label>
         </header>
         <button type="submit"></button>
      </form>
   </section>
   <section data-template-name="displayShoppingList" class="shoppingList">
      <header>My Shopping List</header>
      <ul>
         <li data-template-name="shoppingListItem">
            <span></span>
            <button type="button">X</button>
         </li>
      </ul>
      <input spellcheck>
      <button type="button" class="addToShoppingList">Add Item</button>
      <button type="button" class="clearShoppingList">Remove all</button>
   </section>
   <section data-template-name="displayIdeas" class="ideas">
      <header></header>
      <ul>
         <li data-template-name="ideaListItem">
            <button type="button">X</button>
            <p class="idea"></p>
            <p class="ideaSource"></p>
         </li>
      </ul>
   </section>
   <section data-template-name="addIdea" class="addIdea">
      <header>Add an Idea</header>
      <label>
         The Idea
         <textarea
            cols="40"
            rows="5"
            required
            spellcheck
            placeholder="What's your idea?"></textarea>
      </label>
      <label>
         Source
         <input list="ideaDummy" spellcheck placeholder="What inspired you?">
         <datalist id="ideaDummy">
      </label>
      <button type="submit">Add Idea</button>
   </section>
   <section data-template-name="displaySousVide" class="sousVide">
      <header>Temperatures</header>
      <dl>
         <dt>Pulled Pork</dt>
         <dd>24 hours at 70&deg;C</dd>
         <dt>Pork Belly</dt>
         <dd>12 - 24 hours at 77&deg;C</dd>
         <dt>Chicken</dt>
         <dd>
            60 - 90 minutes at 61&deg;C, time varies according to the thickness
            of the meat
         </dd>
         <dt>Beef</dt>
         <dd>90 minutes at 59&deg;C for medium rare</dd>
         <dt>Eggs</dt>
         <dd>1 hour at 63&deg;C for semi-solid center</dd>
         <dt>Fish</dt>
         <dd>40 minutes at 50&deg;C for medium rare</dd>
         <dt>Shrimp</dt>
         <dd>30 minutes at 58&deg;C for medium</dd>
      </dl>
   </section>
</body>
</html>
