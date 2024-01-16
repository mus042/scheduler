import { Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { API_URL, userAuth } from "../../../app/context/AuthContext";
import axios from "axios";
import { Icon, MD3Colors, Text, useTheme } from "react-native-paper";

type userStats = {
  id?: number;
  scheduleId?: number;
  userId: number;
  morningShifts?: number;
  noonShift?: number;
  nightShifts?: number;
  overTimerStep1?: number;
  overTimeStep2?: number;
  restDayHours?: number;
};

const UserStats = ({
  nextScheduleId,
}: {
  nextScheduleId: number | undefined;
}) => {
  const [userAllTimesStats, setuserAllTimesStats] = useState<userStats>();
  const [usernextschedulStats, setusernextschedulStats] = useState<userStats>();
  const WindowWidth = Dimensions.get("window").width;
  const theme = useTheme();
  const { authState } = userAuth();
  useEffect(() => {
    if (authState?.authenticated) {
      console.log("get stats ");
      const getAllTimesStats = async () => {
        //get stats async
        const result = await axios.get(
          `${API_URL}user-statistics/getAllUserShiftStats`
        );
        console.log("result  = ", { result });
        setuserAllTimesStats(result.data);
      };
      const getCurrentScheduleStats = async () => {
        if (nextScheduleId) {
          console.log({ nextScheduleId });
          const result = await axios.get(
            `${API_URL}user-statistics/getUserShiftStatsForSchedule`,
            {
              params: {
                scheduleId: nextScheduleId,
              },
            }
          );
          setusernextschedulStats(result.data);
        }
      };
      getAllTimesStats();
      getCurrentScheduleStats();
    }
  }, [authState?.authenticated, nextScheduleId]);

  //////////////////
  ////styles///////
  ////////////////
  const styles = StyleSheet.create({
    statsBox: {
      flex: 1,
      maxWidth: 300,
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    centeredView: {
      alignItems: "center",

      margin: 5,
      padding: 1,
    },
    modalView: {
      backgroundColor: theme.colors.backdrop,
      maxWidth: 350,
      borderRadius: 20,
      padding: 10,
      width: 300,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    titleBox: {
      flexDirection: "row",
      flex: 1,
      alignContent: "center",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 4,
      borderBottomWidth: 1,
    },

    mainBox: {
      flex: 1,
      flexDirection: WindowWidth > 400 ? "column" : "row",
    },
  });
  return (
    <View style={styles.mainBox}>
      <View
        style={{
          flex: 1,
          borderBottomColor: "black",
          flexDirection: WindowWidth > 400 ? "row" : "column",
          alignContent: "center",
          alignItems: "center",
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView]}>
            <View style={styles.titleBox}>
              <Icon source="chart-arc" size={30} />
              <Text variant="headlineSmall"> My all times Statistics: </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View>
                <Text variant="titleMedium">
                  Morning shifts: {userAllTimesStats?.morningShifts}{" "}
                </Text>
                <Text variant="titleMedium">
                  Noon shifts: {userAllTimesStats?.noonShift}
                </Text>
                <Text variant="titleMedium">
                  Night shifts: {userAllTimesStats?.nightShifts}
                </Text>
              </View>
              <View>
                <Text variant="titleMedium">
                  Over Time: {userAllTimesStats?.overTimerStep1}
                </Text>
                <Text variant="titleMedium">
                  Over Time 2: {userAllTimesStats?.overTimeStep2}
                </Text>
                <Text variant="titleMedium">
                  Rest Day Hours: {userAllTimesStats?.restDayHours}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.centeredView}>
          <View style={[styles.modalView]}>
            <View style={styles.titleBox}>
              <Icon source="chart-pie" size={30} />
              <Text variant="headlineSmall"> Current Week Statistics:</Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View>
                <Text variant="titleMedium">
                  Morning shifts: {usernextschedulStats?.morningShifts}{" "}
                </Text>
                <Text variant="titleMedium">
                  Noon shifts: {usernextschedulStats?.noonShift}
                </Text>
                <Text variant="titleMedium">
                  Night shifts: {usernextschedulStats?.nightShifts}
                </Text>
              </View>
              <View>
                <Text variant="titleMedium">
                  Over Time: {usernextschedulStats?.overTimerStep1}
                </Text>
                <Text variant="titleMedium">
                  Over Time 2: {usernextschedulStats?.overTimeStep2}
                </Text>
                <Text variant="titleMedium">
                  Rest Day Hours: {usernextschedulStats?.restDayHours}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {WindowWidth > 800 && (
        <View style={{ flex: 1 }}>
          <Text> This will be a graph </Text>
        </View>
      )}
    </View>
  );
};

export default UserStats;
