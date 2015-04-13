<?php namespace MealPlan\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel {

   /**
    * The application's global HTTP middleware stack.
    *
    * @var array
    */
   protected $middleware = [
      'Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode',
      'Illuminate\Cookie\Middleware\EncryptCookies',
      'Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse',
      'Illuminate\Session\Middleware\StartSession',
      'Illuminate\View\Middleware\ShareErrorsFromSession',
      'MealPlan\Http\Middleware\LogRequestMiddleware',
   ];

   /**
    * The application's route middleware.
    *
    * @var array
    */
   protected $routeMiddleware = [
      'auth' => 'MealPlan\Http\Middleware\Authenticate',
      'auth.basic' => 'Illuminate\Auth\Middleware\AuthenticateWithBasicAuth',
      'csrf' => 'MealPlan\Http\Middleware\VerifyCsrfToken',
      'google-id-token' => 'MealPlan\Http\Middleware\GoogleIdTokenMiddleware',
      'guest' => 'MealPlan\Http\Middleware\RedirectIfAuthenticated',
      'plan' => 'MealPlan\Http\Middleware\PlanValidationMiddleware',
      'recipe' => 'MealPlan\Http\Middleware\RecipeValidationMiddleware',
      'shoppingList' => 'MealPlan\Http\Middleware\ShoppingListValidationMiddleware',
      'ideas' => 'MealPlan\Http\Middleware\IdeasValidationMiddleware',
   ];

}
