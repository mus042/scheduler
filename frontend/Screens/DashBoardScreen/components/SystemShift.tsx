import { Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Avatar,
	Badge,
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

const SystemShift = ({ item, user, handelAskReplace, }) => {
	const [findReplaceVisible, setfindReplaceVisible] = useState(false);
	const [expend, setExpend] = useState<boolean>(false);
	const [myShift,setMyShift] = useState<boolean>(item.item.userId===user.id);
	const theme = useTheme();
	const shiftRole = item.item?item.item:item;
	const colorByTimeOfShift = (timeName) => {
		return timeName === "morning"
			? "lightcyan"
			: timeName === "night"
			? "lightgray"
			: "lightgoldenrodyellow";
	};
	const MiniComp = () => {
		const miniTime:string = ""+ shiftRole.shiftStartHour.substring(11, 13) +"-"+ shiftRole.shiftEndHour.substring(11, 13)
		return (
			// <Pressable onPress={() => console.log("press")}>
				<View
					style={{
						flex: 1,
						borderBottomWidth:3,
						borderColor:'red',
						marginBottom:3,
						height:95,
						// width:75,
						minHeight:90,
						marginLeft:5,
						borderBottomColor:myShift?theme.colors.onBackground :theme.colors.background,
					}}
				>
					<View style={{flex:2, alignSelf: "center",justifyContent:'flex-end',alignContent:'flex-end',alignItems:'center' ,}}>
					<View style={{flex:2}}>
					<Text variant='bodySmall' style={{ color: theme.colors.primary,alignSelf:'center' }}>
					{shiftRole.shiftRole.name}
						</Text>
					</View>
					{/* <View
						style={{
							flex: 1,
							
							maxWidth: 75,
					
							alignSelf:'center',
						}}
					>
					
						<Text variant='bodySmall'>
							{shiftRole.shiftStartHour.substring(11, 16)}-{shiftRole.shiftEndHour.substring(11, 16)}
						</Text>
					</View> */}
						<View style={{flex:3,}}>
						<Badge style={{top:-7,right:-15,position:'absolute',zIndex:5,backgroundColor:colorByTimeOfShift(shiftRole.shiftTimeName),color:'black'}}>
						{miniTime}
					</Badge>
						<Avatar.Icon size={45} icon='account' />
						</View>
					<View style={{flex:1}}>
					<Text variant='bodySmall' style={{ color: theme.colors.primary,alignSelf:'center' }}>
							{!myShift ? shiftRole.userRef?.userProfile.firstName : "ME"}{" "}
						</Text>
					</View>
						
					</View>

				

					{/* {(user?.id === shiftRole?.userId ||
						user?.userServerRole === "admin") && (
						<View style={{ flex: 1, flexDirection: "column", minHeight: 5 }}>
							{findReplaceVisible && (
								<View style={{ flex: 1, minHeight: 40 }}>
									<FindReplacmentComp
										shift={shiftRole}
										handelFindReplace={handelAskReplace}
									/>
								</View>
							)} */}
						{/* </View> */}
					{/* )} */}
				</View>
			// </Pressable>
		);
	};
	const ExpendedComp = () => {
		return (
			// <View style={{ flex: 1, minHeight: 100 }}>
			// 	<View style={{ flex: 3, flexDirection: "row" }}>
			// 		<Text variant='titleMedium' style={{ color: theme.colors.primary }}>
			// 			{shiftRole.userRef?.userProfile.lastName}{" "}
			// 			{shiftRole.userRef?.userProfile.firstName}
			// 		</Text>
			// 	</View>
				
			// 	<Text variant='titleMedium'>
			// 		{shiftRole.shiftStartHour.substring(11, 16)} -{" "}
			// 		{shiftRole.shiftEndHour.substring(11, 16)}
			// 	</Text>

			// 	{(user?.id === shiftRole?.userId ||
			// 		user?.userServerRole === "admin") && (
			// 		<View style={{ flex: 1, flexDirection: "column", minHeight: 5 }}>
			// 			{findReplaceVisible && (
			// 				<View style={{ flex: 1, minHeight: 40 }}>
			// 					<FindReplacmentComp
			// 						shift={shiftRole}
			// 						handelFindReplace={handelAskReplace}
			// 					/>
			// 				</View>
			// 			)}
			// 			<View
			// 				style={{
			// 					flexDirection: "row",
			// 					justifyContent: "space-between",
			// 					minHeight: 40,
			// 					borderWidth: 1,
			// 					flex: 1,
			// 					maxWidth: 150,
			// 					alignItems: "center",
			// 					marginBottom: 10,
			// 				}}
			// 			>
			// 				<View style={{ flex: 2, maxWidth: 100 }}>
			// 					<Button
			// 						compact={true}
			// 						labelStyle={{ margin: 2, paddingRight: 4 }}
			// 						onPress={() => setfindReplaceVisible(!findReplaceVisible)}
			// 						icon='find-replace'
			// 						mode='outlined'
			// 					>
			// 						find replacment
			// 					</Button>
			// 				</View>
			// 				<View style={{ flex: 1 }}>
			// 					{user?.userServerRole === "admin" && (
			// 						<IconButton
			// 							icon='circle-edit-outline'
			// 							iconColor={theme.colors.tertiary}
			// 							size={20}
			// 							style={{
			// 								margin: 0,
			// 								padding: 0,
			// 								alignSelf: "center",
			// 								borderWidth: 1,
			// 							}}
			// 							onPress={() => console.log("Pressed")}
			// 						/>
			// 					)}
			// 				</View>
			// 			</View>
			// 		</View>
			// 	)}
			// </View>
			<View
						style={{
							flex: 1,
							
							maxWidth: 75,
					
							alignSelf:'center',
						}}
					>
					
						<Text variant='bodySmall'>
							{shiftRole.shiftStartHour.substring(11, 16)}-{shiftRole.shiftEndHour.substring(11, 16)}
						</Text>
					</View> 
		);
	};
	return (
		<View style={{ flex: 1,  }}>
			    {shiftRole.shiftTimeName !== 'noonCanceled' && <MiniComp />}	
                {expend && <ExpendedComp />}
		</View>
	);
};

export default SystemShift;

const styles = StyleSheet.create({});
