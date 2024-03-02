import {
	Alert,
	Dimensions,
	Modal,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
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
import { shift } from "../../../App";

const CardContent = ({ name, shift, user, handelAskReplace }) => {
	const [findReplaceVisible, setfindReplaceVisible] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	console.log({ shift }, "user", { user });
	const theme = useTheme();

	//To Add shift roles map
	const AssigndComp = () => {
		console.log(shift);
		let miniShifts = [];

		// First, filter shifts that match the userId
		const matchingShifts = shift.filter(shiftToFilter => shiftToFilter.userId === user.id);
		
		// Add all matching shifts to miniShifts
		miniShifts = [...matchingShifts];
		

		if (miniShifts.length < 3) {
		  // Find shifts that don't match the userId condition
		  const nonMatchingShifts = shift.filter(shiftToFilter => shiftToFilter.userId !== user.id);
		
		  // Calculate how many non-matching shifts you can add (up to two)
		  const slotsAvailable = 3 - miniShifts.length;
		  const shiftsToAdd = nonMatchingShifts.slice(0, slotsAvailable);
		
		  // Add the additional shifts to miniShifts
		  miniShifts = [...miniShifts, ...shiftsToAdd];
		}
		const allShifts = [...shift];
		return (
			<View style={{ flex: 1, flexDirection: "row" }}>
				{/* {miniShifts.map((shiftRole) => {
					return (
						<View style={{flex:1,margin:1,}}>
							<SystemShift
							item={shiftRole}
							user={user}
							handelAskReplace={handelAskReplace}
						/>
						</View>
					);
				})} */}
			<FlatList
					horizontal={true}
					data={shift}
					contentContainerStyle={{
						// maxWidth:230,
						justifyContent: "space-between",
						// alignItems: "flex-end",
						alignContent: "center",
						// alignSelf:'center',
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
	
	return (
		<View
			style={{
				flexDirection: "row",
				// backgroundColor: colorByTimeOfShift(name),
				borderRadius: 10,
				margin: 1,
				width: 220,
				// justifyContent: "space-between",
				maxWidth: 230,
				maxHeight:150,
				height:100,
				minHeight:90,
				flex:1,
			}}
		>
			<View
				style={{
					flex: 1,
					maxWidth: 5,
					alignSelf: "center",
					justifyContent: "space-between",
					marginTop: 3,
					marginRight: 1,
				}}
			>
				{name === "morning" ? (
					<IconButton
						icon='white-balance-sunny'
						iconColor={"deepskyblue"}
						size={20}
						style={{ margin: 0, padding: 0, alignSelf: "center" }}
						onPress={() => setModalVisible(!modalVisible)}
					/>
				) : name === "noon" || name === "noonCanceled" ? (
					<IconButton
						icon='theme-light-dark'
						iconColor='sandybrown'
						size={20}
						style={{ margin: 0, padding: 0, alignSelf: "center" }}
						onPress={() => setModalVisible(!modalVisible)}
					/>
				) : (
					<IconButton
						icon='weather-night'
						iconColor='darkblue'
						size={20}
						style={{ margin: 0, padding: 0, alignSelf: "center" }}
						onPress={() => setModalVisible(!modalVisible)}
					/>
				)}
			</View>

			<View style={{ flex: 6, }}>
				<View
					style={{
						flex: 2,
						flexDirection: "column",
					}}
				>
					<AssigndComp />
				</View>
			</View>
			<View style={{ flex: 1 }}>
				<Modal
					animationType='fade'
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						Alert.alert("Modal has been closed.");
						setModalVisible(!modalVisible);
					}}
				>
					<View style={styles.centeredView}>
						<View style={[{ maxHeight: 500 }, styles.modalView]}>
							<View
								style={{
									flex: 1,
									flexDirection: "row",
									alignContent: "flex-start",
									maxHeight: 490,
									margin: 10,
								}}
							>
								<FlatList
									data={shift}
									numColumns={3}
									renderItem={( item ) =>
										item && (
											<View style={{ flex: 1,maxWidth:110, }}>
												<SystemShift
													item={item}
													user={user}
													handelAskReplace={handelAskReplace}
												/>
											</View>
										)
									}
									keyExtractor={(item) => item.id}
								/>
							</View>
							<View>
								{name === "morning" ? (
									<IconButton
										icon='white-balance-sunny'
										iconColor={"deepskyblue"}
										size={20}
										style={{ margin: 0, padding: 0, alignSelf: "center" }}
										onPress={() => setModalVisible(!modalVisible)}
									/>
								) : name === "noon" || name === "noonCanceled" ? (
									<IconButton
										icon='theme-light-dark'
										iconColor='sandybrown'
										size={20}
										style={{ margin: 0, padding: 0, alignSelf: "center" }}
										onPress={() => setModalVisible(!modalVisible)}
									/>
								) : (
									<IconButton
										icon='weather-night'
										iconColor='darkblue'
										size={20}
										style={{ margin: 0, padding: 0, alignSelf: "center" }}
										onPress={() => setModalVisible(!modalVisible)}
									/>
								)}
							</View>
						</View>
					</View>
				</Modal>
			</View>
		</View>
	);
};

export default CardContent;

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",

		alignItems: "center",
		marginTop: 22,
	},

	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonOpen: {
		backgroundColor: "#F194FF",
	},
	buttonClose: {
		backgroundColor: "#2196F3",
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
});
