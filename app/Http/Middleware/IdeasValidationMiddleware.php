<?php namespace MealPlan\Http\Middleware;

use Closure;
use Log;

class IdeasValidationMiddleware
{
    public function handle($request, Closure $next)
    {
        if (!$request->isJson()) {
            abort(415);
        }
      
        Log::info('Validating ideas');
      
        $input = $request->all();
        Log::info($input);
        if (!is_array($input)) {
            return response('Bad Request', 400)
                ->header('Content-Type', 'application/json')
                ->setContent(['Ideas must be an array of idea items']);
        }
      
        $keys = array_keys($input);
        for ($i = 0; $i < count($keys); ++$i) {
            if ($keys[$i] !== $i) {
                return response('Bad Request', 400)
                    ->header('Content-Type', 'application/json')
                    ->setContent(['Ideas must be an array of idea items']);
            }
        }
      
        foreach ($input as $listItem) {
            if (!is_array($listItem)) {
                return response('Bad Request', 400)
                    ->header('Content-Type', 'application/json')
                    ->setContent(['Idea item must be an object']);
            }

            $unknownProperties = array_diff(
                array_keys($listItem),
                ['description', 'source']
            );
            if (!empty($unknownProperties)) {
                return response('Bad Request', 400)
                    ->header('Content-Type', 'application/json')
                    ->setContent(
                        array_merge(
                            ['Idea item contains unknown properties'],
                            $unknownProperties
                        )
                    );
            }

            if (!array_key_exists('description', $listItem)) {
                return response('Bad Request', 400)
                    ->header('Content-Type', 'application/json')
                    ->setContent(['Idea item must have a description']);
            }

            if (!is_string($listItem['description'])) {
                return response('Bad Request', 400)
                    ->header('Content-Type', 'application/json')
                    ->setContent(['Idea description must be a string']);
            }

            if (empty($listItem['description'])) {
                return response('Bad Request', 400)
                    ->header('Content-Type', 'application/json')
                    ->setContent(['Idea description must be non-empty']);
            }

            if (array_key_exists('source', $listItem)) {
                if (!is_string($listItem['source'])) {
                    return response('Bad Request', 400)
                        ->header('Content-Type', 'application/json')
                        ->setContent(['Idea source must be a string']);
                }

                if (empty($listItem['source'])) {
                    return response('Bad Request', 400)
                        ->header('Content-Type', 'application/json')
                        ->setContent(['Idea source must be non-empty']);
                }
            }
        }
      
        return $next($request);
    }
}
