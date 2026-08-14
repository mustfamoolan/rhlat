<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Uses firstOrCreate to safely run in production without duplicating or overwriting existing users.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@rhlat.com'],
            [
                'name' => 'الأدمن الرئيسي',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'employee@rhlat.com'],
            [
                'name' => 'الموظف المسؤول',
                'password' => Hash::make('12345678'),
                'role' => 'employee',
            ]
        );

        User::firstOrCreate(
            ['email' => 'dev@rhlat.com'],
            [
                'name' => 'dev',
                'password' => Hash::make('12345678'),
                'role' => 'employee',
            ]
        );
    }
}
