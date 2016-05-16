package com.mybigday.rn;

import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.view.ViewGroup.LayoutParams;
import android.widget.ImageView;

import com.facebook.react.bridge.ReactApplicationContext;

public class ImageContainer extends Container {

    public ImageContainer(Context context, ReactApplicationContext reactContext) {
        super(context, reactContext);
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
        super.rendOut(cb);
    }
}