import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { shift, user } from "../../App";
import { TextInput } from "react-native-gesture-handler";
const EditShiftAdmin = ({
  shiftToEdit,
  visible,
}: {
  shiftToEdit: shift;
  visible: boolean;
}) => {
  const [shift, setShift] = useState<shift>();
  const [editedShift, setEditedShift] = useState();
  const [modalVisible, setModalVisbile] = useState<boolean>(visible);
  const [day, setDay] = useState<string | undefined>();
  const [startHour, setStartHour] = useState<string | undefined>();
  const [endHour, setEndHour] = useState<string | undefined>();
  const [user, setUser] = useState<user | null>();
  const convertToShift = (shiftToCahnge: shift) => {
    const shift: shift = {
      id: shiftToCahnge.id,
      createdAt: new Date(shiftToCahnge.createdAt),
      updatedAt: new Date(shiftToCahnge.createdAt),
      shiftDate: new Date(shiftToCahnge.shiftDate),
      shiftType: shiftToCahnge.shiftType,
      typeOfShift: shiftToCahnge.typeOfShift,
      shifttStartHour: new Date(shiftToCahnge.shifttStartHour),
      shiftEndHour: new Date(shiftToEdit.shiftEndHour),
      userId: shiftToCahnge.userId,
      userPreference: shiftToCahnge.userPreference,
      scheduleId: shiftToCahnge.scheduleId,
      userRef: shiftToCahnge.userRef,
    };
    return shift;
  };

  const options: Intl.DateTimeFormatOptions = { weekday: "long" };
  const hourOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  useEffect(() => {
    const updateData = () => {
      console.log(shiftToEdit);
      if (shiftToEdit) {
        setShift(convertToShift(shiftToEdit));
        console.log(shift);
        console.log("shift: ,", shiftToEdit, typeof shift?.shifttStartHour);
       
      }
    };
    updateData();
  }, [shiftToEdit]);

  useEffect(() => {
    if (shift) {
      const dayName = shift.shifttStartHour.toLocaleString(
        "en-us",
        options
      );
      const startHourtmp = shift.shifttStartHour.toLocaleString(
        "en-US",
        hourOptions
      );
      const endHourtmp = shift.shiftEndHour.toLocaleTimeString(
        "en-US",
        hourOptions
      );
      console.log(dayName, endHour, shiftToEdit.scheduleId);
      setStartHour(startHourtmp);
      setEndHour(endHourtmp);
      setDay(dayName);
      if (shiftToEdit?.userRef) {
        setUser(shiftToEdit.userRef);
      }
    }
    console.log({ shift: shiftToEdit }, { user }, { startHour });
  }, [shift]);


  const handelTimeChange = (time) => {
    setStartHour(time);
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
          {shiftToEdit && (
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                {" "}
                {day} , {shift?.shifttStartHour.toLocaleDateString("en-us",hourOptions)} - {shift?.shiftEndHour.toLocaleDateString("en-us",hourOptions)}
              </Text>
              <Text>Edit Shift time </Text>
              <Text>Assigned: {user?.firstName}</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => console.log("press edit user ")}
              >
                <Text style={styles.textStyle}>edit</Text>
              </Pressable>
            </View>
          )}
          <View>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => console.log("press")}
            >
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisbile(!modalVisible)}
            >
              <Text style={styles.textStyle}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditShiftAdmin;

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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
