import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import EditShiftModal from '../EditShiftModal';

//This is a ShiftComponent. 
//ToDo:
//add request for replacment 
//for each shift if avlible replacment - show btn to ask for replace. 



const ShiftComponent = ({shift,isEdit}) => {

// console.log(shift)
const localShift = shift.item?shift.item:shift;
// console.log(localShift)

const [editShiftModal, setEditShiftModal] = useState(false);



const handelModalVisible = ()=>{
    setEditShiftModal(!editShiftModal);
}


const editShift = ()=>{
    console.log('editShift');
    setEditShiftModal(!editShiftModal);
}


  return (
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
      <Text style={styles.text}>shiftComponent</Text>
        <Text style={styles.text}>{localShift.shifttStartHour}</Text>
        <Text style={styles.text}>{localShift.shiftType}</Text>
        <Text style={styles.text}>{localShift.shiftEndHour}</Text>
      {isEdit &&  <Pressable onPress={editShift}>
            <View>
  <Text>I'm pressable!</Text>
  <EditShiftModal shift={shift} modalVisible={editShiftModal} setModal={handelModalVisible}/>
  </View>
</Pressable>}
</View>
    </View>
  )
}

export default ShiftComponent

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
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
        marginBottom: 15,
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