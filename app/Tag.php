<?php namespace MealPlan;

use Eloquent;

class Tag extends Eloquent
{
    protected $fillable = ['tag', 'recipe_id'];
    protected $table = 'recipe_tag';
    protected $primaryKey = 'tag';
   
    public $timestamps = false;
   
    public function recipes()
    {
        return Recipe::where('tag', $this->tag)
            ->join('recipe_tag', 'recipe_tag.recipe_id', '=', 'recipes.id')
            ->get();
    }
   
    public function plans()
    {
        return Plan::where('tag', $this->tag)
            ->join('plan_tag', 'plan_tag.plan_id', '=', 'plans.id')
            ->get();
    }
}
