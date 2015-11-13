<?php namespace MealPlan\Http\Controllers;

use Google_Client;
use Google_Service_Oauth2;
use Illuminate\Http\Request;
use Log;
use Session;

class HomeController extends Controller
{
    public function getIndex()
    {
        $viewData = [
            'authenticated' => 'false',
            'clientId' => env('GOOGLE_CLIENT_ID', 'fail'),
            'givenName' => ''
        ];
        
        if (Session::has('accessToken')) {
            Log::info('Access token present, getting given name');
            
            $googleClient = new Google_Client();
            $googleClient->setClientId(env('GOOGLE_CLIENT_ID', 'fail'));
            $googleClient->setClientSecret(env('GOOGLE_CLIENT_SECRET', 'fail'));
            
            try {
                $googleClient->setAccessToken(Session::get('accessToken'));
                $oauth2 = new Google_Service_Oauth2($googleClient);
                $userInfo = $oauth2->userinfo_v2_me->get();
                $viewData['authenticated'] = 'true';
                $viewData['givenName'] = $userInfo->getGivenName();
            } catch (Exception $e) {
                // Clear the session variable - the access token is probably
                // invalid now.
                Log::info('Failed to get given name', ['exception' => $e]);
                Session::forget('accessToken');
            }
        }
        return view('home', $viewData);
    }
    
    public function oauth(Request $request)
    {
        $googleClient = new Google_Client();
        $googleClient->setClientId(env('GOOGLE_CLIENT_ID', 'fail'));
        $googleClient->setClientSecret(env('GOOGLE_CLIENT_SECRET', 'fail'));
        $googleClient->setRedirectUri(route('oauth'));
        
        if ($request->has('code')) {
            Log::info('Retrieved code from callback');
            $code = $request->input('code');
            $googleClient->authenticate($code);
            Session::put('accessToken', $googleClient->getAccessToken());
            return redirect('/');
        } else {
            Log::info('Starting OAuth2 authentication');
            $googleClient->addScope(Google_Service_OAuth2::USERINFO_PROFILE);
            $authUrl = $googleClient->createAuthUrl();
            return redirect($authUrl);
        }
    }
}
