import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import axios from "axios";
import { mainStyle } from "../../../utils/mainStyles";

type userStats = {
  id?: number;
  scheduleId?: number;
  userId: number;
  morningShifts?: number;
  noonShift?: number;
  nightShifts?: number;
  overTimerStep1?: number;
  overTimeStep2?: number;
  restDayHours?: number;
};

const UserStats = ({nextScheduleId}:{ nextScheduleId: number | undefined }) => {
  const [userAllTimesStats, setuserAllTimesStats] = useState<userStats>();
  const [usernextschedulStats, setusernextschedulStats] = useState<userStats>();
  const WindowWidth = Dimensions.get("window").width;

  const { authState } = userAuth();
  useEffect(() => {
    if (authState?.authenticated) {
      console.log("get stats ");
      const getAllTimesStats = async () => {
        //get stats async
        const result = await axios.get(
          `${API_URL}user-statistics/getAllUserShiftStats`
        );
        console.log("result  = ", { result });
        setuserAllTimesStats(result.data);
      };
      const getCurrentScheduleStats = async () => {
        if (nextScheduleId) {
          console.log({nextScheduleId})
          const result = await axios.get(
            `${API_URL}user-statistics/getUserShiftStatsForSchedule`,
            {
              params: {
                scheduleId: nextScheduleId,
              },
            }
          );
          setusernextschedulStats(result.data);
        }
      };
      getAllTimesStats();
      getCurrentScheduleStats();
    }
  }, [authState?.authenticated,nextScheduleId]);

  return (
    <View style={{flex:1 , flexDirection:'row'}}>
      <View style={{flex:1 , borderBottomColor:'black', borderWidth:10, }}>

  
      <View style={mainStyle.centeredView}>
        <View style={[mainStyle.modalView,styles.statsBox]}>
          <View>
            <Text style={mainStyle.h4}> My all times Statistics: </Text>
          </View>
          <Text style={mainStyle.h5}>
            Morning shifts: {userAllTimesStats?.morningShifts}{" "}
          </Text>
          <Text style={mainStyle.h5}>
            Noon shifts: {userAllTimesStats?.noonShift}
          </Text>
          <Text style={mainStyle.h5}>
            Night shifts: {userAllTimesStats?.nightShifts}
          </Text>
          <Text style={mainStyle.h5}>
            Over Time: {userAllTimesStats?.overTimerStep1}
          </Text>
          <Text style={mainStyle.h5}>
            Over Time 2: {userAllTimesStats?.overTimeStep2}
          </Text>
          <Text style={mainStyle.h5}>
            Rest Day Hours: {userAllTimesStats?.restDayHours}
          </Text>
        </View>
      </View>   
      <View style={mainStyle.centeredView}>
        <View style={[mainStyle.modalView,styles.statsBox]}>
          <View>
            <Text style={mainStyle.h4}>Current schedule Statistics:</Text>
          </View>
          <Text style={mainStyle.h5}>
            Morning shifts: {usernextschedulStats?.morningShifts}{" "}
          </Text>
          <Text style={mainStyle.h5}>
            Noon shifts: {usernextschedulStats?.noonShift}
          </Text>
          <Text style={mainStyle.h5}>
            Night shifts: {usernextschedulStats?.nightShifts}
          </Text>
          <Text style={mainStyle.h5}>
            Over Time: {usernextschedulStats?.overTimerStep1}
          </Text>
          <Text style={mainStyle.h5}>
            Over Time 2: {usernextschedulStats?.overTimeStep2}
          </Text>
          <Text style={mainStyle.h5}>
            Rest Day Hours: {usernextschedulStats?.restDayHours}
          </Text>
        </View>  
     
      </View>
     </View>
   {  WindowWidth > 800 &&  <View style={{flex:1}}>
    <Text> This will be a graph </Text>
      </View>}
    </View>
  );
};

export default UserStats;

const styles = StyleSheet.create({
  statsBox:{
    flex:1,
    maxWidth:260,
    maxHeight:300,
    justifyContent:'flex-start',
    alignItems:'flex-start'
  }
});
