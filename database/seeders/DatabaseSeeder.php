<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'الأدمن الرئيسي',
            'email' => 'admin@rhlat.com',
            'password' => Hash::make('12345678'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'الموظف المسؤول',
            'email' => 'employee@rhlat.com',
            'password' => Hash::make('12345678'),
            'role' => 'employee',
        ]);
    }
}
