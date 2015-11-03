<?php namespace MealPlan;

use Eloquent;

class Ideas extends Eloquent
{
    protected $fillable = ['user_id', 'items'];
    protected $visible = ['items'];
    protected $primaryKey = 'user_id';
    protected $table = 'ideas';
   
    public function user()
    {
        return $this->belongsTo('MealPlan\User');
    }
}
