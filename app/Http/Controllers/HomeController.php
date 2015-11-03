<?php namespace MealPlan\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function getIndex()
    {
        return view('home', ['clientId' => env('GOOGLE_CLIENT_ID', 'fail')]);
    }
}
