package com.mybigday.rn;

import android.app.Activity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;

public class RNMediaPlayer extends ReactContextBaseJavaModule {
  private AudioPlayer audioPlayer;
  private ReactApplicationContext context;
  private Activity activity;
  private ExternalDisplay externalDisplay;
  private boolean alreadyInitialize = false;

  public RNMediaPlayer(ReactApplicationContext reactContext, Activity activity) {
    super(reactContext);

    this.context = reactContext;
    this.activity = activity;
  }

  @Override
  public String getName() {
    return "RNMediaPlayer";
  }

  @ReactMethod
  public void initialize() {
    if (!alreadyInitialize) {
      audioPlayer = new AudioPlayer(activity, context);
      externalDisplay = new ExternalDisplay(activity, context);

      alreadyInitialize = true;
    }
  }

  @ReactMethod
  public void showVirtualScreen(boolean bool, Promise promise) {
    if (!alreadyInitialize) {
      promise.resolve(false);
      return;
    }

    externalDisplay.showVirtualScreen(bool);
    promise.resolve(true);
  }

  @ReactMethod
  public void rendImage(final String filePath, final Promise promise) {
    if (!alreadyInitialize) {
      promise.reject("-11", "Can\'t push image, maybe need initialize MediaPlayer first.");
      return;
    }

    final Root root = externalDisplay.getRoot();
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        root.rendIn("image", filePath);
        promise.resolve(Arguments.createMap());
      }
    });
  }

  @ReactMethod
  public void rendVideo(final String filePath, final Promise promise) {
    if (!alreadyInitialize) {
      promise.reject("-13", "Can\'t push video, maybe need initialize MediaPlayer first.");
      return;
    }

    final Root root = externalDisplay.getRoot();
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        root.rendIn("video", filePath);
        promise.resolve(Arguments.createMap());
      }
    });
  }

  @ReactMethod
  public void rendOut(final Promise promise) {
    if (alreadyInitialize) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          externalDisplay.getRoot().rendOut(null);
          promise.resolve(Arguments.createMap());
        }
      });
    } else {
      promise.resolve(Arguments.createMap());
    }
  }

  @ReactMethod
  public void playMusic(String filePath, Promise promise) {
    WritableMap result = audioPlayer.playMusic(filePath);
    promise.resolve(result);
  }

  @ReactMethod
  public void stopMusic(String id) {
    audioPlayer.stopMusic(id);
  }

  @ReactMethod
  public void stopAllMusic() {
    audioPlayer.stopAllMusic();
  }

}
