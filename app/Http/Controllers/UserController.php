<?php namespace MealPlan\Http\Controllers;

use Illuminate\Http\Request;
use MealPlan\ShoppingList;
use MealPlan\User;

class UserController extends Controller {
   public function __construct() {
		$this->middleware(
         'google-id-token',
         ['only' => [
            'getMe',
            'getMyShoppingList',
            'updateMyShoppingList'
         ]]);
      
      $this->middleware(
         'shoppingList',
         ['only' => [
            'updateMyShoppingList'
         ]]);
	}
   
	public function getUsers() {
		return response(204);
	}
   
   public function getUser(User $user) {
      return response()->json(self::userToJson($user));
   }
   
   public function getMe(Request $request) {
      return response()->json(self::userToJson($request->user()));
   }
   
   public function getMyShoppingList(Request $request) {
      $shoppingList = $request->user()->shoppingList;
      if (!$shoppingList) {
         $shoppingListJson = [];
      } else {
         $shoppingListJson = self::shoppingListToJson($shoppingList);
      }

      return response()->json($shoppingListJson);
   }
   
   public function updateMyShoppingList(Request $request) {
      $items = $request->all();
      
      $shoppingList = ShoppingList::firstOrNew(['user_id' => $request->user()->id]);
      $shoppingList->items = json_encode($items);
      $shoppingList->user()->associate($request->user());
      $shoppingList->save();
      
      return response()->json($items);
   }
   
   private static function userToJson(User $user) {
      $userJson = [];
      $userJson['id'] = route('users.get', ['user' => $user]);
      
      return $userJson;
   }
   
   private static function shoppingListToJson(ShoppingList $shoppingList) {
      return json_decode($shoppingList->items, true);
   }
}
