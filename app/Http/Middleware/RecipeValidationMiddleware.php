<?php namespace MealPlan\Http\Middleware;

use Closure;
use Log;
use Validator;

class RecipeValidationMiddleware {

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
      if (!$request->isJson()) {
         abort(415);
      }
      
      Log::info('Validating recipe');
      
      $recipeValidationRules = [
         'title' => 'required|min:1|max:100',
         'instructions' => 'required|min:1',
         'ingredients' => 'required|array',
         'tags' => 'array'
      ];
      
      $input = $request->all();
      $validator = Validator::make($input, $recipeValidationRules);
      if ($validator->fails()) {
         return response('Bad Request', 400)
            ->header('Content-Type', 'application/json')
            ->setContent($validator->messages());
      } else {
         Log::info('Validating ingredients');
         
         $ingredientValidationRules = [
            'description' => 'required|min:1|max:255',
            'shoppable' => 'boolean'
         ];
         
         $ingredients = $input['ingredients'];
         foreach ($ingredients as $ingredient) {
            if (is_array($ingredient)) {
               $validator = Validator::make(
                  $ingredient,
                  $ingredientValidationRules);
               if ($validator->fails()) {
                  return response('Bad Request', 400)
                     ->header('Content-Type', 'application/json')
                     ->setContent($validator->messages());
               }
            } else {
               return response('Bad Request', 400)
                     ->header('Content-Type', 'application/json')
                     ->setContent('ingredient must be an object');
            }
         }
      }
      
		return $next($request);
	}
}
