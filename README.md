# React Native Media Player

This is a react native media player with external display controller. Support photo, video, misic and background mode.

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
import MediaPlayer from "react-native-media-player";
```

### Push Image or Video
Currently only support rend image file type `*.png`, `*.jpg` and video file type `*.mp4`.

```
// Push Image
// path:     string        # The absolute path for image source
// duration: number        # Image rend duration in milliseconds
// pushWay:  string[enum]  # The way push this media (see Push Way above)

try{
	let containerId = await MediaPlayer.pushImage(image_file_path, 2000, MediaPlayer.PUSH_WAY.AtLast);
	console.log("Image Container ID:" + containerId);
}
catch(err){
	showErrorMessage(err);
}

// Push Video
// path:     string        # The absolute path for video source
// pushWay:  string[enum]  # The way push this media (see Push Way above)
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






## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Known Issues

- Will crash after react native hot reload.

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