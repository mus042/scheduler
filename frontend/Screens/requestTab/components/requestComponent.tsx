import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { mainStyle } from "../../../utils/mainStyles";
import {
  getDayName,
  normalizeShiftDate,
  normalizeShiftTime,
} from "../../../utils/utils";
import axios from "axios";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import { userRequest } from "../../../App";
import {
  Avatar,
  Chip,
  IconButton,
  useTheme,
  TextInput,
  Text,
  Surface,
} from "react-native-paper";
import Icon from "react-native-paper/src/components/Icon";
import RequestMassege from "./RequestMassege";
import { useSnackbarContext } from "../../SnackbarProvider";

const RequestComponent = ({
  req,
  setReqStatus,
}: {
  req: any;
  setReqStatus: any;
}) => {
  //Show request -- sender - recived - answerd

  //state for read or not
  //state f or shift and sender details
  const [localRequest, setLocalRequset] = useState(req);

  const [senderDetails, setsenderDetails] = useState();
  const [shiftDetails, setShiftDeatails] = useState();
  const [replayCompVisible, setReplayCompVisible] = useState(false);

  const [userReplay, setUserReaplay] = useState<string>(
    req?.requestAnswer ? req?.requestAnswer : ""
  );
  const [varifayRespose, setVerifyRespone] = useState<boolean>(false);

  const [typedRespons, setTypedRespons] = useState<string>();
  const [chosenRespons, setChosenRespons] = useState<string>("");

  const [isDisabled, setIsDisabled] = useState<boolean>();

  const [isPressed, setIsPressed] = useState(false);
  const [timeUntilShift, setTimeUntilShift] = useState("");

  ///////////////
  //context

  const theme = useTheme();
  const { user } = userAuth().authState;
  const { addSnackBarToQueue } = useSnackbarContext();

  const isCurrentUserSender = user && user.id === req.senderId;

  //////////////////

  ///////////////////////////////////////
  //////////////////
  //// Use EFFECT TO VALIDATE RESPONSE
  /////////////////
  /////////////////////////////////////
  ////////////////
  useEffect(() => {
    const validateForm = () => {
      return chosenRespons === "approve" || chosenRespons === "decline";
    };
    setVerifyRespone(validateForm());
  }, [chosenRespons, typedRespons, userReplay]);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const shiftStart = new Date(req.shift.shiftStartHour);
      const difference = shiftStart.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (days > 2) {
          setTimeUntilShift(`${days}`);
          setIsDisabled(false);
        } else {
          const hoursMinusDays = hours + days * 24; // Include the hours from the days
          // console.log(`${hoursMinusDays} hours ${minutes} minutes `);
          setTimeUntilShift(`${hoursMinusDays} hours ${minutes} minutes `);
          if (hoursMinusDays > 12) {
            setIsDisabled(false);
          } else {
            setIsDisabled(true);
          }
        }
      } else {
        setIsDisabled(true);
        setTimeUntilShift("Shift has started");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [req]);
  useEffect(() => {
    //Bind the local request with global one. update local from global
    setLocalRequset(req);
    //**TOADD***handel animation of changing messege and indecation of new reaplay 
    handelReplayCompVisible();
  }, [req]);

  ///////////
  ////
  //

  console.log(req.status, { isDisabled }, { req });

  const handelReplayCompVisible = () => {
    // this will open new modal to set reaply.
    //replay will be true/false *TO ADD*  replay message .
    const isVisble = localRequest.senderId !== user.id && !isDisabled;
    console.log("replay");
    setReplayCompVisible(isVisble);
  };
  const selectRespons = (responseName) => {
    console.log({ responseName });

    setChosenRespons(responseName);
  };
  const handelOpenReq = () => {
    console.log("open req", { req }, req.status);
    if (req.status !== "seen" && req.status !== null) {
      setReqStatus({ ...req, status: "seen" });
    }
    setIsPressed(!isPressed);
  };
  const handelSendReplay = async () => {
    //Check shift hasent started yet.
    console.log("timeUntilShift", { timeUntilShift });
    if (timeUntilShift) {
      console.log({ timeUntilShift });
    }
    const updatedRequest: userRequest = { ...req };
    updatedRequest.isAnswered = false;
    updatedRequest.requestAnswer =
      chosenRespons === "approve" ? "true" : "false";
    updatedRequest.requestAnswerMsg = typedRespons ? typedRespons : "";
    updatedRequest.status = "replayed";

    const requestRespons = await axios.post(
      `${API_URL}user-request/replayToRquest`,
      updatedRequest
    );

    console.log(requestRespons);
    if (requestRespons) {
      //update the local req.
      setLocalRequset(updatedRequest);
    }
  };
  const onClickChip = (selctedChip) => {
    //Handel behavior on quick response chip
    console.log("selcted chip", { selctedChip });
    if (selctedChip === "approve") {
      setChosenRespons("approve");
      setTypedRespons("For Sure!");
    } else if (selctedChip === "decline") {
      setChosenRespons("decline");
      setTypedRespons("Sorry I'm not availble");
    } else if (selctedChip === "maybe") {
      setChosenRespons("maybe");
      setTypedRespons("I will let you know soon");
    }
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

  const sentDefMsg = isCurrentUserSender
    ? `You want ${
        req.acceptingUserRef?.firstName !==undefined ?req.acceptingUserRef?.firstName:``
      } to replace you on ${normalizeShiftDate(req.shift.shiftStartHour)} ${
        req.shift.typeOfShift
      } ${req.shift.ShiftTimeName} shift.`
    : `${
        req.senderUserRef?.firstName
      } wants you to replace him on ${normalizeShiftDate(
        req.shift.shiftStartHour
      )} ${req.shift.typeOfShift} ${req.shift.ShiftTimeName} shift.`;

  console.log({ sentDefMsg }, user?.id, isCurrentUserSender);

  const getStyle = () => {
    //Will return correct style colors and others = dpending on the status of the req.
    console.log(req.status);
    switch (req.status) {
      case "pending":
        return theme.colors.error; // Replace with your color for pending status
      case "seen":
        return theme.colors.elevation.level2; // Replace with your color for replied status
      case "declined":
        return theme.colors.onErrorContainer; // Replace with your color for declined status
      default:
        return theme.colors.elevation.level5; // Default color
    }
  };
  const styles = StyleSheet.create({
    mainBox: {
      flexDirection: "column",
      borderRadius: 10,
      borderColor: "red",
      borderWidth: 3,
      backgroundColor: getStyle(),
      margin: 5,

      // padding: 2,
    },
    inputBox: {
      // backgroundColor: theme.colors.surface,
      // borderColor: theme.colors.onBackground,
      borderWidth: 2,
      borderRadius: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      // alignSelf: "center",
      // minWidth: 300,
    },
    answerBtn: {
      flex: 2,
      // justifyContent: "center",
      alignSelf: "flex-end",
      alignItems: "center",
      // borderColor: "blue",
      // borderWidth: 4,
    },
  });
  return (
    <View style={[styles.mainBox]}>
      <Pressable onPress={() => handelOpenReq()}>
        <View style={{ maxHeight: 100, flexDirection: "row" }}>
          <View
            style={{
              flex: 2,
              alignContent: "center",
              alignSelf: "center",
              margin: 1,
              marginLeft: 3,
            }}
          >
            {!req?.senderUserRef?.img ? (
              <Avatar.Text
                size={38}
                label={localRequest.senderUserRef?.firstName}
              />
            ) : (
              <Avatar.Image size={38} source={localRequest.senderUserRef.img} />
            )}
          </View>

          <View style={{ flex: 3, margin: 1, alignSelf: "center" }}>
            <Text>
              {getDayName(localRequest.shift?.shiftStartHour)},{" "}
              {normalizeShiftDate(localRequest.shift?.shiftStartHour)}{" "}
              {normalizeShiftTime(localRequest.shift?.shiftStartHour)} -{" "}
              {normalizeShiftTime(localRequest.shift?.shiftEndHour)}
            </Text>
          </View>
          <View style={{ flex: 4, alignSelf: "center" }}>
            <Text> {localRequest?.requsetMsg}</Text>
          </View>
          <View style={{ flex: 2, alignSelf: "center" }}>
            {/* <Pressable onPress={()=>handelReplay()}> */}
            <Text>{localRequest.status}</Text>
            {/* </Pressable> */}
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="bodySmall">{timeUntilShift}</Text>
          </View>
        </View>
      </Pressable>
      {isPressed && (
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            // borderColor: "blue",
            // borderWidth: 3,
            borderRadius: 10,
          }}
        >
          <Surface
            style={{
              marginTop: 20,
              paddingTop: 10,
              paddingBottom: 10,
              flex: 6,
            }}
          >
            <View style={{ flex: 5, margin: 5 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    mainStyle.text,
                    { color: theme.colors.onBackground, flexWrap: "wrap" },
                  ]}
                >
                  {sentDefMsg}
                </Text>
              </View>

              <RequestMassege
                avatar={
                  <Avatar.Text
                    size={30}
                    label={localRequest.senderUserRef?.firstName?.at(0)}
                  />
                }
                position={"right"}
                text={sentDefMsg}
              />

              <RequestMassege
                avatar={
                  <Avatar.Text
                    size={30}
                    label={localRequest.acceptingUserRef?.firstName?.at(0)}
                  />
                }
                position={"left"}
                text={localRequest.requestAnswerMsg}
              />
            </View>
            {replayCompVisible && (
              <>
                <View
                  style={{
                    flex: 1,
                    margin: 1,
                    marginBottom: 10,
                    minHeight: 50,
                    borderTopWidth: 1,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      margin: 0,

                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    <View style={{ minWidth: 10, margin: 1 }}>
                      <Chip
                        icon="check-circle"
                        onPress={() => onClickChip("approve")}
                        textStyle={{ fontSize: 12, margin: 4, marginTop: 5 }}
                      >
                        For Sure
                      </Chip>
                    </View>
                    <View style={{ minWidth: 20, margin: 1 }}>
                      <Chip
                        icon="close-circle"
                        onPress={() => onClickChip("decline")}
                        textStyle={{ fontSize: 12, margin: 4, marginTop: 5 }}
                      >
                        Sorry not this time
                      </Chip>
                    </View>
                    <View style={{ minWidth: 20, margin: 1 }}>
                      <Chip
                        icon="emoticon-neutral"
                        onPress={() => onClickChip("maybe")}
                        textStyle={{ fontSize: 12, margin: 4, marginTop: 5 }}
                      >
                        Will think about it.
                      </Chip>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    flex: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    // maxHeight:100,
                    // height:70,
                    padding: 1,
                    margin: 1,
                  }}
                >
                  <View
                    style={[
                      styles.answerBtn,
                      {
                        backgroundColor:
                          chosenRespons === "approve"
                            ? theme.colors.onPrimary
                            : "transparent",
                        borderRadius: 5,
                      },
                    ]}
                  >
                    <IconButton
                      icon="check-circle"
                      iconColor={theme.colors.primary}
                      style={{
                        marginBottom: 0,
                        padding: 0,
                        margin: 0,
                        // maxHeight: 30,
                      }}
                      size={34}
                      onPress={() =>
                        chosenRespons === "approve"
                          ? selectRespons("")
                          : selectRespons("approve")
                      }
                    />
                    <Text style={theme.fonts.bodySmall}>Accept</Text>
                  </View>
                  <View
                    style={[
                      styles.answerBtn,
                      {
                        backgroundColor:
                          chosenRespons === "decline"
                            ? theme.colors.onPrimary
                            : "transparent",
                        borderRadius: 5,
                      },
                    ]}
                  >
                    <IconButton
                      icon="close-circle"
                      style={{
                        marginBottom: 0,
                        padding: 0,
                        margin: 0,
                        // maxHeight: 30,
                      }}
                      iconColor={theme.colors.error}
                      size={34}
                      onPress={() =>
                        chosenRespons === "decline"
                          ? selectRespons("")
                          : selectRespons("decline")
                      }
                    />
                    <Text style={theme.fonts.bodySmall}>Decline</Text>
                  </View>
                  <View
                    style={[
                      styles.answerBtn,
                      {
                        backgroundColor:
                          chosenRespons === "maybe"
                            ? theme.colors.onPrimary
                            : "transparent",
                        borderRadius: 5,
                      },
                    ]}
                  >
                    <IconButton
                      icon="close-circle"
                      style={{
                        marginBottom: 0,
                        padding: 0,
                        margin: 0,
                        // maxHeight: 30,
                      }}
                      iconColor={theme.colors.error}
                      size={34}
                      onPress={() =>
                        chosenRespons === "maybe"
                          ? selectRespons("")
                          : selectRespons("maybe")
                      }
                    />
                    <Text style={theme.fonts.bodySmall}>Maybe</Text>
                  </View>
                  <View
                    style={{
                      flex: 9,
                      alignSelf: "flex-end",
                      marginTop: 5,
                    }}
                  >
                    <View>
                      <TextInput
                        right={
                          <TextInput.Icon
                            icon={"arrow-up-bold-box"}
                            style={{
                              alignSelf: "flex-start",
                              marginLeft: 3,
                              alignItems: "center",
                              marginBottom: 0,
                              paddingBottom: 0,
                            }}
                            disabled={chosenRespons === ""}
                            onPress={() => handelSendReplay()}
                            // iconColor={theme.colors.primary}
                          />
                        }
                        label={
                          req.isAnswered
                            ? "If you changed your mind...  "
                            : "Add a messege to your response"
                        }
                        value={typedRespons}
                        multiline
                        dense
                        onChangeText={(text) => setTypedRespons(text)}
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </Surface>
        </View>
      )}
    </View>
  );
};

export default RequestComponent;
