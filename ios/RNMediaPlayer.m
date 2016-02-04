//
//  ExternalDisplayMediaQueueManager.m
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/16.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "RNMediaPlayer.h"

@implementation RNMediaPlayer {
	UIScreen *screen;
	UIWindow *window;
	UIViewController *viewController;
	NSMutableArray *renderQueue;
	Container *rendoutContainer;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initialize: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	// Log documents path
	NSString *documentsPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
	NSLog(@"%@", documentsPath);

	// Initialize property
	renderQueue = [[NSMutableArray alloc] init];
	rendoutContainer = nil;

	// External screen connect notification
	NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
	[center addObserver:self selector:@selector(handleScreenDidConnectNotification:) name:UIScreenDidConnectNotification object:nil];
	[center addObserver:self selector:@selector(handleScreenDidDisconnectNotification:) name:UIScreenDidDisconnectNotification object:nil];

	// Window initialize
	dispatch_async(dispatch_get_main_queue(), ^{
		NSArray *screens = [UIScreen screens];
		if([screens count] > 1){
			screen = [screens objectAtIndex:1];
		}
		else{
			screen = [screens objectAtIndex:0];
		}
		window = [[UIWindow alloc] init];
		[window setBackgroundColor:[UIColor redColor]];
		viewController = [[UIViewController alloc] init];
		window.rootViewController = viewController;
		[self changeScreen];
		resolve(@{});
	});
}

RCT_EXPORT_METHOD(pushImage: (NSString *)path type:(NSString *)type duration:(NSTimeInterval)duration resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	UIImage *image = [UIImage imageWithContentsOfFile:path];
	NSLog(@"duration:%f", duration);
	Container *container = [[ImageContainer alloc] initWithImage:image duration:duration renderView:window];
	if([self pushContainer:container withStringType:type]){
		resolve(@{});
	}
	else{
		reject([[NSError alloc] initWithDomain:@"Can't push image" code:0 userInfo:nil]);
	}
}

RCT_EXPORT_METHOD(pushVideo: (NSString *)path type:(NSString *)type resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
	Container *container = [[VideoContainer alloc] initWithURL:[NSURL URLWithString:path] renderView:window];
	if([self pushContainer:container withStringType:type]){
		resolve(@{});
	}
	else{
		reject([[NSError alloc] initWithDomain:@"Can't push video" code:0 userInfo:nil]);
	}
}

-(BOOL) pushContainer: (Container *)container withStringType:(NSString *)type{
	enum ContainerPushType containerPushType = AtLast;
	if([type isEqualToString:@"AfterNow"]){
		containerPushType = AfterNow;
	}
	else if([type isEqualToString:@"Interrupt"]){
		containerPushType = Interrupt;
	}
	else if([type isEqualToString:@"ClearOther"]){
		containerPushType = ClearOther;
	}
	return [self pushContainer:container withType:containerPushType];
}

-(void) changeScreen{
	window.screen = screen;
	window.frame = CGRectMake(0, 0, screen.bounds.size.width / 2, screen.bounds.size.height / 2);
	[window makeKeyAndVisible];
}

-(void) handleScreenDidConnectNotification: (NSNotification *)notification{
	NSLog(@"Screen Connect");
	// Change screen to external screen
	NSArray *screens = [UIScreen screens];
	if([screens count] > 1){
		screen = [screens objectAtIndex:1];
		[self changeScreen];
		// Need change screen
	}
}

-(void) handleScreenDidDisconnectNotification: (NSNotification *)notification{
	NSLog(@"Screen Disconnect");
	// Change screen to internal screen
	NSArray *screens = [UIScreen screens];
	screen = [screens objectAtIndex:0];
	[self changeScreen];
	// Need change screen
}

-(BOOL) pushContainer: (Container *)container withType:(enum ContainerPushType) type{
	if(renderQueue){
		container.delegate = self;
		switch(type){
			case AtLast:
				[renderQueue insertObject:container atIndex:0];
				break;
			case AfterNow:
				if(rendoutContainer || [renderQueue count] == 0){
					[renderQueue addObject:container];
				}
				else{
					[renderQueue insertObject:container atIndex:([renderQueue count] - 1)];
				}
				break;
			case Interrupt:
				if(rendoutContainer || [renderQueue count] == 0){
					[renderQueue addObject:container];
				}
				else{
					[renderQueue insertObject:container atIndex:([renderQueue count] - 1)];
					[((Container *)[renderQueue lastObject]) rendOut];
				}
				break;
			case ClearOther:
				if(rendoutContainer || [renderQueue count] == 0){
					renderQueue = [NSMutableArray arrayWithObject:container];
				}
				else{
					Container *lastObject = [renderQueue lastObject];
					renderQueue = [NSMutableArray arrayWithObject:container];
					[renderQueue addObject:lastObject];
					[lastObject rendOut];
				}
				break;
		}
		if(!rendoutContainer && [renderQueue count] == 1){
			[self showNextContent];
		}
		return YES;
	}
	else{
		return NO;
	}
}

-(void) showNextContent{
	NSLog(@"showNextContent");
	if([renderQueue count] > 0){
		Container *container = renderQueue.lastObject;
		[container rendIn];
	}
	else{
		// Push to background
		//		self.backgroundMode()
		//		self.eventDelegate.first?.queueEmpty()
	}
}

-(void) containerRendInStart{
	NSLog(@"containerRendInStart");
}

-(void) containerRendOutStart{
	NSLog(@"containerRendOutStart");
	rendoutContainer = renderQueue.lastObject;
	[renderQueue removeObjectAtIndex:[renderQueue count] - 1];
}

-(void) containerRendOutFinish{
	NSLog(@"containerRendOutFinish");
	rendoutContainer = nil;
	[self showNextContent];
}

@end
