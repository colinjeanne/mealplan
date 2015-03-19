<?php namespace MealPlan;

use Eloquent;

class Claim extends Eloquent {
   protected $fillable = ['id'];
   
   public function user() {
      return $this->belongsTo('MealPlan\User');
   }
}
