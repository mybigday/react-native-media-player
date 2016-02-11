//
//  ImageContainer.m
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/22.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "ImageContainer.h"

@implementation ImageContainer{
	UIImage *image;
}

-(id) initWithImage: (UIImage *)initImage renderView: (UIView *)initRenderView {
	self = [super initWithRenderView:initRenderView];
	if(self){
		image = initImage;
	}
	return self;
}

-(UIView *) prepareContent {
	UIImageView *imageView = [[UIImageView alloc] init];
	[imageView setImage:image];
	[imageView setContentMode:UIViewContentModeScaleAspectFit];
	return imageView;
}

@end
