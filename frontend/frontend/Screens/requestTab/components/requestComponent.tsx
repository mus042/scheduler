import { Pressable, StyleSheet, } from 'react-native'
import React, { useEffect, useState } from 'react'
import { mainStyle } from '../../../utils/mainStyles'
import { getDayName, normalizeShiftDate, normalizeShiftTime } from '../../../utils/utils'
import axios from 'axios'
import { API_URL } from '../../../app/context/AuthContext'
import { userRequest } from '../../../App'
import { Avatar, Colors, Drawer,Text, View  } from 'react-native-ui-lib'




const RequestComponent = ({req}) => {
    //Show request -- sender - recived - answerd
 console.log({req});
    //state for read or not 
    //state f or shift and sender details 
    const [senderDetails, setsenderDetails] = useState();
    const [shiftDetails,setShiftDeatails] = useState();
    const [replayCompVisible,setReplayCompVisible]= useState(false);
  const [userReplay, setUserReaplay]  = useState<string>(req?.requestAnswer);


const handelReplay= ()=>{
  // this will open new modal to set reaply. 
  //replay will be true/false *TO ADD*  replay message . 

    console.log('replay');
    setReplayCompVisible(!replayCompVisible);

}

const  selectUserReplay = async (replay:string)=>{
  //This will handel the selction of replay.
  console.log(replay !== userReplay,{replay},userReplay);
  if(replay !== userReplay ){
  // selectUserReplay(replay);
  const updatedRequest:userRequest = {...req};
  updatedRequest.isAnswered = true;
  updatedRequest.requestAnswer =replay; 
    const result = await axios.post(`${API_URL}user-request/replayToRquest`,updatedRequest)
}
}


    return (
    // <View style={{flexDirection:'row'}}>
<Drawer
  rightItems={[{text: 'Read', background: Colors.blue30, onPress: () => console.log('read pressed')}]}
  leftItem={{text: 'Delete', background: Colors.red30, onPress: () => console.log('delete pressed')}}
>
  <View centerV row spread  padding-s4 bg-white style={{height: 60}}>
    
<Avatar  label={"IT"}/>
<Text text60 > {normalizeShiftDate(req.shift.shifttStartHour)} </Text>
    <Text text70 blue20 >{normalizeShiftTime(req.shift.shifttStartHour)} - {normalizeShiftTime(req.shift.shiftEndHour)}</Text>
    <Text text40> aaa </Text>  
  </View>
</Drawer>
      /* <View style={{flex:1}}>
        <Text> from {req?.senderId} </Text>
    </View>
     <View style={{flex:3}}>
      <Text style={mainStyle.text}>shift id: {req?.shiftId} </Text>
      <Text style={mainStyle.text}> { getDayName(req.shift.shifttStartHour)}, { normalizeShiftDate(req.shift.shifttStartHour)}</Text>
      <Text style={mainStyle.text}> </Text>
      <Text>{normalizeShiftTime(req.shift.shifttStartHour)} - {normalizeShiftTime(req.shift.shiftEndHour)}</Text>
      </View>
      <View style={{flex:4}}>
       <Text> request message {req.message}</Text>
      </View>
      <View style={{flex:2 , flexDirection:'row'}}>
        <View style={{flex:2}}>
           <Text style={mainStyle.text}>is answerd:</Text>
            <Text>  {req.isAnswered? "True" : "False" }</Text>
        </View>
        <Pressable style={[mainStyle.button]} onPress={()=>handelReplay()}>
            <Text style={mainStyle.h5}>Replay</Text>
        </Pressable>

      </View>
     {replayCompVisible  && 
      <View style={{flex:1}}>
          <Text>
            replay comp 
          </Text>
          <Pressable onPress={()=>selectUserReplay("true")}>
            <Text>
              true
            </Text>
          </Pressable>
          <Pressable onPress={()=>selectUserReplay("false")}>
            <Text>
              False
            </Text>
            </Pressable>
      </View>
      }  */
    // </View>
  )
}

export default RequestComponent

const styles = StyleSheet.create({})