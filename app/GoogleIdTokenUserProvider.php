<?php namespace MealPlan;

use DB;
use Cache;
use Carbon\Carbon;
use Google_Client;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider;
use Log;
use Validator;

class GoogleIdTokenUserProvider implements UserProvider
{
    /**
     * Separates the claim issuer from the user Id relative to the issuer. The
     * issuer member of an Id token is a URL which does not contain either a
     * query string or a fragment identifier. This separator, therefore, cannot
     * occur within the issuer URL.
     */
    const CLAIM_SEPARATOR = '#';
   
    /**
     * The client used to talk to the Google API
     *
     * @var Google_Client
     */
    private $googleClient;
   
    public function __construct()
    {
        $this->googleClient = new Google_Client;
        $this->googleClient->setClientId(env('GOOGLE_CLIENT_ID', 'fail'));
        $this->googleClient->setClientSecret(env('GOOGLE_CLIENT_SECRET', 'fail'));
      
        Log::info('GoogleIdTokenUserProvider initialized');
    }
   
    public function retrieveById($identifier)
    {
        Log::info('Retrieving user by Id', ['id' => $identifier]);
        return User::find($identifier);
    }

    public function retrieveByToken($identifier, $token)
    {
        Log::info('Retrieving a user from their remember me token');
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        Log::info('Updating remember me token');
    }

    /**
     * Retrieve a user by the given credentials.
     *
     * @param  array  $credentials
     * @return \Illuminate\Auth\UserInterface|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        Log::info('Retrieving user by credentials');
      
        $userId = $this->getUserIdFromCredentials($credentials);
        Log::info('Retrieved user Id', ['id' => $userId]);
      
        // Find user, if not found create it
        $user = $this->retrieveById($userId);
        if ($user === null) {
            Log::info('User not found, beginning creation process');
         
            $idToken = $this->getIdTokenFromCredentials($credentials);
            if ($idToken === null) {
                return null;
            }
         
            $token = $this->googleClient->verifyIdToken($idToken);
            $payload = $token->getAttributes()['payload'];
            $claimData = $this->convertIdTokenToClaim($payload);
         
            Log::info(
                'Retrieved claim data from credentials',
                ['claimData' => $claimData]
            );
         
            // Attempt to get the claim, if it exists. Then recreate the user. If
            // the claim does not exist create the claim and the user
            $claim = Claim::find($claimData);
         
            if ($claim === null) {
                // Create claim and user
                Log::info('Claim not found, creating the claim and user');
            
                DB::transaction(function () use (&$user, $claimData) {
                    $user = User::create([]);
                    $claim = new Claim(['id' => $claimData]);
                    $claim->user()->associate($user);
                    $claim->save();
                });
            
                Log::info('User and claim created', ['userId' => $user->id]);
            } else {
                // Create user and update claim
                Log::info('Claim found, retrieving the user');
            
                $user = $claim->user;
            }
        }
      
        return $user;
    }

    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        Log::info(
            'Validating credentials for user',
            ['id' => $user->getAuthIdentifier()]
        );
      
        $userId = $this->getUserIdFromCredentials($credentials);
        return $user->getAuthIdentifier() === $userId;
    }
   
    /**
     * Retrieves the Google Id token from the credentials
     *
     * @param  array  $credentials
     * @return string|null
     */
    private function getIdTokenFromCredentials(array $credentials)
    {
        Log::info('Getting Id token from credentials');
        
        if (array_key_exists('accessToken', $credentials)) {
            $this->googleClient->setAccessToken($credentials['accessToken']);
            $decoded = json_decode($this->googleClient->getAccessToken(), true);
            if (array_key_exists('id_token', $decoded)) {
                $credentials['idToken'] = $decoded['id_token'];
            }
        }
        
        $validator = Validator::make($credentials, ['idToken' => 'required']);
        if ($validator->fails()) {
            Log::info('Credentials are missing idToken');
            return null;
        }
        
        return $credentials['idToken'];
    }
   
    /**
     * Retrieves a user Id from the given credentials.
     *
     * @param  array  $credentials
     * @return string|null
     */
    private function getUserIdFromCredentials(array $credentials)
    {
        Log::info('Getting user Id from credentials');
      
        $idToken = $this->getIdTokenFromCredentials($credentials);
        if ($idToken === null) {
            return null;
        }
      
        if (Cache::has($idToken)) {
            Log::info('Retrieved Id token from cache');
            $userId = Cache::get($idToken);
        } else {
            // Validate the Id token, add the token to the cache, and retrieve the
            // user Id
            Log::info('Id token not in cache, verify and get user Id');
         
            $token = $this->googleClient->verifyIdToken($idToken);
            $payload = $token->getAttributes()['payload'];
            $claimData = $this->convertIdTokenToClaim($payload);
         
            Log::info(
                'Retrieved claim data from credentials',
                ['claimData' => $claimData]
            );
         
            $claim = Claim::find($claimData);
            if ($claim !== null) {
                $userId = $claim->user->id;
         
                Log::info(
                    'Retrieved userId from credentials',
                    ['userId' => $userId]
                );
            } else {
                Log::info('Claim not found', ['claimData' => $claimData]);
                $userId = null;
            }
        }
      
        // Update the cache so that the Id token is available for another 10
        // minutes.
        Cache::put($idToken, $userId, Carbon::now()->addMinutes(10));
      
        return $userId;
    }
   
    /**
     * Converts an Id token to a claim
     *
     * @param  array  $idToken
     * @return string
     */
    private function convertIdTokenToClaim(array $idToken)
    {
        return $idToken['iss'] .
            self::CLAIM_SEPARATOR .
            $idToken['sub'];
    }
}
