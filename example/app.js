"use strict";

import React, {AppRegistry, Component, StyleSheet, View, Text} from "react-native";
import MediaPlayer from "react-native-media-player";

const styles = StyleSheet.create({
	container:{
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#AAAAAA"
	}
});

class ExampleApp extends Component{
	render(){
		return (
			<View style={styles.container}>
				<Text>{"Hello World!!!"}</Text>
			</View>
		);
	}
}

AppRegistry.registerComponent("example", () => ExampleApp);
