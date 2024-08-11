import {
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { shift, user, userRequest } from "../../../App";
import EditDayModal from "./EditDayModal";
import UserStats from "./UserStats";
import EditShiftAdmin from "../../AdminPanelScreen.tsx/EditShiftAdmin";
import axios from "axios";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import EditShiftComp from "../EditShiftComp";
import { mainStyle } from "../../../utils/mainStyles";
import { normalizeShiftTime } from "../../../utils/utils";
import { useTheme } from "react-native-paper";
import PickPrefComp from "./pickPrefComp";
import ShiftView from "./ShiftView";
import EditPrefDayView from "./EditPrefDayView";

const DayViewComp = ({
	shifts,
	update,
	viewType,
	isEdit,
	allUsers,
}: {
	shifts: shift[] | undefined | any;
	update: any;
	isEdit: boolean | undefined;
	viewType: "systemSchedule" | "user" | undefined;
	allUsers?: user[];
}) => {
	const [localShifts, setlocalShifts] = useState<shift[]>();
	const [editDay, setEdit] = useState(isEdit !== undefined ? !isEdit : false);
	const [dayName, setDayName] = useState<string>("");
	const { authState } = userAuth();
	const theme = useTheme();
	useEffect(() => {
		console.log({ shifts });
		if (shifts) {
			setlocalShifts(shifts.item);
		}
	}, [shifts]);

	useEffect(() => {
		// console.log("view Type ", viewType, { localShifts });
		if (localShifts) {
			console.log("useEffect Dayview : ", { viewType }, { localShifts });
			// console.log(morning,noon,night,nightUser);

			const shiftDate: Date = new Date(localShifts[0]?.shiftStartHour);
			console.log({shiftDate})
			const options = { weekday: "long" };
			setDayName(shiftDate.toLocaleString("en-us", options));
		}
	}, [localShifts]);

	const handelOpenDay = () => {
		if (viewType !== "systemSchedule") {
			console.log({ localShifts });
			setEdit(!editDay);
		}
	};

	const updateShifts = (editedShifts: shift[]) => {
		// console.log(editedShifts);
		setlocalShifts(editedShifts);
		update(editedShifts);
	};
	// console.log({shifts});

	const handelEditShift = (newUser, shift) => {
		// if (shift) {
		// 	if (viewType === "user") {
		// 		// edit prefernce for future schedule
		// 		if (localShifts) {
		// 			const index = localShifts.findIndex(
		// 				(localShift) => localShift.id === shift?.id
		// 			);
		// 			const newShifts: shift[] = [...localShifts];
		// 			newShifts[index] = shift;
		// 			console.log({ shift });
		// 			update(shift);
		// 			//Edit shift component for user
		// 		}
		// 	}
		// }
		console.log({ shift }, { newUser }, { localShifts }, { dayName });
		//change the shift in schedule / remove user from the shifts before and after and same day .
		//local shift and genral schedule .
		const newLocalShifts = localShifts?.map((shiftToUpdate) => {
			if (shift.tmpId === shiftToUpdate.tmpId) {
				const newShiftOption= {
					roleId: shift.shiftRole.roleId,
					userId: -1,
					userPreference: "-1",
					userShiftId: -1
				};
				let newShiftOptions;
				if (Array.isArray(shiftToUpdate.optinalUsers)) {
					newShiftOptions = shiftToUpdate.optinalUsers.filter(
						(shiftoption) => shiftoption.userId !== newUser.userId
					);
					 newShiftOptions.push(newShiftOption)
					console.log({ newShiftOptions });
				} else {
					newShiftOptions = [
						newShiftOption,
					];
				}
				return {
					...shiftToUpdate,
					userId: newUser.userId,
					userPreference: newUser.userPreference,
					optinalUsers:[...newShiftOptions],
				};
			} else {
				return shiftToUpdate;
			}
		});
		console.log({ newLocalShifts });
		update(newLocalShifts)
		setlocalShifts(newLocalShifts);
	};
	function FindReplacmentUser({ shift, handelFindReplace }) {
		const [possibleUsers, setpossibleUsers] = useState<shift[]>();

		useEffect(() => {
			const getPossibleuseres = async () => {
				const result = await handelFindReplace(shift);
				console.log(result);
				setpossibleUsers(result);
			};
			getPossibleuseres();
		}, [shift]);

		const handelAskReplace = async (requstedUser: number | undefined) => {
			console.log({ requstedUser }, { shift });
			if (requstedUser) {
				if (authState?.authenticated) {
					const requestDto: userRequest = {
						senderId: shift.userId,
						destionationUserId: requstedUser,
						isAnswered: false,
						requsetMsg: "",
						shiftId: shift.id,
						requestAnswerMsg: "",
						shiftStartTime: shift.shiftStartHour,
						shiftEndTime: shift.shiftEndHour,
						senderName: authState?.user?.firstName,
						senderLastName: authState?.user?.lastName,
					};

					console.log({ requestDto });
					// add emit to server

					// authState.socket.emit('message', { destionationUserId:requstedUser , shift});
					//call api to send the msg ?
					const respone = await axios.post(
						`${API_URL}user-request/setRequest`,
						requestDto
					);
					console.log("emit msg");
				}
				//add update state after emit
			}
		};
		const replaceUserAsAdmin = async (newUser: number | undefined) => {
			console.log({ newUser });
			try {
				const response = await axios.post(`${API_URL}shifts/replaceUser`, {
					newUser,
					shift,
				});
				console.log(response);
			} catch (error) {
				console.log({ error });
			}
		};
		const replaceItem = (item: shift) => {
			return (
				<View>
					<Text>Cahnge</Text>
					<View>
						<Pressable onPress={() => handelAskReplace(item.userRef?.id)}>
							<Text>Ask to take replace.</Text>
						</Pressable>
						<Pressable onPress={() => replaceUserAsAdmin(item.userRef?.id)}>
							<Text>replace users as admin</Text>
						</Pressable>
					</View>
				</View>
			);
		};

		if (possibleUsers) {
			return (
				<View>
					<FlatList
						data={possibleUsers}
						keyExtractor={(item, index) => `child-replace-${index}`}
						renderItem={({ item }) => replaceItem(item)}
					/>
				</View>
			);
		} else
			return (
				<View>
					<Text>no replace</Text>
				</View>
			);
	}

	return (
		<View style={styles.centeredView}>
			{localShifts && (
				<View style={[styles.modalView]}>
					{viewType === "user" && (
						<EditPrefDayView
							dayName={dayName.split(",")[0]}
							date={dayName.split(",")[1]}
							dayShifts={localShifts}
							updateShifts={updateShifts}
						/>
					)}
					{viewType === "systemSchedule" && (
						<>
							{allUsers && isEdit ? (
								<ShiftView
									shifts={localShifts}
									viewType={"systemSchedule"}
									dayName={dayName.split(",")[0]}
									allOptionUsers={allUsers}
									updateShift={handelEditShift}
								/>
							) : (
								<ShiftView
									shifts={localShifts}
									viewType={"systemSchedule"}
									dayName={dayName.split(",")[0]}
									updateShift={handelEditShift}
								/>
							)}
						</>
					)}
					{/* {editDay && (
            <EditDayModal
              shifts={localShifts}
              modalVisible={editDay}
              setModal={setEdit}
              shiftDate={dayName}
              setEdtitedShifts={updateShifts}
            />
          )} */}
				</View>
			)}
		</View>
	);
};

export default DayViewComp;

const styles = StyleSheet.create({
	centeredView: {
		width: 260,
		minWidth: 220,
		maxWidth: 360,
		flex: 4,
		justifyContent: "center",
		alignItems: "center",
	},
	modalView: {
		margin: 10,
		marginRight: 10,
		flex: 1,
		borderRadius: 20,
		padding: 15,
		alignItems: "center",
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
