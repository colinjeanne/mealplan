<?php namespace MealPlan\Http\Middleware;

use Closure;
use Log;
use Validator;

class PlanValidationMiddleware
{

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
      
        Validator::extend('not_exists', function ($attribute, $value, $parameters) {
            return false;
        });

        Log::info('Validating plan');
      
        $planValidationRules = [
            'title' => 'required|min:1|max:100',
            'recipes' => 'required|array'
        ];
      
        $input = $request->all();
        $validator = Validator::make($input, $planValidationRules);
        if ($validator->fails()) {
            return response('Bad Request', 400)
                ->header('Content-Type', 'application/json')
                ->setContent($validator->messages());
        } else {
            $recipePathRegex = '#^/recipe/[1-9]\d*$#';
            $recipeValidationRules = [
                'path' => 'required|regex:' . $recipePathRegex,
                'query' => 'not_exists',
                'fragment' => 'not_exists'
            ];
         
            $recipes = $input['recipes'];
            foreach ($recipes as $recipe) {
                $parsed = parse_url($recipe);
                $validator = Validator::make($parsed, $recipeValidationRules);
                if ($validator->fails()) {
                    return response('Bad Request', 400)
                        ->header('Content-Type', 'application/json')
                        ->setContent($validator->messages());
                }
            }
        }
      
        return $next($request);
    }
}
