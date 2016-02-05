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
		self.duration = 0;
		self.rendinAnimationDuration = 1.0;
		self.rendState = New;
	}
	return self;
}

-(id) initWithRenderView: (UIView *)initRenderView inDuration:(NSTimeInterval)initDuration {
	self = [self initWithRenderView:initRenderView];
	if(self){
		self.duration = initDuration;
	}
	return self;
}

-(void) rendIn{
	dispatch_async(dispatch_get_main_queue(), ^{
		// Prepare content
		self.contentView = [self prepareContent];
		if(self.contentView){
			[self beforeRendIn];
			[self.renderView addSubview:self.contentView];
			
			[self.contentView setTranslatesAutoresizingMaskIntoConstraints:NO];
			
			[self.renderView addConstraint:[NSLayoutConstraint constraintWithItem:self.contentView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:self.renderView attribute:NSLayoutAttributeWidth multiplier:1.0 constant:0]];
			[self.renderView addConstraint:[NSLayoutConstraint constraintWithItem:self.contentView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:self.renderView attribute:NSLayoutAttributeHeight multiplier:1.0 constant:0]];
			[self.renderView addConstraint:[NSLayoutConstraint constraintWithItem:self.contentView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:self.renderView attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0]];
			[self.renderView addConstraint:[NSLayoutConstraint constraintWithItem:self.contentView attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:self.renderView attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0]];
			
			[self.delegate containerRendInStart];
			
			// Rend-In animation
			// TODO: anamation need move to seperate function
			[self.contentView setAlpha:0.0];
			[UIView animateWithDuration:self.rendinAnimationDuration animations:^(){
				[self.contentView setAlpha:1.0];
			}];
			
			// Setup Rend-Out timer
			if(self.duration > 0){
				if(self.renderTimer){
					NSLog(@"You can only render once");
				}
				else{
					self.renderTimer = [NSTimer scheduledTimerWithTimeInterval:(self.duration + self.rendinAnimationDuration) target:self selector:@selector(contentShowTimeout:) userInfo:nil repeats:NO];
				}
			}
		}
	});
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
	NSLog(@"rendOut");
	
	// Delegate notify
	[self.delegate containerRendOutStart];
	
	// Stop Rend-Out timer
	if(self.renderTimer){
		[self.renderTimer invalidate];
		self.renderTimer = nil;
	}
	
	// Rend-Out animation
	dispatch_async(dispatch_get_main_queue(), ^{
		[UIView animateWithDuration:self.rendinAnimationDuration delay:0.0 options:UIViewAnimationOptionCurveEaseOut animations:^{
			[self.contentView setAlpha:0.0];
		} completion:^(BOOL finishied){
			[self.contentView removeFromSuperview];
			[self afterRendOut];
			// Delegate notify
			NSLog(@"Call containerRendOutFinish");
			[self.delegate containerRendOutFinish];
		}];
	});
}

-(void) afterRendOut{
	// Do nothing
}

-(void) contentShowTimeout: (NSTimer *)sender{
	[self rendOut];
}

@end
