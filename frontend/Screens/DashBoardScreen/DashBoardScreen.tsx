import { StyleSheet, View, Dimensions, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import NextShiftComp from "./components/nextShiftComp";
import UserCurrentSchedule from "./components/UserCurrentSchedule";
import UserNextScheduleComp from "./components/UserNextScheduleComp";
import UserStats from "./components/UserStats";
import axios from "axios";
import { API_URL, userAuth } from "../../app/context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import { shift, scheduleData } from "../../App";
import { Platform } from "react-native";
import { mainStyle } from "../../utils/mainStyles";
// import { useWebSocket } from "../../app/context/WebSocketContext";
import { Text, useTheme } from "react-native-paper";
import { useSnackbarContext } from "../SnackbarProvider";
export default function DashboardScreen() {
  const [userStats, setUserStats] = useState<any>(null);
  const [nextShift, setNextShift] = useState<shift>();
  const [nextSchedule, setNextSchedule] = useState<scheduleData>();
  const [userPrefChanges, setuserPrefChanges] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<scheduleData>();
  const [nextSystemSchedule, setNextSystemSchedule] = useState<scheduleData>();

  const { authState } = userAuth();
  const { addSnackBarToQueue } = useSnackbarContext();

  const { OS } = Platform;
  const WindowWidth = Dimensions.get("window").width;
  const theme = useTheme();
  useEffect(() => {
    const loadNextSchedule = async () => {
      const nextScheduleResponse = await axios.get(
        `${API_URL}schedule/getNextSchedule`
      );
      if (nextScheduleResponse?.data) {
        console.log(nextScheduleResponse.data);

        const { data, shifts } = nextScheduleResponse.data;

        const updatedSched: scheduleData = {
          data: data,
          shifts: shifts,
        };

        setNextSchedule(updatedSched);
      }
    };
    const getCurrentSched = async () => {
      try {
        const sched = await axios.get(`${API_URL}schedule/getCurrentSchedule `);
        const scheduleData: scheduleData = { ...sched.data };
        console.log("schedule data 41 ", { scheduleData });
        setCurrentSchedule(scheduleData);
      } catch (error) {
        console.log({ error });
      }
    };
    const loadNextSysSchedule = async () => {
      const sched = await axios.get(
        `${API_URL}schedule/getNextSystemSchedule `
      );
      const scheduleData: scheduleData = { ...sched.data };
      console.log("schedule data 41 ", { scheduleData });
      setNextSystemSchedule(scheduleData);
      // console.log({currentSchedule});
    };

    getCurrentSched();
    loadNextSchedule();
    loadNextSysSchedule();
  }, []);

  useEffect(() => {
    const loadNextShift = async () => {
      const nextShiftResponse = await axios.get(`${API_URL}shifts/nextShift`);
      console.log({ nextShiftResponse });
      if (nextShiftResponse.data) {
        setNextShift(nextShiftResponse.data);
      }
      // console.log({ nextShift });
    };

    loadNextShift();
  }, []);

  const saveToServer = async (schedule: any) => {
    console.log({ schedule });
    const scheduleShiftsToEdit = {
      scheduleId: schedule[0].scheduleId,
      shiftsEdit: schedule,
    };

    try {
      await axios.post(
        `${API_URL}schedule/editeFuterSceduleForUser/`,
        scheduleShiftsToEdit
      );
      console.log("Request successful");
      addSnackBarToQueue({ snackbarMessage: "Saved Changes " });

      return true;
    } catch (error) {
      console.error("Request error:", error);
      return error;
    }
  };
  const handleUpdateUserPref = async (updatedScheduld: shift[]) => {
    if (updatedScheduld && nextSchedule) {
      console.log("update dashbaord arr ");
      const tmpSchedul: scheduleData = nextSchedule;
      tmpSchedul.shifts = updatedScheduld;
      setuserPrefChanges(true);
      setNextSchedule(tmpSchedul);
    }
  };
  const handleSaveUsrPef = async (newSchedule: any) => {
    if (userPrefChanges) {
      //call server only in case of changes
      try {
        if (nextSchedule) {
          const result = await saveToServer(nextSchedule.shifts);
          if (result === true) {
            // setNextSchedule({ data: nextSchedule.data, shifts: tmpSched });
            console.log({ nextSchedule });
          } else {
            console.log({ result });
          }
        }
      } catch (error) {
        console.log({ error });
      }
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        <Text style={[mainStyle.h3, { textAlign: "center" }]}>
          My DashBoard Screen לוח הבקרה שלי
        </Text>
      </View>
      <View
        style={
          WindowWidth > 800 ? styles.statsAndShiftWeb : styles.statsAndShiftBox
        }
      >
        {nextShift && (
          <View style={{ flex: 1 }}>
            <NextShiftComp nextShift={nextShift} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <UserStats nextScheduleId={currentSchedule?.data?.id} />
        </View>
      </View>
      <View style={{ flex:9, }}>
        <UserCurrentSchedule scheudle={nextSystemSchedule} />
      </View>
      <View style={{ flex: 9,minHeight:700,}}>
        <UserCurrentSchedule scheudle={currentSchedule} />
      </View>
      {nextSchedule && (
        <View style={{ flex: 8,minHeight:500}}>
          <UserNextScheduleComp
            nextSchedule={nextSchedule}
            update={handleUpdateUserPref}
            saveToServer={handleSaveUsrPef}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 4,
    maxWidth: 1200,
    width: "94%",
    minWidth: 300,
    // justifyContent: "center",
    flexDirection: "column",
  },
  statsAndShiftBox: {
    flex: 8,
    flexDirection: "column",
  },
  statsAndShiftWeb: {
    flexDirection: "row",
    maxWidth: 1200,
    flex: 8,
    alignContent: "flex-start",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    justifyContent: "space-between",
  },
});
