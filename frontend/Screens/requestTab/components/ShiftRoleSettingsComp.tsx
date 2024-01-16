import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import DayPicker from "../../../app/components/DayPicker";
import { SegmentedButtons, Surface, useTheme } from "react-native-paper";
import ShiftComponent from "../../DashBoardScreen/components/ShiftComponent";
import ShiftEditItemView from "../../../app/components/ShiftEditItemView";
import SettingsShiftComp from "../../../app/components/SettingsShiftComp";
import { shiftTemp } from "../../SettingsScreen";
import { shift } from "../../../App";
import CustomSegmentedButtons from "../../../app/components/CustomSegmentedButton";
import { mainStyle } from "../../../utils/mainStyles";
import { ScrollView } from "react-native-gesture-handler";

const ShiftRoleSettingsComp = ({ schedule, range, updatedSchedule }: any) => {
  //segmented btns state
  const [selcetedDayBtn, setSelcetedDayBtn] = useState<string>();
  const [dayBtns, setDayBtns] =
    useState<
      { value: any; label: string; showSelectedCheck: boolean }[]
    >();

  const [selctedShift, setSelectedShift] = useState<shiftTemp>();
  const [selctedShifts, setSelectedShifts] = useState<shiftTemp[]>([]);
  const [selctedDays, setSelectedDays] = useState([]);

  const [daysRange, setDaysRange] = useState();

  const onDaySelect = (newDay) => {
    console.log("on Daye Selcet:", { schedule }, { newDay }, { selcetedDayBtn });
    setSelectedDays(newDay);
    if (Array.isArray(newDay)) {
      const shifts: shiftTemp[] = [];
      newDay.forEach((day) => {
        const tmpShift = schedule.filter(
          (item: shiftTemp) => item.day?.value === Number(day.value)
        );
        console.log({ tmpShift });
        shifts.push(...tmpShift);
      });
      console.log("shifts", { shifts });
      const tmpDayShifts = shifts.filter(
        (item: shiftTemp) => item.day?.value === shifts[0].day?.value
      );
      const tmpDayBtns =  tmpDayShifts.map((shift) => ({
        value: shift.id.toString(),
        label: shift.name,
        showSelectedCheck: true,
      })
      );
      setDayBtns(tmpDayBtns)
      if (tmpDayBtns) {
        console.log(
          { dayBtns },
          { shifts },
        
        {selctedShift}  );
        //setShifts
        const tmpShifts = shifts.filter(
          (shift) => shift.startHour.hours === selctedShift?.startHour?.hours
        );
        console.log(tmpShifts);
        setSelectedShifts(tmpShifts);
      }
      console.log({dayBtns})
    } else {
      console.log("else")
      const shifts = schedule.filter(
        (item: shiftTemp) => item.day?.value === Number(newDay.value)
      );
      console.log({ shifts });
     
      setSelcetedDayBtn(
        shifts.map((shift) => ({
          value: shift.id.toString(),
          label: shift.name,
          showSelectedCheck: true,
        }))
      );
      console.log({selcetedDayBtn})
      const tmpbtns = shifts.map((shift:shiftTemp)=>shift.day?.value);
      console.log({tmpbtns})
      
    }
  };

  // useEffect(() => {
  //   console.log("shifts settings comp :",
  //     {btnsValues},
  //     { dayShifts },
  //     { schedule },
  //     { selctedShift },
  //     { selctedShifts }
  //   );
  // }, [dayShifts]);
  // useEffect(() => {
  //   console.log({ dayShifts }, { schedule }, { value });
  //   value && value.length > 1 && onDaySelect({ ...value });
  //   if (selctedShift) {
  //     console.log({ selctedShift });
  //   }
  // }, [schedule]);

  useEffect(() => {
    console.log(
      "selected shift useEffect",
      { selctedShifts },
      { selctedShift },
      { schedule },
    );
    //  if(selctedShift){
    //   onSelect(selctedShift)
    // }
  }, [selctedShifts]);
 
  const theme = useTheme();

  const styles = StyleSheet.create({
    surface: {
      padding: 10,
     minHeight:350,
   
    
    borderRadius:10,
    borderColor:theme.colors.background,
      margin:10,
      marginBottom:20, 
      
    },
  });



  const updateShifts = (shiftToUpdate: shiftTemp) => {
    console.log(
      "update Schedule with new roles",
      { shiftToUpdate },
      { schedule },
      { selctedShifts },
      
    );
    if (selctedShifts) {
      const tmpShifts = schedule;
      selctedShifts.forEach((shift) => {
        const index = schedule.findIndex(
          (scedShift: shiftTemp) => scedShift.id === shift.id
        );
        console.log({ index }, { shift });
        if (index !== -1) {
          tmpShifts[index] = {
            ...shiftToUpdate,
            day: tmpShifts[index].day,
            id: tmpShifts[index].id,
          };
        }
      });
      console.log({ tmpShifts });
      setSelectedShift({ ...tmpShifts[0] });

      updatedSchedule(tmpShifts);
      const tmpSelected = { ...shiftToUpdate };
      onDaySelect(tmpSelected.day);
    }
  };
  const onSelectShift = (shiftOfDay) => {
    //for each selctedShift Day , reSelect all the shifts

    console.log({ shiftOfDay }, { selctedShifts },{selctedDays});
    if (selctedDays.length > 0) {
      console.log({ selctedDays });
      const tmpSelctedShifts: shiftTemp[] = [];
      selctedDays.forEach((day: { value: string; lable: string }) => {
        console.log(selctedShift, { day });
        const tmpShift = schedule.filter(
          (shift: shiftTemp) =>
            shift.id === Number(shiftOfDay)
        );
        tmpShift && tmpSelctedShifts.push(...tmpShift);
      });
      console.log({ tmpSelctedShifts });
      setSelectedShifts([...tmpSelctedShifts]);
      setSelectedShift(tmpSelctedShifts[0]);
      const tmpValue = tmpSelctedShifts[0].id.toString();
     setSelcetedDayBtn(tmpValue)
    }
    
  };

  return (
    <View style={{ borderColor:'red',borderWidth:1,flex:1}}>
      <View style={{borderColor:'red',borderWidth:1, flex:1,flexDirection:'column'}}>
     <View style={{flex:1,alignContent:'center',alignSelf:'center',borderColor:'red',borderWidth:3,}}>
      <DayPicker
    day={[]}
    setDay={(day) => onDaySelect(day)}
    range={range}
    multiSelect={true}
   
  />
  </View>
           {dayBtns && (
            <SegmentedButtons
              value={selcetedDayBtn}
              onValueChange={onSelectShift}
              buttons={dayBtns}
            />
          )} 
          </View>
     <View style={{flex:5,borderColor:'brown',borderWidth:2}}>
        <Surface
          style={[
            styles.surface,
          ]}
          elevation={4}
        >
          <ScrollView style={{flex:1 , borderColor: "blue", borderWidth: 4,}}>  
        <View style={{flex:1}}>
          <Text style={[mainStyle.h2,{color:theme.colors.onSurface}]}>Edit Shift:</Text>
          </View>
          <View style={{flex:4,borderColor: "pink", borderWidth: 4,}}>
          {selctedShift && (
          <SettingsShiftComp
            shift={selctedShift}
            updateSchedule={updateShifts}
          />
        )}
        </View>
        </ScrollView>
          {/* Shift info - start - end -roles ---delete */}
        </Surface>
      </View>
      </View>
    
  );
};

export default ShiftRoleSettingsComp;


