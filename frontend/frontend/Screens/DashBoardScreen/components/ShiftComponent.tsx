import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import EditShiftModal from '../EditShiftModal';
import { getDayName, normalizeShiftDate, normalizeShiftTime } from '../../../utils/utils';
import { mainStyle } from '../../../utils/mainStyles';
import { API_URL } from '../../../app/context/AuthContext';
import axios from 'axios';
import FindReplacmentComp from './FindReplacmentComp';

//This is a ShiftComponent. 
//ToDo:
//add request for replacment 
//for each shift if avlible replacment - show btn to ask for replace. 



const ShiftComponent = ({shift,isEdit}) => {
  const [findReplaceVisible, setfindReplaceVisible] = useState(false);
// console.log(shift)
const localShift = shift.item?shift.item:shift;
// console.log(localShift)

const [editShiftModal, setEditShiftModal] = useState(false);
const handelFindReplace = async (shift: shift | undefined) => {
  console.log("find replace ", shift, shift?.id);
  
  if (shift) {
    const possibleUsers = await axios.get(
      `${API_URL}schedule/getReplaceForShift/${shift.id}/${shift.scheduleId}`
    );

    console.log({ possibleUsers });
    setfindReplaceVisible(true);
    return possibleUsers?.data;
  } else return [];
};

const handelModalVisible = ()=>{
    setEditShiftModal(!editShiftModal);
}


const editShift = ()=>{
    console.log('editShift');
    setEditShiftModal(!editShiftModal);
}
console.log({shift})
if(!localShift.id){
  return (
       <View style={styles.centeredView}>
        <View style={[styles.modalView, {maxWidth:250}]}>
          <Text style={mainStyle.h3}>Lookes like you dont have a shift heading your way</Text>
</View>
    </View>
  )
}

  return (
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={mainStyle.h3}>{getDayName(localShift.shifttStartHour)}, {localShift.shiftType} </Text>
      <Text style={mainStyle.h4}> {normalizeShiftDate(localShift.shifttStartHour)}</Text>
        <Text style={mainStyle.h5}>{localShift.typeOfShift}</Text>
        <Text style={mainStyle.h5}>{normalizeShiftTime(localShift.shifttStartHour)} - {normalizeShiftTime(localShift.shiftEndHour)}</Text>
      {isEdit &&  <Pressable onPress={editShift}>
            <View>
  <Text>Edit</Text>
  <EditShiftModal shift={shift} modalVisible={editShiftModal} setModal={handelModalVisible}/>
  </View>
</Pressable>}
<View>
  <Pressable style={[mainStyle.button,mainStyle.buttonOpen]} onPress={()=>handelFindReplace(localShift)}>
    <Text>
      Find replacment
    </Text>
  </Pressable>
  {findReplaceVisible && (
              <FindReplacmentComp
                shift={shift}
                handelFindReplace={handelFindReplace}
              />
            )}
            {/* To Add send all btn  */}
</View>
</View>
    </View>
  )
}

export default ShiftComponent

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        // marginTop: 10,
      },
      modalView: {
        margin: 15,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
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
        marginBottom: 5,
        textAlign: "center",
      },
      text: {
        fontSize: 20,
      },
    container:{
        maxWidth:50,
        borderWidth:1,
        borderColor:'green', 
        fontSize:5,
    },
 
})