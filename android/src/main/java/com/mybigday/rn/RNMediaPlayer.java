package com.mybigday.rn;

import android.app.Activity;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.LifecycleEventListener;

public class RNMediaPlayer extends ReactContextBaseJavaModule {
  private Context context;
  private Activity activity;
  private ExternalDisplay externalDisplay;
  private boolean alreadyInitialize = false;

  public RNMediaPlayer(ReactApplicationContext reactContext, Activity activity) {
    super(reactContext);

    this.context = (Context) reactContext;
    this.activity = activity;
  }

  @Override
  public String getName() {
    return "RNMediaPlayer";
  }

  @ReactMethod
  public void initialize() {
    if (!alreadyInitialize) {
      externalDisplay = new ExternalDisplay((Context) this.activity, (ReactApplicationContext) this.context);
      externalDisplay.start();

      alreadyInitialize = true;
    }
  }

  @ReactMethod
  public void showVirtualScreen(boolean bool) {
    if (externalDisplay == null) return;

    externalDisplay.showVirtualScreen(bool);
  }
}
