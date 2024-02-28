import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Avatar,
	Button,
	Card,
	IconButton,
	MD2Colors,
	MD3Colors,
	Text,
	useTheme,
} from "react-native-paper";
import { normalizeShiftTime } from "../../../utils/utils";
import FindReplacmentComp from "./FindReplacmentComp";
import SystemShift from "./SystemShift";
import { FlatList } from "react-native-gesture-handler";

const CardContent = ({ name, shift, user, handelAskReplace }) => {
	const [findReplaceVisible, setfindReplaceVisible] = useState(false);
	console.log({ shift }, "user", { user });
	const theme = useTheme();

	//To Add shift roles map
	const AssigndComp = () => {
		console.log(shift);
		return (
			<View style={{ flex: 1,maxWidth:185 }}>

				<FlatList
					horizontal={true}
					data={shift}
          contentContainerStyle={{
            flexGrow: 1,
            maxWidth:100,
            justifyContent: 'space-between',
            alignItems: 'center', 
            alignContent:'center',
    
          }}
					renderItem={(shiftRole) => (
        
						<SystemShift
							item={shiftRole}
							user={user}
							handelAskReplace={handelAskReplace}
						/>
					)}
					keyExtractor={(item) => item.id}
				/>
			</View>
		);
	};
	const colorByTimeOfShift = (timeName) => {
		return timeName === "morning"
			? "lightcyan"
			: timeName === "night"
			? "lightgrey"
			: "lightgoldenrodyellow";
	};
	return (
		<View
			style={{
				flexDirection: "row",
				backgroundColor: colorByTimeOfShift(name),
				borderRadius: 10,
				margin: 5,
				width: 200,
				justifyContent: "space-between",
				maxWidth: 240,
        minHeight:150,
			}}
		>
			<View
				style={{
					flex: 1,
					maxWidth: 5,
					alignSelf: "center",
					justifyContent: "space-between",
					marginTop: 3,
					marginRight: 7,
				}}
			>
				{name === "morning" ? (
					<IconButton
						icon='white-balance-sunny'
						iconColor={"deepskyblue"}
						size={20}
						style={{ margin: 0, padding: 0, alignSelf: "center" }}
						onPress={() => console.log("Pressed")}
					/>
				) : name === "noon" || name === "noonCanceled"? (
					<IconButton
						icon='theme-light-dark'
						iconColor='sandybrown'
						size={20}
						style={{ margin: 0, padding: 0, alignSelf: "center" }}
						onPress={() => console.log("Pressed")}
					/>
				) : (
					<IconButton
						icon='weather-night'
						iconColor='darkblue'
						size={20}
						style={{ margin: 0, padding: 0, alignSelf: "center" }}
						onPress={() => console.log("Pressed")}
					/>
				)}
			</View>

			<View
				style={{ flex: 6, maxWidth: 200, borderColor: theme.colors.onPrimary }}
			>
				<View
					style={{
						flex: 2,
						flexDirection: "column",
						width: 235,
					}}
				>
					<AssigndComp />
				</View>
			</View>
		</View>
	);
};

export default CardContent;

const styles = StyleSheet.create({});
