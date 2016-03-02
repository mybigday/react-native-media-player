import ReactNative, { NativeModules, NativeAppEventEmitter, DeviceEventEmitter } from "react-native";
import RNFS from "react-native-fs";

import MediaPlayer from "./media_player";

module.exports = new MediaPlayer(NativeModules, NativeAppEventEmitter, DeviceEventEmitter, RNFS);
