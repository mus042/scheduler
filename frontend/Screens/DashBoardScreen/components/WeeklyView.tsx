import { PanResponder, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import ShiftComponent from "./ShiftComponent";
import DayViewComp from "./DayViewComp";
import { scheduleData, scheduleInfo } from "../../../App";
import { shift } from "../../../App";
import { mainStyle } from "../../../utils/mainStyles";

const WeeklyView = ({
  shifts,
  update,
  scheduleInfo,
  type,
}: {
  shifts: shift[] | undefined;
  update: any;
  scheduleInfo: scheduleInfo | undefined;
  type: "systemSchedule" | "user" | undefined;
}) => {
  

  const [editShiftModal, setEditShiftModal] = useState(false);
  const [localShifts, setlocalShifts] = useState<shift[][]>();

  useEffect(() => {
    if (shifts) {
      const arr: shift[][] | undefined = createWeeklyView(shifts);
      arr && setlocalShifts(arr);
    }
  }, [shifts]);
  useEffect(() => {
    console.log("localShifts:", localShifts,{type});
  }, [localShifts]);

  const hadelUpdate = (arr) => {
    console.log("handel update ")
    update(arr);
  };

  function compareShifts(a, b) {

    const startHourA = new Date(a.shiftStartHour);
    const startHourB = new Date(b.shiftStartHour);
    // startHourA.setHours(startHourA.getUTCHours());
    // startHourB.setHours(startHourB.getUTCHours());
    console.log({a},{b},{startHourA},{startHourB})
    if (startHourA < startHourB) {
      return -1;
    } else if (startHourA > startHourB) {
      return 1;
    }
    return 0;
  }
 function comperShiftById (shiftA, shiftB){
  return shiftA.id < shiftB.id ? -1 :1;
 }
  const handelModalVisible = () => {
    setEditShiftModal(!editShiftModal);
  };

  const createWeeklyView = (shiftsData: shift[]) => {
    console.log({ shiftsData },"type of weekly view ",{type}, Object.keys(shiftsData).length > 0);
    if (Object.keys(shiftsData).length > 0) {
      const weekArr: shift[][] = [];
     type ==='systemSchedule'?shiftsData.sort(compareShifts): shiftsData.sort(compareShifts);
      console.log('sorted shifts data ',{ shiftsData });

      for (let i = 0; i < shiftsData.length; i += 1) {
        // const utcDate = new Date(shiftsData[i].shiftStartHour);
        const dateOfShift:string = shiftsData[i].shiftStartHour?.slice(0,10);
        // console.log({ utcDate },{dateOfShift},{i});
   
        console.log("shifts data at i ",{shiftsData},shiftsData[i].shiftStartHour,"type of starthour : ", typeof shiftsData[i].shiftStartHour);
        const dayShifts: shift[] = [];
        let dateToCheck =shiftsData[i].shiftStartHour?.slice(0,10);//set the date from string
        console.log("date to check ",{dateToCheck})
        while (dateToCheck === dateOfShift && i < shiftsData.length) {
        
          dayShifts.push({ ...shiftsData[i] });
          i += 1;
          // console.log('while loop ',{i},dateToCheck === dateOfShift, dateToCheck,utcDate.getDay())
          if(i<shiftsData.length-1){
            console.log({dateToCheck},);
            dateToCheck = shiftsData[i].shiftStartHour?.slice(0,10);
          // if(dateToCheck.getUTCHours() === 1){   
          //   dateToCheck = new Date (dateToCheck.getTime() -1 );
          //   dateToCheck.setHours(dateToCheck.getHours()); 
          // }
          console.log({dateToCheck},shiftsData[i].shiftStartHour);
          
        }
      }
        // console.log({ dayShifts }, { day });
        weekArr.push(dayShifts);
        i-=1;
    }
      console.log(weekArr);
      return weekArr;
    }
  };

  const editShift = () => {
    console.log("editShift");
    setEditShiftModal(!editShiftModal);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: () => false,
  });

  return (
    <View {...panResponder.panHandlers}>
    
      <FlatList
        horizontal={true}
        data={localShifts}
        renderItem={(shifts) => (
          
          <DayViewComp
            shifts={shifts}
            isEdit={true}
            update={hadelUpdate}
            viewType={type}
          />
          
        )}
      />
    </View>
  );
};

export default WeeklyView;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  text: {
    fontSize: 20,
  },
  container: {
    maxWidth: 50,
    borderWidth: 1,
    borderColor: "green",
    fontSize: 5,
  },
});
