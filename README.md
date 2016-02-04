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

TODO: Write usage instructions

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Known Issues

## History

TODO: Write history

## Credits

TODO: Write credits

## License

TODO: Write license