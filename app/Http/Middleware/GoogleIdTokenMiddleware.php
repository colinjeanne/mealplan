<?php namespace MealPlan\Http\Middleware;

use Auth;
use Closure;
use Log;

class GoogleIdTokenMiddleware
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
        Log::info('Attempting Id token authorization');
      
        $authorization = $request->header('Authorization');
        if ($authorization !== null) {
            Log::info(
                'Authorization header is present',
                ['header' => $authorization]
            );
         
            $authInfo = explode(' ', $authorization);
            if ((count($authInfo) === 2) && ($authInfo[0] === 'google-id-token')) {
                $idToken = $authInfo[1];
            
                if (Auth::once(['idToken' => $idToken])) {
                    Log::info('Successfully authenticated');
                    return $next($request);
                }
            }
        }
      
        $response = response('Unauthorized', 401)
            ->header('WWW-Authenticate', 'google-id-token');
        return $response;
    }
}
