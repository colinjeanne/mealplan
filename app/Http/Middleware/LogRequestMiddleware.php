<?php namespace MealPlan\Http\Middleware;

use Closure;
use Illuminate\Contracts\Routing\TerminableMiddleware;
use Log;

class LogRequestMiddleware implements TerminableMiddleware
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
        Log::info(
            'Beginning request',
            [
                'time' => microtime(true),
                'method' => $request->method(),
                'uri' => $request->url()
            ]
        );

        return $next($request);
    }

    public function terminate($request, $response)
    {
        Log::info(
            'Ending request',
            [
                'time' => microtime(true),
                'status' => $response->getStatusCode()
            ]
        );
    }
}
