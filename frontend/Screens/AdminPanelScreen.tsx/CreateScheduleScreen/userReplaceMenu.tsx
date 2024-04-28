import React, { useState } from "react";
import {
	Modal,
	View,
	Text,
	FlatList,
	StyleSheet,
	Pressable,
} from "react-native";
import { Button, IconButton } from "react-native-paper";
import Userbuble from "../components/Userbuble";
import { Colors } from "react-native/Libraries/NewAppScreen";

const EditShiftModalView = ({
	visible,
	setVisible,
	shiftAndOption,
	allusers,
}) => {
	console.log({ shiftAndOption });
	const shiftOptions = Array.isArray(shiftAndOption.optinalUsers)
		? shiftAndOption.optinalUsers
		: Object.values(shiftAndOption.optinalUsers);
	const shift = shiftAndOption.shift;
	const onSelectUser = (selctedUser) => {
		//update the shift with the new user and options with old user.
		console.log(
			selctedUser.userId,
			"replace users ",
			{ shiftAndOption },
			{ selctedUser }
		);

		let newOptions = [...shiftAndOption.optinalUsers] || [];
		newOptions.push({
			userId: selctedUser.userId,
			roleId: shiftAndOption.shift.shiftRole.roleId,
			userPreference: shiftAndOption.shift.userPreference,
			usrShiftId: -1,
		});
		newOptions = newOptions.filter(
			(option) => option.userId === shiftAndOption.shift.userId
		);
		const newShift = {
			...shiftAndOption.shift,
			userId: selctedUser.userId,
			userPreference: selctedUser.userPreference,
			userShfit: selctedUser.userShift,
		};
		console.log({ newShift }, { newOptions });
		//Update up component tree
	};

	const saveChanges = () => {
		console.log("save changes ");
	};
	return (
		<View style={styles.container}>
			<Modal
				visible={visible}
				transparent={true}
				onRequestClose={() => setVisible(false)}
				animationType='slide'
			>
				<View style={[styles.modalContainer, { justifyContent: "flex-end" }]}>
					<View style={styles.modalContent}>
						<View style={{ position: "absolute", top: 3, right: 3 }}>
							<IconButton
								icon='close-circle'
								iconColor="red"
								size={20}
								onPress={() => setVisible(false)}
							/>
						</View>
						<View style={{flex:1}}>
							<Text>
								{shiftAndOption.shift.shiftStartHour.substring(0, 10)}
							</Text>
						</View>
                        <View style={{flex:3}}>
						<FlatList
							style={{ flex: 1, flexDirection: "row" }}
							data={shiftOptions}
							horizontal={true}
							keyExtractor={(item) => item.userShiftId}
							renderItem={({ item }) => (
								<View style={styles.itemContainer}>
									<Pressable onPress={() => onSelectUser(item)}>
										<Userbuble
											user={allusers.find((user) => item.userId === user.id)}
											badgeContent={item.userPreference}
											altText={""}
											selected={false}
											badgeColor={""}
										/>
									</Pressable>
								</View>
							)}
						/>
                        </View>
                        <View style={{flex:1 , flexDirection:'column'}}>
						<Button style={{flex:1}} onPress={() => setVisible(false)}>Close Modal</Button>
						<Button style={{flex:1}} onPress={() => saveChanges()}>Save </Button> 
                        </View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		// flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "100%",
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
	},
	itemContainer: {
		// borderRadius: 5, 
        margin:2,
        marginRight:3,
	},
	itemText: {
		fontSize: 16,
	},
});

export default EditShiftModalView;
