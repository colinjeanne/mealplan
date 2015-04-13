<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateIdeasTable extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('ideas', function($table) {
         $table->integer('user_id')->unsigned();
         $table->text('items');
         $table->timestamps();
         $table->primary('user_id');
         $table->foreign('user_id')
            ->references('id')
            ->on('users')
            ->onDelete('cascade');
      });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('ideas');
	}
}
