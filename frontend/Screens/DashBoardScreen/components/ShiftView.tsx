import { useEffect, useState } from "react";
import { user, shift } from "../../../App";
import axios from "axios";
import { Pressable, View, StyleSheet } from "react-native";
import React from "react";
import EditShiftComp from "../EditShiftComp";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  IconButton,
  MD2Colors,
  Text,
} from "react-native-paper";
import { mainStyle } from "../../../utils/mainStyles";
import { normalizeShiftDate, normalizeShiftTime } from "../../../utils/utils";
import FindReplacmentComp from "./FindReplacmentComp";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import CardContent from "./CardContent";
const ShiftView = ({
  shifts,
  viewType,
  dayName,
}: {
  shifts: shift[];
  viewType: any;
  dayName: string;
}) => {
  const [localShift, setShift] = useState<shift[]>();
  const [shiftUser, setUser] = useState<user>();
  const [findReplaceVisible, setfindReplaceVisible] = useState(false);
  const [systemShifts,setSystemShifts] = useState<Record<string, shift[]>>();
  const user = userAuth()?.authState?.user ?? null;

  useEffect(() => {
    //Update Shift and user
    console.log('shift view shift',{ shifts });
    if (shifts) {
      //if system schedule - group same time shifts together by shiftTimeName
      if (viewType === 'systemSchedule') {
        const groupedShifts = shifts.reduce((acc: Record<string, shift[]>, shift: shift) => {
          // Determine the key for grouping
          const groupName = shift.shiftTimeName === 'noonCanceled' ? 'noon' : shift.shiftTimeName;
        
          // Initialize the group array if it does not exist
          if (!acc[groupName]) {
              acc[groupName] = [];
          }
        
          // Add the shift to the appropriate group
          acc[groupName].push(shift);
        
          return acc;
      }, {});
        console.log("grouped shifts ",{groupedShifts});
        setSystemShifts({...groupedShifts})
      }
      setShift([...shifts]);
      // if (shifts.userRef) {
      //   // console.log(shift.userRef);
      //   setUser(shift.userRef);
      // }
    }
  }, [shifts]);
  // const shiftContainerStyle = () => {
  //   return localShift?.userId === null ? styles.noUser : null;
  // };

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
  
  const LeftContent = (props) => {
    const day: string = dayName.slice(0, 1).toLocaleLowerCase();

    return (
      <Avatar.Icon
        {...props}
        icon={`alpha-${day}-box`}
        style={{ marginRight: 5 }}
      />
    );
  };

  ///return
  if (localShift) {
    return (
      <Card mode="elevated" style={{flex:1,marginBottom:1,maxWidth:250, }}>
        
        <Card.Title
          title={dayName}
          subtitle={normalizeShiftDate(shifts[0].shiftStartHour)}
          titleVariant="headlineSmall"
          subtitleVariant="labelMedium"
          right={LeftContent}
        />
        <Card.Content>
          <View style={{flex:1 ,}}>
        {systemShifts && Object.entries(systemShifts).map(([key, values])=>
        
        <CardContent key={key} shift={values} name={values[0].shiftTimeName} user={user}  handelAskReplace={handelFindReplace}/>)
        
        }
             </View>
        </Card.Content>
        {/* <Card.Actions>
          <Button compact onPress={() => {}}>
            Cancel
          </Button>
          <Button onPress={() => {}}>Update</Button>
        </Card.Actions> */}
      </Card>
    );
  } else {
    return (
      <View>
        <Text>Fatching day</Text>
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    );
  }
};

export default ShiftView;

//////styles
const styles = StyleSheet.create({
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
