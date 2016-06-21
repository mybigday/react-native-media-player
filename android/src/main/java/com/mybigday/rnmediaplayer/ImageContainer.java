package com.mybigday.rnmediaplayer;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.net.Uri;
import android.view.ViewGroup.LayoutParams;
import android.widget.ImageView;

import com.facebook.react.bridge.ReactApplicationContext;

public class ImageContainer extends Container {

  public ImageContainer(Context context, ReactApplicationContext reactContext, boolean upsideDownMode) {
    super(context, reactContext, upsideDownMode);
    ImageView image = new ImageView(context);
    image.setBackgroundColor(Color.BLACK);
    image.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    init(image);
  }

  @Override
  public void rendIn(String filePath, Callback cb) {
    ((ImageView) getView()).setImageURI(Uri.parse(filePath));
    super.rendIn(filePath, null);
  }

  @Override
  public void rendOut(final Callback cb) {
    super.rendOut(new Callback() {
      @Override
      public void call() {
        destroy();
        if (cb != null) cb.call();
      }
    });
  }

  @Override
  public void destroy() {
    ImageView imageView = ((ImageView) getView());
    ((BitmapDrawable) imageView.getDrawable()).getBitmap().recycle();
  }
}