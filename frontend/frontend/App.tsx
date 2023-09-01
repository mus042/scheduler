import * as React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LogingScreen from "./Screens/LoginScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, userAuth } from "./app/context/AuthContext";
import { createStackNavigator } from "@react-navigation/stack";
import DashBoardScreen from "./Screens/DashBoardScreen/DashBoardScreen";
import AdminPanel from "./Screens/AdminPanelScreen.tsx/AdminPanel";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { SocketProvider, useWebSocket } from "./app/context/WebSocketContext";
import { useContext, useEffect } from "react";
import RequestMiniCompenent from "./Screens/DashBoardScreen/components/RequestMiniCompenent";
import { RequestsProvider, useRequests } from "./app/context/requestsContext";
import RequestsScreen from "./Screens/requestTab/RequestsScreen";
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

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
        <Tab.Screen name="Personal Settings" component={SettingsScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Personal DashBoard" component={DashBoardScreen} />
      <Tab.Screen name="Personal Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
function RequestsTab() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Feed Screen</Text>
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

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings!</Text>
    </View>
  );
}

function MyDrawer() {

  return (
    <SocketProvider>
      <RequestsProvider>
        <Drawer.Navigator >
          <Drawer.Screen name="Requests" component={RequestsTab} />
          <Drawer.Screen name="Dashboard" component={MyTabs} />
          <Drawer.Screen name="About" component={Article} />
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
      {/* <GestureHandlerRootView> */}
       <Layout />
    {/* </GestureHandlerRootView>  */}
        </RequestsProvider>
      </SocketProvider>
    </AuthProvider>
     

  );
}

export const Layout = () => {
  const { authState, onLogout } = userAuth();
 
  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <NavigationContainer>
      <Stack.Navigator>
        {authState?.authenticated ? (
          <Stack.Screen
            name="HomeScreen"
            component={MyDrawer}
            options={{
              headerRight: () => (
                // <SocketProvider>
                <View style={{ flex: 1, marginTop: 5, marginRight: 5 }}>
                  <Button onPress={onLogout} title={"Sign Out"} />
                  <RequestMiniCompenent />
                </View>
                // </SocketProvider>
              ),
            }}
          ></Stack.Screen>
        ) : (
          <Stack.Screen name="login" component={LogingScreen}></Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
