/* @flow */
"use strict";

import { NativeModules } from "react-native";

const RNMediaPlayer = NativeModules.RNMediaPlayer;
console.log(RNMediaPlayer);
RNMediaPlayer.initialize();

// "MEDIA_PLAYER_EVENT_RENDER_QUEUE_EMPTY"

const PushTypeList = [
	"AtLast",
	"AfterNow",
	"Interrupt",
	"ClearOther"
];
export let PUSH_TYPE = {};
PushTypeList.forEach((pushType) => {
	PUSH_TYPE[pushType] = pushType;
});

export function pushImage(filePath, type, duration){
	return new Promise((resolve, reject) => {
		if(PUSH_TYPE[type]){
			if(duration >= 0){
				resolve(RNMediaPlayer.pushImage(filePath, type, duration));
			}
			else{
				reject("Duration must greater then 0.");
			}
		}
		else{
			reject("Unsupport push type.");
		}
	});
}

export function pushVideo(filePath, type){
	return new Promise((resolve, reject) => {
		if(PUSH_TYPE[type]){
			RNMediaPlayer.pushVideo(filePath, type);
		}
		else{
			reject("Unsupport push type.");
		}
	});	
}

// export function pushGroupImage(filePathList, random, loop){
// 	if(filePathList){

// 	}
// }