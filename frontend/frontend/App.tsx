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
import { ScrollView } from "react-native-gesture-handler";

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

export const dueDateSchedule = () => {
  const today = new Date();
  return (2 + 7 - today.getDay()) % 7;
};

export interface scheduleData {
  data: scheduleInfo ;
  shifts: shift[] ;
}

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

  firstName: String | null;
  lastName: String | null;
};

export type shift = {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  shiftDate: Date;
  shiftType: number;
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
   
  if(user?.userRole === 'admin'){
    return (
      <Tab.Navigator>
     <Tab.Screen name="Admin Panel" component={AdminPanel} />
     <Tab.Screen name="Personal DashBoard" component={DashBoardScreen} />
     <Tab.Screen name="Personal Settings" component={SettingsScreen} />
    </Tab.Navigator>
    )
  }
  
  
  return (
    <Tab.Navigator>
     <Tab.Screen name="Personal DashBoard" component={DashBoardScreen} />
     <Tab.Screen name="Personal Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
function ScheduleDashboard() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Feed Screen</Text>
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

function HomeScreen({}) {
  const { authState }: any = userAuth();
  const user: user | null = authState?.user;
  console.log(user);
  return (
    <ScrollView>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {user && <Text>Welcome Home {user.firstName} </Text>}
        {user?.userRole === "admin" ? (
          <>
            <AdminPanel />{" "}
          </>
        ) : (
          <DashBoardScreen />
        )}
      </View>
    </ScrollView>
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
    <Drawer.Navigator useLegacyImplementation>
      <Drawer.Screen name="Tabs" component={MyTabs} />
      <Drawer.Screen name="Feed" component={ScheduleDashboard} />
      <Drawer.Screen name="Article" component={Article} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

export const Layout = () => {
  const { authState, onLogout } = userAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState?.authenticated ? (
          <Stack.Screen
            name="HomeScreen"
            component={MyDrawer}
            options={{
              headerRight: () => (
                <Button onPress={onLogout} title={"Sign Out"} />
              ),
            }}
          ></Stack.Screen>
        ) : (
          <Stack.Screen name="login" component={LogingScreen}></Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
