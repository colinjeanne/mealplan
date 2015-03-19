<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('users', function($table) {
         $table->increments('id');
         $table->timestamps();
      });
      
      Schema::create('claims', function($table) {
         $table->text('id');
         $table->integer('user_id')->unsigned();
         $table->timestamps();
         $table->unique('id');
         $table->foreign('user_id')
            ->references('id')
            ->on('users')
            ->onDelete('cascade');
      });
      
      Schema::create('shopping_lists', function($table) {
         $table->integer('user_id')->unsigned();
         $table->text('items');
         $table->timestamps();
         $table->primary('user_id');
         $table->foreign('user_id')
            ->references('id')
            ->on('users')
            ->onDelete('cascade');
      });
      
      Schema::create('tags', function($table) {
         $table->string('id', 20);
         $table->primary('id');
      });
      
      Schema::create('recipes', function($table) {
         $table->increments('id');
         $table->integer('created_by')->unsigned();
         $table->string('title', 100);
         $table->string('title_lower', 100);
         $table->text('instructions');
         $table->text('instructions_html');
         $table->text('ingredients');
         $table->timestamps();
         $table->index('title_lower');
         $table->foreign('created_by')->references('id')->on('users');
      });
      
      Schema::create('plans', function($table) {
         $table->increments('id');
         $table->integer('created_by')->unsigned();
         $table->string('title', 100);
         $table->string('title_lower', 100);
         $table->timestamps();
         $table->index('title_lower');
         $table->foreign('created_by')->references('id')->on('users');
      });
      
      Schema::create('plan_recipe', function($table) {
         $table->integer('plan_id')->unsigned();
         $table->integer('recipe_id')->unsigned();
         $table->foreign('plan_id')
            ->references('id')
            ->on('plans')
            ->onDelete('cascade');
         $table->foreign('recipe_id')
            ->references('id')
            ->on('recipes')
            ->onDelete('cascade');
      });
      
      Schema::create('taggables', function($table) {
         $table->string('tag_id', 20);
         $table->morphs('taggable');
      });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
      Schema::drop('taggables');
      Schema::drop('plan_recipe');
      Schema::drop('plans');
      Schema::drop('recipes');
      Schema::drop('tags');
      Schema::drop('shopping_lists');
      Schema::drop('claims');
		Schema::drop('users');
	}
}
