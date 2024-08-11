import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScheduleCreateView from "./ScheduleCreateView";
import { scheduleData, shift, user } from "../../../App";
import axios from "axios";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import Userbuble from "../components/Userbuble";
import Example from "./userReplaceMenu";
import SystemNextSchedule from "../SystemNextSchedule";
import { useSnackbarContext } from "../../SnackbarProvider";
import ScheduleWeekPicker from "../../DashBoardScreen/components/ScheduleWeekPicker";
export type scheduleCreate = {
	schedule: scheduleData;
	assigend: shiftAndOptions[];
	unAssigend: shiftAndOptions[];
	userShiftStats: any;
};
export type shiftAndOptions = {
	shift: shift;
	optinalUsers?: shiftOptions[];
};
export type shiftOptions = {
	userId: number;
	roleId: number;
	userPreference: string;
	userShiftId: number;
};
type createdSchedType = {
	shifts: shiftAndOptions[];
	stats: any[];
};
const CreateScheduleComp = ({ allUsers }: { allUsers: any[] | undefined }) => {
	const [selectedUsers, setSelectedUsers] = useState<user[]>([]);
	const [submittedUsers, setSubmittedUsers] = useState<user[]>([]);
	const [selcetedweek, setSelctedWeek] = useState();
	const [createdScheduleStats, setcreatedScheduleStats] = useState();

	const [createdScheduleShifts, setcreatedScheduleShifts] =
		useState<shiftAndOptions[]>();
	const [createdSched, setCreatedSched] = useState<createdSchedType>({
		shifts: [],
		stats: [],
	});
	const { addSnackBarToQueue } = useSnackbarContext();

	const me = userAuth().authState?.user;
	useEffect(() => {
		if (allUsers) {
			setSelectedUsers([...allUsers]);
		}
	}, [allUsers]);

	useEffect(() => {
		const fetchSubmittedUsers = async () => {
			if (selcetedweek) {
				try {
					const response = await axios.get(
						`${API_URL}schedule/submittedUsers/`,
						{ params: { startDate: selcetedweek } }
					);
					const data = response.data;
					setSubmittedUsers(data);
				} catch (error) {
					console.error("Failed to fetch submitted users:", error);
				}
			}
		};
		fetchSubmittedUsers();
	}, [selcetedweek]);
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
	const selctedDate: Date =
		selcetedweek !== undefined
			? new Date(selcetedweek)
			: new Date(
					currentDate.getTime() +
						(7 - currentDate.getDay()) * 24 * 60 * 60 * 1000
			  );
	const startDate: Date = selcetedweek
		? selctedDate
		: new Date(
				currentDate.getTime() + (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000
		  );
	const createNewSysSchedule = async (
		startDate: Date,
		selectedUsers: user[]
	) => {
		startDate.setUTCHours(0, 0, 0, 0); // Set time to start of the day in UTC

		try {
			console.log("sched create ", { startDate }, startDate.toUTCString(), {
				selectedUsers,
			});
			const selectedUsersIds = selectedUsers.map((user) => user.id);
			const schedule = await axios.post(`${API_URL}schedule/createSchedule/`, {
				scheduleStart: startDate, // Send as ISO string
				selectedUsers: selectedUsersIds,
			});
			console.log({schedule})
			return schedule.data;
		} catch (error) {
			return { error: true, msg: (error as any).response.data.msg };
		}
	};

	const handelPress = () => {
		console.log("create new schedule ");
		const newScheudle = async () => {
			try {
				const tmpSched = await createNewSysSchedule(startDate, selectedUsers);
				console.log("tmpSched", { tmpSched });
	
				// Ensure tmpSched and tmpSched.shifts exist and are arrays
				if (!tmpSched.error && Array.isArray(tmpSched.shifts)) {
					const sortedShifts = tmpSched.shifts.sort((a, b) => {
						const dateA = a && a.shiftStartHour 
							? new Date(a.shiftStartHour).getTime() 
							: 0;
						const dateB = b && b.shiftStartHour 
							? new Date(b.shiftStartHour).getTime() 
							: 0;
						console.log(dateA, dateB, "a,b ", { a }, { b });
						return dateA - dateB;
					});
					console.log("sorted shifts", { sortedShifts });
	
					setCreatedSched({ ...tmpSched, shifts: sortedShifts });
					addSnackBarToQueue({ snackbarMessage: "Created schedule 🎊" });
					return tmpSched;
				} else {
					throw new Error("Invalid schedule data");
				}
			} catch (error) {
				console.log({ error });
				addSnackBarToQueue({ snackbarMessage: "Error Creating schedule 😔 " });
			}
		};
		newScheudle();
	};
	
	const updateSchedule = (newShifts: shift[]) => {
		console.log("newShifts ", { newShifts });

		if (createdSched && createdSched.shifts) {
			const updatedShifts: shiftAndOptions[] = createdSched.shifts.map(
				(existingShift) => {
					// Find the new shift that matches the current shift's tmpId
					const newShift = newShifts.find(
						(ns) => ns.tmpId === existingShift.shift.tmpId
					);
					console.log(
						{ newShift },
						{ existingShift },
						existingShift.shift.tmpId
					);
					const tmpShift = newShift
						? { ...existingShift.shift, ...newShift }
						: { ...existingShift.shift };
					console.log({ tmpShift });
					const { optinalUsers, userRef, ...tmpShiftWithoutOptions } = tmpShift;
					return { shift: tmpShiftWithoutOptions, optinalUsers: optinalUsers };
				}
			);

			const newSched: createdSchedType = { shifts: updatedShifts, stats: [] }; // Ensure 'stats' and other properties are correctly defined
			console.log({ newSched });
			setCreatedSched(newSched);
		}
	};

	return (
		<View style={{ flexDirection: "column", flex: 1 }}>
			<View style={{ flexGrow: 1 }}>
				<Pressable onPress={() => console.log("weeks")}>
					<Text>choose week to create </Text>
					{/* to remove past weeks  */}
					<ScheduleWeekPicker setSelectedDate={setSelctedWeek} />
				</Pressable>
				<FlatList
					data={allUsers}
					keyExtractor={(user) => user.id.toString() + Math.random()}
					horizontal={true}
					contentContainerStyle={{
						justifyContent: "flex-start",
						borderWidth: 3,

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
									submittedUsers.some((u) => u === user.id) ? "Sub" : undefined
								}
								altText={user.id === me?.id ? "Me" : undefined}
								selected={selectedUsers.some((u) => u.id === user.id)}
								badgeColor={undefined}
							/>
						</Pressable>
					)}
				/>
			</View>
			<View style={{ flexGrow: 1 }}>
				<Text>Show schedule template</Text>
			</View>
			<View style={{ flexGrow: 1 }}>
				<Pressable onPress={handelPress}>
					<Text>Create new Schedule for next week</Text>
				</Pressable>
			</View>
			<View style={{ flexGrow: 9 }}>
				{createdSched && allUsers && (
					<View style={{ flexGrow: 1 }}>
						<ScheduleCreateView
							createdSchedule={createdSched.shifts}
							users={allUsers}
							updateSchedule={updateSchedule}
						/>
					</View>
				)}

				{/*                
                <View style={{flex:1}}>
                <Pressable onPress={()=>console.log("approve")}>
                        <Text>Approve</Text>
                </Pressable>
                </View> */}
			</View>
		</View>
	);
};

export default CreateScheduleComp;

const styles = StyleSheet.create({});
