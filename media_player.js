import { RENDER_STATUS, PUSH_WAY, EVENT_CHANNEL } from "./constant";
import { Image, Video } from "./container";
import Group from "./group";

export default class MediaPlayer {
	constructor(nativeModules, nativeAppEventEmitter, eventEmitter, RNFS){
		// Define constant
		this.PUSH_WAY = PUSH_WAY;
		this.RENDER_STATUS = RENDER_STATUS;
		this.EVENT_CHANNEL = EVENT_CHANNEL;

		// This queue only keep not rend yet item
		// First one is next rend item
		this.queue = [];
		// Rending is keep the item during RendInStart and RendOutStart
		this.rending = null;
		// Background is a container to rend when Idle
		this.background = null;
		this.renderStatus = RENDER_STATUS.Idle;

		this.emitter = eventEmitter;

		// RNMediaPlayer Init
		this.RNMediaPlayer = nativeModules.RNMediaPlayer;
		this.RNFS = RNFS;
		this.RNMediaPlayer.initialize();

		// Subsript native event
		this.subscription = [];
		this.subscription.push(nativeAppEventEmitter.addListener("RendInStart",() => {
			this.renderStatus = RENDER_STATUS.Rending;
			if(this.rending){
				this.emitter.emit(EVENT_CHANNEL.RENDER_STATUS, RENDER_STATUS.Rending, this.rending.id);
			}
		}));
		this.subscription.push(nativeAppEventEmitter.addListener("RendOutStart",() => {
			if(this.rending){
				this.renderStatus = RENDER_STATUS.RendOut;
				this.emitter.emit(EVENT_CHANNEL.RENDER_STATUS, RENDER_STATUS.RendOut, this.rending.id);
				this.rending = null;
			}
		}));
		this.subscription.push(nativeAppEventEmitter.addListener("RendOutFinish",() => {
			this.renderStatus = RENDER_STATUS.Idle;
			this.emitter.emit(EVENT_CHANNEL.RENDER_STATUS, RENDER_STATUS.Idle);
			this.rendNextItem();
		}));
	}
	destructors(){
		// Clear checking timer
		if(this.checker){
			clearInterval(this.checker);
		}
		// Unsubsript native event
		this.subscription.forEach((sub) => {
			sub.remove();
		});
	}
	subscribe(channel, listener){
		// TODO: Must test channel
		this.emitter.addListener(channel, listener);
	}
	unSubstribe(channel, listener){
		this.emitter.removeListener(channel, listener);
	}
	async setBackground(path){
		let image = new Image(this);
		await image.setPath(path);
		await image.setDuration(0);
		this.background = image;
		await this.pushBackground();
	}
	async pushImage(path, duration, way){
		let image = new Image(this);
		await image.setPath(path);
		await image.setDuration(duration);
		await this.push(image, way);
		return image.id;
	}
	async pushVideo(path, way){
		let video = new Video(this);
		await video.setPath(path);
		await this.push(video, way);
		return video.id;
	}
	async pushBackground(){
		if(this.background && this.queue.length == 0 && !this.rending){
			await this.background.rendIn();
		}
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
				await this.clear();
				this.queue.unshift(item);
				break;
			case PUSH_WAY.ClearOther:
				await this.clear();
				this.queue = [item];
				break;
			case PUSH_WAY.AtLast:
			default:
				this.queue.push(item);
		}
		// Check render state to call rend in
		if((this.renderStatus == RENDER_STATUS.Idle && !this.rending)|| (this.background && this.background.rending)){
			await this.rendNextItem();
		}
	}
	async rendNextItem(){
		let item = this.queue.shift();
		if(item){
			if(this.background && this.background.rending){
				this.queue.unshift(item);
				await this.background.rendOut();
			}
			else{
				this.rending = item;
				await this.rending.rendIn();
			}
		}
		else if(this.group){
			if(await this.group.finish()){
				await this.pushBackground();
			}
		}
		else{
			await this.pushBackground();
		}
	}
	async remove(id){
		if(this.rending && this.rending.id == id){
			// Call rendout
			await this.rending.rendOut();
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
