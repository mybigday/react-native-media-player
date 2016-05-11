package com.mybigday.rn;

import android.app.Activity;
import android.content.Context;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.PopupWindow;

public class Preview {
  private int width = 0, height = 0;
  private int mPosX = 0, mPosY = 0;
  private Context ctx;
  private View containerView;
  private PopupWindow popupWindow;
  private GestureDetector mGestureDetector;
  private boolean isFullScreen = false;

  Preview(Context ctx, View containerView, int width, int height) {
    this.ctx = ctx;
    this.containerView = containerView;
    this.width = width;
    this.height = height;

    popupWindow = new PopupWindow(containerView, width, height, false);
    mGestureDetector = new GestureDetector(ctx, new PreviewOnGestureListener());
  }

  void show() {
    View contextView = ((Activity) ctx).getWindow().getDecorView().getRootView();
    popupWindow.showAtLocation(contextView, Gravity.CENTER, mPosX, mPosY);

    containerView.setOnTouchListener(new View.OnTouchListener() {
      private int dx = 0;
      private int dy = 0;

      @Override
      public boolean onTouch(View view, MotionEvent motionEvent) {
        switch (motionEvent.getAction()) {
          case MotionEvent.ACTION_DOWN:
            dx = mPosX - (int) motionEvent.getRawX();
            dy = mPosY - (int) motionEvent.getRawY();
            break;
          case MotionEvent.ACTION_MOVE:
            mPosX = (int) (motionEvent.getRawX() + dx);
            mPosY = (int) (motionEvent.getRawY() + dy);
            popupWindow.update(mPosX, mPosY, -1, -1);
            break;
        }
        mGestureDetector.onTouchEvent(motionEvent);
        return true;
      }
    });
  }

  void dismiss() {
    popupWindow.dismiss();
    containerView.setOnTouchListener(null);
  }

  private void fullScreen() {
    if (isFullScreen) {
      popupWindow.update(this.width, this.height);
      isFullScreen = false;
      return;
    }
    DisplayMetrics displaymetrics = new DisplayMetrics();
    ((Activity) ctx).getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
    int height = displaymetrics.heightPixels;
    int width = displaymetrics.widthPixels;
    popupWindow.update(width, height);
    isFullScreen = true;
  }

  private class PreviewOnGestureListener extends GestureDetector.SimpleOnGestureListener {

    @Override
    public boolean onDoubleTap(MotionEvent e) {
      fullScreen();
      return false;
    }
  }
}
