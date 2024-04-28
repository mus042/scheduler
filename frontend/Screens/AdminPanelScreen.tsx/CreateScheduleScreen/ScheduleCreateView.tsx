import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ShiftTimeName, scheduleData, shift, user } from "../../../App";
import { scheduleCreate, shiftAndOptions } from "./CreateScheduleComp";
import SysDayView from "./SysDayView";
import { FlatList } from "react-native-gesture-handler";
import Example from "./userReplaceMenu";
import { Button } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../../app/context/AuthContext";
import SystemNextSchedule from "../SystemNextSchedule";
import ShiftView from "../../DashBoardScreen/components/ShiftView";
import DayViewComp from "../../DashBoardScreen/components/DayViewComp";

type weekGrouped = Record<string, Record<string, shiftAndOptions[]>>;

function isShiftAndOptions(object: any): object is shiftAndOptions {
	return "shift" in object && object.shift != null;
}

const ScheduleCreateView = ({
	createdSchedule,
	users,
	updateSchedule,
}: {
	createdSchedule: shiftAndOptions[];
	users: user[];
	updateSchedule:any;
}) => {
	const [localSchedule, setLocalSchedule] = useState<any[]>();
	const [updatedSchedule, setUpdatedSchedule] = useState<any[]>();

	const groupShiftsByDayAndTime = (
		schedule: shiftAndOptions[]
	): weekGrouped => {
		// const combined = [...schedule.assigend, ...schedule.unAssigend];
		const weekArr: weekGrouped = {};

		createdSchedule.forEach((item) => {
			// Use the type guard to determine the correct object to use
			const tmpShift = isShiftAndOptions(item) ? item.shift : item;
			console.log({ tmpShift }, "tmpShift", { item });
			const dateKey =
				tmpShift.shiftStartHour instanceof Date
					? tmpShift.shiftStartHour.toISOString().substring(0, 10)
					: tmpShift.shiftStartHour.substring(0, 10);
			const timeName =
				tmpShift.shiftTimeName === "noonCanceled"
					? "noon"
					: tmpShift.shiftTimeName;

			if (!weekArr[dateKey]) {
				weekArr[dateKey] = {};
			}
			if (!weekArr[dateKey][timeName]) {
				weekArr[dateKey][timeName] = [];
			}

			weekArr[dateKey][timeName].push(item); // Assuming item is of type shiftAndOptions
		});

		return weekArr;
	};
	useEffect(() => {
		console.log({ createdSchedule });
		if(createdSchedule?.length > 0 ){
		const groupedShifts = groupShiftsByDayAndTime(createdSchedule);
		console.log("groupedShifts",{groupedShifts})
		setLocalSchedule(Object.entries(groupedShifts));
		console.log({ groupedShifts }, Object.entries(groupedShifts)[0][1]);
		setUpdatedSchedule(createdSchedule);
		};
	}, [createdSchedule]);
	useEffect(() => {
		localSchedule && console.log(localSchedule[0][0]);
	}, [localSchedule]);

	
	const saveSchedule = async () => {
		try {
			const response = await axios.post(
				`${API_URL}schedule/setSystemSchedule/`,
				updatedSchedule
			);
			const data = response.data;
			console.log({ data });
		} catch (error) {
			console.error("Failed to fetch submitted users:", error);
		}
	};
	return (
		<View style={{ flex: 1 }}>
			<Text>ScheduleCreateView</Text>
			<View style={{ flex: 6 }}>
				<FlatList
					style={{ flex: 1 }}
					data={localSchedule}
					keyExtractor={(item) => item[0]}
					horizontal={true}
					contentContainerStyle={{
						justifyContent: "flex-start",
					}}
					renderItem={({ item }) => {
						const scheduleParts:shiftAndOptions[] = item[1]; // Object with morning, noon, and night keys
						console.log('parts',{scheduleParts});

						// Flatten all shifts from each part of the day into a single array
						const shiftsArray = Object.values(scheduleParts)
							.flat()
							.map((entry) => {
								const userRef = users.find((user)=>user.id === entry.shift.userId)
								// console.log('user Profile , '{userProfile})
								const shiftWithOptions = { ...entry.shift,userRef };
								shiftWithOptions.optinalUsers = entry.optinalUsers;

								return shiftWithOptions;
							});
							console.log("shiftsArrays:",{shiftsArray});
					
						const flatShifts = { item: shiftsArray };

						return (
							<View style={{ flex: 1 }}>
								<View>
									<Pressable style={{ margin: 5, }}>
										{/* <SysDayView shifts={item[1]} dayName={item[0]} users={users} /> */}
										<DayViewComp
											shifts={flatShifts}
											isEdit={true}
											viewType={"systemSchedule"}
											update={updateSchedule}
                                            allUsers={users}
										/>
									</Pressable>
								</View>
							</View>
						);
					}}
				/>

				<View>
					<Button onPress={() => saveSchedule()}>Set Schedule</Button>
				</View>
			</View>
		</View>
	);
};

export default ScheduleCreateView;

const styles = StyleSheet.create({});
