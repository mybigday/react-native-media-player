//
//  Container.m
//  player_app
//
//  Created by 嚴孝頤 on 2016/1/31.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "Container.h"

@implementation Container{
	
}

-(id) initWithRenderView: (UIView *)initRenderView {
	self = [super init];
	if(self){
		self.renderView = initRenderView;
		self.rendinAnimationDuration = 1.0;
		self.rendState = New;
	}
	return self;
}

-(void) rendIn{
	// Prepare content
	self.contentView = [self prepareContent];
	if(self.contentView){
		[self beforeRendIn];
		[self.renderView addSubview:self.contentView];
		
		// TODO: Autolayout need fix to support UIPanGestureRecognizer
		[self.contentView setTranslatesAutoresizingMaskIntoConstraints:NO];
		
		[self.renderView addConstraint:[NSLayoutConstraint constraintWithItem:self.contentView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:self.renderView attribute:NSLayoutAttributeWidth multiplier:1.0 constant:0]];
		[self.renderView addConstraint:[NSLayoutConstraint constraintWithItem:self.contentView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:self.renderView attribute:NSLayoutAttributeHeight multiplier:1.0 constant:0]];
		
		[self.delegate containerRendInStart];
		
		// Rend-In animation
		// TODO: anamation need move to seperate function
		[self.contentView setAlpha:0.0];
		[UIView animateWithDuration:self.rendinAnimationDuration animations:^(){
			[self.contentView setAlpha:1.0];
			self.rendState = Rend;
		}];
	}
}

-(UIView *) prepareContent{
	NSString *message = @"ERROR: prepareContent not impletement yet!!!";
	NSLog(@"%@", message);

	UITextView *textView = [[UITextView alloc] initWithFrame:self.renderView.frame];
	[textView setBackgroundColor:[UIColor blackColor]];
	[textView setText:message];
	[textView setTextColor:[UIColor whiteColor]];
	[textView setFont:[UIFont boldSystemFontOfSize:20]];
	[textView setTextAlignment:NSTextAlignmentJustified];
	return textView;
}

-(void) beforeRendIn{
	// Do nothing
}

-(void) rendOut{
	// Delegate notify
	[self.delegate containerRendOutStart];
	self.rendState = Rendout;
	
	// Rend-Out animation
	[UIView animateWithDuration:self.rendinAnimationDuration delay:0.0 options:UIViewAnimationOptionCurveEaseOut animations:^{
		[self.contentView setAlpha:0.0];
	} completion:^(BOOL finishied){
		[self.contentView removeFromSuperview];
		self.rendState = End;
		[self afterRendOut];
		// Delegate notify
		[self.delegate containerRendOutFinish];
	}];
}

-(void) afterRendOut{
	// Do nothing
}

@end
