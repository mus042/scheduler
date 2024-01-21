import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../app/context/AuthContext";
import ShiftComponent from "./ShiftComponent";
import { shift } from "../../../App";
import { normalizeShiftDate, normalizeShiftTime } from "../../../utils/utils";
import { mainStyle } from "../../../utils/mainStyles";

const NextShiftComp = ({nextShift}:{nextShift:shift | undefined}) => {

  //getNext Shift from server
  const [shift, setnextShift] = useState<shift>();



  useEffect(() => {
    console.log("next shift component",{nextShift})
    setnextShift(nextShift);
  }, [nextShift]);
  

  const date = new Date("2023-07-23T15:55:22.242Z");
  const nextTestShift:shift = {
    id: 1,
    createdAt:date,
    updatedAt:date,
    shiftTimeName: 'morning',

    typeOfShift: "short",
    shiftStartHour:date,
    shiftEndHour:date,
    userId: 6,
    userPreference: "1",
    scheduleId: 2,
    userRef:null ,
  }

  return (
   
    <View style={styles.container}>
     { nextShift?(
      <View style={{flex:1}}>
      <View style={{flex:1}}>
        <Text style={mainStyle.h3}>
            Next shift
        </Text>
      { nextShift &&
      <View style={{flex:1,alignContent:'center',alignItems:'center',alignSelf:'center'}}>
      <ShiftComponent shift={nextShift} isEdit={false} />
      </View>
      } 
     </View>
      </View>
      ):(
        <View>
      <Text>looks like no next shifts</Text>
      </View>
      ) 
      }
    </View>
       
      );
};

export default NextShiftComp;

const styles = StyleSheet.create({

    container:{
      flex:1,
        borderWidth:1,
        borderColor:'red', 
    }
});
