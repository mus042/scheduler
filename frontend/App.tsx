import * as React from "react";
import { View, Text, StyleSheet, Platform, AppRegistry } from "react-native";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LogingScreen from "./Screens/LoginScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { API_URL, AuthProvider, userAuth } from "./app/context/AuthContext";
import { createStackNavigator } from "@react-navigation/stack";
import DashBoardScreen from "./Screens/DashBoardScreen/DashBoardScreen";
import AdminPanel from "./Screens/AdminPanelScreen.tsx/AdminPanel";
import {
	GestureHandlerRootView,
	ScrollView,
} from "react-native-gesture-handler";
// import { SocketProvider, useWebSocket } from "./app/context/WebSocketContext";
import { useContext, useEffect, useState } from "react";
import RequestMiniCompenent from "./Screens/DashBoardScreen/components/RequestMiniCompenent";
import { RequestsProvider, useRequests } from "./app/context/requestsContext";
import RequestsScreen from "./Screens/requestTab/RequestsScreen";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import LoginScreenOrg from "./Screens/LoginScreenOrg";
import SettingsScreen from "./Screens/SettingsScreen";
import {
	Appbar,
	Badge,
	Button,
	PaperProvider,
	useTheme,
	Snackbar,
} from "react-native-paper";
import "react-native-gesture-handler";
import { enGB, registerTranslation } from "react-native-paper-dates";
import SignupScreen from "./Screens/SignUpScreen";
import axios from "axios";
import { getHeaderTitle } from "@react-navigation/elements";
import { SnackbarProvider } from "./Screens/SnackbarProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

registerTranslation("en-GB", enGB);
const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

export const dueDateSchedule = () => {
	const today = new Date();
	return (2 + 7 - today.getDay()) % 7;
};

export interface scheduleData {
	data: scheduleInfo;
	shifts: shift[];
}
export type userRequest = {
	id?: number;
	senderId: number;
	destionationUserId: number;
	isAnswered: boolean;
	requsetMsg?: string;
	shiftId: number;
	shiftStartTime?: Date;
	shiftEndTime?: Date;
	senderName?: string | null | undefined;
	senderLastName?: string | null | undefined;
	sendrRef?: user | null;
	requestAnswer?: string | null;
	requestAnswerMsg: string | null;
	recivingRef?: user | null;
	shift?: shift | null;
	status?: "pending" | "recived" | "sent" | "seen" | "replayed" | null;
};

export type scheduleInfo = {
	id?: number | undefined;
	createdAt: Date | undefined;
	updatedAt: Date | undefined;
	isLocked?: boolean | undefined;
	scedualStart: Date | undefined;
	scedualEnd: Date | undefined;
	scheduleType: "systemSchedule" | "user" | undefined;

	userId?: number | undefined;
};
export type user = {
	id: number;
	createdAt?: Date ;
	updatedAt?: Date;
	userServerRole: "admin" | "user";
	userLevel: number;
	typeOfUser: "new";
	email: string;
	facilityId?: number;
	userProfile?:{
		firstName: string | null;
		lastName: string | null;
	}
	firstName: string | null;
	lastName: string | null;
};
export type ShiftTimeName =
	| "morning"
	| "noon"
	| "noonCanceled"
	| "night"
	| "other";

export type shift = {
	id: number;
	createdAt: Date;
	updatedAt: Date;
	tmpId?: number;
	shiftTimeName: ShiftTimeName;
	typeOfShift: "short" | "long";
	shiftStartHour: string | Date;
	shiftEndHour: string | Date;
	shiftRoleUser: any;
	userId: number;
	userPreference: string | null;
	scheduleId: number | null;
	userRef: user | null | undefined;
	roleId?: number | null;
	shiftRole?: object | null;
	optinalUsers?: object | null | undefined;
};

const BellIconWithBadge = ({ onPress, badgeCount }) => {
	const theme = useTheme();
	return (
		<View style={{ flexDirection: "row", alignItems: "center" }}>
			<Appbar.Action
				icon='bell-circle'
				color={badgeCount.in > 0 ? theme.colors.error : theme.colors.primary}
				style={{ borderWidth: 1 }}
				onPress={onPress}
			/>
			{badgeCount.in > 0 && (
				<Badge
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						backgroundColor: "red",
						color: "white",
					}}
				>
					{badgeCount.in}
				</Badge>
			)}
		</View>
	);
};

const CustomHeader = ({ logOut, navigation, route, options }) => {
	const title = getHeaderTitle(options, route.name);
	const requests = useRequests();
	const theme = useTheme();
	const [unseenCount, setUneenCount] = useState(requests.requests?.unseen);

	useEffect(() => {
		setUneenCount(requests.requests?.unseen);
	}, [requests]);

	return (
		<Appbar.Header
			style={{
				alignContent: "space-between",

				alignItems: "flex-end",
				justifyContent: "flex-end",
			}}
		>
			<Appbar.Action
				icon={"menu"}
				size={20}
				style={{ paddingTop: 15 }}
				onPress={() => {
					navigation.openDrawer();
				}}
			/>
			<Appbar.Content title={title} />
			<Appbar.Action
				icon='logout'
				color={theme.colors.error}
				style={{ borderWidth: 1 }}
				size={20}
				onPress={() => logOut()}
			/>
			<BellIconWithBadge
				onPress={() => {
					console.log("navigate");
					navigation.navigate("HomeScreen", { screen: "Requests" });
				}}
				badgeCount={unseenCount}
			/>
		</Appbar.Header>
	);
};
function MyTabs() {
	const { authState }: any = userAuth();
	const theme = useTheme();
	const user: user | null = authState?.user;

	if (user?.userServerRole === "admin") {
		return (
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: { color: theme.colors.primary },
					tabBarStyle: { backgroundColor: theme.colors.background },
				}}
			>
				<Tab.Screen name='Admin Panel' component={AdminPanel} />
				<Tab.Screen name='Personal DashBoard' component={DashBoardScreen} />

				<Tab.Screen name='Personal Settings' component={SettingsScreen} />
			</Tab.Navigator>
		);
	}

	return (
		<Tab.Navigator
			screenOptions={{
				tabBarLabelStyle: { color: theme.colors.primary },
				tabBarActiveTintColor: theme.colors.tertiary,
				tabBarIndicatorStyle: { backgroundColor: theme.colors.tertiary },
				tabBarStyle: { backgroundColor: theme.colors.background },
			}}
		>
			<Tab.Screen name='Personal DashBoard' component={DashBoardScreen} />
			{/* <Tab.Screen name="Personal Settings" component={SettingsScreen} /> */}
		</Tab.Navigator>
	);
}
function RequestsTab() {
	return (
		<View style={{ flex: 1, alignItems: "center" }}>
			<RequestsScreen />
		</View>
	);
}

function Article() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Article Screen</Text>
		</View>
	);
}

function MyDrawer({ onLogout }) {
	const theme = useTheme();

	return (
		// <SocketProvider>
		//  <SnackbarProvider>
		<RequestsProvider>
			<Drawer.Navigator
				screenOptions={{
					header: ({ navigation, options, route }) => (
						<CustomHeader
							logOut={onLogout}
							navigation={navigation}
							options={options}
							route={route}
						/>
					),
					headerStyle: {
						backgroundColor: theme.colors.background,
					},
					headerTintColor: theme.colors.tertiary,
					headerTitleStyle: {
						fontWeight: "bold",
						color: theme.colors.onBackground,
					},
				}}
			>
				<Drawer.Screen name='Dashboard' component={MyTabs} />
				<Drawer.Screen name='Requests' component={RequestsTab} />

				<Drawer.Screen name='About' component={Article} />
				{/* <Drawer.Screen name="Settings" component={SettingsScreen} /> */}
			</Drawer.Navigator>
		</RequestsProvider>
		//  </SnackbarProvider>
	);
}

export default function App() {
	return (
		<SafeAreaProvider>
			<AuthProvider>
				{/* <SocketProvider> */}
				<NavigationContainer>
					<PaperProvider>
						<>
							{Platform.OS === "web" ? (
								<style type='text/css'>{`
        @font-face {
          font-family: 'MaterialCommunityIcons';
          src: url(${"react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"}) format('truetype');
        }
      `}</style>
							) : null}
							<SnackbarProvider>
								<Layout />
							</SnackbarProvider>
						</>
						{/* </GestureHandlerRootView>  */}
					</PaperProvider>
				</NavigationContainer>
				{/* </RequestsProvider> */}
				{/* </SocketProvider> */}
			</AuthProvider>
		</SafeAreaProvider>
	);
}

export function Layout() {
	const { authState, onLogout } = userAuth();
	const [settingsSet, setSettingsSet] = useState<boolean>(false);
	const theme = useTheme();
	const [isLoading, setIsLoading] = useState(false);
	// fetch server-side settings
	const checkServerSettings = async () => {
		if (
			authState?.user?.facilityId &&
			authState.user.userServerRole === "admin"
		) {
			console.log("user", authState.user.userServerRole);
			try {
				console.log("facilityId", authState?.user?.facilityId);
				// Call your server API to check settings for admin users

				const response = await axios.get(
					`${API_URL}schedule/getSelctedScheduleMold`,
					{
						params: {
							facilityId: authState.user.facilityId,
						},
					}
				);
				const data = response.data;
				console.log({ response });
				console.log("settings not set ", { data });
				setSettingsSet(data.id ? true : false);
			} catch (error) {
				setSettingsSet(false);
			}
		}
	};

	useEffect(() => {
		// Check server settings only if the user is authenticated and is an admin
		if (
			authState?.authenticated &&
			authState.user?.userServerRole === "admin"
		) {
			console.log({ authState });
			checkServerSettings();
		}
	}, [authState?.authenticated, authState?.user?.userServerRole]);

	const SetScreen = () => {
		return (
			<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
				<SettingsScreen setSettingsShow={setSettingsSet} />
			</View>
		);
	};
	const MyDrawerWithSetRoute = ({ navigation }) => {
		return <MyDrawer onLogout={onLogout} />;
	};
	// if (isLoading && authState?.authenticated) {
	//   return (<View><Text>Loading</Text></View>);
	// }
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Stack.Navigator>
				{authState?.authenticated ? (
					// Check if settings are set before rendering the drawer
					authState.user?.userServerRole === "user" || settingsSet === true ? (
						<Stack.Screen
							name='HomeScreen'
							component={MyDrawerWithSetRoute}
							options={{
								headerShown: false,
							}}
						/>
					) : (
						// Render a loading or error screen if settings are not set
						authState.user?.userServerRole === "admin" && (
							<Stack.Screen name='Settings' component={SetScreen} />
						)
					)
				) : (
					<Stack.Group>
						<Stack.Screen
							name='login'
							component={LogingScreen}
							options={{
								headerTransparent: true,
								headerStyle: {
									// backgroundColor: theme.colors.background,

									// backgroundColor: 'transparent',
									borderBottomWidth: 0,
									// borderBottomColor: theme.colors.background,
								},
								headerTintColor: "white", // Set the text color of the header for this screen
								headerTitleStyle: {
									fontWeight: "bold",
									color: theme.colors.onBackground,
								},
							}}
						/>
						<Stack.Screen
							name='Signup'
							component={SignupScreen}
							options={{
								headerTransparent: true,
								headerStyle: {
									backgroundColor: theme.colors.background,
									borderBottomWidth: 0,
									borderBottomColor: theme.colors.background,
								},
								headerTintColor: "white",
								headerTitleStyle: {
									fontWeight: "bold",
									color: theme.colors.onBackground,
								},
							}}
						/>

						<Stack.Screen
							name='login facility'
							component={LoginScreenOrg}
							options={{
								headerTransparent: true,
								headerStyle: {
									backgroundColor: theme.colors.background,
									borderBottomWidth: 0,
									borderBottomColor: theme.colors.background,
								},
								headerTintColor: "white",
								headerTitleStyle: {
									fontWeight: "bold",
									color: theme.colors.onBackground,
								},
							}}
						/>
					</Stack.Group>
				)}
			</Stack.Navigator>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,

		alignItems: "center",
		justifyContent: "center",
	},
});
