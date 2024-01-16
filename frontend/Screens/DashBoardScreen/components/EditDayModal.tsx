import { Alert, Modal, Pressable, StyleSheet, Text, View,FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import EditShiftComp from "../EditShiftComp";

const EditDayModal = ({ shifts, modalVisible, setModal,setEdtitedShifts ,shiftDate }) => {
console.log({shifts})
const [morningShift,setMorningShifts] = useState( shifts[0]);
const [noonShift,setNoonShift] = useState( shifts[1]);
const [nightShift,setNightShift] = useState( shifts[2]);

  console.log(noonShift)
 const [prefSelctor,setPrefSelctor]= useState(false);

 useEffect(() => {
  console.log({morningShift},{nightShift});
  
  
 }, [morningShift]);
 

const updateShifts =()=> {
    const newShift = [{...morningShift},{...noonShift},{...nightShift}];
    setEdtitedShifts(newShift)
}

const options = { weekday: 'long' };
const dayName:string = shiftDate.toLocaleString('en-us', options); 
const handleSave=()=>{
    console.log('handel save')
    updateShifts();
    console.log({shifts})
    setModal(!modalVisible);
}


const handelSetDay=(userPref)=>{

  let tmpShift = {...morningShift};
  tmpShift.userPreference = userPref.toString(); 
  console.log('tmpShfit: ' , {tmpShift})
  setMorningShifts({...tmpShift});
  console.log({morningShift})
  tmpShift = {...noonShift};
  tmpShift.userPreference = userPref.toString();
  setNoonShift({...tmpShift});
  tmpShift = {...nightShift};
  tmpShift.userPreference = userPref.toString();
  console.log(tmpShift)
  setNightShift({...tmpShift});
 


  console.log("editdaymodal , 39 , day chage saved ");
  // setModal(!modalVisible);
  updateShifts();
}

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}> {dayName} </Text>
            {shifts && 
            ( <>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() =>handelSetDay(1)}
            >
              <Text style={styles.textStyle}>Set All Day</Text>
            </Pressable>
            <EditShiftComp shift={morningShift} update={setMorningShifts} /> 
            <EditShiftComp shift={noonShift} update={setNoonShift} />  
            <EditShiftComp shift={nightShift} update={setNightShift} /> 
            </>
            )
            }
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() =>handleSave()}
            >
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
            
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditDayModal;

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
});
