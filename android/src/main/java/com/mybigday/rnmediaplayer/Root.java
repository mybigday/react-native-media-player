package com.mybigday.rnmediaplayer;

import android.content.Context;
import android.view.View;
import android.widget.LinearLayout;

import com.facebook.react.bridge.ReactApplicationContext;

public class Root {
    Context context;
    ReactApplicationContext reactContext;
    private LinearLayout containerLayout;
    private Container currentReadyContainer;

    public Root(Context context, ReactApplicationContext reactContext, LinearLayout layout) {
        this.context = context;
        this.reactContext = reactContext;
        containerLayout = layout;
    }

    public View getView() {
        return containerLayout;
    }

    private void finalRendIn(String type, String filePath) {
        Container container = type == "image" ? new ImageContainer(context, reactContext) : new VideoContainer(context, reactContext);
        containerLayout.removeAllViews();
        containerLayout.refreshDrawableState();
        containerLayout.addView(container.getView());
        currentReadyContainer = container;
        currentReadyContainer.rendIn(filePath, new Container.Callback() {
            @Override
            public void call() {
                containerLayout.removeAllViews();
                containerLayout.refreshDrawableState();
                currentReadyContainer = null;
            }
        });
    }

    public void rendIn(final String type, final String filePath) {
        if (currentReadyContainer != null) {
            rendOut(new Container.Callback() {
                @Override
                public void call() {
                    finalRendIn(type, filePath);
                }
            });
        } else {
            finalRendIn(type, filePath);
        }
    }

    public void rendOut(final Container.Callback cb) {
        if (currentReadyContainer == null) {
            if (cb != null) cb.call();
            return;
        }
        currentReadyContainer.rendOut(new Container.Callback() {
            @Override
            public void call() {
                containerLayout.removeAllViews();
                containerLayout.refreshDrawableState();
                currentReadyContainer = null;
                if (cb != null) cb.call();
            }
        });
    }

    public void destroyContainer() {
        if (currentReadyContainer != null) {
            currentReadyContainer.destroy();
        }
    }
}
