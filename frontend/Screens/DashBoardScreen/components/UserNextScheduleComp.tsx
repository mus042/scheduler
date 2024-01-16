import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  
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
import { Button, IconButton } from "react-native-paper";
import { Text  } from "react-native-paper";
import { useSnackbarContext } from "../../SnackbarProvider";
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
  const [ weekPrefSelctor,setWeekPrefSelctor] = useState<string>();

 
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

  const handleUpdate = (newShift:shift | shift[]) => {
    // Update shift or shift arr 
    if(scheduleShifts){
  
    console.log("update user pref nextsched comp" ,{newShift})
    
     //find shift in arr and set state 
     const updateSingleShift = (toUpdate:shift)=>{
      const shiftIndex = scheduleShifts.findIndex((shift)=>shift.id === toUpdate.id);
      const newSchedule = [...scheduleShifts]
      console.log({shiftIndex},newSchedule)
      if( shiftIndex !== -1) {
          newSchedule[shiftIndex].userPreference = toUpdate.userPreference;
          console.log("updates", {shiftIndex})
          update(newSchedule);
          setScheduleShifts(newSchedule);
      }
     }

       //if shift arr 
    if(Array.isArray(newShift)){
      console.log("arr to update ")
      for(const shiftToUpdate of newShift){
        updateSingleShift(shiftToUpdate);
        console.log({shiftToUpdate})
      }
      
    }else{
        updateSingleShift(newShift);
      }
  };
}
  const handelSave = () =>{
    console.log({scheduleShifts})
    if(scheduleShifts){
    const result:boolean = saveToServer(scheduleShifts);
      }}
  // const handelSetWeek = (schedule: scheduleData | undefined) => {
  //   if (schedule) {
  //     console.log("set week");
  //     console.log(schedule.shifts[0].userPreference);
  //     if (nextSchedule) {
  //       const newSched: shift[] = nextSchedule.shifts.map((scheduleToMap) => {
  //         console.log({scheduleToMap});
  //         return {
  //           ...scheduleToMap,
  //           userPreference: "1",
  //         };
  //       });
  //       console.log(newSched[0].userPreference);

  //       // update(newSched);
  //       setScheduleShifts(newSched);
  //       // setLocalNextSched(schedule.data);
  //     }
  //   }
  // };

  const handelSetWeekPref = (pref:string)=>{
    //Get pref and map schedule to contain the pref
    if(pref && nextSchedule){
      console.log({pref},"set week ")
      const newSched: shift[] = nextSchedule.shifts.map((scheduleToMap) => {
                console.log({scheduleToMap});
                return {
                  ...scheduleToMap,
                  userPreference: pref,
                }
     });
                setScheduleShifts(newSched);
                update(newSched);
    
  }
}

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
                  flex:1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{flex:3 ,width:250}}>
                <Text variant="headlineSmall" >
                  My Prefrences for next schedule:
                </Text>
                <Text variant="bodyMedium">
                {normalizeScheduleDates(nextSchedule)}
                </Text>
                </View>
                <View style={{flex:1, justifyContent: "flex-end",}}>
                <Text style={[mainStyle.h5, { flex: 1 }]}>
                  Duo in: {daysToSubmit}
                </Text>
                
              </View>
              </View>
             
              <View style={{flex:9}}> 
                <View style={{flex:6}}>
                <WeeklyView
                  scheduleInfo={nextSchedule?.data}
                  shifts={scheduleShifts}
                  update={handleUpdate}
                />
                </View>               
                 <View style={{flex:1,margin:3,}}>
                 <Text variant='headlineSmall' >Set all Week</Text>
                 <View style={{flex:1 , flexDirection:'row',width:200, alignContent:'center',justifyContent:'center', alignItems:'center',alignSelf:'center' }}>
            <IconButton icon="checkbox-marked-circle-plus-outline" size={18} mode="contained" onPress={() =>setWeekPrefSelctor('1')} selected={weekPrefSelctor ==='1'} />
 
  <IconButton icon="alert-circle-check-outline" mode="contained" onPress={() => setWeekPrefSelctor('2')} size={18} selected={weekPrefSelctor ==='2'} />
 
  <IconButton icon="close-circle-outline" mode="contained" onPress={() => setWeekPrefSelctor('3')} size={18} selected={weekPrefSelctor ==='3'}/>
 
  <Button onPress={()=> weekPrefSelctor && handelSetWeekPref(weekPrefSelctor)} mode='contained' compact={true}>
                    Set all shifts
                  </Button>
  
  
  </View>
</View>
              {nextSchedule?.data?.sceduleType === "userSchedule"
              &&(
                <View
                  style={{ flex: 1, justifyContent: "center" ,flexDirection:'row' ,alignSelf:'center', margin:1}}
                >
  
<View style={{flex:1,margin:2,marginTop:5}}>
                  <Button onPress={()=>handelSave()} mode='contained' compact={true}>
                    Save Changes
                  </Button>
                  </View>
                </View>
              )}
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
    flexDirection:"column",
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
