package com.mybigday.rn;

import android.annotation.TargetApi;
import android.os.Build;
import android.graphics.Color;
import android.app.Activity;
import android.app.Presentation;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.view.Gravity;
import android.view.MotionEvent;
import android.widget.LinearLayout;
import android.widget.PopupWindow;

import android.media.MediaRouter;
import android.media.MediaRouter.RouteInfo;
import android.media.MediaRouter.SimpleCallback;
import android.view.Display;
import android.webkit.WebView;

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
  private Preview preview;
  private static boolean alreadyInitialize = false;
  private View containerView;

  public RNMediaPlayer(ReactApplicationContext reactContext, Activity activity) {
    super(reactContext);

    this.context = (Context) reactContext;
    this.activity = activity;
    // reactContext.addLifecycleEventListener(this);
  }

  @Override
  public String getName() {
    return "RNMediaPlayer";
  }

  // test
  void initLayoutView() {
    containerView = new LinearLayout(this.activity);
    LayoutParams params = new LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    );
    containerView.setLayoutParams(params);
    containerView.setBackgroundColor(Color.BLACK);
  }

  void initPreview() {
    preview = new Preview(this.activity, containerView, 300, 300);
    preview.show();
  }

  @ReactMethod
  public void initializePlayer() {
    if (!alreadyInitialize) {
      initLayoutView();
      initPreview();

      alreadyInitialize = true;
    }
  }
}
