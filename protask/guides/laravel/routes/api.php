<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ResetController;

// Public routes (no auth)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/_reset', [ResetController::class, 'reset']);

// Protected routes
Route::middleware('mock.auth')->group(function () {
    // Users
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'updateMe']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Boards
    Route::get('/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{board}', [BoardController::class, 'show']);
    Route::put('/boards/{board}', [BoardController::class, 'update']);
    Route::delete('/boards/{board}', [BoardController::class, 'destroy']);

    // Columns (reorder MUST be before {column})
    Route::put('/columns/reorder', [ColumnController::class, 'reorder']);
    Route::get('/boards/{board}/columns', [ColumnController::class, 'index']);
    Route::post('/boards/{board}/columns', [ColumnController::class, 'store']);
    Route::put('/columns/{column}', [ColumnController::class, 'update']);
    Route::delete('/columns/{column}', [ColumnController::class, 'destroy']);

    // Cards
    Route::post('/cards/reorder', [CardController::class, 'reorder']);
    Route::post('/cards/{card}/move', [CardController::class, 'move']);
    Route::get('/columns/{column}/cards', [CardController::class, 'index']);
    Route::post('/columns/{column}/cards', [CardController::class, 'store']);
    Route::get('/cards/{card}', [CardController::class, 'show']);
    Route::patch('/cards/{card}', [CardController::class, 'update']);
    Route::delete('/cards/{card}', [CardController::class, 'destroy']);

    // Labels
    Route::get('/boards/{board}/labels', [LabelController::class, 'index']);
    Route::post('/boards/{board}/labels', [LabelController::class, 'store']);
    Route::patch('/labels/{label}', [LabelController::class, 'update']);
    Route::delete('/labels/{label}', [LabelController::class, 'destroy']);

    // Comments
    Route::get('/cards/{card}/comments', [CommentController::class, 'index']);
    Route::post('/cards/{card}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Invitations + Members
    Route::get('/boards/{board}/invitations', [InvitationController::class, 'index']);
    Route::post('/boards/{board}/invitations', [InvitationController::class, 'store']);
    Route::patch('/invitations/{invitation}', [InvitationController::class, 'update']);
    Route::delete('/invitations/{invitation}', [InvitationController::class, 'destroy']);
    Route::delete('/boards/{board}/members/{member}', [InvitationController::class, 'removeMember']);
});
