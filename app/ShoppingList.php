<?php namespace MealPlan;

use Eloquent;

class ShoppingList extends Eloquent {
   protected $fillable = ['user_id', 'items'];
   protected $visible = ['items'];
   protected $primaryKey = 'user_id';
   
   public function user() {
      return $this->belongsTo('MealPlan\User');
   }
}
