var assert = require("assert");
var expect = require("expect.js");
import path from "path";

// Basic test
import MediaPlayer from "../media_player";
import DummyPlayer from "./dummy_player";
import EventEmitter from "./event_emitter";
import fs from "fs-promise";

let eventEmitter = new EventEmitter();
let dummyPlayer = new DummyPlayer(eventEmitter);
let rendOutDuration = 100;
dummyPlayer.setRendOutDuration(rendOutDuration);

let basicImagePath = path.join(__dirname, "images");
let basicVideoPath = path.join(__dirname, "videos");

function testAfter(time, test, errMessage){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if(test()){
				return resolve();
			}
			return reject(new Error((errMessage)?errMessage + " (In " + time + "ms)":"Test after " + time + "ms fail."));
		}, time + 10);
	});
}

describe("Basic Function", () => {
	let mediaPlayer;
	it("should say hello + input", (done) => {
		mediaPlayer = new MediaPlayer({
			RNMediaPlayer: dummyPlayer
		}, eventEmitter, fs);
		done();
	});
	it("should run 10ms image", function(done){
		let imagePath = path.join(basicImagePath, "1.jpg");
		let duration = 100;
		let rendInContainerId;
		let rendOutContainerId;

		let rendOutCallback = (result) => {
			rendOutContainerId = result;
			mediaPlayer.unSubstribe(mediaPlayer.RENDER_STATUS.Idle, rendOutCallback);
		};
		mediaPlayer.subscribe(mediaPlayer.RENDER_STATUS.Idle, rendOutCallback);
		mediaPlayer.pushImage(imagePath, duration, mediaPlayer.AtLast).then((result) => {
			rendInContainerId = result;
			expect(dummyPlayer.mode).to.equal("image");
			expect(dummyPlayer.currentPath).to.equal(imagePath);
			return testAfter(duration, () => {
				return dummyPlayer.mode == "rendout" && !dummyPlayer.currentPath;
			}, "Image not rend out.");
		}).then(() => {
			return testAfter(rendOutDuration, () => {
				return rendInContainerId == rendOutContainerId;
			}, "Image not rend out finished.");
		}).then(() => {
			done();
		}).catch(done);
	});
	it("should run 100ms video", function(done){
		let videoPath = path.join(basicVideoPath, "1.mp4");
		let duration = 500;
		let rendInContainerId;
		let rendOutContainerId;

		let rendOutCallback = (result) => {
			rendOutContainerId = result;
			mediaPlayer.unSubstribe(mediaPlayer.RENDER_STATUS.Idle, rendOutCallback);
		};
		mediaPlayer.subscribe(mediaPlayer.RENDER_STATUS.Idle, rendOutCallback);
		dummyPlayer.setVideoDuration(duration);
		mediaPlayer.pushVideo(videoPath, mediaPlayer.AtLast).then((result) => {
			rendInContainerId = result;
			expect(dummyPlayer.mode).to.equal("video");
			expect(dummyPlayer.currentPath).to.equal(videoPath);
			return testAfter(duration, () => {
				return dummyPlayer.mode == "rendout" && !dummyPlayer.currentPath;
			}, "Video not rend out.");
		}).then(() => {
			return testAfter(rendOutDuration, () => {
				return rendInContainerId == rendOutContainerId;
			}, "Video not rend out finished.");
		}).then(() => {
			done();
		}).catch(done);
	});
});
