import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { scheduleInfo } from "../../../App";
import { scheduleData } from "../../../App";
import { shift } from "../../../App";
import WeeklyView from "./WeeklyView";
import { mainStyle } from "../../../utils/mainStyles";
import { normalizeScheduleDates } from "../../../utils/utils";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import SystemNextSchedule from "../../AdminPanelScreen.tsx/SystemNextSchedule";

const UserCurrentSchedule = ({
  scheudle,
}: {
  scheudle: scheduleData | undefined;
}) => {
  const [scheduleData, setScheduleData] = useState<scheduleInfo>();
  const [scheduleShifts, setScheduleShifts] = useState<shift[] | undefined>(
    undefined
  );
  let schedStart: Date | undefined;

  useEffect(() => {
if(scheudle){
    setScheduleData(scheudle?.data);
    console.log(typeof scheudle.shifts , scheudle, "current schedule:: ");
      if (typeof scheudle?.shifts === "object") {
        
        const shiftsArr = Object.values(scheudle.shifts);
        setScheduleShifts(shiftsArr);
        
      } else {
        setScheduleShifts(scheudle?.shifts);
      }
    }
    console.log("sched", scheudle);
  }, [scheudle]);

  useEffect(() => {
    schedStart = scheduleData?.scedualStart;
    //if shifts are object -> turn to array

    console.log("setsched", scheduleData, scheduleShifts);
    console.log({ schedStart });
  }, [scheduleData]);
  type ItemProps = { date: string; userPreference: string };

  const Item = ({ date, userPreference }: ItemProps) => {
    const shiftDay: Date = new Date(date);

    return (
      <View style={styles.item}>
        <Text style={styles.title}>{shiftDay.getDay()}</Text>
        <Text style={styles.title}>{shiftDay.getHours()}</Text>
        <Text style={styles.title}>{userPreference} </Text>
      </View>
    );
  };
  // console.log({ schedule });

  return (
    <View style={styles.container}>
      <View style={{flex:1}}>
      <Text style={mainStyle.h4}>THIS WEEK: {normalizeScheduleDates(scheudle)}</Text>
      </View>
      {scheduleData && (
        <View style={{flex:1}}>
          
          <Text>{schedStart?.getTime()}</Text>
        </View>
      )}
      {scheduleData && (
        <View >
          {/* <Text>{schedule.scheduleShifts}</Text> */}
          {scheduleShifts && (
            <WeeklyView
              scheduleInfo={scheduleData}
              shifts={scheduleShifts}
              update={null}
              type={'systemSchedule'}
            />
            
          )}
    
        </View>
      )}
      {!scheduleData && (
        <View style={{flex:1}}>
          <>
          <ActivityIndicator animating={true} color={MD2Colors.red800} />
          </>
        </View>
      )}
    </View>
  );
};

export default UserCurrentSchedule;

const styles = StyleSheet.create({
  container: {
    flex:1,
    borderWidth: 1,
    borderColor: "red",
    marginTop:5,
    minHeight:240,
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
});
