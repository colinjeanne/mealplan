import * as mealPlanApi from './../src/api/api.js';

describe('The Meal Plan API', function () {
   it('can start new sessions', function () {
      const idTokenCallback = jasmine.createSpy('idTokenCallback').and.returnValue(1);

      mealPlanApi.startSession(idTokenCallback);

      expect(mealPlanApi.currentSession).toBeDefined();
      expect(idTokenCallback).toHaveBeenCalled();
   });

   it('can forget old sessions', function () {
      const firstSessionCallback = jasmine.createSpy('first session').and.returnValue(1);
      const secondSessionCallback = jasmine.createSpy('second session').and.returnValue(2);

      mealPlanApi.startSession(firstSessionCallback);
      firstSessionCallback.calls.reset();

      mealPlanApi.startSession(secondSessionCallback);

      expect(mealPlanApi.currentSession).toBeDefined();
      expect(firstSessionCallback).not.toHaveBeenCalled();
      expect(secondSessionCallback).toHaveBeenCalled();
   });
});

describe('An Ingredient', function () {
   it('must have a description string', function () {
      expect(() => new mealPlanApi.Ingredient()).toThrow();
      expect(() => new mealPlanApi.Ingredient(1)).toThrow();

      const ingredient = new mealPlanApi.Ingredient('description');
      expect(ingredient.description).toBe('description');
   });

   it('is added to shopping lists by default', function () {
      const ingredient = new mealPlanApi.Ingredient('description');
      expect(ingredient.shoppable).toBe(true);
   });

   it('may be explicitly added shopping lists', function () {
      expect(() => new mealPlanApi.Ingredient('description', 1)).toThrow();

      const ingredient = new mealPlanApi.Ingredient('description', true);
      expect(ingredient.shoppable).toBe(true);
   });

   it('may be explicitly not added shopping lists', function () {
      expect(() => new mealPlanApi.Ingredient('description', 0)).toThrow();

      const ingredient = new mealPlanApi.Ingredient('description', false);
      expect(ingredient.shoppable).toBe(false);
   });
});

describe('A Recipe', function () {
   it('must have a string title', function () {
      const ingredients = [new mealPlanApi.Ingredient('description')];

      expect(() => 
         new mealPlanApi.Recipe(1, ingredients, 'instructions')).toThrow();

      const recipe = new mealPlanApi.Recipe(
         'title',
         ingredients,
         'instructions');

      expect(recipe.title).toBe('title');
   });

   it('must have an array of ingredients', function () {
      expect(() => 
         new mealPlanApi.Recipe(
            'title',
            1,
            'instructions')).toThrow();

      expect(() => 
         new mealPlanApi.Recipe(
            'title',
            [],
            'instructions')).toThrow();

      expect(() => 
         new mealPlanApi.Recipe(
            'title',
            [1],
            'instructions')).toThrow();

      const ingredients = [new mealPlanApi.Ingredient('description')];
      const recipe = new mealPlanApi.Recipe(
         'title',
         ingredients,
         'instructions');
      
      expect(recipe.ingredients.length).toBe(1);
      expect(recipe.ingredients[0].description).toBe('description');
   });

   it('must have a string instructions', function () {
      const ingredients = [new mealPlanApi.Ingredient('description')];

      expect(() => new mealPlanApi.Recipe('title', ingredients, 1)).toThrow();

      const recipe = new mealPlanApi.Recipe(
         'title',
         ingredients,
         'instructions');

      expect(recipe.instructions).toBe('instructions');
   });

   it('has no tags by default', function () {
      const ingredients = [new mealPlanApi.Ingredient('description')];
      const recipe = new mealPlanApi.Recipe(
         'title',
         ingredients,
         'instructions');
      
      expect(recipe.tags.length).toBe(0);
   });

   it('may have an array of tags', function () {
      const ingredients = [new mealPlanApi.Ingredient('description')];

      expect(() => 
         new mealPlanApi.Recipe(
            'title',
            ingredients,
            'instructions',
            1)).toThrow();

      expect(() => 
         new mealPlanApi.Recipe(
            'title',
            ingredients,
            'instructions',
            [1])).toThrow();

      const recipe = new mealPlanApi.Recipe(
         'title',
         ingredients,
         'instructions',
         ['tag']);
      
      expect(recipe.tags.length).toBe(1);
      expect(recipe.tags[0]).toBe('tag');
   });
});

describe('A Plan', function () {
   it('must have a string title', function () {
      expect(() => new mealPlanApi.Plan(1, ['1'])).toThrow();

      const plan = new mealPlanApi.Plan('title', ['1']);
      expect(plan.title).toBe('title');
   });

   it('must have an array of recipe Ids', function () {
      expect(() => new mealPlanApi.Plan('title')).toThrow();
      expect(() => new mealPlanApi.Plan('title', [])).toThrow();
        expect(() => new mealPlanApi.Plan('title', [1])).toThrow();

      const plan = new mealPlanApi.Plan('title', ['recipe Id']);
      
      expect(plan.recipes.length).toBe(1);
      expect(plan.recipes[0]).toBe('recipe Id');
   });
});
