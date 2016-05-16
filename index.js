import ReactNative, { Platform, NativeModules, NativeAppEventEmitter, DeviceEventEmitter } from "react-native";
import RNFS from "react-native-fs";

import MediaPlayer from "./media_player";

if (Platform.OS === 'ios') {
  module.exports = new MediaPlayer(NativeModules, NativeAppEventEmitter, DeviceEventEmitter, RNFS);
} else {
  module.exports = new MediaPlayer(NativeModules, DeviceEventEmitter, DeviceEventEmitter, RNFS);
}
