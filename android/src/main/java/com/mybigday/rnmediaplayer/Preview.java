package com.mybigday.rnmediaplayer;

import android.app.Activity;
import android.content.Context;
import android.util.DisplayMetrics;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.widget.PopupWindow;

public class Preview {
  private int width = 0, height = 0;
  private int currentWidth = 0, currentHeight = 0;
  private int mPosX = 0, mPosY = 0;
  private Context ctx;
  private View containerView;
  private PopupWindow popupWindow;
  private GestureDetector mGestureDetector;
  private ScaleGestureDetector mScaleGestureDetector;
  private boolean isFullScreen = false;
  private boolean lock = false;

  private int touchState;
  private final int IDLE = 0;
  private final int TOUCH = 1;
  private final int PINCH = 2;

  Preview(Context ctx, View containerView, int width, int height, int x, int y, boolean lock) {
    this.ctx = ctx;
    this.containerView = containerView;
    this.width = this.currentWidth = width;
    this.height = this.currentHeight = height;
    this.mPosX = x;
    this.mPosY = y;
    this.lock = lock;

    popupWindow = new PopupWindow(containerView, width, height, false);
    mGestureDetector = new GestureDetector(ctx, new PreviewOnGestureListener());
    mScaleGestureDetector = new ScaleGestureDetector(ctx, new PreviewOnScaleGestureListener());
  }

  public void show() {
    View contextView = ((Activity) ctx).getWindow().getDecorView().getRootView();
    popupWindow.showAtLocation(contextView, Gravity.AXIS_X_SHIFT, mPosX, mPosY);
    touchState = IDLE;
    containerView.setOnTouchListener(new PreviewOnTouchListener());
  }

  public void setLayout(int x, int y, int w, int h, boolean lock) {
    this.lock = lock;

    mPosX = x >= 0 ? x : mPosX;
    mPosY = y >= 0 ? y : mPosY;
    width = w >= 0 ? w : width;
    height = h >= 0 ? h : height;
    popupWindow.update(mPosX, mPosY, width, height, lock);
  }

  class PreviewOnTouchListener implements View.OnTouchListener {
    private int dx = 0;
    private int dy = 0;

    @Override
    public boolean onTouch(View view, MotionEvent motionEvent) {
      if (lock) return false;

      switch (motionEvent.getAction()) {
        case MotionEvent.ACTION_DOWN:
          dx = mPosX - (int) motionEvent.getRawX();
          dy = mPosY - (int) motionEvent.getRawY();
          touchState = TOUCH;
          break;
        case MotionEvent.ACTION_POINTER_DOWN:
          touchState = PINCH;
          break;
        case MotionEvent.ACTION_MOVE:
          if (touchState == PINCH) break;
          mPosX = (int) (motionEvent.getRawX() + dx);
          mPosY = (int) (motionEvent.getRawY() + dy);

          if (mPosX < 0) mPosX = 0;
          if (mPosY < 0) mPosY = 0;
          DisplayMetrics displaymetrics = new DisplayMetrics();
          ((Activity) ctx).getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
          int screenHeight = displaymetrics.heightPixels;
          int screenWidth = displaymetrics.widthPixels;
          if (mPosX - width > screenWidth - width)
            mPosX = screenWidth - width;
          if (mPosY - height > screenHeight - height)
            mPosY = screenHeight - height;

          popupWindow.update(mPosX, mPosY, -1, -1);
          break;
        case MotionEvent.ACTION_UP:
          touchState = IDLE;
          break;
        case MotionEvent.ACTION_POINTER_UP:
          touchState = TOUCH;
          break;
      }
      mGestureDetector.onTouchEvent(motionEvent);
      mScaleGestureDetector.onTouchEvent(motionEvent);
      return true;
    }
  }

  public void dismiss() {
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

  private class PreviewOnScaleGestureListener implements ScaleGestureDetector.OnScaleGestureListener {
    float mScaleFactor = 1;

    @Override
    public boolean onScale(ScaleGestureDetector detector) {
      mScaleFactor *= detector.getScaleFactor();
      mScaleFactor = (mScaleFactor < 1 ? 1 : mScaleFactor);
      mScaleFactor = ((float)((int)(mScaleFactor * 100))) / 100;
      currentWidth = (int) (width + 10 * mScaleFactor);
      currentHeight = (int) (height + 10 * mScaleFactor);

      DisplayMetrics displaymetrics = new DisplayMetrics();
      ((Activity) ctx).getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
      int screenHeight = displaymetrics.heightPixels;
      int screenWidth = displaymetrics.widthPixels;

      if (currentWidth > screenWidth || currentHeight > screenHeight) {
        currentWidth = screenWidth;
        currentHeight = screenHeight;
      }
      popupWindow.update(currentWidth, currentHeight);
      return true;
    }

    @Override
    public boolean onScaleBegin(ScaleGestureDetector detector) {
      touchState = PINCH;
      return true;
    }

    @Override
    public void onScaleEnd(ScaleGestureDetector detector) {
      touchState = IDLE;
    }
  }

  private class PreviewOnGestureListener extends GestureDetector.SimpleOnGestureListener {


    @Override
    public boolean onDoubleTap(MotionEvent e) {
      fullScreen();
      return false;
    }
  }
}
