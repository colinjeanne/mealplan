<?php namespace MealPlan;

use DB;
use Eloquent;

class Recipe extends Eloquent
{
    protected $fillable = [
        'created_by',
        'title',
        'title_lower',
        'ingredients',
        'instructions',
        'instructions_html'];
   
    protected $visible = [
        'id',
        'created_by',
        'title',
        'ingredients',
        'instructions',
        'instructions_html'];
   
    public function createdBy()
    {
        return $this->belongsTo('MealPlan\User', 'created_by');
    }
   
    public function tags()
    {
        $tagsData = DB::table('recipe_tag')
            ->where('recipe_id', $this->id)
            ->get();
      
        return array_map(function ($element) {
            return $element->tag;
        }, $tagsData);
    }
   
    public function syncTags($tags)
    {
        $rows = array_map(function ($tag) {
            return [
                'recipe_id' => $this->id,
                'tag' => $tag
            ];
        }, $tags);
      
        $recipeId = $this->id;
      
        DB::transaction(function () use ($rows, $recipeId) {
            DB::table('recipe_tag')
                ->where('recipe_id', $recipeId)
                ->delete();
         
            if (!empty($rows)) {
                DB::table('recipe_tag')->insert($rows);
            }
        });
    }
   
    public function plans()
    {
        return $this->belongsToMany('MealPlan\Plan');
    }
   
    public static function allTags()
    {
        $tagged = DB::table('recipe_tag')
            ->select(DB::raw('count(recipe_id) as tagCount, tag'))
            ->groupBy('tag');
      
        $untagged = DB::table('recipes')
            ->select(DB::raw('count(*) as tagCount, tag'))
            ->leftJoin('recipe_tag', 'recipes.id', '=', 'recipe_tag.recipe_id')
            ->whereNull('recipe_id')
            ->groupBy('tag')
            ->having('tagCount', '<>', 0);
      
        return $tagged->union($untagged)->get();
    }
   
    public static function untagged()
    {
        return Recipe::whereNull('recipe_id')
            ->leftJoin('recipe_tag', 'recipes.id', '=', 'recipe_tag.recipe_id')
            ->groupBy('recipes.id')
            ->get();
    }
}
