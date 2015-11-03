<?php namespace MealPlan\Http\Controllers;

use DB;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use MealPlan\Recipe;
use MealPlan\Tag;
use Michelf\Markdown;

class RecipeController extends Controller
{
    private $parser;
   
    public function __construct()
    {
        $this->middleware(
            'google-id-token',
            ['only' => [
                'createRecipe',
                'updateRecipe',
                'deleteRecipe'
            ]]
        );
      
        $this->middleware(
            'recipe',
            ['only' => [
               'createRecipe',
               'updateRecipe'
            ]]
        );
      
        $this->parser = new Markdown;
      
        // All tags are HTML, not XHTML
        $this->parser->empty_element_suffix = '>';
      
        // Simple Markdown only: no tags
        $this->parser->no_markup = true;
    }

    public function getRecipes(Request $request)
    {
        $recipeModels = null;
        if ($request->has('title')) {
            $recipeModels = self::getByTitle($request->input('title'));
        } elseif ($request->exists('tag')) {
            $recipeModels = self::getByTag($request->input('tag'));
        } else {
            $recipeModels = self::getAllRecipes();
        }
      
        $recipes = [];
        $recipeModels->each(function ($recipe) use (&$recipes) {
            $recipes[] = self::recipeToJson($recipe);
        });
      
        return $recipes;
    }
   
    public function createRecipe(Request $request)
    {
        $recipeJson = null;
        DB::transaction(function () use (&$recipeJson, $request) {
            $input = $request->json();
            $recipe = new Recipe([
                'title' => $input->get('title'),
                'title_lower' => strtolower($input->get('title')),
                'instructions' => $input->get('instructions'),
                'instructions_html' =>
                $this->parser->transform(
                    htmlspecialchars(
                        $input->get('instructions'),
                        ENT_QUOTES | ENT_HTML5
                    )
                ),
                'ingredients' => json_encode($input->get('ingredients'))
            ]);
         
            $recipe->createdBy()->associate($request->user());
            $recipe->save();
         
            $recipeJson = [];
            $recipeJson['id'] = route('recipes.get', ['recipe' => $recipe]);
            $recipeJson['createdBy'] = route('users.get', ['user' => $recipe->created_by]);
            $recipeJson['title'] = $recipe->title;
            $recipeJson['instructions'] = $recipe->instructions;
            $recipeJson['instructionsHtml'] = $recipe->instructions_html;
            $recipeJson['ingredients'] = $input->get('ingredients');
         
            if ($input->has('tags')) {
                $tags = array_map('strtolower', $input->get('tags'));
                $recipeJson['tags'] = $tags;
            
                foreach ($tags as $tag) {
                    Tag::firstOrCreate([
                        'recipe_id' => $recipe->id,
                        'tag' => $tag
                    ]);
                }
            
                $recipe->syncTags($tags);
            }
        });
      
        return response()
            ->json($recipeJson, 201)
            ->header('Location', $recipeJson['id']);
    }
   
    public function getTags()
    {
        return response()->json(Recipe::allTags());
    }
   
    public function getRecipe(Recipe $recipe)
    {
        return response()->json(self::recipeToJson($recipe));
    }
   
    public function updateRecipe(Request $request, Recipe $recipe)
    {
        $recipeJson = null;
        DB::transaction(function () use (&$recipeJson, $request, $recipe) {
            $input = $request->json();
            $recipe->title = $input->get('title');
            $recipe->title_lower = strtolower($input->get('title'));
            $recipe->instructions = $input->get('instructions');
            $recipe->instructions_html =
            $this->parser->transform(
                htmlspecialchars(
                    $input->get('instructions'),
                    ENT_QUOTES | ENT_HTML5
                )
            );
            $recipe->ingredients = json_encode($input->get('ingredients'));

            $recipe->save();
         
            $recipeJson = [];
            $recipeJson['id'] = route('recipes.get', ['recipe' => $recipe]);
            $recipeJson['createdBy'] = route('users.get', ['user' => $recipe->created_by]);
            $recipeJson['title'] = $recipe->title;
            $recipeJson['instructions'] = $recipe->instructions;
            $recipeJson['instructionsHtml'] = $recipe->instructions_html;
            $recipeJson['ingredients'] = $input->get('ingredients');
         
            if ($input->has('tags')) {
                $tags = array_map('strtolower', $input->get('tags'));
            } else {
                $tags = [];
            }
         
            $recipeJson['tags'] = $tags;
         
            foreach ($tags as $tag) {
                Tag::firstOrCreate([
                    'recipe_id' => $recipe->id,
                    'tag' => $tag
                ]);
            }
         
            $recipe->syncTags($tags);
        });
      
        return response()->json($recipeJson, 200);
    }
   
    public function deleteRecipe(Recipe $recipe)
    {
        $recipe->delete();
    }
   
    private static function getAllRecipes()
    {
        return Recipe::all();
    }
   
    private static function getByTitle($title)
    {
        $lowerTitle = strtolower($title);
        $likePattern = '%' . $lowerTitle . '%';
      
        return Recipe::where('title_lower', 'LIKE', $likePattern)->get();
    }
   
    private static function getByTag($tag)
    {
        if ($tag) {
            $lowerTag = strtolower($tag);
            $tagModel = Tag::find($lowerTag);
            if (!$tagModel) {
                return new Collection();
            }
         
            return $tagModel->recipes();
        }
      
        return Recipe::untagged();
    }
   
    private static function recipeToJson(Recipe $recipe)
    {
        $recipeJson = [];
        $recipeJson['id'] = route('recipes.get', ['recipe' => $recipe]);
        $recipeJson['createdBy'] = route('users.get', ['user' => $recipe->created_by]);
        $recipeJson['title'] = $recipe->title;
        $recipeJson['instructions'] = $recipe->instructions;
        $recipeJson['instructionsHtml'] = $recipe->instructions_html;
        $recipeJson['ingredients'] = json_decode($recipe->ingredients, true);
        $recipeJson['tags'] = $recipe->tags();
      
        return $recipeJson;
    }
}
