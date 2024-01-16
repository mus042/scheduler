import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, TextInput, useTheme } from 'react-native-paper'
import { SmallTimePicker } from '../../app/components/SmallTimePicker'
import { convertTimeToString } from '../../utils/utils'
import { mainStyle } from '../../utils/mainStyles'

const ShiftTemplatComp = ({shift,setShift}) => {
  //utils 


    //State 
const [shiftName,setShiftName] = useState(shift.name || "");
const [startTimeVisible,setstartTimeVisible] = useState(false);
const[start,setStart] = useState(shift.startHour);
const [end,setEnd] = useState(shift.endHour);
const [endTimeVisible, setEndTimeVisible] = useState(false); // New state for the "End of shift" time picker
const [changeFlag, setChangeFlage] = useState<boolean>(false);
const theme = useTheme();
//useEffect 
useEffect(() => {
  console.log({shift}, " shift Temp Comp useEffct ,<- editShiftNames ");

}, [])


const setTime =(time,func,visible) =>{
//Add validation to make sure start > end ; 
  console.log({time})
  visible(false);
  // const str = convertTimeToString(time); 
  // console.log({str});
  // Check if start is less than end before updating the state
  if (func === setStart && end && time.hours >= end.hours) {
    // Handle validation error (start should be less than end)
    console.log({end},{start},{time})
    console.log('Start time must be less than end time');
    // You can choose to show an error message or handle it differently
  } else if (func === setEnd && start && time.hours <= start.hours) {
    // Handle validation error (end should be greater than start)
    console.log('End time must be greater than start time',func === setEnd, start , time.hours > start.hours);
    console.log({end},{start},{time})
     } else {
    func(time);
  }
  
  console.log({time},{end});
  func === setStart ? setShift({...shift,endHour:{...end},startHour:{...time}}) : setShift({...shift,endHour:{...time},startHour:{...start}})
  
}

const setItem=(item,setItem)=>{
    setItem(item);
    setShift({...shift,name:item})
    console.log({item})
}

const onChangeName =(newName) =>{

}
  return (
    <View style={{flex:1 , margin:10 , backgroundColor:theme.colors.surfaceVariant , padding:10,borderRadius:10,}}>
       <View style={{flex:1}}>
       <TextInput
      label="Shift Name"
      value={shiftName}
      onChangeText={text => setItem(text,setShiftName)}
    /> 
       </View>
    <View style={{flexDirection:'row'}}  > 
      <View style={{flex:1}}>
        <Pressable onPress={()=>setstartTimeVisible(true)} >
            <Text style={[mainStyle.h5,{color:theme.colors.onBackground}]}>Start - <Text style={{color:theme.colors.primary}}>{convertTimeToString(start)}</Text></Text>

        </Pressable>
        <SmallTimePicker onConfirm={(time)=>setTime(time,setStart,setstartTimeVisible)} onDismiss={()=>setstartTimeVisible(!startTimeVisible)} visible={startTimeVisible} />
   
        </View> 
        <View style={{flex:1}}>   
        <Pressable onPress={()=>setEndTimeVisible(true)} >
            <Text style={[mainStyle.h5,{color:theme.colors.onBackground}]}>Until -<Text style={{color:theme.colors.primary}}> {convertTimeToString(end)}</Text> </Text>
        </Pressable>
        <SmallTimePicker onConfirm={(time)=> setTime(time,setEnd,setEndTimeVisible)} onDismiss={()=>setEndTimeVisible(!endTimeVisible)} visible={endTimeVisible} />
        </View>

        <View style={{flex:1}}>
          <Text style={[mainStyle.h5,{color:theme.colors.onBackground}]}>Total: <Text>{Number(shift.endHour.hours)+(Number(shift.endHour.minutes)/60) -Number(shift.startHour.hours)+(Number(shift.startHour.minutes)/60) }</Text></Text>
          </View>  
        </View> 
  
    </View>
  )
}

export default ShiftTemplatComp

const styles = StyleSheet.create({})