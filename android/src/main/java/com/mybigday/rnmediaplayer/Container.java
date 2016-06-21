package com.mybigday.rnmediaplayer;

import android.content.Context;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

public abstract class Container {
  public enum RendState {
    NEW, REND, RENDOUT, END
  }
  protected Context context;
  protected ReactApplicationContext reactContext;
  protected RendState rendState = RendState.NEW;
  private View view;
  private boolean upsideDownMode;

  public Container(Context context, ReactApplicationContext reactContext, boolean upsideDownMode) {
    this.context = context;
    this.reactContext = reactContext;
    this.upsideDownMode = upsideDownMode;
  }

  protected void init(View view) {
    if (this.view != null) return;
    this.view = view;
    if(upsideDownMode == true){
      this.view.setRotation(180);
    }
  }

  public RendState getState() {
    return rendState;
  }

  public View getView() {
    return view;
  }

  protected void sendEvent(String eventName, WritableMap params) {
    reactContext
      .getJSModule(RCTNativeAppEventEmitter.class)
      .emit(eventName, params);
  }

  public void rendIn(String filePath, final Callback cb) {
    sendEvent("RendInStart", Arguments.createMap());

    rendState = RendState.NEW;

    Animation am = new AlphaAnimation(0, 1);
    am.setDuration(1000);
    am.setAnimationListener(new AlphaAnimation.AnimationListener() {

      @Override
      public void onAnimationEnd(Animation animation) {
        view.setAlpha(1);
        rendState = RendState.REND;
        view.clearAnimation();
        if (cb != null) cb.call();
      }

      public void onAnimationStart(Animation animation) {}
      public void onAnimationRepeat(Animation animation) {}
    });
    view.startAnimation(am);
  }

  public void rendOut(final Callback cb) {
    sendEvent("RendOutStart", Arguments.createMap());

    if (rendState == RendState.NEW || rendState == RendState.RENDOUT) {
      view.clearAnimation();
      view.setAlpha(0);
      rendState = RendState.END;
      sendEvent("RendOutFinish", Arguments.createMap());
      if (cb != null) cb.call();
      return;
    }

    rendState = RendState.RENDOUT;

    Animation am = new AlphaAnimation(1, 0);
    am.setDuration(1000);
    am.setAnimationListener(new AlphaAnimation.AnimationListener() {

      @Override
      public void onAnimationEnd(Animation animation) {
        view.setAlpha(0);
        rendState = RendState.END;
        sendEvent("RendOutFinish", Arguments.createMap());
        if (cb != null) cb.call();
      }

      public void onAnimationStart(Animation animation) {}
      public void onAnimationRepeat(Animation animation) {}
    });
    view.startAnimation(am);
  }

  public abstract void destroy();

  public interface Callback {
    void call();
  }
}
