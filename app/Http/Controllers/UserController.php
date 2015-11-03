<?php namespace MealPlan\Http\Controllers;

use Illuminate\Http\Request;
use MealPlan\Ideas;
use MealPlan\ShoppingList;
use MealPlan\User;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(
            'google-id-token',
            ['only' => [
                'getMe',
                'getMyShoppingList',
                'updateMyShoppingList',
                'getMyIdeas',
                'updateMyIdeas'
            ]]
        );
      
        $this->middleware(
            'shoppingList',
            ['only' => [
                'updateMyShoppingList'
            ]]
        );

        $this->middleware(
            'ideas',
            ['only' => [
                'updateMyIdeas'
            ]]
        );
    }
   
    public function getUsers()
    {
        return response(204);
    }
   
    public function getUser(User $user)
    {
        return response()->json(self::userToJson($user));
    }
   
    public function getMe(Request $request)
    {
        return response()->json(self::userToJson($request->user()));
    }
   
    public function getMyShoppingList(Request $request)
    {
        $shoppingList = $request->user()->shoppingList;
        if (!$shoppingList) {
            $shoppingListJson = [];
        } else {
            $shoppingListJson = self::shoppingListToJson($shoppingList);
        }

        return response()->json($shoppingListJson);
    }
   
    public function updateMyShoppingList(Request $request)
    {
        $items = $request->all();
      
        $shoppingList = ShoppingList::firstOrNew(['user_id' => $request->user()->id]);
        $shoppingList->items = json_encode($items);
        $shoppingList->user()->associate($request->user());
        $shoppingList->save();
      
        return response()->json($items);
    }

    public function getMyIdeas(Request $request)
    {
        $ideas = $request->user()->ideas;
        if (!$ideas) {
            $ideasJson = [];
        } else {
            $ideasJson = self::ideasToJson($ideas);
        }

        return response()->json($ideasJson);
    }
   
    public function updateMyIdeas(Request $request)
    {
        $items = $request->all();
      
        $ideas = Ideas::firstOrNew(['user_id' => $request->user()->id]);
        $ideas->items = json_encode($items);
        $ideas->user()->associate($request->user());
        $ideas->save();
      
        return response()->json($items);
    }
   
    private static function userToJson(User $user)
    {
        $userJson = [];
        $userJson['id'] = route('users.get', ['user' => $user]);
      
        return $userJson;
    }
   
    private static function shoppingListToJson(ShoppingList $shoppingList)
    {
        return json_decode($shoppingList->items, true);
    }

    private static function ideasToJson(Ideas $ideas)
    {
        return json_decode($ideas->items, true);
    }
}
