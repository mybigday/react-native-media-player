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
  private int animationLength;
  private BetweenAnimation rendInAnimation;
  private BetweenAnimation rendOutAnimation;

  public Container(Context context, ReactApplicationContext reactContext, boolean upsideDownMode, int animationLength) {
    this.context = context;
    this.reactContext = reactContext;
    this.upsideDownMode = upsideDownMode;
    this.animationLength = animationLength;

    if (this.animationLength > 0) {
      this.rendInAnimation = new BetweenAnimation(0, 1, this.animationLength);
      this.rendOutAnimation = new BetweenAnimation(1, 0, this.animationLength);
    }
  }

  public Container(Context context, ReactApplicationContext reactContext, boolean upsideDownMode) {
    this(context, reactContext, upsideDownMode, 1000);
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

    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        view.setAlpha(1);
        rendState = RendState.REND;
        view.clearAnimation();
        if (cb != null) cb.call();
      }
    };

    if (animationLength == 0) {
      runnable.run();
    } else {
      rendInAnimation.setOnAnimEndRunnable(runnable);
      view.startAnimation(rendInAnimation);
    }
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

    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        view.setAlpha(0);
        rendState = RendState.END;
        sendEvent("RendOutFinish", Arguments.createMap());
        if (cb != null) cb.call();
      }
    };

    if (animationLength == 0) {
      runnable.run();
    } else {
      rendOutAnimation.setOnAnimEndRunnable(runnable);
      view.startAnimation(rendOutAnimation);
    }
  }

  public abstract void destroy();

  private class BetweenAnimation extends AlphaAnimation {
    private Runnable onAnimEndRunnable;

    public BetweenAnimation(float fromAlpha, float toAlpha, int duration) {
      super(fromAlpha, toAlpha);
      this.setDuration(duration);
      this.setAnimationListener(new AnimationListener() {
        @Override
        public void onAnimationEnd(Animation animation) {
          if (onAnimEndRunnable == null)
            return;
          onAnimEndRunnable.run();
        }
        @Override
        public void onAnimationStart(Animation animation) {}
        @Override
        public void onAnimationRepeat(Animation animation) {}
      });
    }
    public void setOnAnimEndRunnable(Runnable onAnimEndRunnable) {
      this.onAnimEndRunnable = onAnimEndRunnable;
    }
  }

  public interface Callback {
    void call();
  }
}
