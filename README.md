# React Native Media Player

This is a react native media player with external display controller. Support photo, video, music and background mode.

__*NOTE*__ If your RN version <= 0.28, please keep use v0.2.x.

## Installation

```bash
$ npm install react-native-fs react-native-media-player --save
$ react-native link
```

## Usage

### Initialize
You just simply need to import react-native-media-player in your js world

```js
import MediaPlayer from "react-native-media-player";
```

### Get Support File Type List
You can get the support file type list programatically

```js
MediaPlayer.getSupportFileTypeList();
```

### Virtual Screen
When initialize react-native-media-player you can see one black virtual screen on your main screen. Once you plug your external display it will disappear and turn you content rend on external display. You also can show / hide your virtual screen manually when there is no external display connected.

```js
// Show the virtual screen
await MediaPlayer.showVirtualScreen();
// Hide the virtual screen
await MediaPlayer.hideVirtualScreen();
```

You also can fix the virtual screen layout and disable all gesture recognizer.

```js
// Set Virtual Screen Layout
// x: number			# The absolute x position of screen
// y: number			# The absolute y position of screen
// width: number		# New width of virtual screen
// height: number	# New height of virtual scree
// lock: bool			# Disable all gesture recognizer

MediaPlayer.setVirtualScreenLayout(0, 0, 400, 300, false);

// Or you can get your layout rect by
<View style={style.renderContainer} onLayout={(event) => {
	this.setState({
		layout: event.nativeEvent.layout;
	});
}}>

// And set layout
MediaPlayer.setVirtualScreenLayout(
	this.state.layout.x,
	this.state.layout.y,
	this.state.layout.width,
	this.state.layout.height,
	true
);
```

### Push Image or Video
Currently only support rend image file type `*.png`, `*.jpg` and video file type `*.mp4`.

```js
// Push Image
// path:     string        # The absolute path for image source
// duration: number        # Image rend duration in milliseconds
// pushWay:  string[enum]  # The way push this media (see Push Way below)

try{
	let containerId = await MediaPlayer.pushImage(image_file_path, 2000, MediaPlayer.PUSH_WAY.AtLast);
	console.log("Image Container ID:" + containerId);
}
catch(err){
	showErrorMessage(err);
}

// Push Video
// path:     string        # The absolute path for video source
// pushWay:  string[enum]  # The way push this media (see Push Way below)

try{
	let containerId = await MediaPlayer.pushVideo(video_file_path, MediaPlayer.PUSH_WAY.AtLast);
	console.log("Video Container ID:" + containerId);
}
catch(err){
	showErrorMessage(err);
}
```

### Push Way
This player have a simple rend queue. So you can push your media with four kind of way:

| Push Way | Description |
|---|---|
| **MediaPlayer.PUSH_WAY.AtLast** | Place the media at end of queue |
| **MediaPlayer.PUSH_WAY.AfterNow** | Place the media next rend position, it will rend after current rending media finish his own job |
| **MediaPlayer.PUSH_WAY.Interrupt** | This will rendout current rending media and rendin new media immediately, the other media which already in queue will still rend after this finish |
| **MediaPlayer.PUSH_WAY.ClearOther** | This will rendout current rending media and rendin new media immediately, and clear all other media which already in queue |

### Clear Queue
You can simply call `clear()` to remove all item in playlist.

```js
// Clear all item
// keepCurrentPlaying: bool   # Set true if you do not want to disturb current playing item 

let keepCurrentPlaying = true;
MediaPlayer.clear(keepCurrentPlaying);m
```

### Backgroud
If set the backgroud image for media player. The image will auto rend when render is idle. And you can use `clearBackground` to remove background image.

```js
MediaPlayer.setBackground(background_image_path);
MediaPlayer.clearBackground();
```

### Group
This player support a single group let you can play a bunch of media with random order or repeat mode. When using group you must create `group` first and then add some image or video. After you setup all your metarial just call `play()` the group will auto control those media as you want.

#### Create your group first

```js
// repeat: bool    # Group will auto replay when all item rend finished
// random: bool    # Group will random the queue order every time to start playing group

MediaPlayer.createGroup(repeat, random);
```

#### Make your playlist
Like the queue, you can push image, video, audio(not support yet) to rend.

```js
// Push image or video
// pathList:  string        # The absolute path list for images, videos, musics source
// duration:  number        # Image rend duration in milliseconds
// reRendAll: bool          # When push a new item to group rerend all item immediately
MediaPlayer.group.pushImages(pathList, duration, reRendAll);
MediaPlayer.group.pushVideos(pathList, reRendAll);
MediaPlayer.group.pushMusics(pathList);
```

#### Let's rock
Now you can play your playlist just one call, sure you can stop it. The better thing is we will keep the group let you start again util you delete it.

```js
MediaPlayer.group.start();
MediaPlayer.group.stop();
```

#### Delete group
Currently you can only have one group at a time, so when you need a new group you will need delete old group first.

```js
MediaPlayer.deleteGroup();
```

### Event
Media player will emit render status and group status. You can subscribe the channel to receive below event.

```js
MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.RENDER_STATUS, callback);
MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.MUSIC_STATUS, callback);
MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.GROUP_STATUS, callback);
```

| Channel | Status | Parameter | Description |
|---|---|---|---|
| **EVENT\_CHANNEL.RENDER\_STATUS** | **Idle** | containerId | Fire when there is no item to rend |
| **EVENT\_CHANNEL.RENDER\_STATUS** | **Rending** | containerId | Start rend an item |
| **EVENT\_CHANNEL.RENDER\_STATUS** | **RendOut** |  | Fire when an item **start rend out** |

| Channel | Status | Parameter | Description |
|---|---|---|---|
| **EVENT\_CHANNEL.MUSIC\_STATUS** | **Playing** | musicId | Start play a music |
| **EVENT\_CHANNEL.MUSIC\_STATUS** | **End** | musicId | Music stopped |

| Channel | Status | Parameter | Description |
|---|---|---|---|
| **EVENT\_CHANNEL.GROUP\_STATUS** | **Start** |  | Start a group, include auto replay |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **Stop** |  | Stop a group |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **RendStart** |  | Rend start, include auto replay |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **RendStop** |  | Stop rend |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **RendFinished** |  | All item in group are rended once, both before replay group and stop rend a group will fire this event  |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **ReRend** |  | When push a new item and set reRendAll |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **PushRend** |  | Add new item to rend |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **MusicStart** |  | Start play a music in group |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **MusicStop** |  | Music stopped |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **MusicFinished** |  | All music in group are played once, both before replay group and stop a group will fire this event   |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **PushMusic** |  | When push a music into group |


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Roadmap

- [x] Android support
- [ ] Test coverage
- [ ] Image transitions
- [x] Music play
- [x] Support react native reload
- [ ] Stop music when video playing
- [x] Virtual display control

## Known Issues

## History

TODO: Write history

## Credits

TODO: Write credits

## License

[MIT](LICENSE.md)
