<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
