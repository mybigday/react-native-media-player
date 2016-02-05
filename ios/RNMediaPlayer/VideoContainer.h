//
//  VideoContainer.h
//  player_app
//
//  Created by 嚴孝頤 on 2016/2/1.
//  Copyright © 2016年 Facebook. All rights reserved.
//

@import Foundation;
@import UIKit;
@import AVFoundation;
#import "Container.h"

@interface VideoContainer : Container

-(id) initWithURL: (NSURL *)initUrl renderView: (UIView *) initRenderView;

@end
