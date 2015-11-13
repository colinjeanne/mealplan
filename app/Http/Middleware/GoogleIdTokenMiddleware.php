<?php namespace MealPlan\Http\Middleware;

use Auth;
use Closure;
use Log;
use Session;

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
        if ($authorization) {
            Log::info(
                'Authorization header is present',
                ['header' => $authorization]
            );
         
            $authInfo = explode(' ', $authorization);
            if ((count($authInfo) === 2) && ($authInfo[0] === 'google-id-token')) {
                $idToken = $authInfo[1];
            
                if (Auth::once(['idToken' => $idToken])) {
                    Log::info('Successfully authenticated with ID token');
                    return $next($request);
                }
            }
        } elseif (Session::has('accessToken')) {
            Log::info('Attempting authorization with access token');
            if (Auth::once(['accessToken' => Session::get('accessToken')])) {
                Log::info('Successfully authenticated with access token');
                return $next($request);
            }
        }
      
        $response = response('Unauthorized', 401)
            ->header('WWW-Authenticate', 'google-id-token');
        return $response;
    }
}
