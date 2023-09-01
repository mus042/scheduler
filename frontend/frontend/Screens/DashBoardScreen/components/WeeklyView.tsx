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
}: {
  shifts: shift[] | undefined;
  update: any;
  scheduleInfo: scheduleInfo | undefined;
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
    console.log("localShifts:", localShifts);
  }, [localShifts]);

  const hadelUpdate = (arr) => {
    console.log("handel update ")
    update(arr);
  };

  function compareShifts(a, b) {
    const startHourA = new Date(a.shifttStartHour);
    const startHourB = new Date(b.shifttStartHour);
    startHourA.setHours(startHourA.getHours() - 3);
    startHourB.setHours(startHourB.getHours() - 3);

    if (startHourA < startHourB) {
      return -1;
    } else if (startHourA > startHourB) {
      return 1;
    }
    return 0;
  }

  const handelModalVisible = () => {
    setEditShiftModal(!editShiftModal);
  };

  const createWeeklyView = (shiftsData: shift[]) => {
    // console.log({ shiftsData }, Object.keys(shiftsData).length > 0);
    if (Object.keys(shiftsData).length > 0) {
      const weekArr: shift[][] = [];
      shiftsData.sort(compareShifts);
      console.log({ shiftsData });

      for (let i = 0; i < shiftsData.length-1; i += 1) {
        const day = new Date(shiftsData[i].shifttStartHour);
        const dayShifts: shift[] = [];
        let dateToChek = new Date(shiftsData[i].shifttStartHour);
        // console.log(dateToChek.getDay() === day.getDay(), dateToChek,day)
        
        while (dateToChek.getDay() === day.getDay() && i < shiftsData.length) {
          // console.log('while loop ',{i},dateToChek.getDay() === day.getDay(), dateToChek,day.getDay())
          dayShifts.push({ ...shiftsData[i] });
          i += 1;
          if(i<shiftsData.length){
          dateToChek = new Date(shiftsData[i].shifttStartHour);
          if(dateToChek.getHours() === 1){   
            dateToChek = new Date (dateToChek.getTime() -1 );
            dateToChek.setHours(dateToChek.getHours()-3); 
          }
          // console.log(dateToChek,shiftsData[i].shifttStartHour);
          
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
            viewType={scheduleInfo?.sceduleType}
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
    backgroundColor: "white",
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
