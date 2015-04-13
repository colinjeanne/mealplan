<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', 'HomeController@getIndex');

Route::get('plan', 'PlanController@getPlans');
Route::post('plan', 'PlanController@createPlan');

Route::get('plan/tags', 'PlanController@getTags');

Route::get('plan/{plan}', [
   'as' => 'plans.get',
   'uses' => 'PlanController@getPlan']);

Route::put('plan/{plan}', 'PlanController@updatePlan');
Route::delete('plan/{plan}', 'PlanController@deletePlan');

Route::get('recipe', [
   'as' => 'recipes.getAll',
   'uses' => 'RecipeController@getRecipes']);
Route::post('recipe', 'RecipeController@createRecipe');

Route::get('recipe/tags', 'RecipeController@getTags');

Route::get('recipe/{recipe}', [
   'as' => 'recipes.get',
   'uses' => 'RecipeController@getRecipe']);

Route::put('recipe/{recipe}', 'RecipeController@updateRecipe');
Route::delete('recipe/{recipe}', 'RecipeController@deleteRecipe');

Route::get('user', 'UserController@getUsers');
Route::get('user/{user}', [
   'as' => 'users.get',
   'uses' => 'UserController@getUser']);
   
Route::get('me', 'UserController@getMe');
Route::get('me/shoppingList', 'UserController@getMyShoppingList');
Route::put('me/shoppingList', 'UserController@updateMyShoppingList');
Route::get('me/ideas', 'UserController@getMyIdeas');
Route::put('me/ideas', 'UserController@updateMyIdeas');
