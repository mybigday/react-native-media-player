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
	UIWindow *window;
	UIViewController *viewController;
	Container *currentContainer;
	NSMutableDictionary *avAudioPlayerDictionary;
    CGRect virtualScreenLayout;
    CGRect virtualScreenLayoutBackup;
    BOOL virtualScreenFullscreenMode;
    
    UIPanGestureRecognizer *pan;
    UIPinchGestureRecognizer *pinch;
    UITapGestureRecognizer *doubleTap;
    UITapGestureRecognizer *singleTap;
    
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
		window = [[UIWindow alloc] init];
		[window setBackgroundColor:[UIColor blackColor]];
		viewController = [[UIViewController alloc] init];
		window.rootViewController = viewController;
          virtualScreenLayout = CGRectMake(0, 0, 400, 300);
		[self changeScreen];
		[self setVirtualScreenVisible:YES];
		
		// Add UIPanGestureRecognizer
		pan = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(handlePan:)];
		[window addGestureRecognizer:pan];
		pinch = [[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(handlePinch:)];
		[window addGestureRecognizer:pinch];
		doubleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleDoubleTap:)];
		singleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleSingleTap:)];
		[singleTap requireGestureRecognizerToFail:doubleTap];
		[doubleTap setDelaysTouchesBegan:YES];
		[singleTap setDelaysTouchesBegan:YES];
		
		[doubleTap setNumberOfTapsRequired:2];
		[singleTap setNumberOfTapsRequired:1];
		[window addGestureRecognizer:doubleTap];
		[window addGestureRecognizer:singleTap];
		
		// Audio initialize
		avAudioPlayerDictionary = [NSMutableDictionary new];
		
		alreadyInitialize = YES;
	}
	if(currentContainer){
		[currentContainer rendOut];
	}
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
	NSURL *fileURL = [NSURL fileURLWithPath: path];
	Container *container = [[VideoContainer alloc] initWithURL:fileURL renderView:window];
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

RCT_EXPORT_METHOD(playMusic:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	NSError *error = nil;
	NSURL *fileURL = [NSURL fileURLWithPath: path];
	AVAudioPlayer *avAudioPlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:fileURL error:&error];
	if(error){
		return reject([NSString stringWithFormat: @"%lu", (long)error.code], error.localizedDescription, error);
	}
	avAudioPlayer.delegate = self;
	NSString *avAudioPlayerId = [[NSUUID UUID] UUIDString];
	[avAudioPlayerDictionary setObject:avAudioPlayer forKey:avAudioPlayerId];
	[avAudioPlayer play];
	resolve(@{
			  @"id": avAudioPlayerId,
			  @"duration": [NSNumber numberWithDouble:avAudioPlayer.duration]
			  });
	[self.bridge.eventDispatcher sendAppEventWithName:@"MusicStart" body:@{@"musicId": avAudioPlayerId}];
}

RCT_EXPORT_METHOD(stopMusic:(NSString *)avAudioPlayerId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	AVAudioPlayer *avAudioPlayer = [avAudioPlayerDictionary objectForKey:avAudioPlayerId];
	if(avAudioPlayer){
		[avAudioPlayer pause];
		[avAudioPlayerDictionary removeObjectForKey:avAudioPlayerId];
	}
}

RCT_EXPORT_METHOD(stopAllMusic:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	for(id avAudioPlayerId in avAudioPlayerDictionary){
		AVAudioPlayer *avAudioPlayer = [avAudioPlayerDictionary objectForKey:avAudioPlayerId];
		[avAudioPlayer pause];
	}
	[avAudioPlayerDictionary removeAllObjects];
}

RCT_EXPORT_METHOD(showVirtualScreen:(BOOL)visible resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	if([self setVirtualScreenVisible:visible]){
		resolve(@{});
	}
	else{
		NSError *err = [NSError errorWithDomain:@"Can't set virtual screen visible state then content is rending in or rending out." code:-15 userInfo:nil];
		reject([NSString stringWithFormat: @"%lu", (long)err.code], err.localizedDescription, err);
	}
}

RCT_EXPORT_METHOD(setVirtualScreenLayout: (NSInteger) x y: (NSInteger) y width:(NSInteger) width height:(NSInteger) height lock:(BOOL) lock resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    virtualScreenLayout = CGRectMake(x, y, width, height);
    [self changeScreen];
    if(lock){
        [window removeGestureRecognizer:pan];
        [window removeGestureRecognizer:pinch];
        [window removeGestureRecognizer:singleTap];
        [window removeGestureRecognizer:doubleTap];
    }
    else{
        [window addGestureRecognizer:pan];
        [window addGestureRecognizer:pinch];
        [window addGestureRecognizer:doubleTap];
        [window addGestureRecognizer:singleTap];
    }
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag{
	NSString *avAudioPlayerId = (NSString *)[[avAudioPlayerDictionary allKeysForObject:player] firstObject];
	[avAudioPlayerDictionary removeObjectForKey:avAudioPlayerId];
	[self.bridge.eventDispatcher sendAppEventWithName:@"MusicEnd" body:@{@"musicId": avAudioPlayerId}];
}

-(void) changeScreen{
    NSArray *screens = [UIScreen screens];
    if([screens count] > 1){
        UIScreen *screen = [screens objectAtIndex:1];
        window.screen = screen;
        window.frame = CGRectMake(0, 0, screen.bounds.size.width, screen.bounds.size.height);
    }
    else{
        window.screen = [screens objectAtIndex:0];
        window.frame = virtualScreenLayout;
    }
    [window makeKeyAndVisible];

    [NSTimer scheduledTimerWithTimeInterval:0.1 target:self selector:@selector(setDefaultKeyWindow:) userInfo:nil repeats:NO];
}

-(void) setDefaultKeyWindow:(NSTimer *)timer{
  [[[[UIApplication sharedApplication] windows] objectAtIndex:0] makeKeyWindow];
}

-(void) handleScreenDidConnectNotification: (NSNotification *)notification{
	[self changeScreen];
}

-(void) handleScreenDidDisconnectNotification: (NSNotification *)notification{
	[self changeScreen];
}

-(BOOL) setVirtualScreenVisible: (BOOL) visible {
	NSArray *screens = [UIScreen screens];
	if(currentContainer){
		NSString *state = @"Not set";
		switch(currentContainer.rendState){
			case New:
				state = @"New";
				break;
			case Rend:
				state = @"Rend";
				break;
			case Rendout:
				state = @"Rendout";
				break;
			case End:
				state = @"End";
				break;
		}
		if(currentContainer && (currentContainer.rendState == New || currentContainer.rendState == Rendout) ){
			return NO;
		}
	}
	if([screens count] == 1){
		if(visible){
			[window makeKeyAndVisible];
			[NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(setDefaultKeyWindow:) userInfo:nil repeats:NO];
		}
		else{
			[window setHidden:YES];
		}
	}
	return YES;
}

-(BOOL) rendin: (Container *)container{
	if(alreadyInitialize){
		if(currentContainer && currentContainer.rendState == Rend){
			[currentContainer rendOut];
		}
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

-(void) handleDoubleTap: (UITapGestureRecognizer *)recognizer{
    if(virtualScreenFullscreenMode){
        virtualScreenLayout = virtualScreenLayoutBackup;
    }
    else{
        virtualScreenLayoutBackup = virtualScreenLayout;
        virtualScreenLayout = CGRectMake(0, 0, [[UIScreen screens] objectAtIndex:0].bounds.size.width, [[UIScreen screens] objectAtIndex:0].bounds.size.height);
    }
    virtualScreenFullscreenMode = !virtualScreenFullscreenMode;
    [self changeScreen];
}

-(void) handleSingleTap: (UITapGestureRecognizer *)recognizer{
	
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

@end
