import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  PanResponder,
  Pressable,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import ShiftComponent from "./ShiftComponent";
import WeeklyView from "./WeeklyView";
import { dueDateSchedule, shift } from "../../../App";
import axios from "axios";
import { API_URL } from "../../../app/context/AuthContext";
import { scheduleData, scheduleInfo } from "../../../App";
import { mainStyle } from "../../../utils/mainStyles";
import { normalizeScheduleDates } from "../../../utils/utils";

const UserNextScheduleComp = ({
  nextSchedule,
  update,
  saveToServer,
}: {
  nextSchedule: scheduleData | undefined;
  update: any;
  saveToServer: any,
}) => {
  const [localNextSched, setLocalNextSched] = useState<scheduleInfo>();
  const [scheduleShifts, setScheduleShifts] = useState<shift[]>();
  const [loading, setLoading] = useState(true);
  const [daysToSubmit, setDaysToSubmit] = useState<number>();



  useEffect(() => {
    console.log({ nextSchedule });
    if (nextSchedule && nextSchedule.data !== undefined) {
      console.log("useEffect 16 ", { nextSchedule });
      const days = dueDateSchedule();
      setDaysToSubmit(days);
      setLocalNextSched(nextSchedule.data);
      if (typeof nextSchedule.shifts === "object") {
        console.log("object to arr ");
        const shiftsArr = Object.values(nextSchedule.shifts);
        setScheduleShifts(shiftsArr);
      } else {
        setScheduleShifts(nextSchedule.shifts);
      }

      setLoading(false); // Set loading to false when data is fetched
    }
  }, [nextSchedule]);

  useEffect(() => {
    console.log("userlocalNextSched:", localNextSched, scheduleShifts);
  }, [localNextSched]);

  const handleUpdate = (newShift:shift) => {
    // Handle the update logic
    console.log("update user pref nextsched comp")
    if(scheduleShifts){
     //find shift in arr and set state 
      const shiftIndex = scheduleShifts.findIndex((shift)=>shift.id === newShift.id);
      const newSchedule = [...scheduleShifts]
      if( shiftIndex !== -1) {
          newSchedule[shiftIndex].userPreference = newShift.userPreference;
          console.log("updates", {shiftIndex})
          update(newSchedule);
          setScheduleShifts(newSchedule);
      }
  };
}
  const handelSave = () =>{
    if(scheduleShifts){
    saveToServer(scheduleShifts)
  }}
  const handelSetWeek = (schedule: scheduleData | undefined) => {
    if (schedule) {
      console.log("set week");
      console.log(schedule.shifts[0].userPreference);
      if (nextSchedule) {
        const newSched: shift[] = nextSchedule.shifts.map((scheduleToMap) => {
          console.log({scheduleToMap});
          return {
            ...scheduleToMap,
            userPreference: "1",
          };
        });
        console.log(newSched[0].userPreference);

        // update(newSched);
        setScheduleShifts(newSched);
        // setLocalNextSched(schedule.data);
      }
    }
  };
  if (loading) {
    console.log("loading");
    return (
      <View>
        <Text style={mainStyle.h3}>No Schedule to show </Text>
      </View>
    ); // Render a loading state while data is being fetched
  }
 
  return (
    <View style={styles.container}>
      {localNextSched && (
        <View style={styles.scheduleContainer}>
          {nextSchedule !== null && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{flex:4}}>
                <Text style={[mainStyle.h4, { flex: 2 }]}>
                  My Prefrences for next {normalizeScheduleDates(nextSchedule)}:{" "}
                </Text>
                </View>
                <View style={{flex:1, justifyContent: "flex-end",}}>
                <Text style={[mainStyle.h5, { flex: 1 }]}>
                  Duo in: {daysToSubmit}
                </Text>
                
              </View>
              </View>
             
              <View>
                <WeeklyView
                  scheduleInfo={nextSchedule?.data}
                  shifts={scheduleShifts}
                  update={handleUpdate}
                />
              {nextSchedule?.data?.sceduleType === "userSchedule"}
              {
                <View
                  style={{ flex: 1, maxWidth: 100, justifyContent: "center" }}
                >
                  <Pressable
                    style={[mainStyle.button, mainStyle.buttonOpen]}
                    onPress={() => handelSetWeek(nextSchedule)}
                  >
                    <Text style={mainStyle.text}>set all week</Text>
                  </Pressable>
                  <Pressable
                    style={[mainStyle.button, mainStyle.buttonOpen]}
                    onPress={() => handelSave()}
                  >
                    <Text style={mainStyle.text}>Save</Text>
                  </Pressable>
                </View>
              }
              </View>

            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    borderWidth: 1,
    borderColor: "red",
    maxWidth: "100%",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 2,
    marginVertical: 1,
    marginHorizontal: 1,
  },
  title: {
    fontSize: 12,
  },
  scheduleContainer: {
    maxWidth: "99%",
  },
});

export default UserNextScheduleComp;
