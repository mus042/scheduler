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
import WeeklyView  from "./WeeklyView";
import { dueDateSchedule, shift } from "../../../App";
import axios from "axios";
import { API_URL } from "../../../app/context/AuthContext";
import { scheduleData, scheduleInfo } from "../../../App";

const UserNextScheduleComp = ({
  nextSchedule,
  update,
}: {
  nextSchedule: scheduleData | undefined;
  update: any;
}) => {
  const [localNextSched, setLocalNextSched] = useState<
    scheduleInfo 
  >();
  const [scheduleShifts, setScheduleShifts] = useState<shift[]>();
  const [loading, setLoading] = useState(true);
  const[daysToSubmit,setDaysToSubmit] = useState<number>();

  
  useEffect(() => {
    console.log({ nextSchedule });
    if (nextSchedule && nextSchedule.data !== undefined) {
      console.log("useEffect 16 ", { nextSchedule });
      const days = dueDateSchedule();
        setDaysToSubmit(days)
      setLocalNextSched(nextSchedule.data);
      if (typeof nextSchedule.shifts === "object") {
        console.log("object to arr ")
        const shiftsArr = Object.values(nextSchedule.shifts);
        setScheduleShifts(shiftsArr);
      } else {
        setScheduleShifts(nextSchedule.shifts);
      }
      
      setLoading(false); // Set loading to false when data is fetched
    }
  }, [nextSchedule]);

  useEffect(() => {
   console.log('userlocalNextSched:', localNextSched, scheduleShifts);
  }, [localNextSched]);

  const handleUpdate = (arr) => {
    // Handle the update logic
  };
  const handelSetWeek = (schedule:scheduleData | undefined)=>{
    if(schedule){
      console.log("set week");
      console.log(schedule.shifts[0].userPreference);
if(nextSchedule){
     const newSched:shift[] =  nextSchedule.shifts.map(scheduleToMap => {
      return {
        ...scheduleToMap,
        userPreference: '1',
      };})
      console.log(newSched[0].userPreference);
    
    setScheduleShifts(newSched);
    setLocalNextSched(schedule.data);  
    update(newSched);
  }
}
}
  if (loading) {
    console.log("loading");
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    ); // Render a loading state while data is being fetched
  }

  return (
    <View style={styles.container}>
      <Text>UserNextScheduleComp</Text>
      <Text>Time Until Schedule id Duo:  </Text>
      <Text>{daysToSubmit}</Text>
      {localNextSched && (
        <View style={styles.scheduleContainer}>
          {nextSchedule !== null && (
            <>
            {nextSchedule?.data?.sceduleType === 'userSchedule'}{
              <Pressable onPress={()=>handelSetWeek(nextSchedule)} >
                <Text>
                  set all week 
                </Text>
              </Pressable>
            }
            <WeeklyView
              scheduleInfo={nextSchedule?.data}
              shifts={scheduleShifts}
              update={update}
            />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
