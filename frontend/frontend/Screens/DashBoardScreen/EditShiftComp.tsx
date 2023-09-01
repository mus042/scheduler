import { Alert, Modal, Pressable, StyleSheet, Text, View,FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { mainStyle } from "../../utils/mainStyles";

const EditShiftComp = ({ shift , update}) => {

const [localShift,setlocalShift] = useState( shift.item? {...shift.item}:{...shift})
const [userPref, setUserPref] = useState(shift?.userPreference?shift.userPreference:shift.item.userPreference);
 const [prefSelctor,setPrefSelctor]= useState(false);


 useEffect(() => {
   setlocalShift(shift.item? {...shift.item}: {...shift});
   setUserPref(shift?.userPreference?shift.userPreference:shift.item.userPreference)
// console.log({shift});
 }, [shift])
 

// console.log({shift})
  const selectValue = (options) => {
    // console.log('select value')
    return (
        
      <View>
        <FlatList
          data={options}
          renderItem={({ item }) => (
            <Pressable  onPress={() =>{onSelect(item)}}>
              <Text style={mainStyle.h5} >{item}</Text>
            </Pressable>
          )}
        />
      </View>
    );
  };

  const onSelect = (item)=>{
    setUserPref(item),
    setPrefSelctor(!prefSelctor);
   const tmpShift = localShift;
   tmpShift.userPreference = item.toString();
    setlocalShift(tmpShift);
    // console.log(localShift);
    update(localShift)
  }


  return (
    <View >
   
            

            <View>
                <Pressable style={mainStyle.button} onPress={()=>setPrefSelctor(!prefSelctor)}>
                    <View>
                        <Text style={mainStyle.h5}>Prefrence: 
                            {!prefSelctor && userPref}
                            {prefSelctor && selectValue([1,2,3])}
                        </Text>
                    </View>
                </Pressable>
            </View>

          
          </View>

  );
};

export default EditShiftComp;

const styles = StyleSheet.create({

});
