import RNFS from "react-native-fs";
import { NativeModules, NativeAppEventEmitter } from "react-native";

const RNMediaPlayer = NativeModules.RNMediaPlayer;

let containerCounter = 0;

class Container {
	constructor(props){
		containerCounter++;
		this.id = containerCounter;
		this.type = props.type;
		this.supportedTypeList = props.supportedTypeList;
	}
	async setPath(path){
		this.filePath = path;
		await this.checkFileExist();
		await this.checkIsSupportedFile();
	}
	checkFileExist(){
		return new Promise((resolve, reject) => {
			RNFS.stat(this.filePath).then(async (handler) => {
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
			let supportedType = new RegExp("\.(" + this.supportedTypeList.join("|") + ")$", 'i');
			if(!supportedType.test(this.filePath)){
				reject(new Error("Not supported file type [" + this.supportedTypeList.join() + "]."));
			}
			else{
				resolve();
			}
		});
	}
	async rendOut(){
		await RNMediaPlayer.rendOut();
	}
}

class Image extends Container {
	constructor(){
		super({
			type: "image",
			supportedTypeList: ["jpg", "jpeg", "png"]
		});
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
		await RNMediaPlayer.rendImage(this.filePath);
		if(this.duration > 0){
			this.countdownClock = setTimeout(async () => {
				await this.rendOut();
				this.countdownClock = null;
			}, this.duration);
		}
	}
}

class Video extends Container {
	constructor(){
		super({
			type: "video",
			supportedTypeList: ["mp4"]
		});
	}
	async rendIn(){
		await RNMediaPlayer.rendVideo(this.filePath);
	}
}

module.exports = {
	Image: Image,
	Video: Video
}