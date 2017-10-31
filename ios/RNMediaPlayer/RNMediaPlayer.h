//
//  ExternalDisplayMediaQueueManager.h
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/16.
//  Copyright © 2016年 Facebook. All rights reserved.
//

@import Foundation;
@import UIKit;
#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>
#import "Container.h"
#import "ImageContainer.h"
#import "VideoContainer.h"

@protocol RendableContainerDelegate <NSObject>
-(void) rendIn;
-(void) rendOut;
@end

enum ContainerPushType{
	AtLast, AfterNow, Interrupt, ClearOther
};

@interface RNMediaPlayer : NSObject <RCTBridgeModule, RenderDelegate, AVAudioPlayerDelegate>
@end
