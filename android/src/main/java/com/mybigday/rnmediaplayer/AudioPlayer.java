package com.mybigday.rnmediaplayer;

import android.content.Context;
import android.media.MediaPlayer;
import android.net.Uri;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;

public class AudioPlayer implements LifecycleEventListener {
  private Context context;
  private ReactApplicationContext reactContext;
  private Map<String, MediaPlayer> audioIdMap = new HashMap<String, MediaPlayer>();

  public AudioPlayer(Context context, ReactApplicationContext reactContext) {
    this.context = context;
    this.reactContext = reactContext;

    reactContext.addLifecycleEventListener(this);
  }

  public WritableMap playMusic(String filePath) {
    MediaPlayer mediaPlayer = MediaPlayer.create(context, Uri.parse(filePath));
    mediaPlayer.start();

    String id = UUID.randomUUID().toString();
    audioIdMap.put(id, mediaPlayer);

    WritableMap evt = Arguments.createMap();
    evt.putString("musicId", id);
    sendEvent("MusicStart", evt);

    int duration = mediaPlayer.getDuration();
    WritableMap result = Arguments.createMap();
    result.putString("id", id);
    result.putInt("duration", duration);
    return result;
  }

  public void stopMusic(String id) {
    MediaPlayer mediaPlayer = audioIdMap.get(id);
    if (mediaPlayer != null) {
      mediaPlayer.stop();
      mediaPlayer.release();
      audioIdMap.remove(id);
    }
  }

  public void stopAllMusic() {
    Iterator it = audioIdMap.entrySet().iterator();
    while (it.hasNext()) {
      MediaPlayer mediaPlayer = (MediaPlayer) it.next();
      if (mediaPlayer.isPlaying()) {
        mediaPlayer.stop();
      }
      mediaPlayer.release();
      it.remove();
    }
  }

  protected void sendEvent(String eventName, WritableMap params) {
    reactContext
      .getJSModule(RCTNativeAppEventEmitter.class)
      .emit(eventName, params);
  }

  @Override
  public void onHostResume() {}

  @Override
  public void onHostPause() {
    stopAllMusic();
  }

  @Override
  public void onHostDestroy() {}
}
