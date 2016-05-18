package com.mybigday.rnmediaplayer;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Presentation;
import android.content.Context;
import android.graphics.Color;
import android.media.MediaRouter;
import android.media.MediaRouter.SimpleCallback;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.LinearLayout;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;

@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
class ExternalDisplayPresentation extends Presentation {
  private View containerView;

  ExternalDisplayPresentation(Context ctx, Display display, View containerView) {
    super(ctx, display);

    this.containerView = containerView;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    setContentView(containerView);
  }
}

public class ExternalDisplay implements LifecycleEventListener {
  private Root root;
  private Context context;
  private ReactApplicationContext reactContext;
  private LinearLayout containerView;
  private ExternalDisplayPresentation preso;
  private Preview preview;
  private boolean isShowVirtualScreen = false;

  MediaRouter router = null;
  SimpleCallback cb = null;

  ExternalDisplay(Context ctx, ReactApplicationContext reactContext) {
    this.context = ctx;
    this.reactContext = reactContext;

    reactContext.addLifecycleEventListener(this);
  }

  public void showVirtualScreen(boolean bool) {
    isShowVirtualScreen = bool;
    if (bool) {
      tryShowPreview();
    } else {
      tryRemovePreview();
    }
  }

  public Root getRoot() {
    return root;
  }

  public void start() {
    initLayoutView();
    tryShowPreview();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
      if (cb == null) {
        cb = new RouteCallback();
        router = (MediaRouter) context.getSystemService(Context.MEDIA_ROUTER_SERVICE);
      }

      handleRoute(router.getSelectedRoute(MediaRouter.ROUTE_TYPE_LIVE_VIDEO));
      router.addCallback(MediaRouter.ROUTE_TYPE_LIVE_VIDEO, cb);
    }
    root = new Root(context, reactContext, containerView);
  }

  @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
  private void handleRoute(MediaRouter.RouteInfo route) {
    if (route == null) {
      clearPreso();
    } else {
      Display display = route.getPresentationDisplay();
      if (route.isEnabled() && display != null) {
        if (preso == null) {
          showPreso(route);
        } else if (preso.getDisplay().getDisplayId() != display.getDisplayId()) {
          clearPreso();
          showPreso(route);
        }
      } else {
        clearPreso();
      }
    }
  }

  @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
  private void showPreso(MediaRouter.RouteInfo route) {
    preso = new ExternalDisplayPresentation(this.context, route.getPresentationDisplay(), containerView);

    tryRemovePreview();
    preso.show();
  }

  @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
  private void clearPreso() {
    if (preso == null) return;
    preso.dismiss();
    preso = null;

    tryShowPreview();
  }

  private void handlePause() {
    if (root != null) {
      root.destroyContainer();
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
      clearPreso();

      if (router != null) {
        router.removeCallback(cb);
      }
    }
    tryRemovePreview();
  }

  @Override
  public void onHostResume() {
    start();
    showVirtualScreen(true);
  }

  @Override
  public void onHostPause() {
    showVirtualScreen(false);
    handlePause();
  }

  @Override
  public void onHostDestroy() {}

  // test
  private void initLayoutView() {
    containerView = new LinearLayout(this.context);
    LayoutParams params = new LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    );
    containerView.setLayoutParams(params);
    containerView.setBackgroundColor(Color.BLACK);
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

  private void initPreview() {
    tryRemovePreview();
    DisplayMetrics displaymetrics = new DisplayMetrics();
    ((Activity) this.context).getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
    int height = displaymetrics.heightPixels;
    int width = displaymetrics.widthPixels;
    preview = new Preview(this.context, containerView, (int) (width * 0.3), (int) (height * 0.3));
  }

  @TargetApi(Build.VERSION_CODES.JELLY_BEAN)
  class RouteCallback extends MediaRouter.SimpleCallback {
    @Override
    public void onRoutePresentationDisplayChanged(MediaRouter router,
                            MediaRouter.RouteInfo route) {
      handleRoute(route);
    }
  }
}
