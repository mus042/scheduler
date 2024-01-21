import { Alert, Modal, Pressable, StyleSheet, Text, View,FlatList } from "react-native";
import React, { useState } from "react";

const EditShiftModal = ({ shift, modalVisible, setModal }) => {


  const [userPref, setUserPref] = useState(shift.userPreference?shift.userPreference:shift.item.userPreference);
 const [prefSelctor,setPrefSelctor]= useState(false);
const localShift = shift.item? {...shift.item}:{...shift};

  const selectValue = (options) => {
    // console.log('select value')
    return (
        
      <View>
        <FlatList
          data={options}
          renderItem={({ item }) => (
            <Pressable onPress={() =>{setUserPref(item),setPrefSelctor(!prefSelctor)}}>
              <Text>{item}</Text>
            </Pressable>
          )}
        />
      </View>
    );
  };



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
            <Text style={styles.modalText}> shift Day</Text>

            <Text style={styles.text}>{localShift.shiftStartHour}</Text>

            <Text style={styles.text}>{localShift.ShiftTimeName}</Text>

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

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModal()}
            >
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditShiftModal;

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
