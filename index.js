/* @flow */
"use strict";

import RNFS from "react-native-fs";
import { NativeModules } from "react-native";

const RNMediaPlayer = NativeModules.RNMediaPlayer;
// "MEDIA_PLAYER_EVENT_RENDER_QUEUE_EMPTY"

const PushTypeList = [
	"AtLast",
	"AfterNow",
	"Interrupt",
	"ClearOther"
];

class MedaiPlayer {
	constructor(){
		this.PUSH_TYPE = {};
		PushTypeList.forEach((pushType) => {
			this.PUSH_TYPE[pushType] = pushType;
		});
	}
	initialize(){
		RNMediaPlayer.initialize();
	}
	pushImage(filePath, type, duration){
		return new Promise((resolve, reject) => {
			// RNFS.stat(filePath)
			if(this.PUSH_TYPE[type]){
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
}

module.exports = new MedaiPlayer();



// exports.initialize = function(){
// 	RNMediaPlayer.initialize();
// };


// export function pushVideo(filePath, type){
// 	return new Promise((resolve, reject) => {
// 		if(PUSH_TYPE[type]){
// 			RNMediaPlayer.pushVideo(filePath, type);
// 		}
// 		else{
// 			reject("Unsupport push type.");
// 		}
// 	});	
// }



// export function pushGroupImage(filePathList, random, loop){
// 	if(filePathList){

// 	}
// }