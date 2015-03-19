<?php namespace MealPlan\Exceptions;

use Exception;
use Google_Auth_Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Log;

class Handler extends ExceptionHandler {

	/**
	 * A list of the exception types that should not be reported.
	 *
	 * @var array
	 */
	protected $dontReport = [
		'Symfony\Component\HttpKernel\Exception\HttpException'
	];

	/**
	 * Report or log an exception.
	 *
	 * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
	 *
	 * @param  \Exception  $e
	 * @return void
	 */
	public function report(Exception $e)
	{
      if ($e instanceof Google_Auth_Exception) {
         Log::info($e);
      }
      
		return parent::report($e);
	}

	/**
	 * Render an exception into an HTTP response.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Exception  $e
	 * @return \Illuminate\Http\Response
	 */
	public function render($request, Exception $e)
	{
      Log::info('Rendering exception');
		if ($this->isHttpException($e))
		{
			return $this->renderHttpException($e);
		}
		else
		{
         if ($e instanceof Google_Auth_Exception) {
            abort(401, 'Unauthorized');
         }
         
			return parent::render($request, $e);
		}
	}

}
