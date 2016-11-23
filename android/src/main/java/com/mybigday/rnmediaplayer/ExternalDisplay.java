package com.mybigday.rnmediaplayer;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Presentation;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.LinearLayout;
import android.hardware.display.DisplayManager;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;

@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
class ExternalDisplayScreen extends Presentation {
  private View containerView;

  ExternalDisplayScreen(Context ctx, Display display, View containerView) {
    super(ctx, display);

    this.containerView = containerView;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(containerView);
  }
}

@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
class ExternalDisplayHelper implements DisplayManager.DisplayListener {
  public interface Listener {
    void showScreen(Display display);
    void clearScreen();
  }

  private Listener listener = null;
  private DisplayManager dm = null;
  private Display currentDisplay = null;
  private boolean alreadyRouted = true;
  private boolean enabled = true;

  public ExternalDisplayHelper(Context context, Listener listener) {
    this.listener = listener;

    dm = (DisplayManager) context.getSystemService(Context.DISPLAY_SERVICE);
  }

  public void onResume() {
    handleRoute();
    dm.registerDisplayListener(this, null);
  }

  public void onPause() {
    listener.clearScreen();
    currentDisplay = null;

    dm.unregisterDisplayListener(this);
  }

  private void handleRoute() {
    if (!enabled) return;

    Display[] displays = dm.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);

    if (displays.length == 0) {
      if (currentDisplay != null || alreadyRouted) {
        listener.clearScreen();
        currentDisplay = null;
      }
    } else {
      Display display = displays[0];
      if (display != null && display.isValid()) {
        if (currentDisplay == null) {
          listener.showScreen(display);
          currentDisplay = display;
        } else if (currentDisplay.getDisplayId() != display.getDisplayId()) {
          listener.clearScreen();
          listener.showScreen(display);
          currentDisplay = display;
        }
      } else if (currentDisplay != null) {
        listener.clearScreen();
        currentDisplay = null;
      }
    }
    alreadyRouted = false;
  }

  @Override
  public void onDisplayAdded(int displayId) {
    handleRoute();
  }

  @Override
  public void onDisplayChanged(int displayId) {
    handleRoute();
  }

  @Override
  public void onDisplayRemoved(int displayId) {
    handleRoute();
  }
}

public class ExternalDisplay implements LifecycleEventListener, ExternalDisplayHelper.Listener {
  private Root root;
  private Context context;
  private ReactApplicationContext reactContext;
  private LinearLayout containerView;
  private ExternalDisplayScreen screen;
  private Preview preview;
  private boolean isShowVirtualScreen = false;
  private boolean alreadyStarted = false;
  private ExternalDisplayHelper helper = null;

  // Preview params
  private int x = 0;
  private int y = 0;
  private int width = 400;
  private int height = 300;
  private boolean lock = false;
  private boolean enabled = true;

  ExternalDisplay(Context ctx, ReactApplicationContext reactContext) {
    this.context = ctx;
    this.reactContext = reactContext;

    reactContext.addLifecycleEventListener(this);
    helper = new ExternalDisplayHelper(context, this);
  }

  public void start() {
    if (alreadyStarted) return;
    initLayoutView();
    tryShowPreview();
    
    root = new Root(context, reactContext, containerView);
    alreadyStarted = true;
  }

  public void showVirtualScreen(boolean bool) {
    if (screen != null) return;

    isShowVirtualScreen = bool;
    if (isShowVirtualScreen) {
      tryShowPreview();
    } else {
      tryRemovePreview();
      if (!this.enabled) {
        root.destroyContainer();
      }
    }
  }

  public void setVirtualScreenLayout(int x, int y, int w, int h, boolean lock) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.lock = lock;

    if (preview != null) {
      preview.setLayout(x, y, w, h, lock);
    }
  }

  public void enable(boolean enable) {
    if (!enable) {
      clearScreen();
    }
    this.enabled = enable;
  }

  public Root getRoot() {
    return root;
  }

  private void initLayoutView() {
    containerView = new LinearLayout(this.context);
    LayoutParams params = new LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    );
    containerView.setLayoutParams(params);
    containerView.setBackgroundColor(Color.BLACK);
  }

  private void initPreview() {
    tryRemovePreview();
    DisplayMetrics displaymetrics = new DisplayMetrics();
    ((Activity) this.context).getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
    int height = displaymetrics.heightPixels;
    int width = displaymetrics.widthPixels;
    preview = new Preview(
      this.context, containerView,
      this.width, this.height,
      this.x, this.y,
      this.lock
    );
  }

  private void tryShowPreview() {
    if (!isShowVirtualScreen) return;
    initPreview();
    preview.show();
  }

  private void tryRemovePreview() {
    if (preview == null) return;
    preview.dismiss();
    preview = null;
  }

  @Override
  public void showScreen(Display display) {
    if (!this.enabled) return;

    tryRemovePreview();
    screen = new ExternalDisplayScreen(this.context, display, containerView);
    screen.show();
  }

  @Override
  public void clearScreen() {
    if (!this.enabled || screen == null) return;

    ViewGroup parent = (ViewGroup) containerView.getParent();
    if (parent != null) parent.removeView(containerView);

    screen.dismiss();
    screen = null;
    tryShowPreview();
  }

  @Override
  public void onHostResume() {
    start();
    helper.onResume();
    showVirtualScreen(true);
  }

  @Override
  public void onHostPause() {
    showVirtualScreen(false);
    helper.onPause();
    tryRemovePreview();
  }

  @Override
  public void onHostDestroy() {}
}
