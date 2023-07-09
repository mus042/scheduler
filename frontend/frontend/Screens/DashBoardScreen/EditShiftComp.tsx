import { Alert, Modal, Pressable, StyleSheet, Text, View,FlatList } from "react-native";
import React, { useEffect, useState } from "react";

const EditShiftComp = ({ shift , update}) => {

const [localShift,setlocalShift] = useState( shift.item? {...shift.item}:{...shift})
console.log({shift})
const [userPref, setUserPref] = useState(shift?.userPreference?shift.userPreference:shift.item.userPreference);
 const [prefSelctor,setPrefSelctor]= useState(false);


 useEffect(() => {
   setlocalShift(shift.item? {...shift.item}: {...shift});
   setUserPref(shift?.userPreference?shift.userPreference:shift.item.userPreference)
console.log({shift});
 }, [shift])
 

console.log({shift})
  const selectValue = (options) => {
    // console.log('select value')
    return (
        
      <View>
        <FlatList
          data={options}
          renderItem={({ item }) => (
            <Pressable onPress={() =>{onSelect(item)}}>
              <Text>{item}</Text>
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
    console.log(localShift);
    update(localShift)
  }


  return (
    <View style={styles.centeredView}>
   


            <Text style={styles.text}>{localShift.shifttStartHour}</Text>

            {/* <Text style={styles.text}>{localShift.shiftType}</Text> */}

            <Text style={styles.text}>{localShift.shiftEndHour}</Text>

            <View>
                <Pressable style={styles.button} onPress={()=>setPrefSelctor(!prefSelctor)}>
                    <View>
                        <Text>
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
