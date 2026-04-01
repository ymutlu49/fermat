package com.yilmazmutlu.ferhengamatematike;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

/**
 * LauncherActivity for the Trusted Web Activity.
 * Falls back to opening in browser if TWA is not supported.
 */
public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    private static final String TAG = "FerhengaTWA";
    private static final String DEFAULT_URL = "https://ymutlu49.github.io/fermat/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            super.onCreate(savedInstanceState);
        } catch (Exception e) {
            Log.e(TAG, "TWA launch failed, falling back to browser", e);
            // Fallback: open in browser
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(DEFAULT_URL));
            startActivity(intent);
            finish();
        }
    }
}
