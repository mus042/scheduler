import {
	Alert,
	Dimensions,
	Modal,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import React, { useEffect, useState } from "react";
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
import EditShiftModalView from "../../AdminPanelScreen.tsx/CreateScheduleScreen/userReplaceMenu";
import { shiftAndOptions } from "../../AdminPanelScreen.tsx/CreateScheduleScreen/CreateScheduleComp";
import Userbuble from "../../AdminPanelScreen.tsx/components/Userbuble";

const CardContent = ({
	name,
	shift,
	user,
	handelAskReplace,
	allOptionUsers,
}) => {
	const [findReplaceVisible, setfindReplaceVisible] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [selctedShiftRole, setSelctedShiftRole] = useState<shiftAndOptions>();
	const [modalHeight, setModalHeight] = useState<"40%" | "60%" | "100%">("60%");

	console.log({ shift }, "user", { user });
	const theme = useTheme();

	const changeModalHeight = "60%";

	useEffect(() => {
		console.log('selcted shift role ',{ selctedShiftRole }, { allOptionUsers });
	}, [selctedShiftRole]);

	//To Add shift roles map
	const AssigndComp = () => {
		let miniShifts = [];

	
		const matchingShifts =  user?.id ? shift.filter(
			(shiftToFilter) => shiftToFilter.userId === user.id): []
	
		// Add all matching shifts to miniShifts
		miniShifts = [...matchingShifts];

		if (miniShifts.length < 3) {
			// Find shifts that don't match the userId condition
			const nonMatchingShifts = user?.id ? shift.filter(
				(shiftToFilter) => shiftToFilter.userId !== user.id
			) :[];

			// Calculate how many non-matching shifts you can add (up to two)
			const slotsAvailable = 3 - miniShifts.length;
			const shiftsToAdd = nonMatchingShifts.slice(0, slotsAvailable);

			miniShifts = [...miniShifts, ...shiftsToAdd];
		}
		const allShifts = [...shift];
		if(user)return (
			<View style={{ flex: 1, flexDirection: "row" }}>
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
						<View>
							<SystemShift
								item={shiftRole}
								user={user}
								handelAskReplace={handelAskReplace}
							/>
						</View>
					)}
					keyExtractor={(item) => (item.id ? item.id : item.tmpId)}
				/>
			</View>
		);
	};
	const replaceUser = (newUserOption) => {
		console.log({ newUserOption }, selctedShiftRole);
	
		handelAskReplace(newUserOption,selctedShiftRole);
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
				maxHeight: 150,
				height: 100,
				minHeight: 90,
				flex: 1,
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

			<View style={{ flex: 6 }}>
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
					animationType='slide'
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						Alert.alert("Modal has been closed.");
						setModalVisible(!modalVisible);
					}}
				>
					<View style={styles.centeredView}>
						<View style={[{ height: modalHeight }, styles.modalView]}>
							<Pressable
								style={{
									position: "absolute",
									top: 10,
									backgroundColor: "black",
									width: 40,
									minHeight: 5,
									maxHeight: 10,
									alignSelf: "center",
								}}
								onPress={() => setModalVisible(!modalVisible)}
							></Pressable>
							<View
								style={{
									flex: 1,
									flexDirection: "column",
									alignContent: "flex-start",
									// maxHeight: '100%',
									justifyContent: "flex-start",
									borderWidth: 10,
									margin: 10,
								}}
							>
								<View style={{ flexGrow: 1 }}>
									<View style={{ flex: 1 }}>
										{/* shift name and date  */}
										<Text>{name}</Text>
										<Text>{shift[0].shiftStartHour.substring(0, 10)} </Text>
									</View>
								</View>
								<View
									style={{
										flexGrow: 1,
										borderWidth: 2,
										justifyContent: "center",
										borderColor: "red",
									}}
								>
									<Text>Shift Roles :</Text>

									<FlatList
										data={shift}
										horizontal={true}
										renderItem={(item) => {
											return (
												item && (
													<View
														style={{
															flex: 1,
															borderWidth: 2,
															alignSelf: "center",

															width: 85,
															height: 90,
														}}
													>
														<Pressable
															onPress={() => {
																console.log(item);
																setSelctedShiftRole(item.item); // Update state with the shift item
															}}
														>
															<SystemShift
																item={item}
																user={user}
																handelAskReplace={handelAskReplace}
															/>
														</Pressable>
													</View>
												)
											);
										}}
										keyExtractor={(item) => (item.id ? item.id : item.tmpId)}
									/>
								</View>
								<View style={{ flexGrow: 2 }}>
									<Text>shift details</Text>
								</View>
								<View style={{ flexGrow: 5, justifyContent: "center" }}>
									{/* shift options */}
									<View style={{ justifyContent: "center" }}>
										{selctedShiftRole?.optinalUsers && (
											<FlatList
												data={selctedShiftRole.optinalUsers}
												horizontal={true}
												renderItem={(item) => (
													<>
														<View
															style={{
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "flex-start",
																height: 95,
															}}
														>
															{/* show each shiftoption as user Buble with pref as badge  */}
															{allOptionUsers && (
																<View
																	style={{
																		flex: 1,
																		borderWidth: 2,
																		alignContent: "center",
																		alignItems: "center",
																		justifyContent: "center",
																	}}
																>
																	<View
																		style={{
																			flex: 1,
																			// maxWidth: 110,
																			marginTop: 2,
																			width: 60,
																		}}
																	>
																		<Pressable
																			onPress={() => replaceUser(item.item)}
																		>
																			<Userbuble
																				user={allOptionUsers.find(
																					(userToCheck) => {
																						console.log(userToCheck, { item });
																						return (
																							userToCheck.id ===
																							item.item.userId
																						);
																					}
																				)}
																				badgeContent={item.item.userPreference}
																				altText={""}
																				selected={false}
																				badgeColor={"red"}
																			/>
																		</Pressable>
																	</View>
																	<View
																		style={{
																			flex: 1,
																			flexDirection: "row",
																			justifyContent: "flex-end",
																		}}
																	>
																		<IconButton
																			icon='dots-horizontal-circle-outline'
																			iconColor={MD3Colors.error50}
																			size={20}
																			onPress={() => console.log("Pressed")}
																		/>
																	</View>
																</View>
															)}
														</View>
													</>
												)}
											/>
										)}
									</View>
								</View>
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
		justifyContent: "flex-end",
		alignItems: "center",
		marginTop: 22,
	},

	modalView: {
		margin: 10,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 10,
		paddingTop: 20,
		// alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: "100%",
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
