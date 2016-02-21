import { NativeModules, NativeAppEventEmitter } from "react-native";

const RNMediaPlayer = NativeModules.RNMediaPlayer;

import { RENDER_STATUS, PUSH_WAY } from "./constant";
import { Image, Video } from "./container";
import Group from "./group";

class MedaiPlayer {
	constructor(){
		// Define constant
		this.PUSH_WAY = PUSH_WAY;

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
			this.rending = null;
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
		return image.id;
	}
	async pushVideo(path, way){
		let video = new Video();
		await video.setPath(path);
		this.push(video, way);
		return video.id;
	}
	async push(item, way){
		switch(way){
			case PUSH_WAY.AfterNow:
				if(this.queue.length > 0){
					this.queue.splice(1, 0, item);
				}
				else{
					this.queue.push(item);
				}
				break;
			case PUSH_WAY.Interrupt:
				// Call rendout
				this.queue.unshift(item);
				break;
			case PUSH_WAY.ClearOther:
				// Call rendout
				this.queue = [item];
				break;
			case PUSH_WAY.AtLast:
			default:
				this.queue.push(item);
		}
		// Check render state to call rend in
		if(this.renderStatus == RENDER_STATUS.Idle && this.rending == null){
			await this.rendNextItem();
		}
	}
	async rendNextItem(){
		let item = this.queue.shift();
		if(item){
			this.rending = item;
			await item.rendIn();
		}
		else if(this.group){
			this.group.finish();
		}
	}
	async remove(id){
		if(this.rending && this.rending.id == id){
			// Call rendout
			await this.rending.rendOut();
			this.rending = null;
		}
		else{
			this.queue = this.queue.filter((item) => (item.id != id));
		}
	}

	async clear(keepCurrentPlaying){
		this.queue = [];
		
		// Call rendout
		if(this.rending && !keepCurrentPlaying){
			await this.rending.rendOut();
			this.rending = null;
		}
	}

	// Group feature
	async createGroup(replay, random){
		await this.deleteGroup();
		this.group = new Group(this, replay, random);
	}
	async deleteGroup(){
		if(this.group){
			await this.group.stop();
			this.group = null;
		}
	}
}

module.exports = new MedaiPlayer();