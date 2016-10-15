import { EVENT_CHANNEL, PUSH_WAY, GROUP_STATUS } from "./constant";

export default class Group {
	constructor(player, replay, random){
		this.running = false;
		this.player = player;
		this.groupList = [];
		this.musicList = [];
		this.musicQueue = [];
		this.currentMusicId = null;
		this.musicRunning = false;
		if(replay == true){
			this.replay = true;
		}
		if(random == true){
			this.random = true;
		}
	}

	// Group
	async start(){
		await this.startRender();
		await this.startMusic();
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.Start);
	}
	async stop(){
		await this.stopRender();
		await this.stopMusic();
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.Stop);
	}

	// Render
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
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.PushRend);
		return new Promise(async (resolve, reject) => {
			if(this.groupList){
				itemList.forEach((item) => {
					this.groupList.push(item);
				});
				try{
					if(reRendAll && this.running){
						this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.ReRend);
						await this.player.clear(true);
						await this.startRender(true);
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
	async startRender(keepCurrentQueue){
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.RendStart);
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
			else if(this.musicList.length > 0){
				resolve();
			}
			else{
				reject(new Error("Must initialize group and push something to rend."));
			}

			
		});
	}
	async stopRender(){
		if(this.running == true){
			this.running = false;
			this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.RendStop);
		}
		await this.player.clear();
	}
	async finish(){
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.RendFinished);
		if(this.running == true && this.replay == true){
			await this.startRender();
			return false;
		}
		else{
			await this.stopRender();
			return true;
		}
	}

	// Music
	async pushMusics(pathList){
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.PushMusic);
		return new Promise((resolve, reject) => {
			if(this.musicList){
				pathList.forEach((item) => {
					this.musicList.push(item);
				});
				resolve();
			}
			else{
				reject(new Error("Must initialize group first."));
			}
		});
	}
	async startMusic(){
		if(!this.musicRunning){
			this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.MusicStart);
			if(this.random){
				this.musicQueue = this.musicList.map((musicPath) => {
					return musicPath;
				}).sort(() => {
					return Math.random() > 0.5;
				});
			}
			else{
				this.musicQueue = this.musicList.map((musicPath) => {
					return musicPath;
				});
			}
			if(this.musicQueue.length > 0){
				await this.playNextMusic();
				this.musicRunning = true;
			}
		}
	}
	async stopMusic(){
		// Stop music
		await this.player.stopMusic(this.currentMusicId);
		// Clear queue
		this.musicQueue = [];
		this.musicRunning = false;
		this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.MusicStop);
	}
	async playNextMusic(){
		if(!this.currentMusicId){
			let musicPath = this.musicQueue.shift();
			if(musicPath){
				let music = await this.player.playMusic(musicPath);
				this.currentMusicId = music.id;
			}
			else{
				this.musicRunning = false;
				this.player.emitter.emit(EVENT_CHANNEL.GROUP_STATUS, GROUP_STATUS.MusicFinished);
				if(this.replay){
					await this.startMusic();
				}
			}
		}
	}
	async musicEnd(musicId){
		if(musicId == this.currentMusicId){
			this.currentMusicId = null;
			if(this.musicRunning){
				await this.playNextMusic();
			}
		}
	}
}