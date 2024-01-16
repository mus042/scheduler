import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Button, TextInput, useTheme } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";
import PickHourSmall from "./PickHourSmall";
import { FlatList } from "react-native-gesture-handler";
import SmallTimePicker from "../../app/components/SmallTimePicker";
import ShiftTemplatComp from "./ShiftTemplatComp";
import { shift } from "../../App";
import { shiftTemp } from "../SettingsScreen";
import { mainStyle } from "../../utils/mainStyles";

// const deafultShiftTemplat: shiftTemp[] = [
//   { id: 0, name: "morning", startHour: "06:00", endHour: "14:00", roles: [] },
//   { id: 1, name: "Noon", startHour: "14:00", endHour: "22:00", roles: [] },
//   { id: 2, name: "Night", startHour: "22:00", endHour: "06:00", roles: [] },
// ];

const EditShiftNames = ({ setShiftNames , defShifts}) => {
  //Start with deafult templat for shift
  const [newName, setNewName] = useState("");
  const [visible, setVisible] = useState(false);
  const [shifts, setShifts] = useState<shiftTemp[]>(defShifts);
  const [text, settext] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const theme = useTheme();


  const setShift = (newShift) => {
    const index: number = shifts.findIndex((shift) => shift.id === newShift.id);
    console.log({ index }, { newShift });
    if (index >= 0) {
      //change existing
      const newShifts = [...shifts];
      newShifts[index] = { ...newShift };
      console.log(newShifts[index]);
      setShifts(newShifts);
    } else {
      //no shift id
    }
  };
  useEffect(() => {
    console.log("Edit shifts name and time ",{ shifts });
  }, [shifts]);

  const onSetShifts = () => {
    //set the pref from user
    console.log("set shifts , ", { shifts });
    setShifts([...shifts]);
    setShiftNames([...shifts])
  };
  const resetForm = () => {
    console.log("reset form, set shifts to default");
    setShifts([...defShifts]); 
    setResetKey((prevKey) => prevKey + 1); // Update the reset key
  };
  const addNewShift = () => {
    //add new shift, map arr to find next id and icrmiemnt id +1 ,
    // add deafult hours and name and concat to arr.
    const newId = shifts[shifts.length - 1].id + 1;
    const newShift: shiftTemp = {
      id: newId,
      startHour: {hours:0,minutes:0},
      endHour: {hours:0,minutes:0},
      name: "New Shift",
      roles: [],
    };
    const newShifts: shiftTemp[] = [...shifts, newShift];
    // newShifts.push(newShift);
    setShifts([...newShifts]);
    console.log({ newShifts });
  };

  ///--***Local Styles***--///
  const styles = StyleSheet.create({
    btn:{
      // marginTop: 10,
      // maxHeight: 20,
      // maxWidth: 100,
      margin:2,
      alignItems: "center",
      alignSelf: "center",
      backgroundColor:theme.colors.primary
      
    }
  });
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 5 }}>
        {/* Add new Shift  */}
        <FlatList
          data={shifts}
          renderItem={({ item }) => (
            <ShiftTemplatComp shift={item} setShift={setShift} />
          )}
          keyExtractor={(item) => `${item.id}-${resetKey}`}
        />

        {/* show the shifts set  */}
      </View>
      <View style={{ flex: 1, flexDirection: "row" , justifyContent:'center',}}>
        <Button
          style={styles.btn}
          icon="checkbox-marked-circle-outline"
          mode="outlined"
          compact={true}
          onPress={() => addNewShift()}
          
          textColor= {theme.colors.onPrimary}
        >
          Add Shift
        </Button>
        <Button
          style={styles.btn}
          icon="checkbox-marked-circle-outline"
          mode="outlined"
          compact={true}
          onPress={() => onSetShifts()}
          
          textColor= {theme.colors.onPrimary}
        >
          save
        </Button>
        <Button
          style={styles.btn}
          icon="checkbox-marked-circle-outline"
          mode="outlined"
          compact
          onPress={() => resetForm()}
          textColor= {theme.colors.onPrimary}
        >
          Reset
        </Button>
      </View>
    </View>
  );
};




export default EditShiftNames;