import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../app/context/AuthContext";
import ShiftComponent from "./ShiftComponent";

const NextShiftComp = () => {
  //getNext Shift from server
  const [nextShift, setnextShift] = useState<any>();

  useEffect(() => {
    const loadNextShift = async () => {
        
      const result = await axios.get(`${API_URL}shifts/nextShift `);
    
      if (result) {
        setnextShift(result.data.nextShift);
      }
      
    };
    loadNextShift();
  }, []);
  
  return (
   
    <View style={styles.container}>
     { nextShift?(
      <View>
        <Text>
            next shift
        </Text>
        <Text>{nextShift.id}</Text>
        <Text>{nextShift.shifttStartHour}</Text>   
        <Text>{nextShift.typeOfShift}</Text>
      { nextShift && <ShiftComponent shift={nextShift} isEdit={false} />} 
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
        borderWidth:1,
        borderColor:'red', 
    }
});
