import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Platform,
  AppRegistry,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
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
import { SocketProvider, useWebSocket } from "./app/context/WebSocketContext";
import { useContext, useEffect, useState } from "react";
import RequestMiniCompenent from "./Screens/DashBoardScreen/components/RequestMiniCompenent";
import { RequestsProvider, useRequests } from "./app/context/requestsContext";
import RequestsScreen from "./Screens/requestTab/RequestsScreen";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import LoginScreenOrg from "./Screens/LoginScreenOrg";
import SettingsScreen from "./Screens/SettingsScreen";
import { PaperProvider, useTheme } from "react-native-paper";

import { enGB, registerTranslation } from "react-native-paper-dates";
import SignupScreen from "./Screens/SignUpScreen";
import axios from "axios";
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
  recivingRef?: user | null;
  shiftRef?: shift | null;
  status?: "pending" | "recived" | "sent" | "seen" | "replayed" | null;
};

export type scheduleInfo = {
  id: number | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  scedualStart: Date | undefined;
  scedualEnd: Date | undefined;
  sceduleType: "systemSchedule" | "userSchedule" | undefined;

  userId?: number | undefined;
};
export type user = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userRole: "admin" | "user";
  userLevel: number;
  typeOfUser: "new";
  email: string;

  firstName: string | null;
  lastName: string | null;
};

export type shift = {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  shiftDate: Date;
  shiftType: string;
  typeOfShift: "short" | "long";
  shifttStartHour: Date;
  shiftEndHour: Date;

  userId: number;
  userPreference: string | null;
  scheduleId: number | null;
  userRef: user | null | undefined;
};

function MyTabs() {
  const { authState }: any = userAuth();
  const user: user | null = authState?.user;

  if (user?.userRole === "admin") {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Personal DashBoard" component={DashBoardScreen} />
        <Tab.Screen name="Admin Panel" component={AdminPanel} />
        {/* <Tab.Screen name="Personal Settings" component={SettingsScreen} /> */}
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Personal DashBoard" component={DashBoardScreen} />
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

function MyDrawer() {
  return (
    <SocketProvider>
      <RequestsProvider>
        <Drawer.Navigator>
          <Drawer.Screen name="Requests" component={RequestsTab} />
          <Drawer.Screen name="Dashboard" component={MyTabs} />
          <Drawer.Screen name="About" component={Article} />
          {/* <Drawer.Screen name="Settings" component={SettingsScreen} /> */}
        </Drawer.Navigator>
      </RequestsProvider>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <RequestsProvider>
          <PaperProvider>
            <>
              {Platform.OS === "web" ? (
                <style type="text/css">{`
        @font-face {
          font-family: 'MaterialCommunityIcons';
          src: url(${require("react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf")}) format('truetype');
        }
      `}</style>
              ) : null}
              <Layout />
            </>
            {/* </GestureHandlerRootView>  */}
          </PaperProvider>
        </RequestsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export function Layout() {
  const { authState, onLogout } = userAuth();
  const [settingsSet, setSettingsSet] = useState<boolean>(true);
  const theme = useTheme();
  // fetch server-side settings
  const checkServerSettings = async () => {
    try {
      // Call your server API to check settings for admin users
      const response = await axios.get(`${API_URL}getSettings`);
      const data = response.data;
      // Assuming the server response has a 'settingsSet' field indicating whether settings are set
      setSettingsSet(data.settingsSet);
    } catch (error) {
      console.error("Error fetching server settings:", error);
    }
  };

  useEffect(() => {
    // Check server settings only if the user is authenticated and is an admin
    if (authState?.authenticated && authState.user?.userRole === "admin") {
      checkServerSettings();
    }
  }, [authState?.authenticated, authState?.user?.userRole]);
  const SetScreen = () => {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SettingsScreen setSettingsShow={setSettingsSet} />
      </View>
    );
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
              borderBottomWidth: 0,
              borderBottomColor: theme.colors.background,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: "bold",
              color: theme.colors.onBackground,
            },
          }}
        >
          {authState?.authenticated ? (
            // Check if settings are set before rendering the drawer
            settingsSet ? (
              <Stack.Screen
                name="HomeScreen"
                component={MyDrawer}
                options={{
                  headerRight: () => (
                    <View style={{ flex: 1, marginTop: 5, marginRight: 5 }}>
                      <Button onPress={onLogout} title={"Sign Out"} />
                      <RequestMiniCompenent />
                    </View>
                  ),
                }}
              />
            ) : (
              // Render a loading or error screen if settings are not set

              <Stack.Screen
                name="Settings Not Set Screen"
                component={SetScreen}
              />
            )
          ) : (
            <Stack.Group>     
                     <Stack.Screen
                name="login"
                component={LogingScreen}
                options={{
                  headerStyle: {
                    backgroundColor: theme.colors.background,
                    borderBottomWidth: 0,
                    borderBottomColor: theme.colors.background,
                  },
                  headerTintColor: "white", // Set the text color of the header for this screen
                  headerTitleStyle: {
                    fontWeight: "bold",
                    color: theme.colors.onBackground,
                  },
                }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{
                  headerStyle: {
                    backgroundColor: theme.colors.background,
                    borderBottomWidth: 0,
                    borderBottomColor: theme.colors.background,
                  },
                  headerTintColor: "white", // Set the text color of the header for this screen
                  headerTitleStyle: {
                    fontWeight: "bold",
                    color: theme.colors.onBackground,
                  },
                }}
              />

  
                            <Stack.Screen name="login facility" component={LoginScreenOrg} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
