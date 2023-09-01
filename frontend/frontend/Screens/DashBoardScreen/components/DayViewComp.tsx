import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { shift, user, userRequest } from "../../../App";
import EditDayModal from "./EditDayModal";
import UserStats from "./UserStats";
import EditShiftAdmin from "../../AdminPanelScreen.tsx/EditShiftAdmin";
import axios from "axios";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import EditShiftComp from "../EditShiftComp";
import { FlatList } from "react-native-gesture-handler";
import { mainStyle } from "../../../utils/mainStyles";
import { normalizeShiftTime } from "../../../utils/utils";

const DayViewComp = ({
  shifts,
  update,
  viewType,
  isEdit,
}: {
  shifts: shift[] | undefined | any;
  update: any;
  isEdit: boolean | undefined;
  viewType: "systemSchedule" | "userSchedule" | undefined;
}) => {
  const [localShifts, setlocalShifts] = useState<shift[]>();
  const [editDay, setEdit] = useState(isEdit !== undefined ? !isEdit:false);
  const [dayName, setDayName] = useState<string>("");
  const [morning, setMorning] = useState<shift>();
  const [morningUser, setMorningUser] = useState<user>();
  const [nightUser, setNightUser] = useState<user>();
  const [noonUser, setNoonUser] = useState<user>();
  const [night, setNight] = useState<shift>();
  const [noon, setNoon] = useState<shift>();
  const { authState } = userAuth();

  useEffect(() => {
    if (shifts) {
      setlocalShifts(shifts.item);
      setMorning({ ...shifts.item[0] });
      setMorningUser({ ...shifts.item[0]?.userRef });
      setNoon({ ...shifts.item[1] });
      setNoonUser({ ...shifts.item[0]?.userRef });
      setNight({ ...shifts.item[2] });
      setNightUser({ ...shifts.item[0]?.userRef });
    }
  }, [shifts]);

  useEffect(() => {
    // console.log("view Type ", viewType, { localShifts });
    if (localShifts) {
      // console.log("useEffect Dayview : ", localShifts[0].userRef);
      // console.log(morning,noon,night,nightUser);

      const shiftDate: Date = new Date(localShifts[0]?.shifttStartHour);
      const options = { weekday: "long" };
      setDayName(shiftDate.toLocaleString("en-us", options));
    }
  }, [localShifts]);

  const handelOpenDay = () => {
    if (viewType !== "systemSchedule") {
      console.log({ localShifts });
      setEdit(!editDay);
    }
  };
  const updateShifts = (editedShifts: shift[]) => {
    // console.log(editedShifts);
    setlocalShifts(editedShifts);
    update(editedShifts);
  };
  // console.log({shifts});
  function ShiftView({ shift }: { shift: shift | undefined }) {
    const [localShift, setShift] = useState<shift>();
    const [shiftUser, setUser] = useState<user>();
    const [findReplaceVisible, setfindReplaceVisible] = useState(false);
    useEffect(() => {
      //Update Shift and user
      // console.log({ shift });
      if (shift) {
        setShift(shift);

        if (shift.userRef) {
          // console.log(shift.userRef);
          setUser(shift.userRef);
        }
      }
    }, [shift]);
    const shiftContainerStyle = () => {
      return localShift?.userId === null ? styles.noUser : null;
    };

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
    
    

    if (localShift) {
      if (viewType === "systemSchedule") {
        return (
          <View style={shiftContainerStyle()}>
            {shift?.shiftType !== undefined && (
              <Text style={mainStyle.h4}>
                {" "}
                Assiged: {shift?.userRef?.lastName} {shift?.userRef?.firstName}{" "}
                {shift?.userId} ,{"."}
              </Text>
            )}
            <Text style={ mainStyle.h4}> {normalizeShiftTime(shift?.shifttStartHour)} -  {normalizeShiftTime(shift?.shiftEndHour)}</Text>
            {(authState?.user?.id === shift?.userId || authState?.user?.userRole === 'admin')&& <View>
            <Pressable style={[mainStyle.button,mainStyle.buttonOpen]} onPress={() => handelFindReplace(localShift)}>
              <Text style={mainStyle.h5}>find replacment </Text>
            </Pressable>
            {findReplaceVisible && (
              <FindReplacmentUser
                shift={shift}
                handelFindReplace={handelFindReplace}
              />
            )}
          </View>}
          </View>
        );
      } else {
        return (
          <Pressable style={[mainStyle.button,]}>
            <EditShiftComp shift={shift} update={handelEditShift} />
          </Pressable>
        );
      }
    } else {
      return (
        <View>
          <Text>no shift to show</Text>
        </View>
      );
    }
  }

  const handelEditShift = (shift: shift | undefined) => {
    if(shift){
    if (viewType === "userSchedule") {
      // edit prefernce for future schedule
      if(localShifts){
        const index = localShifts.findIndex((localShift)=> localShift.id === shift?.id )
       const newShifts:shift[] = [...localShifts];
       newShifts[index] = shift;
      console.log({ shift });
      update(shift);
      //Edit shift component for user
    }}
  };
}
  function FindReplacmentUser({ shift, handelFindReplace }) {
    const [possibleUsers, setpossibleUsers] = useState<shift[]>();

    useEffect(() => {
      const getPossibleuseres = async () => {
        const result = await handelFindReplace(shift);
        console.log(result);
        setpossibleUsers(result);
      };
      getPossibleuseres();
    }, [shift]);

    const handelAskReplace = async (requstedUser: number | undefined) => {
      console.log({ requstedUser }, { shift });
      if(requstedUser){
     if (authState?.authenticated){

    
      const requestDto :userRequest = {
        senderId: shift.userId,
        destionationUserId: requstedUser,
        isAnswered: false,
        requsetMsg: "",
        shiftId: shift.id,
        shiftStartTime:shift.shifttStartHour ,
        shiftEndTime:shift.shiftEndHour,
        senderName: authState?.user?.firstName,
        senderLastName: authState?.user?.lastName,
      };
    
      console.log({ requestDto });
      // add emit to server
      
        // authState.socket.emit('message', { destionationUserId:requstedUser , shift});
        //call api to send the msg ?
        const respone = await axios.post(
          `${API_URL}user-request/setRequest`,
          requestDto
        );
        console.log("emit msg");
      }
      //add update state after emit
    };
  }
    const replaceUserAsAdmin = async (newUser: number | undefined) => {
      console.log({ newUser });
      try {
        const response = await axios.post(`${API_URL}shifts/replaceUser`, {
          newUser,
          shift,
        });
        console.log(response);
      } catch (error) {
        console.log({ error });
      }
    };
    const replaceItem = (item: shift) => {
      return (
        <View>
          <Text>
            {item.userRef?.firstName},{item.userRef?.lastName} ,
            {item.userRef?.id}
          </Text>
          <View>
            <Pressable onPress={() => handelAskReplace(item.userRef?.id)}>
              <Text>Ask to take replace.</Text>
            </Pressable>
            <Pressable onPress={() => replaceUserAsAdmin(item.userRef?.id)}>
              <Text>replace users as admin</Text>
            </Pressable>
          </View>
        </View>
      );
    };

    if (possibleUsers) {
      return (
        <View>
          <FlatList
            data={possibleUsers}
            renderItem={({ item }) => replaceItem(item)}
          />
        </View>
      );
    } else
      return (
        <View>
          <Text>no replace</Text>
        </View>
      );
  }

  return (
    <View style={styles.centeredView}>
     
      {localShifts && (
        <View style={styles.modalView}>
          <Pressable onLongPress={() => {console.log('press');return handelOpenDay()}}>
             <View style={{flex:1,  borderColor: "pink", 
                      borderWidth: 1}}>
        <Text style={[mainStyle.h3,{textAlign:'center'}]}>{dayName} </Text>
      </View>
            <View>
              {/* <Text> {dayName} {localShifts[0].typeOfShift} shifts </Text> */}
              <View>
                <View style={{ flex: 1 }}>
                  <Text style={mainStyle.h4}>Morning:</Text>
                </View>
                <View>
 
                    <ShiftView shift={localShifts[0]} />
                   
                </View>
              </View>
              {localShifts[0]?.typeOfShift !== "long" && (
                <View>
                  <Text style={mainStyle.h4}>Noon</Text>
          
                    <ShiftView shift={localShifts[1]} />
           
                </View>
              )}
              <View>
                <Text style={mainStyle.h5}>Night</Text>
                <View>
            
                    <ShiftView shift={localShifts[2]} />
          
                </View>
              </View>
            </View>
          </Pressable>
          {editDay && (
            <EditDayModal
              shifts={localShifts}
              modalVisible={editDay}
              setModal={setEdit}
              shiftDate={dayName}
              setEdtitedShifts={updateShifts}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default DayViewComp;

const styles = StyleSheet.create({
  centeredView: {
    flex: 2,
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
  container: {
    maxWidth: 50,
    borderWidth: 1,
    borderColor: "green",
    fontSize: 5,
  },
  noUser: {
    backgroundColor: "red",
  },
});
