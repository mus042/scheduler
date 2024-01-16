import { Alert, Modal, Pressable, StyleSheet, Text, View,FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { mainStyle } from "../../utils/mainStyles";
import PickPrefComp from "./components/pickPrefComp";
import { Icon, IconButton, MD3Colors } from "react-native-paper";

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
        
   <View style={{flex:1,flexDirection:'column'}}>
      <IconButton
    icon="camera"
    iconColor={MD3Colors.error50}
    size={20}
    onPress={() => console.log('Pressed')}
  />    <IconButton
  icon="camera"
  iconColor={MD3Colors.error50}
  size={20}
  onPress={() => console.log('Pressed')}
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
   
    <View style={{flexDirection:'column'}} >
   
            

            <View style={{borderWidth:3,flexDirection:'row'}}>
                <Pressable  onPress={()=>setPrefSelctor(!prefSelctor)}>
                    
                        <Text style={{flex:1}}>Prefrence: 
                            {!prefSelctor && userPref}
                        </Text>
                        <View style={{flex:1}}>
                        {prefSelctor && selectValue([1,2,3])}
                    </View>
                </Pressable>
            </View>
    
          </View>


  );
};

export default EditShiftComp;

const styles = StyleSheet.create({

});
