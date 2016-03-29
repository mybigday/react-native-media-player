"use strict";

import React, {AppRegistry, Component, PropTypes, StyleSheet, View, Text, ListView, Image, TouchableHighlight} from "react-native";
import MediaPlayer from "react-native-media-player";
import RNFS from "react-native-fs";
import _ from "underscore";
import Toast from "react-native-sk-toast";

const styles = StyleSheet.create({
	container:{
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "stretch",
		backgroundColor: "#AAAAAA"
	},
	imageContainer:{
		height: 100,
		backgroundColor: "#333333"
	},
	imageListContentContainer:{
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "stretch"
	},
	buttonContainer:{
		flex: 1,
		flexDirection: "row"
	},
	spaceContainer:{
		flex: 2
	}
});

function showErrorMessage(error){
	alert(error);
}

function showInfoMessage(message){
	Toast.bottom(message);
}

class ExampleApp extends Component{
	constructor(props){
		super(props);
		let dataSource1 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		let dataSource2 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		let dataSource3 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state = {
			current_jobs: 0,
			finished_jobs: 0,
			image_file_list: [],
			image_list_data_source: dataSource1.cloneWithRows([]),
			selected_image_file_list: [],
			video_file_list: [],
			video_list_data_source: dataSource2.cloneWithRows([]),
			selected_video_file_list: [],
			audio_file_list: [],
			audio_list_data_source: dataSource3.cloneWithRows([]),
			selected_audio_file_list: [],
			random: false,
			repeat: false
		};
		this.loadResource();
		MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.RENDER_STATUS, (stats, containerId) => {
			showInfoMessage("Render: " + stats + " ID:" + containerId);
		});
		MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.MUSIC_STATUS, (stats, musicId) => {
			showInfoMessage("Music: " + stats + " ID:" + musicId);
		});
		MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.GROUP_STATUS, (stats) => {
			showInfoMessage("Group: " + stats);
		});
		console.log(RNFS.DocumentDirectoryPath);
	}
	handlePushImage = async () => {
		try{
			if(this.state.selected_image_file_list.length > 0){
				let containerId = await MediaPlayer.pushImage(this.state.selected_image_file_list[0], 2000, MediaPlayer.PUSH_WAY.AtLast);
				console.log("Image Container ID:" + containerId);
			}
			else{
				showErrorMessage("You need select a image file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handlePushVideo = async () => {
		try{
			if(this.state.selected_video_file_list.length > 0){
				let containerId = await MediaPlayer.pushVideo(this.state.selected_video_file_list[0], MediaPlayer.PUSH_WAY.AtLast);
				console.log("Video Container ID:" + containerId);
			}
			else{
				showErrorMessage("You need select a video file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handlePlayMusic = async () => {
		try{
			if(this.state.selected_audio_file_list.length > 0){
				let music = await MediaPlayer.playMusic(this.state.selected_audio_file_list[0], true);
				this.setState({
					last_music_id: music.id
				});
				showInfoMessage("Play Music: " + music.id + " Duration:" + music.duration);
			}
			else{
				showErrorMessage("You need select a music file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handleStopMusic = async () => {
		try{
			if(this.state.last_music_id && this.state.last_music_id != ""){
				console.log(this.state.last_music_id);
				await MediaPlayer.stopMusic(this.state.last_music_id);
				showInfoMessage("Stop Music: " + this.state.last_music_id);
				this.setState({
					last_music_id: null
				});
			}
			else{
				showErrorMessage("There is no playing music.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handlePlaySound = async () => {
		try{
			if(this.state.selected_audio_file_list.length > 0){
				await MediaPlayer.playMusic(this.state.selected_audio_file_list[0]);
			}
			else{
				showErrorMessage("You need select a music file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handleDownload = () => {
		// Download Photo
		fetch("https://api.flickr.com/services/feeds/photos_faves.gne?id=49840387@N03&format=json").then((response) => response.text()).then((responseText) => {
			let results = responseText.match(/"m":"https(.)+_m.jpg/g);
			let index = 1;
			results.forEach((item) => {
				RNFS.downloadFile(item.replace("\"m\":\"", "").replace("_m", "_b"), RNFS.DocumentDirectoryPath + "/" + index + ".jpg", () => {
					this.setState({
						current_jobs: this.state.current_jobs + 1
					});
				}, (downloadResult) => {
					if(downloadResult.contentLength == downloadResult.bytesWritten){
						this.setState({
							finished_jobs: this.state.finished_jobs + 1
						});
						this.loadResource();
					}
				});
				index++;
			});
		}).catch((err) => {
			showErrorMessage(err);
		});

		// Download Video
		let videoUrlList = [
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_5mb.mp4",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_20mb.mp4"
		];
		let index = 1;
		videoUrlList.forEach((url) => {
			RNFS.downloadFile(url, RNFS.DocumentDirectoryPath + "/" + index + ".mp4", () => {
				this.setState({
					current_jobs: this.state.current_jobs + 1
				});
			}, (downloadResult) => {
				if(downloadResult.contentLength == downloadResult.bytesWritten){
					this.setState({
						finished_jobs: this.state.finished_jobs + 1
					});
					this.loadResource();
				}
			});
			index++;
		});

		// Download Music
		let audioUrlList = [
			"http://www.sample-videos.com/audio/mp3/india-national-anthem.mp3",
			"http://www.sample-videos.com/audio/mp3/crowd-cheering.mp3",
			"http://www.sample-videos.com/audio/mp3/wave.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_1_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_2_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_3_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_4_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_5_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_6_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_7_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_8_Sound_Effect.mp3",
			"http://soundfxcenter.com/human/speech/8d82b5_The_Number_9_Sound_Effect.mp3"
		];
		index = 1;
		audioUrlList.forEach((url) => {
			RNFS.downloadFile(url, RNFS.DocumentDirectoryPath + "/" + index + ".mp3", () => {
				this.setState({
					current_jobs: this.state.current_jobs + 1
				});
			}, (downloadResult) => {
				if(downloadResult.contentLength == downloadResult.bytesWritten){
					this.setState({
						finished_jobs: this.state.finished_jobs + 1
					});
					this.loadResource();
				}
			});
			index++;
		});
	};
	loadResource = () => {
		RNFS.readDir(RNFS.DocumentDirectoryPath).then((files) => {
			let imageFileList = files.filter((file) => (file.path.indexOf("jpg") >= 0)).map((file) => {
				return {
					path: file.path,
					name: file.name
				};
			});
			let videoFileList = files.filter((file) => (file.path.indexOf("mp4") >= 0)).map((file) => {
				return {
					path: file.path,
					name: file.name
				};
			});
			let audioFileList = files.filter((file) => (file.path.indexOf("mp3") >= 0)).map((file) => {
				return {
					path: file.path,
					name: file.name
				};
			});
			this.setState({
				image_file_list: imageFileList,
				image_list_data_source: this.state.image_list_data_source.cloneWithRows(imageFileList),
				video_file_list: videoFileList,
				video_list_data_source: this.state.video_list_data_source.cloneWithRows(videoFileList),
				audio_file_list: audioFileList,
				audio_list_data_source: this.state.audio_list_data_source.cloneWithRows(audioFileList)
			});
		}).catch((err) => {
			showErrorMessage(err);
		});
	};

	handleCreateGroup = () => {
		MediaPlayer.createGroup(this.state.repeat, this.state.random);
	};
	handleDeleteGroup = () => {
		MediaPlayer.deleteGroup();
	};
	handleToggleRandom = () => {
		this.setState({
			random: !this.state.random
		});
	};
	handleToggleRepeat = () => {
		this.setState({
			repeat: !this.state.repeat
		});
	};
	handlePushImageToGroup = async () => {
		try{
			if(this.state.selected_image_file_list.length > 0){
				await MediaPlayer.group.pushImages(this.state.selected_image_file_list, 2000, true);
			}
			else{
				showErrorMessage("You need select one or more image file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handlePushVideoToGroup = async () => {
		try{
			if(this.state.selected_video_file_list.length > 0){
				await MediaPlayer.group.pushVideos(this.state.selected_video_file_list, true);
			}
			else{
				showErrorMessage("You need select one or more video file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handlePushMusicToGroup = async () => {
		try{
			if(this.state.selected_audio_file_list.length > 0){
				await MediaPlayer.group.pushMusics(this.state.selected_audio_file_list);
			}
			else{
				showErrorMessage("You need select one or more music file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handleStartGroup = async () => {
		try{
			await MediaPlayer.group.start();
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handleStopGroup = async () => {
		try{
			await MediaPlayer.group.stop();
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handleSetBackground = async () => {
		try{
			if(this.state.selected_image_file_list.length > 0){
				await MediaPlayer.setBackground(this.state.selected_image_file_list[0]);
			}
			else{
				showErrorMessage("You need select a image file.");
			}
		}
		catch(err){
			showErrorMessage(err);
		}
	};
	handleClearBackground = async () => {
		await MediaPlayer.clearBackground();
	};
	handlePrintSupportFileType = () => {
		console.log(MediaPlayer.getSupportFileTypeList());
	};
	render(){
		return (
			<View style={styles.container}>
				<View style={styles.buttonContainer}>
					<Button
						title={"Set Background"}
						onPress={this.handleSetBackground}
					/>
					<Button
						title={"Clear Background"}
						onPress={this.handleClearBackground}
					/>
					<Button
						title={"Push Image"}
						onPress={this.handlePushImage}
					/>
					<Button
						title={"Push Video"}
						onPress={this.handlePushVideo}
					/>
					<Button
						title={"Download Resource" + ((this.state.current_jobs > 0)?" (" + this.state.finished_jobs + " / " + this.state.current_jobs + ")":"")}
						onPress={this.handleDownload}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						title={"Play Music"}
						onPress={this.handlePlayMusic}
					/>
					<Button
						title={"Stop Music"}
						onPress={this.handleStopMusic}
					/>
					<Button
						title={"Play Sound"}
						onPress={this.handlePlaySound}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						title={"Create Group"}
						onPress={this.handleCreateGroup}
					/>
					<Button
						title={"Toggle Random: " + this.state.random}
						onPress={this.handleToggleRandom}
					/>
					<Button
						title={"Toggle Repeat: " + this.state.repeat}
						onPress={this.handleToggleRepeat}
					/>
					<Button
						title={"Delete Group"}
						onPress={this.handleDeleteGroup}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						title={"Add Image To Group"}
						onPress={this.handlePushImageToGroup}
					/>
					<Button
						title={"Add Video To Group"}
						onPress={this.handlePushVideoToGroup}
					/>
					<Button
						title={"Add Music To Group"}
						onPress={this.handlePushMusicToGroup}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						title={"Start Group"}
						onPress={this.handleStartGroup}
					/>
					<Button
						title={"Stop Group"}
						onPress={this.handleStopGroup}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						title={"Print Support File Type"}
						onPress={this.handlePrintSupportFileType}
					/>
				</View>
				<View style={styles.spaceContainer}></View>
				<ListView
					style={styles.imageContainer}
					contentContainerStyle={styles.imageListContentContainer}
					horizontal={true}
					dataSource={this.state.audio_list_data_source}
					renderRow={(rowData) => (
						<SelectableItem
							type={"text"}
							title={rowData.name}
							enableCheckBox={true}
							onChangeState={(selected) => {
								var newSelectedAudioFileList = [];
								if(selected){
									newSelectedAudioFileList = _(this.state.selected_audio_file_list).union(this.state.selected_audio_file_list, [rowData.path]);
								}
								else{
									newSelectedAudioFileList = _(this.state.selected_audio_file_list).without(this.state.selected_audio_file_list, rowData.path);
								}
								this.setState({
									selected_audio_file_list: newSelectedAudioFileList
								});
							}}
						/>
					)}
				/>
				<ListView
					style={styles.imageContainer}
					contentContainerStyle={styles.imageListContentContainer}
					horizontal={true}
					dataSource={this.state.video_list_data_source}
					renderRow={(rowData) => (
						<SelectableItem
							type={"text"}
							title={rowData.name}
							enableCheckBox={true}
							onChangeState={(selected) => {
								var newSelectedVideoFileList = [];
								if(selected){
									newSelectedVideoFileList = _(this.state.selected_video_file_list).union(this.state.selected_video_file_list, [rowData.path]);
								}
								else{
									newSelectedVideoFileList = _(this.state.selected_video_file_list).without(this.state.selected_video_file_list, rowData.path);
								}
								this.setState({
									selected_video_file_list: newSelectedVideoFileList
								});
							}}
						/>
					)}
				/>
				<ListView
					style={styles.imageContainer}
					contentContainerStyle={styles.imageListContentContainer}
					horizontal={true}
					dataSource={this.state.image_list_data_source}
					renderRow={(rowData) => (
						<SelectableItem
							type={"image"}
							name={rowData.name}
							path={rowData.path}
							enableCheckBox={true}
							onChangeState={(selected) => {
								var newSelectedImageFileList = [];
								if(selected){
									newSelectedImageFileList = _(this.state.selected_image_file_list).union(this.state.selected_image_file_list, [rowData.path]);
								}
								else{
									newSelectedImageFileList = _(this.state.selected_image_file_list).without(this.state.selected_image_file_list, rowData.path);
								}
								this.setState({
									selected_image_file_list: newSelectedImageFileList
								});
							}}
						/>
					)}
				/>
			</View>
		);
	}
}

const buttonStyle = StyleSheet.create({
	button:{
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: 200,
		height: 40,
		backgroundColor: "#333333",
		margin: 5
	},
	text:{
		color: "#FFFFFF",
		fontWeight: "bold",
		fontSize: 14
	}
});
class Button extends Component{
	static propTypes = {
		onPress: PropTypes.func,
		title: PropTypes.string
	};
	static defaultProps = {
		title: "Not Define"
	};
	render(){
		return (
			<TouchableHighlight onPress={this.props.onPress}>
				<View style={buttonStyle.button}>
					<Text style={buttonStyle.text}>{this.props.title}</Text>
				</View>
			</TouchableHighlight>
		);
	}
}

const selectableImageStyle = StyleSheet.create({
	container:{
		flex: 1,
		position: "relative",
		backgroundColor: "#333333",
	},
	image:{
		width: 100,
		height: 100,
		backgroundColor: "#444400"
	},
	text:{
		width: 100,
		height: 100,
		fontSize: 14,
		fontWeight: "bold",
		color: "#FFFFFF",
		textAlign: "center",
		lineHeight: 50
	},
	selector:{
		position: "absolute",
		top: 0,
		left: 0,
		width: 100,
		height: 100
	},
	notSelected:{
		backgroundColor: "rgba(0, 0, 0, 0.7)"
	}
});
class SelectableItem extends Component{
	constructor(props){
		super(props);
		this.state = {
			selected: false
		};
	}
	handlePress = () => {
		let newState = !this.state.selected;
		this.setState({
			selected: newState
		});
		this.props.onChangeState(newState);
	};
	render(){
		return (
			<TouchableHighlight onPress={this.handlePress}>
				<View style={selectableImageStyle.container}>
					{
						(this.props.type == "image")?
						(
							<Image
								style={selectableImageStyle.image}
								key={this.props.name}
								resizeMode={"stretch"} 
								source={{uri: this.props.path}}
							/>
						)
						:
						(
							<Text style={selectableImageStyle.text}>{this.props.title}</Text>
						)
					}
					{
						(this.props.enableCheckBox)?
						(
							<View style={[selectableImageStyle.selector, (!this.state.selected && selectableImageStyle.notSelected)]}></View>
						)
						:
						(
							null
						)
					}
				</View>
			</TouchableHighlight>
		);
	}
}

AppRegistry.registerComponent("example", () => ExampleApp);
