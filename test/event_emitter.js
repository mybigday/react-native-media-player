export default class EventEmitter{
	constructor(){
		this.eventList = {};
	}
	addListener(name, callback){
		this.eventList[name] = callback;
	}
	callEvent(name){
		if(this.eventList[name]){
			this.eventList[name]();
		}
	}
}