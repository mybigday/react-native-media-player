//
//  ImageContainer.h
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/22.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "Container.h"

@interface ImageContainer : Container

-(id) initWithImage: (UIImage *)initImage duration: (NSTimeInterval)initDuration renderView: (UIView *) initRenderView;

@end
