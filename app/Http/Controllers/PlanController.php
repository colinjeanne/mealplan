<?php namespace MealPlan\Http\Controllers;

use DB;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use MealPlan\Plan;
use MealPlan\Tag;

class PlanController extends Controller
{
    public function __construct()
    {
        $this->middleware(
            'google-id-token',
            ['only' => [
                'createPlan',
                'updatePlan',
                'deletePlan'
            ]]
        );
      
         $this->middleware(
             'plan',
             ['only' => [
                'createPlan',
                'updatePlan'
             ]]
         );
    }

    public function getPlans(Request $request)
    {
        $planModels = null;
        if ($request->has('title')) {
            $planModels = self::getByTitle($request->input('title'));
        } elseif ($request->exists('tag')) {
            $planModels = self::getByTag($request->input('tag'));
        } else {
            $planModels = self::getAllPlans();
        }
      
        $plans = [];
        $planModels->each(function ($plan) use (&$plans) {
            $plans[] = self::planToJson($plan);
        });
      
        return $plans;
    }
   
    public function createPlan(Request $request)
    {
        $planJson = null;
        DB::transaction(function () use (&$planJson, $request) {
            $input = $request->json();
            $plan = new Plan([
                'title' => $input->get('title'),
                'title_lower' => strtolower($input->get('title'))
            ]);
         
            $plan->createdBy()->associate($request->user());
            $plan->save();
         
            $planJson = [];
            $planJson['id'] = route('plans.get', ['plan' => $plan]);
            $planJson['createdBy'] = route('users.get', ['user' => $plan->created_by]);
            $planJson['title'] = $plan->title;
         
            $recipePathRegex = '#^' . route('recipes.getAll', []) . '/([1-9]\d*)$#';
            $recipes = $input->get('recipes');
            $planJson['recipes'] = $recipes;
            $recipeIds = [];
            foreach ($recipes as $recipe) {
                $matches = [];
                if (preg_match($recipePathRegex, $recipe, $matches) === 1) {
                    $recipeId = (int)$matches[1];
                    $recipeIds[] = $recipeId;
                } else {
                    abort(400);
                }
            }
         
            $plan->recipes()->sync($recipeIds);
            $plan->save();
        });
      
        return response()
            ->json($planJson, 201)
            ->header('Location', $planJson['id']);
    }
   
    public function getTags()
    {
        return response()->json(Plan::allTags());
    }
   
    public function getPlan(Plan $plan)
    {
        return response()->json(self::planToJson($plan));
    }
   
    public function updatePlan(Request $request, Plan $plan)
    {
        $planJson = null;
        DB::transaction(function () use (&$planJson, $request, $plan) {
            $input = $request->json();
            $plan->title = $input->get('title');
            $plan->title_lower = strtolower($input->get('title'));
         
            $planJson = [];
            $planJson['id'] = route('plans.get', ['plan' => $plan]);
            $planJson['createdBy'] = route('users.get', ['user' => $plan->created_by]);
            $planJson['title'] = $plan->title;
         
            $recipePathRegex = '#^' . route('recipes.getAll', []) . '/([1-9]\d*)$#';
            $recipes = $input->get('recipes');
            $planJson['recipes'] = $recipes;
            $recipeIds = [];
            foreach ($recipes as $recipe) {
                $matches = [];
                if (preg_match($recipePathRegex, $recipe, $matches) === 1) {
                    $recipeId = (int)$matches[1];
                    $recipeIds[] = $recipeId;
                } else {
                    abort(400);
                }
            }
         
            $plan->recipes()->sync($recipeIds);
            $plan->save();
        });
      
        return response()->json($planJson, 200);
    }
   
    public function deletePlan(Plan $plan)
    {
        $plan->delete();
    }
   
    private static function getAllPlans()
    {
        return Plan::all();
    }
   
    private static function getByTitle($title)
    {
        $lowerTitle = strtolower($title);
        $likePattern = '%' . $lowerTitle . '%';
      
        return Plan::where('title_lower', 'LIKE', $likePattern)->get();
    }
   
    private static function getByTag($tag)
    {
        if ($tag) {
            $lowerTag = strtolower($tag);
            $tagModel = Tag::find($lowerTag);
            if (!$tagModel) {
                return new Collection();
            }
         
            return $tagModel->plans();
        }
      
        return Plan::untagged();
    }
   
    private static function planToJson(Plan $plan)
    {
        $planJson = [];
        $planJson['id'] = route('plans.get', ['plan' => $plan]);
        $planJson['createdBy'] = route('users.get', ['user' => $plan->created_by]);
        $planJson['title'] = $plan->title;
      
        $planJson['recipes'] = [];
        $recipes = $plan->recipes;
        foreach ($recipes as $recipe) {
            $planJson['recipes'][] = route('recipes.get', ['recipe' => $recipe]);
        }
      
        $planJson['tags'] = $plan->tags();
      
        return $planJson;
    }
}
