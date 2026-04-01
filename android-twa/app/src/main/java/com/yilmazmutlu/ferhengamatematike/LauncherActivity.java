package com.yilmazmutlu.ferhengamatematike;

import android.os.Bundle;

/**
 * LauncherActivity for the Trusted Web Activity.
 * Extends the androidbrowserhelper LauncherActivity which handles
 * launching the TWA with the configuration specified in the AndroidManifest.xml.
 */
public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
