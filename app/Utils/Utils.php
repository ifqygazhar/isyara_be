<?php

namespace App\Utils;

use Illuminate\Support\Facades\Storage;

class Utils
{
    public static function deleteImageFromStorage($imageUrl)
    {
        if (! $imageUrl) {
            return;
        }

        // Check if image is from local storage (contains /storage/)
        if (preg_match('#/storage/(.*)$#', $imageUrl, $matches)) {
            $path = $matches[1];

            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

    }
}
