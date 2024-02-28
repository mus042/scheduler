import { Pressable, StyleSheet, View } from "react-native";
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

const SystemShift = ({ item, user, handelAskReplace }) => {
	const [findReplaceVisible, setfindReplaceVisible] = useState(false);
	const [expend, setExpend] = useState<boolean>(false);
	const theme = useTheme();
	const shiftRole = item.item;
	
	const MiniComp = () => {
		return (
			<Pressable onPress={() => setExpend(!expend)}>
				<View
					style={{
						flex: 1,
						// borderWidth: 5,
                        marginLeft:3,
						maxWidth: 80,
						width: 80,
						
					}}
				>
					<View style={{flex:5, alignSelf: "center",justifyContent:'flex-end' }}>
						<Avatar.Icon size={50} icon='account' />

						<Text variant='titleSmall' style={{ color: theme.colors.primary }}>
							{shiftRole.userRef?.userProfile.firstName}{" "}
							{shiftRole.userRef?.userProfile.lastName.at(0)}
						</Text>
					</View>

					<View
						style={{
							flex: 2,
							flexDirection: "column",
							maxWidth: 200,
							borderWidth: 1,
						}}
					>
						<Text
							variant='bodySmall'
							style={{
								color:
									shiftRole.userId === null
										? theme.colors.error
										: theme.colors.onBackground,
							}}
						>
							{shiftRole.shiftRole.name}
						</Text>
						<Text variant='bodySmall'>
							{shiftRole.shiftStartHour.substring(11, 16)}-{shiftRole.shiftEndHour.substring(11, 16)}
						</Text>
					</View>

					{(user?.id === shiftRole?.userId ||
						user?.userServerRole === "admin") && (
						<View style={{ flex: 1, flexDirection: "column", minHeight: 5 }}>
							{findReplaceVisible && (
								<View style={{ flex: 1, minHeight: 40 }}>
									<FindReplacmentComp
										shift={shiftRole}
										handelFindReplace={handelAskReplace}
									/>
								</View>
							)}
						</View>
					)}
				</View>
			</Pressable>
		);
	};
	const ExpendedComp = () => {
		return (
			<View style={{ flex: 1, marginLeft: 10, minHeight: 100 }}>
				<View style={{ flex: 3, flexDirection: "row" }}>
					<Text variant='titleMedium' style={{ color: theme.colors.primary }}>
						{shiftRole.userRef?.userProfile.lastName}{" "}
						{shiftRole.userRef?.userProfile.firstName}
					</Text>
				</View>
				<Text variant='titleMedium'>
					{shiftRole.shiftStartHour.substring(11, 16)} -{" "}
					{shiftRole.shiftEndHour.substring(11, 16)}
				</Text>

				{(user?.id === shiftRole?.userId ||
					user?.userServerRole === "admin") && (
					<View style={{ flex: 1, flexDirection: "column", minHeight: 5 }}>
						{findReplaceVisible && (
							<View style={{ flex: 1, minHeight: 40 }}>
								<FindReplacmentComp
									shift={shiftRole}
									handelFindReplace={handelAskReplace}
								/>
							</View>
						)}
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								minHeight: 40,
								borderWidth: 1,
								flex: 1,
								maxWidth: 150,
								alignItems: "center",
								marginBottom: 10,
							}}
						>
							<View style={{ flex: 2, maxWidth: 100 }}>
								<Button
									compact={true}
									labelStyle={{ margin: 2, paddingRight: 4 }}
									onPress={() => setfindReplaceVisible(!findReplaceVisible)}
									icon='find-replace'
									mode='outlined'
								>
									find replacment
								</Button>
							</View>
							<View style={{ flex: 1 }}>
								{user?.userServerRole === "admin" && (
									<IconButton
										icon='circle-edit-outline'
										iconColor={theme.colors.tertiary}
										size={20}
										style={{
											margin: 0,
											padding: 0,
											alignSelf: "center",
											borderWidth: 1,
										}}
										onPress={() => console.log("Pressed")}
									/>
								)}
							</View>
						</View>
					</View>
				)}
			</View>
		);
	};
	return (
		<View style={{ flex: 1, maxWidth: 210 }}>
			    { <MiniComp />}	
                {expend && <ExpendedComp />}
		</View>
	);
};

export default SystemShift;

const styles = StyleSheet.create({});
