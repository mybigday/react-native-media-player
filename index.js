import { NativeModules, NativeAppEventEmitter } from "react-native";

const RNMediaPlayer = NativeModules.RNMediaPlayer;

import { RENDER_STATUS, PUSH_TYPE } from "./constant";
import { Image, Video } from "./container";

class MedaiPlayer {
	constructor(){
		// Define constant
		this.PUSH_TYPE = PUSH_TYPE;

		// This queue only keep not rend yet item
		// First one is next rend item
		this.queue = [];
		this.rending = null;
		this.renderStatus = RENDER_STATUS.Idle;

		// RNMediaPlayer Init
		RNMediaPlayer.initialize();

		// Subsript event
		this.subscription = [];
		this.subscription.push(NativeAppEventEmitter.addListener("RendInStart",(container) => {
			this.renderStatus = RENDER_STATUS.Rending;
			console.log("Status:" + this.renderStatus);
		}));
		this.subscription.push(NativeAppEventEmitter.addListener("RendOutStart",(container) => {
			this.renderStatus = RENDER_STATUS.RendOut;
			console.log("Status:" + this.renderStatus);
		}));
		this.subscription.push(NativeAppEventEmitter.addListener("RendOutFinish",(container) => {
			this.renderStatus = RENDER_STATUS.Idle;
			console.log("Status:" + this.renderStatus);
			this.rendNextItem();
		}));
	}
	destructors(){
		this.subscription.forEach((sub) => {
			sub.remove();
		});
	}
	async pushImage(path, duration, way){
		let image = new Image();
		await image.setPath(path);
		await image.setDuration(duration);
		this.push(image, way);
	}
	async pushVideo(path, way){
		let video = new Video();
		await video.setPath(path);
		this.push(video, way);
	}
	async push(item, way){
		switch(way){
			case PUSH_TYPE.AfterNow:
				if(this.queue.length > 0){
					this.queue.splice(1, 0, item);
				}
				else{
					this.queue.push(item);
				}
				break;
			case PUSH_TYPE.Interrupt:
				// Call rendout
				this.queue.unshift(item);
				break;
			case PUSH_TYPE.ClearOther:
				// Call rendout
				this.queue = [item];
				break;
			case PUSH_TYPE.AtLast:
			default:
				this.queue.push(item);
		}
		// Check render state to call rend in
		if(this.renderStatus == RENDER_STATUS.Idle){
			this.rendNextItem();
		}
	}
	async rendNextItem(){
		let item = this.queue.shift();
		if(item){
			try{
				await item.rendIn();
			}
			catch(err){
				console.log(err);
			}
		}
	}
	remove(id){
		if(this.rending && this.rending.id == id){
			// Call rendout
		}
		else{
			this.queue = this.queue.filter((item) => (item.id != id));
		}
	}
	clear(){
		this.queue = [];
		// Call rendout
	}
};

module.exports = new MedaiPlayer();