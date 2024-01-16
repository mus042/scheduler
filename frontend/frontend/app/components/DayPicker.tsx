import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';
import CustomSegmentedButtons from './CustomSegmentedButton';

const DayPicker = ({day, setDay,range}:any) => {
  const theme = useTheme();
  const daysOfWeek = [
    { value: '0', label: 'Sun',labelStyle: styles.buttonsText ,uncheckedColor:theme.colors.secondary},
    { value: '1', label: 'Mon' ,labelStyle: styles.buttonsText,uncheckedColor:theme.colors.secondary},
    { value: '2', label: 'Tue' ,labelStyle: styles.buttonsText,uncheckedColor:theme.colors.secondary},
    { value: '3', label: 'Wed' ,labelStyle: styles.buttonsText,uncheckedColor:theme.colors.secondary},
    { value: '4', label: 'Thu',labelStyle: styles.buttonsText ,uncheckedColor:theme.colors.secondary},
    { value: '5', label: 'Fri' ,labelStyle: styles.buttonsText,uncheckedColor:theme.colors.secondary},
    { value: '6', label: 'Sat' ,labelStyle: styles.buttonsText,uncheckedColor:theme.colors.secondary},
   
  ]
  
  const [selectedDay, setSelectedDay] = useState<any>(day);
  const [buttons,setButtons] = useState();
useEffect(() => {
  if(day?.value !== undefined){  
  console.log({day},{selectedDay},daysOfWeek[Number(day.value)],day.value,daysOfWeek[0]);
  setSelectedDay(day.value);
  setDay({value:daysOfWeek[Number(day.value)].value,label:daysOfWeek[Number(day.value)].label})
}}, [])


useEffect(() => {
  console.log({day},{selectedDay});
  
}, [selectedDay])



   const onSelect =(value)=>{
    console.log({day},{value});
    if(Array.isArray(value)){
      // console.log("arr",value,daysOfWeek[Number(value[0])].label);
      setSelectedDay(value);
      //create arr of selcted day info 
      const tmpDaysArr=[];
      value.map((item)=>tmpDaysArr.push({value:daysOfWeek[Number(item)].value,label:daysOfWeek[Number(item)].label}));
    // setDay({value:daysOfWeek[Number(0)].value,label:daysOfWeek[Number(0)].label});
  setDay(tmpDaysArr)  
  }else{
    setSelectedDay(value);
    setDay({value:daysOfWeek[Number(value)].value,label:daysOfWeek[Number(value)].label})
   }}



  return (
    <View style={{flex:1 }}>
      {/* <Picker
        selectedValue={selectedDay}
        onValueChange={(itemValue, itemIndex) =>{
          setSelectedDay(itemValue);
          setDay(itemValue);
        }
        }>
        {daysOfWeek.map((day, index) => (
          <Picker.Item key={index} label={day} value={day} />
        ))}
      </Picker> */}
      <CustomSegmentedButtons
      
      style={[styles.cell]}
      defDay={day}
     density='small'
        value={selectedDay}
        onValueChange={onSelect}
        buttons={daysOfWeek.slice(range.start,range.end)}
        multiSelect
      />
       
   
    </View>
  );
};

export default DayPicker;

const styles = StyleSheet.create({
    cell:{
        flex:1,
        maxHeight:35,
    },
    buttonsText:{
        fontSize:12,
        margin:0,
        padding:0,

    }
})