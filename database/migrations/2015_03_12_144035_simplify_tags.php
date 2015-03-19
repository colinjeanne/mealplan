<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SimplifyTags extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
      $existingData = DB::table('taggables')
         ->where('taggable_type', 'MealPlan\Recipe')
         ->get();
      
      $updatedData = array_map(function($row) {
         return [
            'recipe_id' => $row->taggable_id,
            'tag' => strtolower($row->tag_id)
         ];
      }, $existingData);
      
		Schema::create('recipe_tag', function($table) {
         $table->integer('recipe_id')->unsigned();
         $table->string('tag', 20);
         $table->primary(['recipe_id', 'tag']);
         $table->index('tag');
         $table->foreign('recipe_id')
            ->references('id')
            ->on('recipes')
            ->onDelete('cascade');
      });
      
      DB::table('recipe_tag')->insert($updatedData);
      
      DB::statement(
         'CREATE VIEW plan_tag AS ' .
         'SELECT DISTINCT plan_id, tag ' .
         'FROM plan_recipe NATURAL JOIN recipe_tag');
      
      Schema::drop('taggables');
      Schema::drop('tags');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
      DB::statement('DROP VIEW plan_tag');
      
      $existingData = DB::table('recipe_tag')->get();
      
      $taggablesData = array_map(function($row) {
         return [
            'taggable_id' => $row->recipe_id,
            'tag_id' => $row->tag,
            'taggable_type' => 'MealPlan\Recipe'
         ];
      }, $existingData);
      
      $tagsData = array_map(function($row) {
         return [
            'id' => $row->tag
         ];
      }, $existingData);
      
      Schema::create('tags', function($table) {
         $table->string('id', 20);
         $table->primary('id');
      });
      
      Schema::create('taggables', function($table) {
         $table->string('tag_id', 20);
         $table->morphs('taggable');
      });
      
      DB::table('tags')->insert($tagsData);
      DB::table('taggables')->insert($taggablesData);
      
		Schema::drop('recipe_tag');
	}
}
