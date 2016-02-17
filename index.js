import { NativeModules, NativeAppEventEmitter } from "react-native";

const RNMediaPlayer = NativeModules.RNMediaPlayer;

import { RENDER_STATUS, PUSH_WAY } from "./constant";
import { Image, Video } from "./container";

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
	}

	remove(id){
		if(this.rending && this.rending.id == id){
			// Call rendout
			this.rending.rendOut();
			this.rending = null;
		}
		else{
			this.queue = this.queue.filter((item) => (item.id != id));
		}
	}
	clear(){
		this.queue = [];
		
		// Call rendout
		if(this.rending){
			this.rending.rendOut();
			this.rending = null;
		}
	}

	// Group feature
	initializeGroup(replay, random){
		this.groupList = [];
		if(replay == true){
			this.replay = true;
		}
		if(random == true){
			this.random = true;
		}
		this.clear();
	}
	async pushImagesToGroup(pathList, dutation, rePushAll){
		await this.pushItemsToGroup(pathList.map((path) => {
			return {
				type: "image",
				path: path,
				dutation: dutation
			}
		}), rePushAll);
	}
	async pushVideosToGroup(pathList, rePushAll){
		await this.pushItemsToGroup(pathList.map((path) => {
			return {
				type: "video",
				path: path
			}
		}), rePushAll);
	}
	async pushItemsToGroup(itemList, rePushAll){
		return new Promise(async (resolve, reject) => {
			if(this.groupList){
				itemList.forEach((item) => {
					this.groupList.push(item);
				});
				try{
					if(rePushAll){
						await this.pushGroup();
					}
					resolve();
				}
				catch(err){
					reject(err);
				}
			}
			else{
				reject(new Error("Must initialize group first."));
			}
		});
	}
	async pushGroup(){
		return new Promise(async (resolve, reject) => {
			if(this.groupList && this.groupList.length > 0){
				this.clear();
				if(this.random){
					this.groupList.sort(() => {
						return Math.random() > 0.5;
					});
				}
				let promiseList = this.groupList.map(async (item) => {
					switch(item.type){
						case "image":
							return await this.pushImage(item.path, item.dutation, PUSH_WAY.AtLast);
						case "video":
							return await this.pushVideo(item.path, PUSH_WAY.AtLast);
					}
				});
				try{
					await Promise.all(promiseList);
					resolve();
				}
				catch(err){
					reject(err);
				}
			}
			else{
				reject(new Error("Must initialize group and push something to rend."));
			}
		});
	}
	getGroupList(){
		return this.groupList;
	}
};

module.exports = new MedaiPlayer();