import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import NextShiftComp from "./components/nextShiftComp";
import UserCurrentSchedule from "./components/UserCurrentSchedule";
import UserNextScheduleComp from "./components/UserNextScheduleComp";
import UserStats from "./components/UserStats";
import axios from "axios";
import { API_URL } from "../../app/context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import { shift, scheduleData } from "../../App";
import { Platform } from "react-native";
import { mainStyle } from "../../utils/mainStyles";
import { useWebSocket } from "../../app/context/WebSocketContext";

export default function DashboardScreen() {
  const [userStats, setUserStats] = useState<any>(null);
  const [nextShift, setNextShift] = useState<shift>();
  const [nextSchedule, setNextSchedule] = useState<scheduleData>();
  const [userPrefChanges, setuserPrefChanges] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<scheduleData>();
  const { socket } = useWebSocket();
  const { OS } = Platform;
  const WindowWidth = Dimensions.get("window").width;

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
        console.log({ socket });
        setNextSchedule(updatedSched);
      }
    };

    const getCurrentSched = async () => {
      const sched = await axios.get(`${API_URL}schedule/getCurrentSchedule `);
      const scheduleData: scheduleData = { ...sched.data };
      console.log("schedule data 41 ", { scheduleData });
      setCurrentSchedule(scheduleData);
      // console.log({currentSchedule});
    };
    getCurrentSched();
    loadNextSchedule();
  }, []);
  useEffect(() => {
    console.log({ socket });
  }, [socket]);

  useEffect(() => {
    const loadNextShift = async () => {
      const nextShiftResponse = await axios.get(`${API_URL}shifts/nextShift`);
      console.log({ nextShiftResponse });
      if (nextShiftResponse.data) {
        setNextShift(nextShiftResponse.data);
      }
      console.log({ nextShift });
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
    // console.log(newSchedule, typeof newSchedule);
    // let shiftsArr = null;
    // if (typeof nextSchedule?.shifts === "object") {
    //   shiftsArr = Object.values(nextSchedule.shifts);
    // }
    // if (nextSchedule !== undefined) {
    //   const tmpSched: shift[] =
    //     shiftsArr !== null ? shiftsArr : [...nextSchedule.shifts];
    //   console.log({ newSchedule },{tmpSched});

    //   newSchedule.forEach((shift: shift) => {

    //     console.log({ shift });
    //     const oldShiftIndex = tmpSched?.findIndex(
    //       (tmpShift) => shift.id === tmpShift.id
    //     );
    //     console.log((shift &&  oldShiftIndex !== -1))
    //     if (shift &&  oldShiftIndex !== -1) {
    //       console.log(shift?.userPreference?.toString() !==
    //       tmpSched[oldShiftIndex].userPreference?.toString() , tmpSched[oldShiftIndex].userPreference , shift.userPreference);
    //       tmpSched[oldShiftIndex] = { ...shift };
    //     }
    //   });

    if (userPrefChanges) {
      console.log("hasChanges");
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
  console.log({ OS }, { WindowWidth });
  return (
    <ScrollView>
      <View style={{ flex: 3, justifyContent: "center", alignItems: "center" }}>
        <View style={styles.dashboardContainer}>
          <Text style={[mainStyle.h3, { textAlign: "center"}]}>
            {" "}
            My DashBoard Screen לוח הבקרה שלי
          </Text>
          {/* change the dirction for width  */}
          <View
            style={
              WindowWidth > 800
                ? styles.statsAndShiftWeb
                : styles.statsAndShiftBox
            }
          >
            <View style={{ flex: 1 ,maxHeight:350}}>
              <NextShiftComp nextShift={nextShift} />
            </View>
            <View style={{ flex:1,maxHeight:700}}>
              <UserStats nextScheduleId={currentSchedule?.data?.id} />
            </View>
          </View>
          <View style={{flex:1}}>
            <View  >
            <UserCurrentSchedule scheudle={currentSchedule} />
            </View>
          {nextSchedule && (
            <View style={{ flex: 1}}>
              <UserNextScheduleComp
                nextSchedule={nextSchedule}
                update={handleUpdateUserPref}
                saveToServer={handleSaveUsrPef}
                />
            </View>
          )}
          </View>
        </View>
      </View>
      {/* </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    flex:1,
    maxWidth: 1200,
    width: "94%",
    minWidth: 300,
    justifyContent: "center",
    flexDirection: "column",
  },
  statsAndShiftBox: {
     flex:1,
    flexDirection: "column",
  },
  statsAndShiftWeb: {
    flexDirection: "row",
    maxWidth: 1200,
    height:700,
    maxHeight:800,
    flex:1,
  },
});
