//
//  ExternalDisplayMediaQueueManager.m
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/16.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "RNMediaPlayer.h"

@implementation RNMediaPlayer {
	BOOL alreadyInitialize;
	UIScreen *screen;
	UIWindow *window;
	UIViewController *viewController;
	Container *currentContainer;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initialize){
	if(!alreadyInitialize){
		// External screen connect notification
		NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
		[center addObserver:self selector:@selector(handleScreenDidConnectNotification:) name:UIScreenDidConnectNotification object:nil];
		[center addObserver:self selector:@selector(handleScreenDidDisconnectNotification:) name:UIScreenDidDisconnectNotification object:nil];
		
		// Window initialize
		dispatch_async(dispatch_get_main_queue(), ^{
			NSArray *screens = [UIScreen screens];
			CGFloat ratio = 1.0f;
			if([screens count] > 1){
				screen = [screens objectAtIndex:1];
			}
			else{
				screen = [screens objectAtIndex:0];
				ratio = 0.3f;
			}
			window = [[UIWindow alloc] init];
			[window setBackgroundColor:[UIColor blackColor]];
			viewController = [[UIViewController alloc] init];
			window.rootViewController = viewController;
			[self changeScreen:ratio];
			
			// Add UIPanGestureRecognizer
			UIPanGestureRecognizer *pan = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(handlePan:)];
			[window addGestureRecognizer:pan];
			UIPinchGestureRecognizer *pinch = [[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(handlePinch:)];
			[window addGestureRecognizer:pinch];
		});
		alreadyInitialize = YES;
	}
	if(currentContainer){
		[currentContainer rendOut];
	}
	//	[self clearAll];
}

RCT_EXPORT_METHOD(rendImage: (NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	UIImage *image = [UIImage imageWithContentsOfFile:path];
	Container *container = [[ImageContainer alloc] initWithImage:image renderView:window];
	if([self rendin:container]){
		resolve(@{});
	}
	else{
		NSError *err = [NSError errorWithDomain:@"Can't push image, maybe need initialize MediaPlayer first." code:-11 userInfo:nil];
		reject([NSString stringWithFormat: @"%lu", (long)err.code], err.localizedDescription, err);
	}
}

RCT_EXPORT_METHOD(rendVideo: (NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	Container *container = [[VideoContainer alloc] initWithURL:[NSURL URLWithString:path] renderView:window];
	if([self rendin:container]){
		resolve(@{});
	}
	else{
		NSError *err = [NSError errorWithDomain:@"Can't push video, maybe need initialize MediaPlayer first." code:-13 userInfo:nil];
		reject([NSString stringWithFormat: @"%lu", (long)err.code], err.localizedDescription, err);
	}
}

RCT_EXPORT_METHOD(rendOut:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	if(currentContainer){
		[currentContainer rendOut];
	}
	resolve(@{});
}

-(void) changeScreen: (CGFloat)ratio{
	window.screen = screen;
	window.frame = CGRectMake(0, 0, screen.bounds.size.width * ratio, screen.bounds.size.height * ratio);
	[window makeKeyAndVisible];
}

-(void) handleScreenDidConnectNotification: (NSNotification *)notification{
	// Must inishiate event
	NSLog(@"Screen Connect");
	// Change screen to external screen
	NSArray *screens = [UIScreen screens];
	if([screens count] > 1){
		screen = [screens objectAtIndex:1];
		[self changeScreen:1.0f];
	}
}

-(void) handleScreenDidDisconnectNotification: (NSNotification *)notification{
	NSLog(@"Screen Disconnect");
	// Change screen to internal screen
	NSArray *screens = [UIScreen screens];
	screen = [screens objectAtIndex:0];
	[self changeScreen:0.3f];
}

-(BOOL) rendin: (Container *)container{
	if(alreadyInitialize){
		currentContainer = container;
		currentContainer.delegate = self;
		[currentContainer rendIn];
		return YES;
	}
	else{
		return NO;
	}
}

-(void) containerRendInStart{
	[self.bridge.eventDispatcher sendAppEventWithName:@"RendInStart" body:@{}];
}

-(void) containerRendOutStart{
	[self.bridge.eventDispatcher sendAppEventWithName:@"RendOutStart" body:@{}];
}

-(void) containerRendOutFinish{
	[self.bridge.eventDispatcher sendAppEventWithName:@"RendOutFinish" body:@{}];
}

-(void) handlePan: (UIPanGestureRecognizer *)recognizer{
	CGPoint translation = [recognizer translationInView:window];
	recognizer.view.center = CGPointMake((recognizer.view.center.x + translation.x), (recognizer.view.center.y + translation.y));
	[recognizer setTranslation:CGPointMake(0, 0) inView:window];
}

-(void) handlePinch: (UIPinchGestureRecognizer *)recognizer{
	if(recognizer.state == UIGestureRecognizerStateBegan || recognizer.state == UIGestureRecognizerStateChanged){
		recognizer.view.transform = CGAffineTransformScale(recognizer.view.transform, recognizer.scale, recognizer.scale);
		recognizer.scale = 1;
	}
}

@end
