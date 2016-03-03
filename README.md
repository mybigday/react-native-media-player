# React Native Media Player

This is a react native media player with external display controller. Support photo, video, misic and background mode.

## Known Issues

- Don't use `alert` at javascript world this make whole app crash, because alert at iOS platform will find current key window to add NSAlertView when key window is external display it will crash.

## Installation
### Mostly automatic install
1. `npm install rnpm --global`
2. `npm install react-native-media-player@git+ssh://git@bitbucket.org/mlifeteam/react-native-media-player.git --save`
3. `rnpm link react-native-media-player`

### Manual install
#### iOS
1. `npm install react-native-media-player@https://bitbucket.org/mlifeteam/react-native-media-player.git --save`
2. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
3. Go to `node_modules` ➜ `react-native-media-player` and add `RNMediaPlayer.xcodeproj`
4. In XCode, in the project navigator, select your project. Add `libRNMediaPlayer.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
5. Click `RNMediaPlayer.xcodeproj` in the project navigator and go the `Build Settings` tab. Make sure 'All' is toggled on (instead of 'Basic'). In the `Search Paths` section, look for `Header Search Paths` and make sure it contains both `$(SRCROOT)/../../react-native/React` and `$(SRCROOT)/../../../React` - mark both as `recursive`.
5. Run your project (`Cmd+R`)

## Usage

### Initialize
You just simply need to import react-native-media-player in your js world

```
:::javascript
import MediaPlayer from "react-native-media-player";
```

### Push Image or Video
Currently only support rend image file type `*.png`, `*.jpg` and video file type `*.mp4`.

```
:::javascript
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

```
:::javascript
// Clear all item
// keepCurrentPlaying: bool   # Set true if you do not want to disturb current playing item 

let keepCurrentPlaying = true;
MediaPlayer.clear(keepCurrentPlaying);

```

### Backgroud
If set the backgroud image for media player. The image will auto rend when render is idle.

```
:::javascript
MediaPlayer.setBackground(background_image_path);
```

### Group
This player support a single group let you can play a bunch of media with random order or repeat mode. When using group you must create `group` first and then add some image or video. After you setup all your metarial just call `play()` the group will auto control those media as you want.

#### Create your group first

```
:::javascript
// repeat: bool    # Group will auto replay when all item rend finished
// random: bool    # Group will random the queue order every time to start playing group

MediaPlayer.createGroup(repeat, random);
```

#### Make your playlist
Like the queue, you can push image, video, audio(not support yet) to rend.

```
:::javascript
// Push image or video
// pathList:  string        # The absolute path list for images source
// duration:  number        # Image rend duration in milliseconds
// reRendAll: bool          # When push a new item to group rerend all item immediately
MediaPlayer.group.pushImages(pathList, duration, reRendAll);
MediaPlayer.group.pushVideos(pathList, reRendAll);
```

#### Let's rock
Now you can play your playlist just one call, sure you can stop it. The better thing is we will keep the group let you start again util you delete it.

```
:::javascript
MediaPlayer.group.start();
MediaPlayer.group.stop();
```

#### Delete group
Currently you can only have one group at a time, so when you need a new group you will need delete old group first.

```
:::javascript
MediaPlayer.deleteGroup();
```

### Event
Media player will emit render status and group status. You can subscribe the channel to receive below event.

```
:::javascript
MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.RENDER_STATUS, callback);
MediaPlayer.subscribe(MediaPlayer.EVENT_CHANNEL.GROUP_STATUS, callback);
```

| Channel | Status | Parameter | Description |
|---|---|---|---|
| **EVENT\_CHANNEL.RENDER\_STATUS** | **Idle** | containerId | Fire when there is no item to rend |
| **EVENT\_CHANNEL.RENDER\_STATUS** | **Rending** | containerId | Start rend an item |
| **EVENT\_CHANNEL.RENDER\_STATUS** | **RendOut** |  | Fire when an item **start rend out** |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **Start** |  | Start rend a group, include auto replay |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **Stop** |  | Stop rend a group |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **Finished** |  | All item in group are rended once, both before replay group and stop rend a group will fire this event  |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **ReRend** |  | When push a new item and set reRendAll |
| **EVENT\_CHANNEL.GROUP\_STATUS** | **Push** |  | Add new item to rend |

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Roadmap

- [ ] Test coverage
- [ ] Image transitions
- [ ] Music play
- [ ] Support react native reload

## History

TODO: Write history

## Credits

TODO: Write credits

## License

TODO: Write license