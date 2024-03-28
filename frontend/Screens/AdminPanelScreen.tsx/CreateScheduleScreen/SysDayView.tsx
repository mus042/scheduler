import { useEffect, useRef, useState } from "react";
import { user, shift } from "../../../App";
import axios from "axios";
import { Pressable, View, StyleSheet, Modal, Alert } from "react-native";
import React from "react";
// import EditShiftComp from "../EditShiftComp";
import {
	ActivityIndicator,
	Avatar,
	Button,
	Card,
	Divider,
	IconButton,
	MD2Colors,
	Menu,
	Portal,
	Provider,
	Text,
} from "react-native-paper";
import { mainStyle } from "../../../utils/mainStyles";
import { normalizeShiftDate, normalizeShiftTime } from "../../../utils/utils";

import { API_URL, userAuth } from "../../../app/context/AuthContext";
import { shiftAndOptions } from "./CreateScheduleComp";
import CardContent from "../../DashBoardScreen/components/CardContent";
import Userbuble from "../components/Userbuble";

import EditShiftModalView from "./userReplaceMenu";
import { FlatList } from "react-native-gesture-handler";
// import CardContent from "./CardContent";

const SysDayView = ({
	shifts,
	dayName,
	users,
}: {
	shifts: any;
	dayName: string;
	users: user[];
}) => {
	const [localShifts, setShifts] = useState<{
		shiftByTime: string;
		shifts: shift[];
	}>();
	const [shiftUser, setUser] = useState<user>();
	const [findReplaceVisible, setfindReplaceVisible] = useState(false);
	const [systemShifts, setSystemShifts] = useState<Record<string, shift[]>>();

	const user = userAuth()?.authState?.user ?? null;
	const dayDate = new Date(dayName);

	useEffect(() => {
		//Update Shift and user
		console.log("shift view shift", { shifts });
		if (shifts) {
			//if system schedule - group same time shifts together by shiftTimeName

			//   const groupedShifts = shifts.reduce((acc: Record<string, shift[]>, shift: shift) => {
			//     // Determine the key for grouping
			//     const groupName = shift.shiftTimeName === 'noonCanceled' ? 'noon' : shift.shiftTimeName;

			//     // Initialize the group array if it does not exist
			//     if (!acc[groupName]) {
			//         acc[groupName] = [];
			//     }

			//     // Add the shift to the appropriate group
			//     acc[groupName].push(shift);

			//     return acc;
			// }, {});
			console.log("grouped shifts ", { shifts });
			// setSystemShifts(shifts.shifts)

			setShifts(shifts);
			// if (shifts.userRef) {
			//   // console.log(shift.userRef);
			//   setUser(shift.userRef);
			// }
		}
	}, [shifts]);
	// const shiftContainerStyle = () => {
	//   return localShift?.userId === null ? styles.noUser : null;
	// };

	const handelFindReplace = async (shift: shift | undefined) => {
		console.log("find replace ", shift, shift?.id);

		if (shift) {
			const possibleUsers = await axios.get(
				`${API_URL}schedule/getReplaceForShift/${shift.id}/${shift.scheduleId}`
			);

			console.log({ possibleUsers });
			setfindReplaceVisible(true);
			return possibleUsers?.data;
		} else return [];
	};

	const UserView = ({ userOption }) => {
		const shiftUser = users.find((user) => user.id === userOption.userId);

		if (userOption?.userId) {
			return (
				<View style={{ flex: 1 }}>
					{shiftUser !== null ? (
						<Userbuble
							user={shiftUser}
							badgeContent={userOption.userPreference}
							altText={""}
							selected={false}
							badgeColor={
								userOption.userPreference === "1"
									? "green"
									: userOption.userPreference === "3"
									? "red"
									: "yellow"
							}
						/>
					) : (
						<View style={{ flex: 1 }}>
							<Text>empty user</Text>
						</View>
					)}
				</View>
			);
		}
		return null;
	};

	const ShiftContent = ({ shiftsAndOptions }) => {
		
    const [modalInfo, setModalInfo] = useState({
      visible: false,
      currentShiftAndOption: null, // Holds the current shiftAndOption
  });

  const openMenu = (shiftAndOption) => setModalInfo({
      visible: true,
      currentShiftAndOption: shiftAndOption, // Set the current shiftAndOption
  });

  const closeMenu = () => setModalInfo({
      visible: false,
      currentShiftAndOption: null, // Reset when closing
  });
    
    const RoleView = ({ shiftAndOption }) => {
			const [showOtherOptions, setShowOtherOptions] = useState<boolean>(false);
			

			return (
				<>
					<View
						style={{
							flex: 1,
							justifyContent: "flex-start",
							borderWidth: 3,
							borderColor: "red",
						}}
					>
						<View style={{ flex: 1 }}>
							<Text>{shiftAndOption.shift.shiftRole.role.name}</Text>
							<View style={{ flex: 1 }}>
								<Text>
									{shiftAndOption.shift.shiftStartHour.substring(11, 16)} -{" "}
									{shiftAndOption.shift.shiftEndHour.substring(11, 16)}
								</Text>
							</View>
							<View style={{ flex: 1, justifyContent: "center" }}>
							<Pressable onPress={() => openMenu(shiftAndOption)}>
									<UserView userOption={shiftAndOption.shift} />
								</Pressable>
							</View>
						</View>
					</View>
		
				</>
			);
		};
		console.log({ shiftsAndOptions }, typeof shiftsAndOptions);
		return (
			<View style={{ flex: 1 }}>
				<View style={{ flexDirection: "row", flex: 1 }}>
					{Array.isArray(shiftsAndOptions) && (
						<View
							style={{ flex: 1, borderWidth: 10, justifyContent: "center" }}
						>
							<FlatList
								style={{ flex: 1, flexDirection: "row", borderWidth: 2 }}
								data={shiftsAndOptions}
								horizontal={true}
								keyExtractor={(item) => item.shift.tmpId}
								renderItem={({ item: shiftAndOption }) => {
									console.log({ shiftAndOption });
									return (
										<View style={{ flex: 1 }}>
											<RoleView shiftAndOption={shiftAndOption} />
                      {modalInfo.visible && (
                                        <EditShiftModalView
                                            visible={modalInfo.visible}
                                            shiftAndOption={modalInfo.currentShiftAndOption}
                                            setVisible={closeMenu}
                                            allusers={users}
                                            />
                                    )}
                    </View>
									);
								}}
							/>
						</View>
					)}
				</View>
			</View>
		);
	};
	const DayContent = () => {
		return Object.entries(shifts).map(
			([shiftTime, sectionShifts], shiftTimeIndex) => {
				console.log({ shiftTime }, { sectionShifts });
				return (
					<View
						key={`${dayName}-${shiftTime}-${shiftTimeIndex}`}
						style={{ flex: 1 }}
					>
						<View style={{ flex: 1 }}>
							<Text>{shiftTime}</Text>
						</View>
						<View style={{ flex: 9 }}>
							<ShiftContent shiftsAndOptions={sectionShifts} />
						</View>
					</View>
				);
			}
		);
	};

	const LeftContent = (props) => {
		const day: string = dayName.slice(0, 1).toLocaleLowerCase();
		console.log({ day }, { dayName });
		return <Avatar.Icon {...props} style={{ marginRight: 5 }} />;
	};

	///return
	if (localShifts) {
		return (
			<View style={{ flex: 1, flexDirection: "column" }}>
				<Card
					mode='elevated'
					style={{ flex: 1, marginBottom: 1, maxWidth: 250 }}
				>
					<Card.Title
						title={dayDate.toLocaleDateString("en-us", { weekday: "long" })}
						subtitle={dayName}
						titleVariant='headlineSmall'
						subtitleVariant='labelMedium'
						right={LeftContent}
					/>
					<Card.Content>
						<DayContent />
					</Card.Content>
					<Card.Actions>
						<Button compact onPress={() => {}}>
							Cancel
						</Button>
						<Button onPress={() => {}}>Update</Button>
					</Card.Actions>
				</Card>
			</View>
		);
	} else {
		return (
			<View>
				<Text>Fatching day</Text>
				<ActivityIndicator animating={true} color={MD2Colors.red800} />
			</View>
		);
	}
};

export default SysDayView;

//////styles
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
	text: {
		fontSize: 20,
	},
	container: {
		maxWidth: 50,
		borderWidth: 1,
		borderColor: "green",
		fontSize: 5,
	},
	noUser: {
		backgroundColor: "red",
	},
});
