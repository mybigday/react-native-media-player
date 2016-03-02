export default class DummyPlayer{
	constructor(eventEmmitter){
		this.eventEmmitter = eventEmmitter;
	}
	initialize(){
		
	}
	rendImage(path){
		this.currentPath = path;
		this.mode = "image";
		this.eventEmmitter.callEvent("RendInStart");
	}
	setVideoDuration(duration){
		this.videoDuration = duration;
	}
	rendVideo(path){
		this.currentPath = path;
		this.mode = "video";
		this.eventEmmitter.callEvent("RendInStart");
		setTimeout(() => {
			this.rendOut();
		}, this.videoDuration);
	}
	setRendOutDuration(duration){
		this.rendOutDuration = duration;
	}
	rendOut(){
		this.eventEmmitter.callEvent("RendOutStart");
		this.currentPath = null;
		this.mode = "rendout";
		setTimeout(() => {
			this.mode = "idle";
			this.eventEmmitter.callEvent("RendOutFinish");
		}, this.rendOutDuration);
	}
}