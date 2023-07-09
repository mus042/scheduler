import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import NextShiftComp from "./components/nextShiftComp";
import UserCurrentSchedule from "./components/UserCurrentSchedule";
import UserNextScheduleComp from "./components/UserNextScheduleComp";
import UserStats from "./components/UserStats";
import axios from "axios";
import { API_URL } from "../../app/context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import { shift ,scheduleData } from "../../App";
import RequestCompenent from "./components/RequestCompenent";



export default function DashboardScreen() {
  const [userStats, setUserStats] = useState<any>(null);
  const [nextShift, setNextShift] = useState<shift>();
  const [nextSchedule, setNextSchedule] = useState<scheduleData>();
  const [currentSchedule, setCurrentSchedule] = useState<scheduleData>();

  useEffect(() => {
    const loadNextSchedule = async () => {
      const nextScheduleResponse = await axios.get(`${API_URL}schedule/getNextSchedule`);
      if (nextScheduleResponse?.data) {
        console.log(nextScheduleResponse.data)
        
        const { data, shifts } = nextScheduleResponse.data;

        const updatedSched:scheduleData = {
          data:data,
          shifts:shifts,
        };
        console.log({updatedSched});
        setNextSchedule(updatedSched);
        console.log({nextSchedule})
      }

    };
   const getCurrentSched = async () => {
      const sched = await axios.get(`${API_URL}schedule/getCurrentSchedule `);
      const scheduleData:scheduleData = { ...sched.data };
      console.log('schedule data 41 ' , { scheduleData });
      setCurrentSchedule(scheduleData);
      // console.log({currentSchedule});
    };
    getCurrentSched();
    loadNextSchedule();
  }, []);
  

  useEffect(() => {
    const loadNextShift = async () => {
      const nextShiftResponse = await axios.get(`${API_URL}shifts/nextShift`);
      if (nextShiftResponse.data) {
        setNextShift(nextShiftResponse.data.nextShift);
      }
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
      await axios.post(`${API_URL}schedule/editeFuterSceduleForUser/`, scheduleShiftsToEdit);
      console.log('Request successful');
      return(true);
    } catch (error) {
      console.error('Request error:', error);
      return(error)
    }
  };

  const handleUpdateSchedule = async (newSchedule: any) => {
    let hasChanged = false;
    console.log(newSchedule , typeof newSchedule)
   let shiftsArr = null;
    if( typeof nextSchedule?.shifts === "object"){
       shiftsArr = Object.values(nextSchedule.shifts);
    }
    if (nextSchedule !== undefined) {const tmpSched:shift[] = shiftsArr !== null? shiftsArr :  [...nextSchedule.shifts]
    console.log({ newSchedule });

    newSchedule.forEach((shift: any) => {
      console.log({ shift });
      const oldShiftIndex = tmpSched?.findIndex((tmpShift) => shift.id === tmpShift.id);
      if (oldShiftIndex && oldShiftIndex >= 0) {
        if (tmpSched !== null && shift.userPreference.toString() !== tmpSched[oldShiftIndex].userPreference?.toString()) {
          hasChanged = true;
        }
        tmpSched[oldShiftIndex] = { ...shift };
      }
    });

    if (hasChanged) {
     try{  
      const result = await saveToServer(tmpSched);
     if(result === true){
      setNextSchedule({data:nextSchedule.data, shifts: tmpSched });
      console.log({ nextSchedule });
    } 
    else{
      console.log({result});

    }
     }catch(error){
      console.log({error});
     }
     
    

    }
  };
  };

  return (
    <View style={styles.dashboardContainer}>
      <Text>DashBoardScreen</Text>
      <RequestCompenent />
      {/* <UserStats /> */}
      {/* <NextShiftComp nextShift={nextShift} /> */}
      {/* <UserCurrentSchedule scheudle={currentSchedule} /> */}
      {/* <UserNextScheduleComp nextSchedule={nextSchedule} update={handleUpdateSchedule} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    maxWidth: '98%',
    width: '96%',
  },
});
