import {
	Button,
	PanResponder,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import axios, { all } from "axios";
import { API_URL, userAuth } from "../../app/context/AuthContext";
import { user } from "../../App";
import UserNextScheduleComp from "../DashBoardScreen/components/UserNextScheduleComp";
import UserCurrentSchedule from "../DashBoardScreen/components/UserCurrentSchedule";
import { shift, scheduleData } from "../../App";
import SystemNextSchedule from "./SystemNextSchedule";
import { mainStyle } from "../../utils/mainStyles";
import UserItem from "./UserItem";
import UsersPanel from "./UsersPanel";
import Userbuble from "./components/Userbuble";
import CreateScheduleComp from "./CreateScheduleScreen/CreateScheduleComp";
import { IconButton, MD3Colors } from "react-native-paper";
import { useSnackbarContext } from "../SnackbarProvider";
import BulletinBoardComponent from "./components/BulletinBoardComponent";

const AdminPanel = () => {
	// TODO
	//Add user - implment errors handel
	//edit user -  implement  constrains and error handeling
	//edit self -  To Be added to user DashBoard
	//useres Schedules
	//generate new schedule -V - includ users for schedule
	//edit shift -  as admin
	//edit schedule -

	const [allUsers, setAllUsers] = useState<any[]>();
	const [currentSchedule, setCurrentSchedule] = useState<scheduleData>();
	const [nextSystemSchedule, setNextSystemSchedul] = useState<scheduleData>();
	const [emptyShifts, setEmptyShifts] = useState<shift[]>();
	const [createdSched, setcreatedSched] = useState();
	const [userToEdit, setUserToEdit] = useState();
	const [rolesArr, setRolesArr] = useState();
	const [massegeBoardMsgs, setMassegeBoardMsgs] = useState(); //ToAdd
	const me = userAuth().authState?.user;
	const { addSnackBarToQueue } = useSnackbarContext();
	useEffect(() => {
		//get the roles and set state
		const setAllRoles = async () => {
			try {
				const tmpRolesArr = await axios.get(`${API_URL}roles/allRoles`);
				if (tmpRolesArr.data) {
					console.log({ tmpRolesArr });
					setRolesArr(tmpRolesArr.data);
				}
			} catch (error) {
				console.log("error at all roles ", { error });
			}
		};
		setAllRoles();
	}, []);

	useEffect(() => {
		const getCurrentSched = async () => {
			const sched = await axios.get(`${API_URL}schedule/getCurrentSchedule`);
			const scheduleData: scheduleData = { ...sched.data };
			console.log("current schedule ", { scheduleData });
			setCurrentSchedule(scheduleData);
			// console.log({currentSchedule});
		};
		getCurrentSched();
	}, []);
	useEffect(() => {
		// const allUsers = async () => await getAllUsers();
		getAllUsers();
	}, []);

	useEffect(() => {
		const getNextSystemSched = async () => {
			const sched = await axios.get(
				`${API_URL}schedule/getNextSystemSchedule/`
			);
			const scheduleData: scheduleData = { ...sched.data };
			console.log({ scheduleData });

			setNextSystemSchedul(scheduleData);
		};
		getNextSystemSched();
	}, [createdSched]);
	useEffect(() => {
		console.log("Updated currentSchedule:", currentSchedule, emptyShifts);
	}, [currentSchedule]); // Log the updated currentSchedule value

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponderCapture: () => false,
		onMoveShouldSetPanResponder: () => false,
	});

	const CreateNewScheduleComp = () => {
		const [selectedUsers, setSelectedUsers] = useState<user[]>([]);
		const [submittedUsers, setSubmittedUsers] = useState<user[]>([]);
		const [scheduleShifts, setScheduleShifts] = useState();

		useEffect(() => {
			if (allUsers) {
				setSelectedUsers([...allUsers]);
			}
		}, [allUsers]);

		useEffect(() => {
			const fetchSubmittedUsers = async () => {
				try {
					const response = await axios.get(
						`${API_URL}schedule/submittedUsers/`
					);
					const data = response.data;
					// Assuming the response is an array of users
					setSubmittedUsers(data);
				} catch (error) {
					console.error("Failed to fetch submitted users:", error);
				}
			};

			fetchSubmittedUsers();
		}, []);
		const toggleUserSelection = (selectedUser: user) => {
			if (selectedUsers.some((user) => user.id === selectedUser.id)) {
				setSelectedUsers(
					selectedUsers.filter((user) => user.id !== selectedUser.id)
				);
			} else {
				setSelectedUsers([...selectedUsers, selectedUser]);
			}
		};

		const currentDate = new Date(); //current time
		const startDate = new Date(
			currentDate.getTime() + (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000
		);
		startDate.setHours(0); // start time

		const handelPress = () => {
			console.log("create new schedule ");
			const newScheudle = async () => {
				const tmpSched = await createNewSysSchedule(startDate, selectedUsers);
				console.log("tmpSched", { tmpSched });
				setcreatedSched({ ...tmpSched });
				const combinedShifts = { ...tmpSched.assigend, ...tmpSched.unAssigend };
				// setEmptyShifts({ ...tmpSched.emptyShifts });
				console.log("combined assigned and un", { combinedShifts });
				return tmpSched;
			};
			newScheudle();
		};

		return (
			<View style={{ flex: 1, flexDirection: "column" }}>
				<View style={{ flex: 1, borderWidth: 3 }}>
					<FlatList
						data={allUsers}
						keyExtractor={(user) => user.id.toString()}
						horizontal={true}
						contentContainerStyle={{
							justifyContent: "flex-start",
							borderWidth: 3,
							flex: 1,
							width: "100%",
						}}
						renderItem={({ item: user }) => (
							<Pressable
								onPress={() => toggleUserSelection(user)}
								style={{ margin: 5 }}
							>
								<Userbuble
									user={user}
									badgeContent={
										submittedUsers.some((u) => u === user.id)
											? "Sub"
											: undefined
									}
									altText={user.id === me?.id ? "Me" : undefined}
									selected={selectedUsers.some((u) => u.id === user.id)}
									badgeColor={undefined}
								/>
							</Pressable>
						)}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Pressable style={styles.button} onPress={handelPress}>
						<Text>Create new Schedule for next week</Text>
					</Pressable>
				</View>
				<View style={{ flex: 3 }}>
					<Text>Generated Schedule .</Text>

					<View style={{ flex: 5, borderWidth: 10 }}>
						{/* <SystemNextSchedule
					nextSchedule={createdSched}
					onDeleteSched={onDeleteSched}
				/> */}
					</View>
					<Pressable onPress={() => console.log("approve")}>
						<Text>Approve</Text>
					</Pressable>
				</View>
			</View>
		);
	};

	const createNewSysSchedule = async (
		startDate: Date,
		selectedUsers: user[]
	) => {
		try {
			console.log({ startDate }, { selectedUsers });
			const selectedUsersIds = selectedUsers.map((user) => user.id);
			const shcedule = await axios.post(`${API_URL}schedule/createSchedule/`, {
				scedualStart: startDate,
				selctedUsers: selectedUsersIds,
			});
			return shcedule.data;
		} catch (error) {
			return { error: true, msg: (error as any).response.data.msg };
		}
	};

	const addUser = async (
		email,
		password,
		firstName,
		lastName,
		roleId,
		userId
	) => {
		console.log('add user',{ email, password, firstName, lastName,  });
		try {
			const  res = await axios.post(`${API_URL}auth/addUserAsAdmin`, {
				
				email,
				password,
				roleId: roleId,
				userProfile: { firstName, lastName },
			});
			if(res){
				console.log("sucssus");
				addSnackBarToQueue({ snackbarMessage: "Saved Changes " });
				//if new user added - refresh the component, 
			}
		} catch (error) {
			return { error: true, msg: (error as any).response.data.msg };
		}
	};

	const getAllUsers = async () => {
		try {
			const result = await axios.get(`${API_URL}users/allUsers`);
			if (result) {
				setAllUsers(result.data);
				return result.data;
			}
		} catch (error) {
			return { error: true, msg: (error as any).response.data.msg };
		}
	};

	function newScheduleComp() {
		const [nextSchedule, setNextSchedule] = useState();

		return (
			<View>
				<Text>next weeks Schedule :</Text>
			</View>
		);
	}
	const getUsersShiftsForNextSched = async (users) => {
		//get all users
		const usersShifts: Record<number, { user: user; shifts: any }> = {};
		// const users = await getAllUsers();
		for (const user of users) {
			const shifts = await axios.get(`${API_URL}schedule/getNextSchedule`, {
				params: { userId: user.id },
			});
			if (shifts) {
				console.log(shifts.data);
				usersShifts[user.id] = {
					user: { ...user },
					shifts: { ...shifts.data },
				};
			}
		}
		if (usersShifts) {
			console.log({ usersShifts });
			return usersShifts;
		} else {
			console.log("cant find next schedulas or shifts ");
		}
	};
	const onDeleteSched = async () => {
		//This will delete the schedule.
		//make sure schedule didnt start
		console.log("delete schedule");
		try {
			const res = await axios.delete(
				`${API_URL}schedule/deleteSchedule/${nextSystemSchedule?.data.id}`
			);
		} catch (error) {
			console.log({ error });
		}
	};
	function usersSchedulesComp() {}

	const editUser = async (email, userId, firstName, lastName, roleId) => {
		console.log({ email, userId, firstName, lastName });
		try {
			return await axios.post(`${API_URL}users/editUserAsAdmin`, {
				userId,
				email,
				roleId: roleId,
				userProfile: { firstName, lastName },
			});
		} catch (error) {
			return { error: true, msg: (error as any).response.data.msg };
		}
	};

	return (
		<ScrollView style={styles.mainContainer}>
			<View style={{ flexGrow: 1 }}>
				<Text style={[mainStyle.h3, { textAlign: "center" }]}>Admin panel</Text>
			</View>
			<View style={{ flexGrow: 4 }}>
				<Text>Bulltin board</Text>
				<View>
					<BulletinBoardComponent />
				</View>
			
			</View>
			<View style={{ flexGrow: 11 }}>
				<SystemNextSchedule
					nextSchedule={nextSystemSchedule}
					onDeleteSched={onDeleteSched}
				/>
			</View>
		
			<View style={{ flexGrow: 11 }}>
				<CreateScheduleComp allUsers={allUsers} />
			</View>

			<View style={{ flexGrow: 6 }}>
				<UsersPanel users={allUsers} editUser={editUser} roles={rolesArr} addUser={addUser} />
			</View>
		</ScrollView>
	);
};

export default AdminPanel;

const styles = StyleSheet.create({
	mainContainer: {
		maxWidth: 1200,
		minWidth: 300,
		flexDirection: "column",
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,

		width: "30%",
		maxWidth: 350,
	},
	container: {
		borderColor: "black",
		borderWidth: 1,
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 16,
		paddingHorizontal: 8,
	},
});
