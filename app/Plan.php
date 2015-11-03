<?php namespace MealPlan;

use DB;
use Eloquent;

class Plan extends Eloquent
{
    protected $fillable = [
        'created_by',
        'title',
        'title_lower'];
   
    protected $visible = [
        'id',
        'created_by',
        'title'];
   
    public function createdBy()
    {
        return $this->belongsTo('MealPlan\User', 'created_by');
    }
   
    public function recipes()
    {
        return $this->belongsToMany('MealPlan\Recipe');
    }
   
    public function tags()
    {
        $tagsData = DB::table('plan_tag')
            ->where('plan_id', $this->id)
            ->get();
      
        return array_map(function ($element) {
            return $element->tag;
        }, $tagsData);
    }
   
    public static function allTags()
    {
        $tagged = DB::table('plan_tag')
            ->select(DB::raw('count(plan_id) as tagCount, tag'))
            ->groupBy('tag');
      
        $untagged = DB::table('plans')
            ->select(DB::raw('count(*) as tagCount, tag'))
            ->leftJoin('plan_tag', 'plans.id', '=', 'plan_tag.plan_id')
            ->whereNull('plan_id')
            ->groupBy('tag')
            ->having('tagCount', '<>', 0);
      
        return $tagged->union($untagged)->get();
    }
   
    public static function untagged()
    {
        return Plan::whereNull('plan_id')
            ->leftJoin('plan_tag', 'plans.id', '=', 'plan_tag.plan_id')
            ->groupBy('plans.id')
            ->get();
    }
}
