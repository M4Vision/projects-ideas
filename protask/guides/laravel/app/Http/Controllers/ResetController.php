<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Database\Seeders\DatabaseSeeder;

class ResetController extends Controller
{
    public function reset(): JsonResponse
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        DB::table('comments')->delete();
        DB::table('cards')->delete();
        DB::table('labels')->delete();
        DB::table('invitations')->delete();
        DB::table('project_columns')->delete();
        DB::table('boards')->delete();
        DB::table('users')->delete();

        DB::statement('PRAGMA foreign_keys = ON');

        DB::statement('DELETE FROM sqlite_sequence');

        $seeder = new DatabaseSeeder();
        $seeder->run();

        return response()->json(['success' => true]);
    }
}
