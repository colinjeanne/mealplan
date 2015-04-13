<?php namespace MealPlan\Http\Middleware;

use Closure;
use Log;

class ShoppingListValidationMiddleware {
   public function handle($request, Closure $next)
   {
      if (!$request->isJson()) {
         abort(415);
      }
      
      Log::info('Validating shopping list');
      
      $input = $request->all();
      if (!is_array($input)) {
         return response('Bad Request', 400)
            ->header('Content-Type', 'application/json')
            ->setContent(['Shopping list must be an array of list items']);
      }
      
      $keys = array_keys($input);
      for ($i = 0; $i < count($keys); ++$i) {
         if ($keys[$i] !== $i) {
            return response('Bad Request', 400)
               ->header('Content-Type', 'application/json')
               ->setContent(['Shopping list must be an array of list items']);
         }
      }
      
      foreach ($input as $listItem) {
         if (!is_string($listItem)) {
            return response('Bad Request', 400)
               ->header('Content-Type', 'application/json')
               ->setContent(['Shopping list item must be a string']);
         }
      }
      
      return $next($request);
   }
}
