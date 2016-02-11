//
//  Container.h
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/31.
//  Copyright © 2016年 Facebook. All rights reserved.
//

@import Foundation;
@import UIKit;

@protocol RenderDelegate <NSObject>
-(void) containerRendInStart;
-(void) containerRendOutStart;
-(void) containerRendOutFinish;
@end

enum ContainerStatus{
	New, Rend, Rendout, End
};

@interface Container : NSObject

@property (nonatomic, retain) UIView *contentView;
@property (nonatomic, retain) UIView *renderView;
@property (nonatomic, retain) NSTimer *renderTimer;
//@property (nonatomic) NSTimeInterval duration;
@property (nonatomic) NSTimeInterval rendinAnimationDuration;
@property (nonatomic) enum ContainerStatus rendState;
@property (nonatomic, weak) id <RenderDelegate> delegate;

-(id) initWithRenderView: (UIView *)initRenderView;
-(void) rendIn;
-(void) rendOut;

@end
