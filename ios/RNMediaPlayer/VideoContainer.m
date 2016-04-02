//
//  VideoContainer.m
//  player_app
//
//  Created by 嚴孝頤 on 2016/2/1.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "VideoContainer.h"

@interface PlayerView : UIView
@property (nonatomic) AVPlayer *player;
@end

@implementation PlayerView
+ (Class)layerClass {
	return [AVPlayerLayer class];
}
- (AVPlayer*)player {
	return [(AVPlayerLayer *)[self layer] player];
}
- (void)setPlayer:(AVPlayer *)player {
	[(AVPlayerLayer *)[self layer] setPlayer:player];
}
@end


@implementation VideoContainer{
	NSURL *sourceFileURL;
	AVPlayerItem *avPlayerItem;
	AVPlayer *avPlayer;
}

-(id) initWithURL: (NSURL *)initUrl renderView: (UIView *) initRenderView {
	self = [super initWithRenderView:initRenderView];
	if(self){
		sourceFileURL = initUrl;
	}
	return self;
}

-(UIView *) prepareContent {
	PlayerView *containerView = [[PlayerView alloc] init];
	
	// Prepare play item
	AVURLAsset *avUrlAsset = [AVURLAsset URLAssetWithURL:sourceFileURL options:nil];
	avPlayerItem = [AVPlayerItem playerItemWithAsset:avUrlAsset];
	avPlayer = [AVPlayer playerWithPlayerItem:avPlayerItem];
	[containerView setPlayer:avPlayer];

	// Add status observer
	[avPlayerItem addObserver:self forKeyPath:@"status" options:NSKeyValueObservingOptionNew context:nil];
	
	// Handle video play finished
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(videoEnd:) name:AVPlayerItemDidPlayToEndTimeNotification object:avPlayerItem];
	return containerView;
}

- (void) videoEnd: (NSNotification *)notification{
	NSLog(@"videoEnd");
	[[NSNotificationCenter defaultCenter] removeObserver:self name:AVPlayerItemDidPlayToEndTimeNotification object:avPlayerItem];
	[self rendOut];
}

- (void) afterRendOut{
	[avPlayer pause];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context{
	if([keyPath isEqualToString:@"status"]){
		switch(avPlayerItem.status){
			case AVPlayerItemStatusReadyToPlay:
				NSLog(@"AVPlayerItemStatusReadyToPlay");
				[avPlayer play];
				[avPlayerItem removeObserver:self forKeyPath:@"status"];
				break;
			case AVPlayerItemStatusFailed:
				NSLog(@"AVPlayerItemStatusFailed");
				break;
			case AVPlayerItemStatusUnknown:
				NSLog(@"AVPlayerItemStatusUnknown");
				break;
		}
	}
}

@end
