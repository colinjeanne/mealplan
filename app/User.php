<?php namespace MealPlan;

use Eloquent;
use Illuminate\Contracts\Auth\Authenticatable;

class User extends Eloquent implements Authenticatable {
   protected $visible = ['id'];
   
   /**
    * Get the unique identifier for the user.
    *
    * @return mixed
    */
   public function getAuthIdentifier() {
      return $this->getKey();
   }

   /**
    * Get the password for the user.
    *
    * @return string
    */
   public function getAuthPassword() {
      return '';
   }

   /**
    * Get the token value for the "remember me" session.
    *
    * @return string
    */
   public function getRememberToken() {
      return '';
   }

   /**
    * Set the token value for the "remember me" session.
    *
    * @param  string  $value
    * @return void
    */
   public function setRememberToken($value) {
   }

   /**
    * Get the column name for the "remember me" token.
    *
    * @return string
    */
   public function getRememberTokenName() {
      return '';
   }
   
   public function recipes() {
      return $this->hasMany('MealPlan\Recipe', 'created_by');
   }
   
   public function plans() {
      return $this->hasMany('MealPlan\Plan', 'created_by');
   }
   
   public function shoppingList() {
      return $this->hasOne('MealPlan\ShoppingList');
   }

   public function ideas() {
      return $this->hasOne('MealPlan\Ideas');
   }
}
