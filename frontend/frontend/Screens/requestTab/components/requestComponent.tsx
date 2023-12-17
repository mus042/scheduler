import { Pressable, StyleSheet, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { mainStyle } from "../../../utils/mainStyles";
import {
  getDayName,
  normalizeShiftDate,
  normalizeShiftTime,
} from "../../../utils/utils";
import axios from "axios";
import { API_URL } from "../../../app/context/AuthContext";
import { userRequest } from "../../../App";
import { Avatar, Chip, IconButton, TextInput, useTheme } from "react-native-paper";
import Icon from "react-native-paper/src/components/Icon";

const RequestComponent = ({ req }) => {
  //Show request -- sender - recived - answerd
  console.log({ req });
  //state for read or not
  //state f or shift and sender details
  const [senderDetails, setsenderDetails] = useState();
  const [shiftDetails, setShiftDeatails] = useState();
  const [replayCompVisible, setReplayCompVisible] = useState(false);
  const [userReplay, setUserReaplay] = useState<string>(req?.requestAnswer);

  const [typedRespons, setTypedRespons] = useState<string>();
  const [chosenRespons, setChosenRespons] = useState<any>();

  const [isPressed, setIsPressed] = useState(true);

  ///////////////
  //context

  const theme = useTheme();
  //////////////////

  const handelReplay = () => {
    // this will open new modal to set reaply.
    //replay will be true/false *TO ADD*  replay message .

    console.log("replay");
    setReplayCompVisible(!replayCompVisible);
  };

  const selectUserReplay = async (replay: string) => {
    //This will handel the selction of replay.
    console.log(replay !== userReplay, { replay }, userReplay);
    if (replay !== userReplay) {
      // selectUserReplay(replay);
      const updatedRequest: userRequest = { ...req };
      updatedRequest.isAnswered = true;
      updatedRequest.requestAnswer = replay;
      const result = await axios.post(
        `${API_URL}user-request/replayToRquest`,
        updatedRequest
      );
    }
  };

  const styles = StyleSheet.create({
    mainBox: {
      flex: 2,
      flexDirection: "row",
      backgroundColor: theme.colors.secondary,
      margin: 3,
      padding: 2,
    },
    inputBox: {
      backgroundColor: theme.colors.secondaryContainer,
      borderColor: theme.colors.onBackground,
      borderWidth: 2,
      borderRadius: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      // alignSelf: "center",
      // minWidth: 300,
    },
  });
  return (
    <View
      style={{ flex: 1, height: "auto", borderColor: "red", borderWidth: 5 }}
    >
      <Pressable
        style={styles.mainBox}
        onPress={() => setIsPressed(!isPressed)}
      >
        <View
          style={{
            flex: 2,
            alignContent: "center",
            alignSelf: "center",
            margin: 1,
            marginLeft: 3,
          }}
        >
          {!req.senderUserRef.img ? (
            <Avatar.Text size={38} label={req.senderUserRef.firstName} />
          ) : (
            <Avatar.Image size={38} source={require(req.senderUserRef.img)} />
          )}
        </View>

        <View style={{ flex: 3, margin: 1, alignSelf: "center" }}>
          <Text>
            {getDayName(req.shift.shifttStartHour)},{" "}
            {normalizeShiftDate(req.shift.shifttStartHour)}{" "}
            {normalizeShiftTime(req.shift.shifttStartHour)} -{" "}
            {normalizeShiftTime(req.shift.shiftEndHour)}
          </Text>
        </View>
        <View style={{ flex: 4, alignSelf: "center" }}>
          <Text> {req.requsetMsg}</Text>
        </View>
        <View style={{ flex: 2, alignSelf: "center" }}>
          {/* <Pressable onPress={()=>handelReplay()}> */}
          <Text>{req.status}</Text>
          {/* </Pressable> */}
        </View>

        <View style={{ flex: 1 }}>
          <Text>replay</Text>
          <Pressable onPress={() => selectUserReplay("true")}>
            <Text>true</Text>
          </Pressable>
          {/* <Pressable onPress={()=>selectUserReplay("false")}>
            <Text>
              False
            </Text>
            </Pressable> */}
        </View>
      </Pressable>
      {isPressed && (
        <View
          style={{
            flex: 6,
            flexDirection: "column",
            borderColor: "blue",
            borderWidth: 3,
            backgroundColor: theme.colors.onTertiaryContainer,
            minHeight: 300,
          }}
        >
          <View style={{flex:1, flexDirection:'row',alignItems:'center'}}>
            <View style={{flex:1,justifyContent:'center',alignSelf:'center',borderColor:'blue',borderWidth:4}}> 
            <IconButton
    icon="camera"
    iconColor={theme.colors.primary}
    size={20}
    onPress={() => console.log('Pressed')}
  />
            </View>
            <View style={{flex:1}}> </View>
            <IconButton
    icon="camera"
    iconColor={theme.colors.primary}
    size={20}
    onPress={() => console.log('Pressed')}
  />        
            </View>
          <View style={{ flex: 1, alignSelf: "center",justifyContent:'flex-end',width:'100%' }}>
            <TextInput
              style={[
                styles.inputBox,
                { borderWidth: 4, borderColor: "darkgreen" },
              ]}
              label="Type in a messege"
              value={typedRespons}
              multiline
              onChangeText={(text) => setTypedRespons(text)}
              right={<TextInput.Icon icon={"send"} style={{}} />}
            />

            {/* <View style={{flex:2,}}>
                    <View style={{flex:1}}>
                  <Text style={{color:theme.colors.onTertiary}}> 
                    Quick Respose:
                  </Text>
                  </View>
                  <View style={{flex:3, margin:1 ,justifyContent:'center', alignItems:'center', flexDirection:'row',flexWrap:'wrap'}}>
                    <View style={{minWidth:20,margin:2,}}>
                  <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
                  </View><View style={{minWidth:20,margin:2}}>
                  <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
                  </View><View style={{minWidth:20,margin:2}}>
                  <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
                  </View><View style={{minWidth:20,margin:2}}>
                  <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
                    </View>
                    <View style={{minWidth:20,margin:2}}>
                  <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
                    </View>
                    <View style={{minWidth:20,margin:2}}>
                  <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
                    </View>
                    
                    </View>
</View> */}
          </View>
        </View>
      )}
    </View>
  );
};

export default RequestComponent;
