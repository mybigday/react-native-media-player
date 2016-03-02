import { EVENT_CHANNEL, PUSH_WAY, GROUP_STATUS } from "./constant";

export default class Group {
	constructor(player, replay, random){
		this.running = false;
		this.player = player;
		this.groupList = [];
		if(replay == true){
			this.replay = true;
		}
		if(random == true){
			this.random = true;
		}
	}
	async pushImages(pathList, dutation, reRendAll){
		await this.pushItems(pathList.map((path) => {
			return {
				type: "image",
				path: path,
				dutation: dutation
			};
		}), reRendAll);
	}
	async pushVideos(pathList, reRendAll){
		await this.pushItems(pathList.map((path) => {
			return {
				type: "video",
				path: path
			};
		}), reRendAll);
	}
	async pushItems(itemList, reRendAll){
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.Push);
		return new Promise(async (resolve, reject) => {
			if(this.groupList){
				itemList.forEach((item) => {
					this.groupList.push(item);
				});
				try{
					if(reRendAll && this.running){
						this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.ReRend);
						await this.player.clear(true);
						await this.start(true);
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
	getItems(){
		return this.groupList;
	}
	async start(keepCurrentQueue){
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.Start);
		return new Promise(async (resolve, reject) => {
			this.running = false;
			if(this.groupList && this.groupList.length > 0){
				if(!keepCurrentQueue){
					await this.player.clear();
				}
				if(this.random){
					this.groupList.sort(() => {
						return Math.random() > 0.5;
					});
				}
				let promiseList = this.groupList.map(async (item) => {
					switch(item.type){
						case "image":
							return await this.player.pushImage(item.path, item.dutation, PUSH_WAY.AtLast);
						case "video":
							return await this.player.pushVideo(item.path, PUSH_WAY.AtLast);
					}
				});
				try{
					await Promise.all(promiseList);
					this.running = true;
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
	async stop(){
		if(this.running == true){
			this.running = false;
			this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.Stop);
		}
		await this.player.clear();
	}
	async finish(){
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.Finished);
		if(this.running == true && this.replay == true){
			await this.start();
			return false;
		}
		else{
			await this.stop();
			return true;
		}
	}
}