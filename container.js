let containerCounter = 0;

class Container {
	constructor(props, mediaPlayer){
		containerCounter++;
		this.id = containerCounter;
		this.type = props.type;
		this.supportedTypeList = props.supportedTypeList;
		this.rending = false;
		this.RNMediaPlayer = mediaPlayer.RNMediaPlayer;
		this.RNFS = mediaPlayer.RNFS;
	}
	async setPath(path){
		this.filePath = path;
		await this.checkFileExist();
		await this.checkIsSupportedFile();
	}
	checkFileExist(){
		return new Promise((resolve, reject) => {
			this.RNFS.stat(this.filePath).then(async (handler) => {
				if(!handler.isFile()){
					reject(new Error("File not exist or is directory path."));
				}
				else{
					resolve();
				}
			}).catch((err) => {
				reject(err);
			});
		});
	}
	checkIsSupportedFile(){
		return new Promise((resolve, reject) => {
			let supportedType = new RegExp("\.(" + this.supportedTypeList.join("|") + ")$", "i");
			if(!supportedType.test(this.filePath)){
				reject(new Error("Not supported file type [" + this.supportedTypeList.join() + "]."));
			}
			else{
				resolve();
			}
		});
	}
	async rendOut(){
		this.rending = false;
		await this.RNMediaPlayer.rendOut();
	}
}

class Image extends Container {
	constructor(mediaPlayer){
		super({
			type: "image",
			supportedTypeList: ["jpg", "jpeg", "png", "bmp"]
		}, mediaPlayer);
	}
	setDuration(duration){
		return new Promise((resolve, reject) => {
			if(duration < 0){
				reject(new Error("Duration must greater then 0."));
			}
			else{
				this.duration = duration;
				resolve();
			}
		});
	}
	async rendIn(){
		this.rending = true;
		await this.RNMediaPlayer.rendImage(this.filePath);
		if(this.duration > 0){
			this.countdownClock = setTimeout(async () => {
				await this.rendOut();
				this.countdownClock = null;
			}, this.duration);
		}
	}
	async rendOut(){
		if(this.countdownClock){
			clearTimeout(this.countdownClock);
			this.countdownClock = null;
		}
		await super.rendOut();
	}
}

class Video extends Container {
	constructor(mediaPlayer){
		super({
			type: "video",
			supportedTypeList: ["mp4", "mov", "m4v", "mpg", "mpeg"]
		}, mediaPlayer);
	}
	async rendIn(){
		this.rending = true;
		await this.RNMediaPlayer.rendVideo(this.filePath);
	}
}

class Music extends Container {
	constructor(mediaPlayer){
		super({
			type: "music",
			supportedTypeList: ["mp3", "m4a", "aac"]
		}, mediaPlayer);
	}
	async play(){
		let music = await this.RNMediaPlayer.playMusic(this.filePath);
		this.id = music.id;
		this.duration = music.duration;
	}
	async stop(){
		await this.rendOut();
	}
	async rendOut(){
		await this.RNMediaPlayer.stopMusic(this.id);
	}
}

module.exports = {
	Image: Image,
	Video: Video,
	Music: Music
};
