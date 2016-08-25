package com.mybigday.rnmediaplayer;

import android.content.Context;
import android.graphics.Color;
import android.media.MediaPlayer;
import android.net.Uri;
import android.view.ViewGroup.LayoutParams;

import com.facebook.react.bridge.ReactApplicationContext;
import com.yqritc.scalablevideoview.ScalableType;
import com.yqritc.scalablevideoview.ScalableVideoView;

public class VideoContainer extends Container {
  private MScalableVideoView video;

  public VideoContainer(Context context, ReactApplicationContext reactContext, boolean upsideDownMode) {
    super(context, reactContext, upsideDownMode);
    video = (MScalableVideoView) new MScalableVideoView(context);
    video.setBackgroundColor(Color.BLACK);
    video.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    init(video);
  }

  private class MScalableVideoView extends ScalableVideoView {

    public MScalableVideoView(Context context) {
      super(context);
    }

    public void setOnCompletionListener(MediaPlayer.OnCompletionListener listener) {
      mMediaPlayer.setOnCompletionListener(listener);
    }

    public MediaPlayer getMediaPlayer() {
      return mMediaPlayer;
    }
  }

  @Override
  public void rendIn(String filePath, final Container.Callback finishedCallback) {
    final MScalableVideoView view = ((MScalableVideoView) getView());
    try {
      view.setDataSource(context, Uri.parse(filePath));
      view.setScalableType(ScalableType.FIT_CENTER);
      view.invalidate();
      view.prepare(new MediaPlayer.OnPreparedListener() {
        @Override
        public void onPrepared(MediaPlayer mp) {
          view.start();
        }
      });
      view.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
        @Override
        public void onCompletion(MediaPlayer mp) {
          rendOut(finishedCallback);
        }
      });
    } catch(Exception e) {
      e.printStackTrace();
    }
    super.rendIn(filePath, null);
  }

  @Override
  public void rendOut(Callback cb) {
    destroy();
    super.rendOut(cb);
  }

  @Override
  public void destroy() {
    ScalableVideoView view = ((ScalableVideoView) getView());
    if (video.getMediaPlayer() == null) return;
    if (view.isPlaying()) {
      view.stop();
    }
    view.release();
  }
}